import express from 'express'
import Stripe from 'stripe'
import Order from '../models/Order.js'

const router = express.Router()

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY in backend/.env. Add your Stripe secret key and restart the backend.')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

router.post('/create-checkout-session', async (req, res, next) => {
  try {
    const { customerName, email, address, city, country, postalCode, items, total } = req.body

    if (!customerName || !email || !address || !items?.length) {
      res.status(400)
      throw new Error('Missing order details for payment')
    }

    const order = new Order({
      customerName,
      email,
      address,
      city,
      country,
      postalCode,
      items,
      total,
      status: 'pending',
      paymentStatus: 'pending',
    })

    const createdOrder = await order.save()

    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.title || item.name || 'Product',
          images: item.thumbnail ? [item.thumbnail] : undefined,
        },
        unit_amount: Math.round((item.price ?? 0) * 100),
      },
      quantity: item.quantity ?? 1,
    }))

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `https://cart-pied-tau.vercel.app/payment?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: 'https://cart-pied-tau.vercel.app/checkout',
      customer_email: email,
      metadata: {
        orderId: createdOrder._id.toString(),
      },
    })

    createdOrder.stripeSessionId = session.id
    await createdOrder.save()

    res.status(201).json({ url: session.url })
  } catch (error) {
    next(error)
  }
})

router.get('/confirm-session', async (req, res, next) => {
  try {
    const sessionId = req.query.session_id
    if (!sessionId) {
      res.status(400)
      throw new Error('session_id is required')
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      res.status(404)
      throw new Error('Checkout session not found')
    }

    const orderId = session.metadata?.orderId
    if (!orderId) {
      res.status(400)
      throw new Error('No order attached to this session')
    }

    const order = await Order.findById(orderId)
    if (!order) {
      res.status(404)
      throw new Error('Order record not found')
    }

    if (session.payment_status !== 'paid') {
      res.status(400)
      throw new Error('Payment not completed yet')
    }

    order.paymentStatus = 'paid'
    order.status = order.status === 'pending' ? 'processing' : order.status
    order.stripeSessionId = sessionId
    await order.save()

    res.json(order)
  } catch (error) {
    next(error)
  }
})

export default router
