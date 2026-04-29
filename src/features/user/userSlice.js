import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../utils/api.js'

const userInfoFromStorage = JSON.parse(localStorage.getItem('userInfo') || 'null')
const tokenFromStorage = localStorage.getItem('token') || null

export const login = createAsyncThunk('user/login', async ({ email, password }) => {
  const response = await api.post('/auth/login', { email, password })
  return response.data
})

export const register = createAsyncThunk('user/register', async ({ name, email, password }) => {
  const response = await api.post('/auth/register', { name, email, password })
  return response.data
})

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userInfo: userInfoFromStorage,
    token: tokenFromStorage,
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
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
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
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  },
})

export const { logout } = userSlice.actions
export default userSlice.reducer
