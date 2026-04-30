import express from 'express'
import Category from '../models/Category.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.find({}).sort({ createdAt: -1 })
    res.json(categories)
  } catch (error) {
    next(error)
  }
})

router.post('/', protect, admin, async (req, res, next) => {
  try {
    const { title, slug, tagline, description, image } = req.body
    if (!title || !slug) {
      res.status(400)
      throw new Error('Category title and slug are required')
    }

    const existing = await Category.findOne({ slug: slug.toLowerCase() })
    if (existing) {
      res.status(400)
      throw new Error('Category already exists')
    }

    const category = new Category({
      title,
      slug: slug.toLowerCase(),
      tagline,
      description,
      image,
    })

    const createdCategory = await category.save()
    res.status(201).json(createdCategory)
  } catch (error) {
    next(error)
  }
})

router.put('/:id', protect, admin, async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id)
    if (!category) {
      res.status(404)
      throw new Error('Category not found')
    }

    category.title = req.body.title ?? category.title
    category.slug = req.body.slug ? req.body.slug.toLowerCase() : category.slug
    category.tagline = req.body.tagline ?? category.tagline
    category.description = req.body.description ?? category.description
    category.image = req.body.image ?? category.image

    const updatedCategory = await category.save()
    res.json(updatedCategory)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', protect, admin, async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id)
    if (!category) {
      res.status(404)
      throw new Error('Category not found')
    }
    await category.deleteOne()
    res.json({ message: 'Category deleted' })
  } catch (error) {
    next(error)
  }
})

export default router
