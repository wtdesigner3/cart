import express from 'express'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

let homepageContent = {
  categoriesSection: {
    label: 'Browse categories',
    title: 'All Categories',
    buttonText: 'View all categories →',
  },
  flashSaleSection: {
    label: 'Flash Sale',
    title: 'Shop hot deals before they disappear',
  },
  recommendationsSection: {
    label: "Today's For You!",
    title: 'Personalized recommendations',
  },
  promoSection: {
    title: 'Lets Shop Beyond Boundaries',
    subtitle:
      'From the best seller collections to curated local storefronts, find what you love faster with trusted sellers and premium deals.',
  },
}

router.get('/', async (req, res) => {
  try {
    res.json(homepageContent)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.put('/', protect, admin, async (req, res) => {
  try {
    homepageContent = {
      ...homepageContent,
      ...req.body,
    }

    res.json(homepageContent)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
