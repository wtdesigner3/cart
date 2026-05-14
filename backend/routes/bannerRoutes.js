import express from 'express'
import Banner from '../models/Banner.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1 })
    res.json(banners)
  } catch (error) {
    next(error)
  }
})

router.get('/admin/all', protect, admin, async (req, res, next) => {
  try {
    const banners = await Banner.find({}).sort({ order: 1 })
    res.json(banners)
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

    const banner = new Banner(payload)
    const createdBanner = await banner.save()
    res.status(201).json(createdBanner)
  } catch (error) {
    next(error)
  }
})

router.post('/bulk', protect, admin, async (req, res, next) => {
  try {
    const { banners: incoming } = req.body
    if (!Array.isArray(incoming) || incoming.length === 0) {
      res.status(400)
      throw new Error('No banner records provided.')
    }

    const prepared = incoming.map((item) => ({
      ...item,
      id: item.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      subtitle: item.subtitle || '',
      description: item.description || '',
      bgColor: item.bgColor || item.backgroundColor || '',
      bgImage: item.bgImage || item.backgroundImage || '',
      textColor: item.textColor || item.textColour || item.text_color || '',
      image: item.image || '',
      link: item.link || '',
      buttonText: item.buttonText || '',
      isActive: item.isActive !== false,
      order: item.order || 0,
    }))

    const created = await Banner.insertMany(prepared, { ordered: false })
    res.status(201).json({ count: created.length, banners: created })
  } catch (error) {
    next(error)
  }
})

router.patch('/:id/toggle', protect, admin, async (req, res, next) => {
  try {
    const banner = await Banner.findOne({ $or: [{ id: req.params.id }, { _id: req.params.id }] })
    if (!banner) {
      res.status(404)
      throw new Error('Banner not found')
    }

    banner.isActive = !banner.isActive
    await banner.save()
    res.json({ id: banner.id, isActive: banner.isActive, message: `Banner ${banner.isActive ? 'activated' : 'deactivated'} successfully` })
  } catch (error) {
    next(error)
  }
})

router.put('/:id', protect, admin, async (req, res, next) => {
  try {
    const updatedBanner = await Banner.findOneAndUpdate(
      { $or: [{ id: req.params.id }, { _id: req.params.id }] },
      req.body,
      { new: true }
    )

    if (!updatedBanner) {
      res.status(404)
      throw new Error('Banner not found')
    }

    res.json(updatedBanner)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', protect, admin, async (req, res, next) => {
  try {
    const deletedBanner = await Banner.findOneAndDelete({ $or: [{ id: req.params.id }, { _id: req.params.id }] })
    if (!deletedBanner) {
      res.status(404)
      throw new Error('Banner not found')
    }
    res.json({ message: 'Banner deleted' })
  } catch (error) {
    next(error)
  }
})

export default router
