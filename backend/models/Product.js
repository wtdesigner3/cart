import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: String,
    category: String,
    price: { type: Number, required: true },
    discountPercentage: Number,
    rating: Number,
    stock: Number,
    tags: [String],
    brand: String,
    sku: String,
    weight: Number,
    dimensions: Object,
    warrantyInformation: String,
    shippingInformation: String,
    availabilityStatus: String,
    images: [String],
    thumbnail: String,
  },
  { timestamps: true },
)

const Product = mongoose.model('Product', productSchema)
export default Product
