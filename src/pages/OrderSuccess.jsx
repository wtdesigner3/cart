import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircleIcon } from '@heroicons/react/24/outline'

export default function OrderSuccess() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id')

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-green-200 bg-green-50 p-12 shadow-sm">
        {/* Success Animation */}
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
          <CheckCircleIcon className="h-12 w-12 animate-pulse text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900">Order Successfully Placed!</h1>
        <p className="mt-4 text-lg text-gray-600">
          Thank you for your purchase. Your order has been confirmed and is being processed.
        </p>

        {orderId && (
          <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="text-lg font-semibold text-gray-900">{orderId}</p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            to="/orders"
            className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            View Order History
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-2xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="mt-12 rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">What's Next?</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-indigo-600">1</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">Order Processing</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-indigo-600">2</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">Shipping</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-indigo-600">3</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">Delivery</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}