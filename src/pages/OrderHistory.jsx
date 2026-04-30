import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Loader from '../components/Loader.jsx'
import { fetchOrders } from '../features/order/orderSlice.js'

export default function OrderHistory() {
  const dispatch = useDispatch()
  const { orders, status, error } = useSelector((state) => state.order)

  useEffect(() => {
    dispatch(fetchOrders())
  }, [dispatch])

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">Order history</h1>
        <p className="mt-2 text-sm text-gray-600">Review your completed purchases and order details.</p>
      </div>

      {status === 'loading' && <Loader message="Fetching your order history..." />}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {orders?.length ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="text-lg font-semibold text-gray-900">{order._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-lg font-semibold text-green-600">{order.status || 'Completed'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-lg font-semibold text-gray-900">${order.total?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="text-lg text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-800">Shipping information</p>
                  <p className="text-sm text-gray-700">{order.shippingInfo?.address}</p>
                  <p className="text-sm text-gray-700">{order.shippingInfo?.city}, {order.shippingInfo?.postalCode}</p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-800">Items</p>
                  <ul className="mt-3 space-y-2 text-sm text-gray-700">
                    {order.items?.map((item) => (
                      <li key={item.id} className="flex justify-between">
                        <span>{item.title} × {item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        status !== 'loading' && <p className="rounded-3xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-600">No orders found yet.</p>
      )}
    </div>
  )
}
