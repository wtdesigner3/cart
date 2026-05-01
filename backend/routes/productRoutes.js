import express from 'express'
import Product from '../models/Product.js'
import Category from '../models/Category.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

const createSlug = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const normalizeCategory = async (categoryValue) => {
  const normalized = categoryValue?.trim()
  if (!normalized) return ''
  const lowerValue = normalized.toLowerCase()

  let category = await Category.findOne({ slug: lowerValue })
  if (!category) {
    category = await Category.findOne({ title: new RegExp(`^${normalized}$`, 'i') })
  }

  if (category) {
    return category.slug
  }

  const slug = createSlug(normalized)
  const created = await Category.create({ title: normalized, slug })
  return created.slug
}

router.get('/', async (req, res, next) => {
  try {
    const { category, limit = 0, skip = 0, search, includeInactive } = req.query
    const query = {}

    // Only show active products by default, unless explicitly requested
    if (includeInactive !== 'true') {
      query.isActive = true
    }

    if (category) query.category = category
    if (search) query.title = { $regex: search, $options: 'i' }

    const products = await Product.find(query)
      .skip(Number(skip))
      .limit(Number(limit))
    res.json(products)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findOne({ id: req.params.id })
    if (!product) {
      res.status(404)
      throw new Error('Product not found')
    }
    res.json(product)
  } catch (error) {
    next(error)
  }
})

router.post('/', protect, admin, async (req, res, next) => {
  try {
    const product = new Product(req.body)
    const createdProduct = await product.save()
    res.status(201).json(createdProduct)
  } catch (error) {
    next(error)
  }
})

router.post('/bulk', protect, admin, async (req, res, next) => {
  try {
    const { products } = req.body
    if (!Array.isArray(products) || products.length === 0) {
      res.status(400)
      throw new Error('No product records provided.')
    }

    const prepared = []
    for (const item of products) {
      if (!item.title || item.price == null) {
        res.status(400)
        throw new Error('Each product must include at least title and price.')
      }

      const categorySlug = await normalizeCategory(item.category)
      prepared.push({
        ...item,
        category: categorySlug,
        price: Number(item.price) || 0,
        stock: Number(item.stock) || 0,
        isActive: item.isActive !== false, // Default to true unless explicitly false
        id: item.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      })
    }

    const createdProducts = await Product.insertMany(prepared, { ordered: false })
    res.status(201).json({ count: createdProducts.length, products: createdProducts })
  } catch (error) {
    next(error)
  }
})

router.delete('/bulk', protect, admin, async (req, res, next) => {
  try {
    const { ids } = req.body
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400)
      throw new Error('No product IDs provided for bulk delete.')
    }

    const deleted = await Product.deleteMany({ id: { $in: ids } })
    res.json({ deletedCount: deleted.deletedCount })
  } catch (error) {
    next(error)
  }
})

router.patch('/:id/toggle', protect, admin, async (req, res, next) => {
  try {
    const product = await Product.findOne({ id: req.params.id })
    if (!product) {
      res.status(404)
      throw new Error('Product not found')
    }

    product.isActive = !product.isActive
    await product.save()

    res.json({
      id: product.id,
      isActive: product.isActive,
      message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`
    })
  } catch (error) {
    next(error)
  }
})

router.put('/:id', protect, admin, async (req, res, next) => {
  try {
    const updated = await Product.findOneAndUpdate({ id: req.params.id }, req.body, {
      new: true,
    })
    if (!updated) {
      res.status(404)
      throw new Error('Product not found')
    }
    res.json(updated)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', protect, admin, async (req, res, next) => {
  try {
    const deleted = await Product.findOneAndDelete({ id: req.params.id })
    if (!deleted) {
      res.status(404)
      throw new Error('Product not found')
    }
    res.json({ message: 'Product deleted' })
  } catch (error) {
    next(error)
  }
})

export default router
