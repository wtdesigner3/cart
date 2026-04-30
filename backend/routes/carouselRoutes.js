import express from 'express'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

// In-memory storage for demonstration (replace with MongoDB in production)
let carouselItems = []

// Get all active carousel items
router.get('/', async (req, res) => {
  try {
    const activeItems = carouselItems.filter(item => item.isActive).sort((a, b) => (a.order || 0) - (b.order || 0))
    res.json(activeItems)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get all carousel items (admin)
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const sorted = carouselItems.sort((a, b) => (a.order || 0) - (b.order || 0))
    res.json(sorted)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create carousel item (admin)
router.post('/', protect, admin, async (req, res) => {
  try {
    const { title, description, image, link, buttonText, isActive, order } = req.body

    const item = {
      _id: Date.now().toString(),
      id: Date.now().toString(),
      title,
      description,
      image,
      link,
      buttonText,
      isActive: isActive !== false,
      order: order || 0,
      createdAt: new Date(),
    }

    carouselItems.push(item)
    res.status(201).json(item)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update carousel item (admin)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const item = carouselItems.find(c => c._id === req.params.id || c.id === req.params.id)
    if (!item) {
      return res.status(404).json({ message: 'Carousel item not found' })
    }

    Object.assign(item, req.body)
    item.updatedAt = new Date()

    res.json(item)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Delete carousel item (admin)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const index = carouselItems.findIndex(c => c._id === req.params.id || c.id === req.params.id)
    if (index === -1) {
      return res.status(404).json({ message: 'Carousel item not found' })
    }

    carouselItems.splice(index, 1)
    res.json({ message: 'Carousel item deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
