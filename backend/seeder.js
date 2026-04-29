import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import Product from './models/Product.js'
import CartItem from './models/CartItem.js'

dotenv.config()
connectDB()

const importData = async () => {
  try {
    const dataPath = path.resolve(process.cwd(), '../db.json')
    const raw = fs.readFileSync(dataPath, 'utf-8')
    const data = JSON.parse(raw)

    await Product.deleteMany()
    await CartItem.deleteMany()

    if (data.products) {
      await Product.insertMany(data.products)
      console.log('Products imported')
    }

    if (data.cart) {
      const cartItems = data.cart.map((item) => ({
        id: item.id,
        productId: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity ?? 1,
        thumbnail: item.thumbnail,
        category: item.category,
      }))
      await CartItem.insertMany(cartItems)
      console.log('Cart items imported')
    }

    process.exit(0)
  } catch (error) {
    console.error(`Error importing data: ${error.message}`)
    process.exit(1)
  }
}

importData()
