import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { addAddress, deleteAddress, fetchAddresses, updateAddress } from '../features/user/userSlice'

export default function UserAddresses() {
  const dispatch = useDispatch()
  const { addresses = [], token, userInfo } = useSelector((state) => state.user)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const resetForm = () => {
    setForm({
      fullName: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
    })
    setEditingId(null)
  }

  useEffect(() => {
    if (token && addresses.length === 0) {
      dispatch(fetchAddresses())
    }
  }, [dispatch, token, addresses.length])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const addressData = {
        ...form,
        email: userInfo?.email || '',
      }

      if (editingId) {
        await dispatch(updateAddress({ id: editingId, addressData })).unwrap()
      } else {
        await dispatch(addAddress(addressData)).unwrap()
      }
      setShowForm(false)
      resetForm()
    } catch (error) {
      toast.error(error.message || 'Unable to save address')
    }
  }

  const handleEdit = (addr) => {
    setForm({
      fullName: addr.fullName || '',
      address: addr.address || '',
      city: addr.city || '',
      postalCode: addr.postalCode || '',
      country: addr.country || '',
    })
    setEditingId(addr._id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteAddress(id)).unwrap()
    } catch (error) {
      toast.error(error.message || 'Unable to remove address')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    resetForm()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">My Addresses</h2>
          <p className="mt-2 text-sm text-gray-500">Manage your delivery addresses.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Add Address
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingId ? 'Edit Address' : 'Add New Address'}
            </h3>
            <button
              type="button"
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className="mt-1 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="mt-1 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                className="mt-1 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Postal Code</label>
              <input
                type="text"
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                className="mt-1 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <input
                type="text"
                name="country"
                value={form.country}
                onChange={handleChange}
                className="mt-1 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="flex-1 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              {editingId ? 'Update Address' : 'Save Address'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <p className="text-sm text-gray-500">No addresses saved yet.</p>
          </div>
        ) : (
          addresses.map((addr) => (
            <div key={addr._id || addr.id} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{addr.fullName}</p>
                  <p className="mt-1 text-sm text-gray-600">{addr.address}</p>
                  <p className="text-sm text-gray-600">{addr.city}, {addr.postalCode}</p>
                  <p className="text-sm text-gray-600">{addr.country}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(addr)}
                    className="rounded-2xl bg-blue-600 px-3 py-1 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(addr._id || addr.id)}
                    className="rounded-2xl bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}