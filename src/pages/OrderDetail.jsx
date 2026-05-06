import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api, { authHeaders } from '../utils/api.js'
import Loader from '../components/Loader.jsx'
import OrderTrackingPanel from '../components/OrderTrackingPanel.jsx'

export default function OrderDetail() {
  const { id } = useParams()
  const token = useSelector((state) => state.user.token)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`, authHeaders(token))
        setOrder(response.data)
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Unable to load order details.')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchOrder()
    }
  }, [id, token])

  const handleDownloadInvoice = async () => {
    try {
      const response = await api.get(`/orders/${id}/invoice`, {
        ...authHeaders(token),
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `invoice-${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed:', err)
      alert('Failed to download invoice')
    }
  }

  if (loading) {
    return <Loader message="Loading order details..." />
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        <p>{error}</p>
        <Link to="/orders" className="mt-4 inline-block text-indigo-600 hover:text-indigo-500">
          Back to orders
        </Link>
      </div>
    )
  }

  if (!order) {
    return null
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-500">Order details</p>
            <h1 className="text-2xl font-semibold text-gray-900">Order #{order._id}</h1>
            <p className="mt-1 text-sm text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
              {order.status || 'Pending'}
            </span>
            <Link to="/orders" className="rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Back to orders
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
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
                <p className="text-sm text-gray-500">Customer</p>
                <p className="mt-2 text-gray-900">{order.customerName}</p>
                <p className="text-sm text-gray-600">{order.email}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">Order total</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">₹{order.total?.toFixed(2) || 0}</p>
              </div>
              <button
                onClick={handleDownloadInvoice}
                className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Download Invoice
              </button>
            </div>
            <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
              <p className="font-medium text-gray-900">Payment status</p>
              <p>{order.paymentStatus || 'Pending'}</p>
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
                  <p className="text-sm font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <OrderTrackingPanel order={order} />

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Order summary</h2>
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
        </div>
      </div>
    </div>
  )
}
