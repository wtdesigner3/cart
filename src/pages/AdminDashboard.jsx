import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import api, { authHeaders } from '../utils/api.js'

export default function AdminDashboard() {
  const token = useSelector((state) => state.user.token)
  const [summary, setSummary] = useState({ products: 0, orders: 0, users: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [message, setMessage] = useState(null)

  const headers = authHeaders(token)

  useEffect(() => {
    if (!token) return

    const fetchSummary = async () => {
      try {
        const [productsRes, ordersRes, usersRes] = await Promise.all([
          api.get('/products'),
          api.get('/orders', headers),
          api.get('/auth/users', headers),
        ])

        setSummary({
          products: productsRes.data.length,
          orders: ordersRes.data.length,
          users: usersRes.data.length,
        })

        // Get recent orders
        const recent = ordersRes.data.slice(0, 5)
        setRecentOrders(recent)
      } catch (error) {
        setMessage(error.response?.data?.message || error.message)
      }
    }

    fetchSummary()
  }, [token])

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-gray-900">Admin overview</h1>
        <p className="mt-2 text-sm text-gray-500">Quick stats for products, orders, and users.</p>
      </div>

      {message && <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</div>}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Products</p>
          <p className="mt-4 text-4xl font-semibold text-gray-900">{summary.products}</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Orders</p>
          <p className="mt-4 text-4xl font-semibold text-gray-900">{summary.orders}</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Users</p>
          <p className="mt-4 text-4xl font-semibold text-gray-900">{summary.users}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
        <div className="mt-4 space-y-4">
          {recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              <div key={order._id} className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Order #{order._id}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">${order.total?.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{order.status || 'Pending'}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No recent orders</p>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Navigation</h2>
        <p className="mt-2 text-sm text-gray-500">Use the sidebar to manage products, review orders, or edit user roles.</p>
      </div>
    </div>
  )
}
