import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    tagline: String,
    description: String,
    image: String,
  },
  { timestamps: true },
)

const Category = mongoose.model('Category', categorySchema)
export default Category
