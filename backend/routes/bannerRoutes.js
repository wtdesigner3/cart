import express from 'express'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

// In-memory storage for demonstration (replace with MongoDB in production)
let banners = []

// Get all active banners
router.get('/', async (req, res) => {
  try {
    const activeBanners = banners.filter(b => b.isActive)
    res.json(activeBanners)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get all banners (admin)
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    res.json(banners)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create banner (admin)
router.post('/', protect, admin, async (req, res) => {
  try {
    const { title, subtitle, image, link, buttonText, isActive, order } = req.body

    const banner = {
      _id: Date.now().toString(),
      id: Date.now().toString(),
      title,
      subtitle,
      image,
      link,
      buttonText,
      isActive: isActive !== false,
      order: order || 0,
      createdAt: new Date(),
    }

    banners.push(banner)
    res.status(201).json(banner)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update banner (admin)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const banner = banners.find(b => b._id === req.params.id || b.id === req.params.id)
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' })
    }

    Object.assign(banner, req.body)
    banner.updatedAt = new Date()

    res.json(banner)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Delete banner (admin)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const index = banners.findIndex(b => b._id === req.params.id || b.id === req.params.id)
    if (index === -1) {
      return res.status(404).json({ message: 'Banner not found' })
    }

    banners.splice(index, 1)
    res.json({ message: 'Banner deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
