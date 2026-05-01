import { useMemo, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { setShippingInfo } from '../features/order/orderSlice'
import { fetchAddresses, addAddress } from '../features/user/userSlice'
import { getImageUrl } from '../utils/api.js'
import { toast } from 'react-toastify'

export default function Checkout() {
  const dispatch = useDispatch()
  const cartItems = useSelector((state) => state.cart.items)
  const shippingInfo = useSelector((state) => state.order.shippingInfo)
  const { addresses, token } = useSelector((state) => state.user)
  const [shipping, setShipping] = useState(shippingInfo)
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [saveAsDefault, setSaveAsDefault] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      dispatch(fetchAddresses())
    }
  }, [token, dispatch])

  useEffect(() => {
    if (token && addresses.length === 0) {
      setShowAddAddress(true)
    }
  }, [token, addresses.length])

  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0),
    [cartItems],
  )

  const handleChange = (event) => {
    const { name, value } = event.target
    setShipping((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddressSelect = (addressId) => {
    const selectedAddress = addresses.find(addr => addr._id === addressId)
    if (selectedAddress) {
      setShipping({
        fullName: selectedAddress.fullName,
        email: selectedAddress.email,
        address: selectedAddress.address,
        city: selectedAddress.city,
        country: selectedAddress.country,
        postalCode: selectedAddress.postalCode,
      })
      setSelectedAddressId(addressId)
    }
  }

  const handleAddAddress = async () => {
    try {
      const addressData = {
        ...shipping,
        isDefault: saveAsDefault,
      }
      await dispatch(addAddress(addressData)).unwrap()
      setSaveAsDefault(false)
      setShowAddAddress(false)
      toast.success('Address saved successfully')
    } catch (error) {
      toast.error('Failed to add address')
    }
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

          {token && addresses.length > 0 && (
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Select a saved address</h3>
              <div className="space-y-3">
                {addresses.map((address) => (
                  <div
                    key={address._id}
                    className={`border rounded-2xl p-4 cursor-pointer transition-colors ${
                      selectedAddressId === address._id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleAddressSelect(address._id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{address.fullName}</p>
                        <p className="text-sm text-gray-600">{address.email}</p>
                        <p className="text-sm text-gray-600">{address.address}</p>
                        <p className="text-sm text-gray-600">{address.city}, {address.country} {address.postalCode}</p>
                      </div>
                      {address.isDefault && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowAddAddress(!showAddAddress)}
                className="mt-3 text-indigo-600 hover:text-indigo-500 text-sm font-medium"
              >
                {showAddAddress ? 'Cancel' : '+ Add new address'}
              </button>
            </div>
          )}

          {(!token || addresses.length === 0 || showAddAddress) && (
            <>
              {token && addresses.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Or enter new address</h3>
                </div>
              )}

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

              {(showAddAddress || addresses.length === 0) && (
                <div className="border-t pt-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                      <h3 className="text-md font-medium text-gray-900">Save this address for future use</h3>
                      <p className="text-sm text-gray-500">You can reuse this address for later orders.</p>
                    </div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={saveAsDefault}
                        onChange={(event) => setSaveAsDefault(event.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">Set as default</span>
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddAddress}
                    className="w-full rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
                  >
                    Save Address
                  </button>
                </div>
              )}
            </>
          )}

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
                <img src={getImageUrl(item.thumbnail)} alt={item.title} className="h-20 w-20 rounded-2xl object-cover" />
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
