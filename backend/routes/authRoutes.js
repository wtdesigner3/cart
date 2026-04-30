import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
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

const buildTransporter = async () => {
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  }

  const testAccount = await nodemailer.createTestAccount()
  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  })
}

const sendResetCode = async (email, code) => {
  const transporter = await buildTransporter()
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'no-reply@estore.com',
    to: email,
    subject: 'Your password reset code',
    html: `<p>Your password reset code is <strong>${code}</strong>.</p><p>This code expires in 15 minutes.</p>`,
  }

  const info = await transporter.sendMail(mailOptions)
  return nodemailer.getTestMessageUrl(info)
}

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      res.status(400)
      throw new Error('User already exists')
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hashedPassword, phone })

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

router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email, phone } = req.body
    const query = email ? { email } : phone ? { phone } : null
    if (!query) {
      res.status(400)
      throw new Error('Email or phone is required to reset password')
    }

    const user = await User.findOne(query)
    if (!user) {
      res.status(404)
      throw new Error('User not found')
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    user.resetPasswordCode = code
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000
    await user.save()

    const previewUrl = await sendResetCode(user.email, code)
    res.json({
      message: 'Password reset code sent. Check your email or SMS for the code.',
      previewUrl,
    })
  } catch (error) {
    next(error)
  }
})

router.post('/reset-password', async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body
    if (!email || !code || !newPassword) {
      res.status(400)
      throw new Error('Email, code, and new password are required')
    }

    const user = await User.findOne({ email })
    if (!user) {
      res.status(404)
      throw new Error('User not found')
    }

    if (user.resetPasswordCode !== code || !user.resetPasswordExpires || user.resetPasswordExpires < Date.now()) {
      res.status(400)
      throw new Error('Reset code is invalid or expired')
    }

    user.password = await bcrypt.hash(newPassword, 10)
    user.resetPasswordCode = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.json({ message: 'Password reset successfully. Please login with your new password.' })
  } catch (error) {
    next(error)
  }
})

router.put('/profile', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) {
      res.status(404)
      throw new Error('User not found')
    }

    user.name = req.body.name ?? user.name
    user.email = req.body.email ?? user.email
    user.phone = req.body.phone ?? user.phone
    const updatedUser = await user.save()

    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      isAdmin: updatedUser.isAdmin,
    })
  } catch (error) {
    next(error)
  }
})

router.put('/change-password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      res.status(400)
      throw new Error('Both current and new password are required')
    }

    const user = await User.findById(req.user._id)
    if (!user) {
      res.status(404)
      throw new Error('User not found')
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      res.status(401)
      throw new Error('Current password is incorrect')
    }

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()
    res.json({ message: 'Password changed successfully' })
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

// Address routes
router.get('/addresses', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) {
      res.status(404)
      throw new Error('User not found')
    }
    res.json(user.addresses || [])
  } catch (error) {
    next(error)
  }
})

router.post('/addresses', protect, async (req, res, next) => {
  try {
    const { fullName, email, address, city, country, postalCode, isDefault } = req.body
    const user = await User.findById(req.user._id)
    if (!user) {
      res.status(404)
      throw new Error('User not found')
    }

    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false)
    }

    const newAddress = {
      fullName,
      email,
      address,
      city,
      country,
      postalCode,
      isDefault: isDefault || false,
    }

    user.addresses.push(newAddress)
    await user.save()

    res.status(201).json(newAddress)
  } catch (error) {
    next(error)
  }
})

router.put('/addresses/:id', protect, async (req, res, next) => {
  try {
    const { fullName, email, address, city, country, postalCode, isDefault } = req.body
    const user = await User.findById(req.user._id)
    if (!user) {
      res.status(404)
      throw new Error('User not found')
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === req.params.id)
    if (addressIndex === -1) {
      res.status(404)
      throw new Error('Address not found')
    }

    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false)
    }

    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex],
      fullName,
      email,
      address,
      city,
      country,
      postalCode,
      isDefault: isDefault || false,
    }

    await user.save()
    res.json(user.addresses[addressIndex])
  } catch (error) {
    next(error)
  }
})

router.delete('/addresses/:id', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) {
      res.status(404)
      throw new Error('User not found')
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === req.params.id)
    if (addressIndex === -1) {
      res.status(404)
      throw new Error('Address not found')
    }

    user.addresses.splice(addressIndex, 1)
    await user.save()

    res.json({ message: 'Address deleted' })
  } catch (error) {
    next(error)
  }
})

export default router
