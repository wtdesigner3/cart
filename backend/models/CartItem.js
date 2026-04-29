import mongoose from 'mongoose'

const cartItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    productId: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    thumbnail: String,
    category: String,
  },
  { timestamps: true },
)

const CartItem = mongoose.model('CartItem', cartItemSchema)
export default CartItem
