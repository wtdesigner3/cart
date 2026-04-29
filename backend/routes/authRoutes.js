import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables')
  }
  return jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      res.status(400)
      throw new Error('User already exists')
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hashedPassword })

    const token = generateToken(user)
    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      token,
    })
  } catch (error) {
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      res.status(401)
      throw new Error('Invalid email or password')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      res.status(401)
      throw new Error('Invalid email or password')
    }

    const token = generateToken(user)
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      token,
    })
  } catch (error) {
    next(error)
  }
})

router.get('/profile', protect, async (req, res, next) => {
  try {
    res.json(req.user)
  } catch (error) {
    next(error)
  }
})

router.get('/users', protect, admin, async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password')
    res.json(users)
  } catch (error) {
    next(error)
  }
})

router.put('/users/:id', protect, admin, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      res.status(404)
      throw new Error('User not found')
    }
    user.name = req.body.name ?? user.name
    user.email = req.body.email ?? user.email
    if (typeof req.body.isAdmin === 'boolean') {
      user.isAdmin = req.body.isAdmin
    }
    const updatedUser = await user.save()
    res.json({ id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, isAdmin: updatedUser.isAdmin })
  } catch (error) {
    next(error)
  }
})

router.delete('/users/:id', protect, admin, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      res.status(404)
      throw new Error('User not found')
    }
    await user.deleteOne()
    res.json({ message: 'User deleted' })
  } catch (error) {
    next(error)
  }
})

export default router
