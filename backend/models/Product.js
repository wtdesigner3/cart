import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: String,
    category: String,
    unit: { type: String, default: 'pcs' },
    price: { type: Number, required: true },
    mrp: { type: Number, default: 0 },
    discountedPrice: { type: Number, default: 0 },
    discountPercentage: { type: Number, default: 0 },
    rating: Number,
    stock: Number,
    tags: [String],
    tagline: String,
    brand: String,
    sku: String,
    weight: Number,
    dimensions: Object,
    warrantyInformation: String,
    shippingInformation: String,
    availabilityStatus: String,
    images: [String],
    thumbnail: String,
    homepageSection: { type: String, enum: ['none', 'flashSale', 'recommendations'], default: 'none' },
    homepageTabs: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

const Product = mongoose.model('Product', productSchema)
export default Product
