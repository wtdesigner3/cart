import { configureStore } from '@reduxjs/toolkit'
import productReducer from '../features/cart/productSlice.js'
import cartReducer from '../features/cartadd/cartSlice.js'
import orderReducer from '../features/order/orderSlice.js'
import userReducer from '../features/user/userSlice.js'

export const store = configureStore({
  reducer: {
    product: productReducer,
    cart: cartReducer,
    order: orderReducer,
    user: userReducer,
  },
})

