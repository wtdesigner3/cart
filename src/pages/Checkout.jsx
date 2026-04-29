import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { setShippingInfo } from '../features/order/orderSlice'

export default function Checkout() {
  const dispatch = useDispatch()
  const cartItems = useSelector((state) => state.cart.items)
  const shippingInfo = useSelector((state) => state.order.shippingInfo)
  const [shipping, setShipping] = useState(shippingInfo)
  const navigate = useNavigate()

  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0),
    [cartItems],
  )

  const handleChange = (event) => {
    const { name, value } = event.target
    setShipping((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    dispatch(setShippingInfo(shipping))
    navigate('/payment')
  }

  if (!cartItems.length) {
    return (
      <div className="mx-auto max-w-4xl p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">No items in your cart</h2>
        <p className="mt-2 text-gray-600">Add items to your cart before checking out.</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Continue shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Checkout</h1>
          <p className="mt-1 text-sm text-gray-500">Enter shipping details and review your order before payment.</p>
        </div>
        <div className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Shipping information</h2>
            <p className="mt-1 text-sm text-gray-500">Provide the delivery details for your order.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Full name</span>
              <input
                name="fullName"
                value={shipping.fullName}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Email address</span>
              <input
                type="email"
                name="email"
                value={shipping.email}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Street address</span>
            <input
              name="address"
              value={shipping.address}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">City</span>
              <input
                name="city"
                value={shipping.city}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Country</span>
              <input
                name="country"
                value={shipping.country}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Postal code</span>
              <input
                name="postalCode"
                value={shipping.postalCode}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500"
              />
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            Continue to payment
          </button>
        </form>

        <aside className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Order summary</h2>
            <p className="mt-1 text-sm text-gray-500">Review the items you are buying.</p>
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
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="mt-3 rounded-2xl bg-white p-4 text-sm font-semibold text-gray-900">
              Total due <span className="float-right">${total.toFixed(2)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
