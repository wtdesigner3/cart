import mongoose from 'mongoose'

const carouselSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: String,
    image: String,
    link: String,
    buttonText: String,
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

const Carousel = mongoose.model('Carousel', carouselSchema)
export default Carousel
