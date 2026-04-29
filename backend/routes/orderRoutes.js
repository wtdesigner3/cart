import express from 'express'
import Order from '../models/Order.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', protect, async (req, res, next) => {
  try {
    const query = req.user.isAdmin ? {} : { email: req.user.email }
    const orders = await Order.find(query)
    res.json(orders)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      res.status(404)
      throw new Error('Order not found')
    }
    res.json(order)
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { customerName, email, address, city, country, postalCode, items, total } = req.body
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
    res.status(201).json(createdOrder)
  } catch (error) {
    next(error)
  }
})

router.put('/:id', protect, admin, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      res.status(404)
      throw new Error('Order not found')
    }
    order.status = req.body.status ?? order.status
    order.paymentStatus = req.body.paymentStatus ?? order.paymentStatus
    const updatedOrder = await order.save()
    res.json(updatedOrder)
  } catch (error) {
    next(error)
  }
})

export default router
