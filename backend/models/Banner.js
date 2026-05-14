import mongoose from 'mongoose'

const bannerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    subtitle: String,
    description: String,
    bgColor: String,
    bgImage: String,
    textColor: String,
    image: String,
    link: String,
    buttonText: String,
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

const Banner = mongoose.model('Banner', bannerSchema)
export default Banner
