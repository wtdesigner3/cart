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
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Order management</h1>
            <p className="text-sm text-slate-500">Review and update current orders.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-4">
              <div>
                <p className="text-sm text-slate-500">Order ID</p>
                <p className="mt-1 font-semibold text-slate-900">{order._id}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Customer</p>
                <p className="mt-1 font-semibold text-slate-900">{order.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Total</p>
                <p className="mt-1 font-semibold text-slate-900">${order.total?.toFixed(2) || 0}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <p className="mt-1 font-semibold text-indigo-700">{order.status}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {statusOptions.map((statusOption) => (
                <button
                  key={statusOption}
                  type="button"
                  onClick={() => updateStatus(order._id, statusOption)}
                  className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  {statusOption}
                </button>
              ))}
            </div>

            <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-100 bg-slate-50 p-4">
              <h2 className="text-sm font-semibold text-slate-900">Items</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
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
        {!orders.length && <p className="rounded-3xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-600">No orders found.</p>}
      </div>
    </div>
  )
}
