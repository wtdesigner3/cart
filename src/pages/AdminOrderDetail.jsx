import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import api, { authHeaders } from '../utils/api.js'
import Loader from '../components/Loader.jsx'

const statusOptions = ['pending', 'processing', 'shipped', 'completed']

export default function AdminOrderDetail() {
  const { id } = useParams()
  const token = useSelector((state) => state.user.token)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [trackingInputs, setTrackingInputs] = useState({})
  const [couriers, setCouriers] = useState([])
  const [loadingCouriers, setLoadingCouriers] = useState(true)

  const headers = authHeaders(token)

  useEffect(() => {
    if (token) {
      fetchOrder()
      fetchCouriers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, id])

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/orders/${id}`, headers)
      setOrder(response.data)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to load order details.')
    } finally {
      setLoading(false)
    }
  }

  const fetchCouriers = async () => {
    setLoadingCouriers(true)
    try {
      const response = await api.get('/trackcourier/couriers', headers)
      setCouriers(response.data.couriers || [])
    } catch (err) {
      toast.error('Unable to load TrackCourier courier list.')
    } finally {
      setLoadingCouriers(false)
    }
  }

  const handleTrackingInput = (field, value) => {
    setTrackingInputs((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const updateStatus = async (status) => {
    try {
      await api.put(`/orders/${id}`, { status }, headers)
      toast.success('Order status updated.')
      fetchOrder()
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    }
  }

  const updateTracking = async () => {
    const courier = trackingInputs.courier?.trim() ?? order?.courier
    const trackingNumber = trackingInputs.trackingNumber?.trim() ?? order?.trackingNumber

    if (!courier || !trackingNumber) {
      toast.error('Please provide both courier slug and tracking number.')
      return
    }

    try {
      await api.put(
        `/orders/${id}`,
        { courier, trackingNumber },
        headers,
      )
      toast.success('Tracking information updated.')
      fetchOrder()
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    }
  }

  if (loading) {
    return <Loader message="Loading order details..." />
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        <p>{error}</p>
        <Link to="/admin/orders" className="mt-4 inline-block text-indigo-600 hover:text-indigo-500">
          Back to order list
        </Link>
      </div>
    )
  }

  if (!order) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-500">Order details</p>
            <h1 className="text-2xl font-semibold text-gray-900">Order #{order._id}</h1>
            <p className="mt-1 text-sm text-gray-600">Customer: {order.customerName} · {order.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
              {order.status || 'pending'}
            </span>
            <Link to="/admin/orders" className="rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Back to order list
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Shipping address</p>
                <p className="mt-2 text-gray-900">{order.shippingInfo?.address || order.address}</p>
                <p className="text-sm text-gray-600">{order.shippingInfo?.city || order.city}, {order.shippingInfo?.postalCode || order.postalCode}</p>
                <p className="text-sm text-gray-600">{order.shippingInfo?.country || order.country}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Order details</p>
                <p className="mt-2 text-sm text-gray-700">Total: ${order.total?.toFixed(2) || 0}</p>
                <p className="text-sm text-gray-700">Payment: {order.paymentStatus || 'pending'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Items</h2>
            <div className="mt-4 space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Tracking details</h2>
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
                      value={trackingInputs.courier ?? order.courier ?? ''}
                      onChange={(e) => handleTrackingInput('courier', e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="" disabled>Select courier</option>
                      {couriers.map((courier) => (
                        <option key={courier.slug} value={courier.slug}>
                          {courier.name} ({courier.slug})
                        </option>
                      ))}
                      {trackingInputs.courier && !couriers.some((courier) => courier.slug === trackingInputs.courier) && (
                        <option value={trackingInputs.courier}>{trackingInputs.courier} (current)</option>
                      )}
                      {!trackingInputs.courier && order.courier && !couriers.some((courier) => courier.slug === order.courier) && (
                        <option value={order.courier}>{order.courier} (current)</option>
                      )}
                    </select>
                    <p className="mt-2 text-xs text-gray-500">Select the courier name and slug for this shipment.</p>
                  </>
                ) : (
                  <input
                    value={trackingInputs.courier ?? order.courier ?? ''}
                    onChange={(e) => handleTrackingInput('courier', e.target.value)}
                    placeholder="e.g. delhivery"
                    className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
                  />
                )}
              </label>
              <label className="block">
                <span className="text-sm text-gray-600">Tracking number</span>
                <input
                  value={trackingInputs.trackingNumber ?? order.trackingNumber ?? ''}
                  onChange={(e) => handleTrackingInput('trackingNumber', e.target.value)}
                  placeholder="Enter AWB or track number"
                  className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={updateTracking}
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

        <aside className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Update status</h2>
            <div className="mt-4 grid gap-3">
              {statusOptions.map((statusOption) => (
                <button
                  key={statusOption}
                  type="button"
                  onClick={() => updateStatus(statusOption)}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    order.status === statusOption
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
            <div className="mt-4 space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Order ID</span>
                <span className="font-medium text-gray-900">{order._id}</span>
              </div>
              <div className="flex justify-between">
                <span>Date</span>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Courier</span>
                <span className="font-medium text-gray-900">{order.courier || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span>Tracking #</span>
                <span className="font-medium text-gray-900">{order.trackingNumber || 'Not set'}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
