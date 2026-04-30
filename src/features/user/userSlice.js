import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'
import api from '../../utils/api.js'

const userInfoFromStorage = JSON.parse(localStorage.getItem('userInfo') || 'null')
const tokenFromStorage = localStorage.getItem('token') || null

export const login = createAsyncThunk('user/login', async ({ email, password, redirectFrom }) => {
  const response = await api.post('/auth/login', { email, password })
  return { ...response.data, redirectFrom }
})

export const register = createAsyncThunk('user/register', async ({ name, email, password, redirectFrom }) => {
  const response = await api.post('/auth/register', { name, email, password })
  return { ...response.data, redirectFrom }
})

export const fetchAddresses = createAsyncThunk('user/fetchAddresses', async (_, { getState }) => {
  const { user } = getState()
  const response = await api.get('/auth/addresses', {
    headers: { Authorization: `Bearer ${user.token}` },
  })
  return response.data
})

export const addAddress = createAsyncThunk('user/addAddress', async (addressData, { getState }) => {
  const { user } = getState()
  const response = await api.post('/auth/addresses', addressData, {
    headers: { Authorization: `Bearer ${user.token}` },
  })
  return response.data
})

export const updateAddress = createAsyncThunk('user/updateAddress', async ({ id, addressData }, { getState }) => {
  const { user } = getState()
  const response = await api.put(`/auth/addresses/${id}`, addressData, {
    headers: { Authorization: `Bearer ${user.token}` },
  })
  return response.data
})

export const deleteAddress = createAsyncThunk('user/deleteAddress', async (id, { getState }) => {
  const { user } = getState()
  await api.delete(`/auth/addresses/${id}`, {
    headers: { Authorization: `Bearer ${user.token}` },
  })
  return id
})

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userInfo: userInfoFromStorage,
    token: tokenFromStorage,
    addresses: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    logout(state) {
      state.userInfo = null
      state.token = null
      state.status = 'idle'
      state.error = null
      localStorage.removeItem('userInfo')
      localStorage.removeItem('token')
      toast.success('You have been signed out successfully.')
    },
    updateUserInfo(state, action) {
      state.userInfo = action.payload
      localStorage.setItem('userInfo', JSON.stringify(action.payload))
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.userInfo = action.payload.user
        state.token = action.payload.token
        state.error = null
        localStorage.setItem('userInfo', JSON.stringify(action.payload.user))
        localStorage.setItem('token', action.payload.token)
        const redirectFrom = action.payload.redirectFrom || '/' 
        const message = redirectFrom === '/checkout'
          ? 'Login successful, continuing to checkout.'
          : 'Welcome back! You are signed in.'
        toast.success(message)
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
        toast.error(action.error.message || 'Login failed. Please check your credentials.')
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.userInfo = action.payload.user
        state.token = action.payload.token
        state.error = null
        localStorage.setItem('userInfo', JSON.stringify(action.payload.user))
        localStorage.setItem('token', action.payload.token)
        const redirectFrom = action.payload.redirectFrom || '/' 
        const message = redirectFrom === '/checkout'
          ? 'Account created! Continuing to checkout.'
          : 'Account created! You are now signed in.'
        toast.success(message)
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
        toast.error(action.error.message || 'Registration failed. Please try again.')
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.addresses = action.payload
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.addresses.push(action.payload)
        toast.success('Address added successfully')
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        const index = state.addresses.findIndex(addr => addr._id === action.payload._id)
        if (index !== -1) {
          state.addresses[index] = action.payload
          toast.success('Address updated successfully')
        }
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.filter(addr => addr._id !== action.payload)
        toast.success('Address deleted successfully')
      })
  },
})

export const { logout, updateUserInfo } = userSlice.actions
export default userSlice.reducer
