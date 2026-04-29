import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/Layout/Layout.jsx'
import Home from './pages/Home.jsx'
import Checkout from './pages/Checkout.jsx'
import Payment from './pages/Payment.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import OrderHistory from './pages/OrderHistory.jsx'
import AdminLayout from './pages/AdminLayout.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminProducts from './pages/AdminProducts.jsx'
import AdminOrders from './pages/AdminOrders.jsx'
import AdminUsers from './pages/AdminUsers.jsx'
import { Provider } from 'react-redux'
import { store } from './app/store.js'
import Cart from './components/cart/Cart.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'cart',
        element: <Cart />,
      },
      {
        path: 'checkout',
        element: <ProtectedRoute><Checkout /></ProtectedRoute>,
      },
      {
        path: 'payment',
        element: <ProtectedRoute><Payment /></ProtectedRoute>,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'orders',
        element: <ProtectedRoute><OrderHistory /></ProtectedRoute>,
      },
      {
        path: 'admin',
        element: <ProtectedRoute adminOnly={true}><AdminLayout /></ProtectedRoute>,
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
          {
            path: 'products',
            element: <AdminProducts />,
          },
          {
            path: 'orders',
            element: <AdminOrders />,
          },
          {
            path: 'users',
            element: <AdminUsers />,
          },
        ],
      },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)

