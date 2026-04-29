import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api, { authHeaders } from '../../utils/api.js'

export const createOrder = createAsyncThunk('order/createOrder', async (orderData, thunkAPI) => {
  const token = thunkAPI.getState().user.token
  const response = await api.post('/orders', orderData, authHeaders(token))
  return response.data
})

export const fetchOrders = createAsyncThunk('order/fetchOrders', async (_, thunkAPI) => {
  const token = thunkAPI.getState().user.token
  const response = await api.get('/orders', authHeaders(token))
  return response.data
})

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    shippingInfo: {
      fullName: '',
      email: '',
      address: '',
      city: '',
      country: '',
      postalCode: '',
    },
    currentOrder: null,
    orders: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    setShippingInfo(state, action) {
      state.shippingInfo = action.payload
    },
    resetOrder(state) {
      state.currentOrder = null
      state.status = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.currentOrder = action.payload
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.orders = action.payload
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  },
})

export const { setShippingInfo, resetOrder } = orderSlice.actions
export default orderSlice.reducer
