import express from 'express'
import CartItem from '../models/CartItem.js'

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const cartItems = await CartItem.find({})
    res.json(cartItems)
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { id, title, price, quantity, thumbnail, category } = req.body
    const existing = await CartItem.findOne({ id })

    if (existing) {
      existing.quantity = (existing.quantity ?? 1) + (quantity ?? 1)
      const updated = await existing.save()
      return res.status(200).json(updated)
    }

    const cartItem = new CartItem({
      id,
      productId: id,
      title,
      price,
      quantity: quantity ?? 1,
      thumbnail,
      category,
    })
    const created = await cartItem.save()
    res.status(201).json(created)
  } catch (error) {
    next(error)
  }
})

router.patch('/:id', async (req, res, next) => {
  try {
    const { quantity } = req.body
    const cartItem = await CartItem.findOne({ id: req.params.id })
    if (!cartItem) {
      res.status(404)
      throw new Error('Cart item not found')
    }

    if (quantity <= 0) {
      await cartItem.deleteOne()
      return res.json({ message: 'Cart item removed' })
    }

    cartItem.quantity = quantity
    const updated = await cartItem.save()
    res.json(updated)
  } catch (error) {
    next(error)
  }
})

router.delete('/', async (req, res, next) => {
  try {
    await CartItem.deleteMany({})
    res.json({ message: 'Cart cleared' })
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const cartItem = await CartItem.findOne({ id: req.params.id })
    if (!cartItem) {
      res.status(404)
      throw new Error('Cart item not found')
    }
    await cartItem.deleteOne()
    res.json({ message: 'Cart item deleted' })
  } catch (error) {
    next(error)
  }
})

export default router
