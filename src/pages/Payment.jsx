import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { clearCart } from '../features/cartadd/cartSlice'
import api from '../utils/api.js'

export default function Payment() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const cartItems = useSelector((state) => state.cart.items)
  const shippingInfo = useSelector((state) => state.order.shippingInfo)
  const [status, setStatus] = useState({ loading: false, success: '', error: '' })

  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0),
    [cartItems],
  )

  useEffect(() => {
    if (!shippingInfo.fullName && cartItems.length) {
      navigate('/checkout')
    }
  }, [shippingInfo, cartItems, navigate])

  useEffect(() => {
    if (sessionId) {
      confirmStripeSession(sessionId)
    }
  }, [sessionId])

  const confirmStripeSession = async (sessionId) => {
    setStatus({ loading: true, success: '', error: '' })

    try {
      const response = await api.get(`/payments/confirm-session?session_id=${sessionId}`)
      await dispatch(clearCart())
      setStatus({ loading: false, success: 'Payment completed successfully. Your order is confirmed.', error: '' })
    } catch (error) {
      setStatus({ loading: false, success: '', error: error.response?.data?.message || error.message })
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus({ loading: true, success: '', error: '' })

    try {
      const orderPayload = {
        customerName: shippingInfo.fullName,
        email: shippingInfo.email,
        address: shippingInfo.address,
        city: shippingInfo.city,
        country: shippingInfo.country,
        postalCode: shippingInfo.postalCode,
        items: cartItems.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity ?? 1,
          thumbnail: item.thumbnail,
        })),
        total,
      }

      const response = await api.post('/payments/create-checkout-session', orderPayload)
      window.location.href = response.data.url
    } catch (error) {
      setStatus({ loading: false, success: '', error: error.response?.data?.message || error.message })
    }
  }

  if (!cartItems.length) {
    return (
      <div className="mx-auto max-w-4xl p-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">No items in cart</h1>
        <p className="mt-2 text-gray-600">Add products to your cart before completing payment.</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Back to store
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Payment</h1>
        <p className="mt-2 text-sm text-gray-500">Use Stripe test mode to complete the payment.</p>
      </div>

      {status.error && (
        <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {status.error}
        </div>
      )}

      {status.success && (
        <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-700">
          {status.success}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Stripe test payment</h2>
            <p className="mt-1 text-sm text-gray-500">You will be redirected to Stripe checkout in test mode. Use the card number below to simulate a successful payment.</p>
          </div>

          <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-900">
            <p className="font-semibold">Test card</p>
            <p>4242 4242 4242 4242</p>
            <p>Any future expiry date</p>
            <p>Any CVC</p>
          </div>

          <button
            type="submit"
            disabled={status.loading}
            className="w-full rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status.loading ? 'Redirecting to Stripe…' : `Pay $${total.toFixed(2)} with Stripe`}
          </button>
        </form>

        <aside className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Your order</h2>
            <p className="mt-1 text-sm text-gray-500">Summary of items in your cart.</p>
          </div>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 rounded-3xl border border-gray-200 bg-gray-50 p-4">
                <img src={item.thumbnail} alt={item.title} className="h-20 w-20 rounded-2xl object-cover" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{item.quantity ?? 1} × ${item.price.toFixed(2)}</p>
                </div>
                <div className="text-sm font-semibold text-gray-900">${((item.quantity ?? 1) * item.price).toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="rounded-3xl bg-gray-100 p-4 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Order total</span>
              <span className="font-semibold text-gray-900">${total.toFixed(2)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
