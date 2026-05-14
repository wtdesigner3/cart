import express from 'express'
import Carousel from '../models/Carousel.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const items = await Carousel.find({ isActive: true }).sort({ order: 1 })
    res.json(items)
  } catch (error) {
    next(error)
  }
})

router.get('/admin/all', protect, admin, async (req, res, next) => {
  try {
    const items = await Carousel.find({}).sort({ order: 1 })
    res.json(items)
  } catch (error) {
    next(error)
  }
})

router.post('/', protect, admin, async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      id: req.body.id || Date.now().toString(),
      isActive: req.body.isActive !== false,
      order: req.body.order || 0,
    }

    const item = new Carousel(payload)
    const createdItem = await item.save()
    res.status(201).json(createdItem)
  } catch (error) {
    next(error)
  }
})

router.post('/bulk', protect, admin, async (req, res, next) => {
  try {
    const { items: incoming } = req.body
    if (!Array.isArray(incoming) || incoming.length === 0) {
      res.status(400)
      throw new Error('No carousel records provided.')
    }

    const prepared = incoming.map((item) => ({
      ...item,
      id: item.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      description: item.description || '',
      image: item.image || '',
      link: item.link || '',
      buttonText: item.buttonText || '',
      isActive: item.isActive !== false,
      order: item.order || 0,
    }))

    const created = await Carousel.insertMany(prepared, { ordered: false })
    res.status(201).json({ count: created.length, items: created })
  } catch (error) {
    next(error)
  }
})

router.patch('/:id/toggle', protect, admin, async (req, res, next) => {
  try {
    const item = await Carousel.findOne({ $or: [{ id: req.params.id }, { _id: req.params.id }] })
    if (!item) {
      res.status(404)
      throw new Error('Carousel item not found')
    }

    item.isActive = !item.isActive
    await item.save()
    res.json({ id: item.id, isActive: item.isActive, message: `Carousel item ${item.isActive ? 'activated' : 'deactivated'} successfully` })
  } catch (error) {
    next(error)
  }
})

router.put('/:id', protect, admin, async (req, res, next) => {
  try {
    const updatedItem = await Carousel.findOneAndUpdate(
      { $or: [{ id: req.params.id }, { _id: req.params.id }] },
      req.body,
      { new: true }
    )

    if (!updatedItem) {
      res.status(404)
      throw new Error('Carousel item not found')
    }

    res.json(updatedItem)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', protect, admin, async (req, res, next) => {
  try {
    const deletedItem = await Carousel.findOneAndDelete({ $or: [{ id: req.params.id }, { _id: req.params.id }] })
    if (!deletedItem) {
      res.status(404)
      throw new Error('Carousel item not found')
    }
    res.json({ message: 'Carousel item deleted' })
  } catch (error) {
    next(error)
  }
})

export default router
