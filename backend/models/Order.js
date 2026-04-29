import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: String,
    country: String,
    postalCode: String,
    items: [
      {
        id: String,
        title: String,
        price: Number,
        quantity: Number,
        thumbnail: String,
      },
    ],
    total: { type: Number, required: true },
    status: { type: String, default: 'pending' },
    paymentStatus: { type: String, default: 'pending' },
    stripeSessionId: String,
  },
  { timestamps: true },
)

const Order = mongoose.model('Order', orderSchema)
export default Order
