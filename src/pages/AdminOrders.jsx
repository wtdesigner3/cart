import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import api, { authHeaders } from '../utils/api.js'

const statusOptions = ['pending', 'processing', 'shipped', 'completed']

export default function AdminOrders() {
  const token = useSelector((state) => state.user.token)
  const [orders, setOrders] = useState([])

  const headers = authHeaders(token)

  useEffect(() => {
    if (token) {
      fetchOrders()
    }
  }, [token])

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders', headers)
      setOrders(response.data)
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}`, { status }, headers)
      toast.success('Order status updated.')
      fetchOrders()
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Order management</h1>
            <p className="text-sm text-gray-500">Review and update current orders.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-4">
              <div>
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="mt-1 font-semibold text-gray-900">{order._id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Customer</p>
                <p className="mt-1 font-semibold text-gray-900">{order.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="mt-1 font-semibold text-gray-900">${order.total?.toFixed(2) || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  order.status === 'completed' ? 'bg-green-100 text-green-700' :
                  order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>{order.status}</span>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {statusOptions.map((statusOption) => (
                <button
                  key={statusOption}
                  type="button"
                  onClick={() => updateStatus(order._id, statusOption)}
                  className={`rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                    order.status === statusOption
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                </button>
              ))}
            </div>

            <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h2 className="text-sm font-semibold text-gray-900">Items</h2>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                {order.items?.map((item) => (
                  <li key={item.id} className="flex justify-between gap-4">
                    <span>{item.title} × {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
        {!orders.length && <p className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-600">No orders found.</p>}
      </div>
    </div>
  )
}
