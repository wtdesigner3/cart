import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import api, { authHeaders } from '../utils/api.js'

const statusOptions = ['pending', 'processing', 'shipped', 'completed']

export default function AdminOrders() {
  const token = useSelector((state) => state.user.token)
  const [orders, setOrders] = useState([])
  const [trackingInputs, setTrackingInputs] = useState({})
  const [couriers, setCouriers] = useState([])
  const [loadingCouriers, setLoadingCouriers] = useState(true)

  const headers = authHeaders(token)

  useEffect(() => {
    if (token) {
      fetchOrders()
      fetchCouriers()
    }
  }, [token])

  const fetchCouriers = async () => {
    setLoadingCouriers(true)
    try {
      const response = await api.get('/trackcourier/couriers', headers)
      setCouriers(response.data.couriers || [])
    } catch (error) {
      toast.error('Unable to load TrackCourier courier list.')
    } finally {
      setLoadingCouriers(false)
    }
  }

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

  const handleTrackingInput = (orderId, field, value) => {
    setTrackingInputs((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [field]: value,
      },
    }))
  }

  const updateTracking = async (orderId) => {
    const order = orders.find((item) => item._id === orderId)
    const inputs = trackingInputs[orderId] || {}
    const courier = inputs.courier?.trim() ?? order?.courier
    const trackingNumber = inputs.trackingNumber?.trim() ?? order?.trackingNumber

    if (!courier || !trackingNumber) {
      toast.error('Please provide both courier slug and tracking number.')
      return
    }

    try {
      await api.put(
        `/orders/${orderId}`,
        { courier, trackingNumber },
        headers,
      )
      toast.success('Tracking information updated.')
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
                <p className="mt-1 font-semibold text-gray-900">₹{order.total?.toFixed(2) || 0}</p>
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

            <div className="mt-4 flex items-center justify-between gap-3">
              <Link
                to={`/admin/orders/${order._id}`}
                className="rounded-2xl border border-indigo-600 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
              >
                View order details
              </Link>
              <p className="text-sm text-gray-600">Click to open the full order detail page.</p>
            </div>

            <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h2 className="text-sm font-semibold text-gray-900">Items</h2>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                {order.items?.map((item) => (
                  <li key={item.id} className="flex justify-between gap-4">
                    <span>{item.title} × {item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4">
              <h2 className="text-sm font-semibold text-gray-900">Tracking details</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm text-gray-600">Courier</span>
                  {loadingCouriers ? (
                    <div className="mt-2 rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                      Loading courier list...
                    </div>
                  ) : couriers.length ? (
                    <>
                      <select
                        value={trackingInputs[order._id]?.courier ?? order.courier ?? ''}
                        onChange={(e) => handleTrackingInput(order._id, 'courier', e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="" disabled>Select courier</option>
                        {couriers.map((courier) => (
                          <option key={courier.slug} value={courier.slug}>
                            {courier.name} ({courier.slug})
                          </option>
                        ))}
                        {trackingInputs[order._id]?.courier && !couriers.some((courier) => courier.slug === trackingInputs[order._id]?.courier) && (
                          <option value={trackingInputs[order._id].courier}>{trackingInputs[order._id].courier} (current)</option>
                        )}
                        {!trackingInputs[order._id]?.courier && order.courier && !couriers.some((courier) => courier.slug === order.courier) && (
                          <option value={order.courier}>{order.courier} (current)</option>
                        )}
                      </select>
                      <p className="mt-2 text-xs text-gray-500">
                        Select the courier name and slug for this shipment. The dropdown is loaded from TrackCourier.
                      </p>
                    </>
                  ) : (
                    <input
                      value={trackingInputs[order._id]?.courier ?? order.courier ?? ''}
                      onChange={(e) => handleTrackingInput(order._id, 'courier', e.target.value)}
                      placeholder="e.g. delhivery"
                      className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
                    />
                  )}
                </label>
                <label className="block">
                  <span className="text-sm text-gray-600">Tracking number</span>
                  <input
                    value={trackingInputs[order._id]?.trackingNumber ?? order.trackingNumber ?? ''}
                    onChange={(e) => handleTrackingInput(order._id, 'trackingNumber', e.target.value)}
                    placeholder="Enter AWB or track number"
                    className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
                  />
                </label>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateTracking(order._id)}
                  className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Save tracking details
                </button>
                {order.courier && order.trackingNumber && (
                  <p className="text-sm text-gray-600">
                    Current: <span className="font-medium text-gray-900">{order.courier}</span> / <span className="font-medium text-gray-900">{order.trackingNumber}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
        {!orders.length && <p className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-600">No orders found.</p>}
      </div>
    </div>
  )
}
