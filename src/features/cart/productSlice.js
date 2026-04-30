import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'
import axios from 'axios'

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export const fetchProduct = createAsyncThunk('product/fetchProduct', async () => {
  const response = await axios.get(`${API_BASE}/api/products`)
  return response.data
})
const productSlice = createSlice({
  name: 'product',
  initialState: {
    products: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProduct.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.products = action.payload
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
        toast.error(action.error.message || 'Unable to load products.')
      })
  },
})

export default productSlice.reducer;