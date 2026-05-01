import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/Layout/Layout.jsx'
import Home from './pages/Home.jsx'
import Checkout from './pages/Checkout.jsx'
import Payment from './pages/Payment.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import OrderSuccess from './pages/OrderSuccess.jsx'
import UserDashboard from './pages/UserDashboard.jsx'
import UserProfile from './pages/UserProfile.jsx'
import UserAddresses from './pages/UserAddresses.jsx'
import UserOrders from './pages/UserOrders.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import OrderHistory from './pages/OrderHistory.jsx'
import AdminLayout from './pages/AdminLayout.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminProducts from './pages/AdminProducts.jsx'
import AdminCategories from './pages/AdminCategories.jsx'
import AdminBanners from './pages/AdminBanners.jsx'
import AdminCarousel from './pages/AdminCarousel.jsx'
import AdminOrders from './pages/AdminOrders.jsx'
import AdminUsers from './pages/AdminUsers.jsx'
import CategoryPage from './pages/CategoryPage.jsx'
import ProductsPage from './pages/ProductsPage.jsx'
import { Provider } from 'react-redux'
import { store } from './app/store.js'
import Cart from './components/cart/Cart.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'

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
        path: 'product/:id',
        element: <ProductDetail />,
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
        path: 'order-success',
        element: <ProtectedRoute><OrderSuccess /></ProtectedRoute>,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: 'reset-password',
        element: <ResetPassword />,
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
        path: 'category/:slug',
        element: <CategoryPage />,
      },
      {
        path: 'products',
        element: <ProductsPage />,
      },
      {
        path: 'user',
        element: <ProtectedRoute><UserDashboard /></ProtectedRoute>,
        children: [
          {
            index: true,
            element: <UserProfile />,
          },
          {
            path: 'profile',
            element: <UserProfile />,
          },
          {
            path: 'addresses',
            element: <UserAddresses />,
          },
          {
            path: 'orders',
            element: <UserOrders />,
          },
        ],
      },
      {
        path: 'admin',
        element: <ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>,
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
            path: 'categories',
            element: <AdminCategories />,
          },
          {
            path: 'banners',
            element: <AdminBanners />,
          },
          {
            path: 'carousel',
            element: <AdminCarousel />,
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
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </Provider>
  </StrictMode>,
)

