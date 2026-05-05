import express from 'express'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/couriers', protect, async (req, res, next) => {
  try {
    const apiKey = process.env.TRACKCOURIER_API_KEY
    if (!apiKey) {
      res.status(500)
      throw new Error('TrackCourier API key is not configured on the server')
    }

    const response = await fetch('https://api.trackcourier.io/v1/couriers', {
      headers: {
        'X-API-Key': apiKey,
        Accept: 'application/json',
      },
    })
    const result = await response.json()
    if (!response.ok || result.success === false) {
      res.status(response.status || 502)
      throw new Error(result.error?.message || 'Unable to fetch couriers from TrackCourier')
    }

    res.json({ success: true, couriers: result.data?.couriers || [] })
  } catch (error) {
    next(error)
  }
})

export default router
