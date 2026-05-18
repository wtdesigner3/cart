import express from 'express'
import { protect, admin } from '../middleware/authMiddleware.js'
import HomepageContent from '../models/HomepageContent.js'

const router = express.Router()

const DEFAULT_HOMEPAGE_CONTENT = {
  key: 'homepage',
  categoriesSection: {
    label: 'Browse categories',
    title: 'All Categories',
    buttonText: 'View all categories →',
  },
  flashSaleSection: {
    label: 'Flash Sale',
    title: 'Shop hot deals before they disappear',
    buttonText: 'View all',
    link: '/products',
  },
  recommendationsSection: {
    label: "Today's For You!",
    title: 'Personalized recommendations',
  },
  promoSection: {
    badgeLabel: 'Limited Time Offer',
    title: 'Lets Shop Beyond Boundaries',
    subtitle:
      'From the best seller collections to curated local storefronts, find what you love faster with trusted sellers and premium deals.',
  },
  recommendationTabs: [
    { key: 'bestSeller', label: 'Best Seller' },
    { key: 'keepStylish', label: 'Keep Stylish' },
    { key: 'specialDiscount', label: 'Special Discount' },
    { key: 'officialStore', label: 'Official Store' },
    { key: 'covetedProduct', label: 'Coveted Product' },
  ],
}

const getHomepageContent = async () => {
  let content = await HomepageContent.findOne({ key: 'homepage' })

  if (!content) {
    content = await HomepageContent.create(DEFAULT_HOMEPAGE_CONTENT)
  }

  return content
}

router.get('/', async (req, res) => {
  try {
    const content = await getHomepageContent()
    res.json(content)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.put('/', protect, admin, async (req, res) => {
  try {
    const content = await HomepageContent.findOneAndUpdate(
      { key: 'homepage' },
      { $set: req.body },
      { new: true, upsert: true, runValidators: true },
    )

    res.json(content)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
