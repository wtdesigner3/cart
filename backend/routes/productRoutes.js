import express from 'express'
import Product from '../models/Product.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const products = await Product.find({})
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
