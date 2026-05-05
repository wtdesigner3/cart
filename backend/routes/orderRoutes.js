import express from 'express'
import Order from '../models/Order.js'
import { protect, admin } from '../middleware/authMiddleware.js'
import PDFDocument from 'pdfkit'

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

router.get('/:id', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      res.status(404)
      throw new Error('Order not found')
    }
    if (req.user.email !== order.email && !req.user.isAdmin) {
      res.status(403)
      throw new Error('Not authorized to view this order')
    }
    res.json(order)
  } catch (error) {
    next(error)
  }
})

router.get('/:id/track', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      res.status(404)
      throw new Error('Order not found')
    }
    if (req.user.email !== order.email && !req.user.isAdmin) {
      res.status(403)
      throw new Error('Not authorized to view this order')
    }
    if (!order.courier || !order.trackingNumber) {
      res.status(400)
      throw new Error('Tracking information is not available for this order')
    }

    const apiKey = process.env.TRACKCOURIER_API_KEY
    if (!apiKey) {
      res.status(500)
      throw new Error('TrackCourier API key is not configured on the server')
    }

    const url = `https://api.trackcourier.io/v1/track?courier=${encodeURIComponent(order.courier)}&tracking_number=${encodeURIComponent(order.trackingNumber)}`
    const response = await fetch(url, {
      headers: {
        'X-API-Key': apiKey,
        Accept: 'application/json',
      },
    })
    const result = await response.json()

    if (!response.ok || result.success === false) {
      res.status(response.status || 502)
      throw new Error(result.error?.message || 'Failed to fetch live tracking from TrackCourier')
    }

    res.json({ success: true, tracking: result.data, usage: result.usage })
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { customerName, email, address, city, country, postalCode, items, total, trackingNumber, courier } = req.body
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
      trackingNumber,
      courier,
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
    order.trackingNumber = req.body.trackingNumber ?? order.trackingNumber
    order.courier = req.body.courier ?? order.courier
    const updatedOrder = await order.save()
    res.json(updatedOrder)
  } catch (error) {
    next(error)
  }
})

router.get('/:id/invoice', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      res.status(404)
      throw new Error('Order not found')
    }

    // Check if user owns this order or is admin
    if (req.user.email !== order.email && !req.user.isAdmin) {
      res.status(403)
      throw new Error('Not authorized to view this invoice')
    }

    // Create PDF
    const doc = new PDFDocument()
    const filename = `invoice-${order._id}.pdf`

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

    doc.pipe(res)

    // Header
    doc.fontSize(20).text('E-Shop Invoice', { align: 'center' })
    doc.moveDown()

    // Order details
    doc.fontSize(14).text(`Order ID: ${order._id}`)
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`)
    doc.text(`Status: ${order.status}`)
    doc.moveDown()

    // Customer info
    doc.fontSize(12).text('Customer Information:')
    doc.text(`Name: ${order.customerName}`)
    doc.text(`Email: ${order.email}`)
    doc.moveDown()

    // Shipping info
    doc.text('Shipping Address:')
    doc.text(`${order.address}`)
    doc.text(`${order.city}, ${order.postalCode}`)
    doc.text(`${order.country}`)
    doc.moveDown()

    // Items
    doc.fontSize(14).text('Items:')
    doc.moveDown(0.5)

    order.items.forEach((item, index) => {
      const y = doc.y
      doc.text(`${index + 1}. ${item.title || item.name}`, 50, y)
      doc.text(`Qty: ${item.quantity}`, 350, y)
      doc.text(`$${item.price.toFixed(2)}`, 450, y)
      doc.moveDown()
    })

    doc.moveDown()
    doc.fontSize(14).text(`Total: $${order.total.toFixed(2)}`, { align: 'right' })

    doc.end()
  } catch (error) {
    next(error)
  }
})

export default router
