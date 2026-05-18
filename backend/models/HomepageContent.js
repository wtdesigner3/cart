import mongoose from 'mongoose'

const sectionSchema = new mongoose.Schema(
  {
    label: { type: String },
    title: { type: String },
    buttonText: { type: String },
    badgeLabel: { type: String },
    subtitle: { type: String },
  },
  { _id: false },
)

const tabSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
  },
  { _id: false },
)

const homepageContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'homepage' },
    categoriesSection: {
      label: { type: String, default: 'Browse categories' },
      title: { type: String, default: 'All Categories' },
      buttonText: { type: String, default: 'View all categories →' },
    },
    flashSaleSection: {
      label: { type: String, default: 'Flash Sale' },
      title: { type: String, default: 'Shop hot deals before they disappear' },
      buttonText: { type: String, default: 'View all' },
      link: { type: String, default: '/products' },
    },
    recommendationsSection: {
      label: { type: String, default: "Today's For You!" },
      title: { type: String, default: 'Personalized recommendations' },
    },
    promoSection: {
      badgeLabel: { type: String, default: 'Limited Time Offer' },
      title: { type: String, default: 'Lets Shop Beyond Boundaries' },
      subtitle: {
        type: String,
        default:
          'From the best seller collections to curated local storefronts, find what you love faster with trusted sellers and premium deals.',
      },
    },
    recommendationTabs: {
      type: [tabSchema],
      default: [
        { key: 'bestSeller', label: 'Best Seller' },
        { key: 'keepStylish', label: 'Keep Stylish' },
        { key: 'specialDiscount', label: 'Special Discount' },
        { key: 'officialStore', label: 'Official Store' },
        { key: 'covetedProduct', label: 'Coveted Product' },
      ],
    },
  },
  { timestamps: true },
)

const HomepageContent = mongoose.model('HomepageContent', homepageContentSchema)
export default HomepageContent
