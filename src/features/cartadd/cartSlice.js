import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

const API_BASE = 'import.meta.env.VITE_API_URL'

export const fetchCart = createAsyncThunk('cart/fetchCart', async () => {
  const response = await axios.get(`${API_BASE}/api/cart`)
  return response.data
})

export const addCartItem = createAsyncThunk(
  'cart/addCartItem',
  async (product, { getState }) => {
    const { cart } = getState()
    const existingItem = cart.items.find((item) => item.id === product.id)

    if (existingItem) {
      const response = await axios.patch(`${API_BASE}/cart/${existingItem.id}`, {
        quantity: (existingItem.quantity ?? 1) + 1,
      })
      return response.data
    }

    const payload = { ...product, quantity: 1, id: product.id }
    const response = await axios.post(`${API_BASE}/cart`, payload)
    return response.data
  },
)

export const removeCartItem = createAsyncThunk('cart/removeCartItem', async (id) => {
  await axios.delete(`${API_BASE}/cart/${id}`)
  return id
})

export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateCartItemQuantity',
  async ({ id, quantity }) => {
    if (quantity <= 0) {
      await axios.delete(`${API_BASE}/cart/${id}`)
      return { id, deleted: true }
    }
    const response = await axios.patch(`${API_BASE}/cart/${id}`, { quantity })
    return { item: response.data, deleted: false }
  },
)

export const clearCart = createAsyncThunk('cart/clearCart', async () => {
  await axios.delete(`${API_BASE}/cart`)
  return []
})

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.map((item) => ({
          ...item,
          quantity: item.quantity ?? 1,
        }))
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(addCartItem.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(addCartItem.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const addedItem = { ...action.payload, quantity: action.payload.quantity ?? 1 }
        const existing = state.items.find((item) => item.id === addedItem.id)

        if (existing) {
          existing.quantity = addedItem.quantity
        } else {
          state.items.push(addedItem)
        }
      })
      .addCase(addCartItem.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(removeCartItem.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.status = 'succeeded'
        if (action.payload.deleted) {
          state.items = state.items.filter((item) => item.id !== action.payload.id)
          return
        }
        const updatedItem = action.payload.item
        const existing = state.items.find((item) => item.id === updatedItem.id)
        if (existing) {
          existing.quantity = updatedItem.quantity ?? existing.quantity
        }
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(clearCart.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.status = 'succeeded'
        state.items = []
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  },
})

export { cartSlice }
export default cartSlice.reducer;