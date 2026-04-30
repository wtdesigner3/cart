import express from 'express'
import multer from 'multer'
import path from 'path'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(process.cwd(), 'backend', 'uploads')),
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname)
    const name = `${Date.now()}-${file.fieldname}${extension}`
    cb(null, name)
  },
})

const upload = multer({ storage })

router.post('/', protect, admin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Image file is required' })
  }

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000'
  const url = `${backendUrl}/uploads/${req.file.filename}`
  res.status(201).json({ url })
})

export default router
