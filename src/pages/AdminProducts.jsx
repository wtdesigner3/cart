import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import api, { authHeaders } from '../utils/api.js'

const initialForm = {
  id: '',
  title: '',
  description: '',
  price: 0,
  thumbnail: '',
}

export default function AdminProducts() {
  const token = useSelector((state) => state.user.token)
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })

  const headers = authHeaders(token)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products')
      setProducts(response.data)
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || error.message })
    }
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value,
    }))
  }

  const handleEdit = (product) => {
    setForm({
      id: product.id || product._id,
      title: product.title || product.name || '',
      description: product.description || '',
      price: product.price || 0,
      thumbnail: product.thumbnail || '',
    })
    setEditingId(product.id || product._id)
    setMessage({ type: '', text: '' })
  }

  const handleDelete = async (productId) => {
    try {
      await api.delete(`/products/${productId}`, headers)
      setMessage({ type: 'success', text: 'Product deleted successfully.' })
      fetchProducts()
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || error.message })
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage({ type: '', text: '' })
    try {
      const payload = {
        ...form,
        id: form.id || Date.now().toString(),
      }
      if (editingId) {
        await api.put(`/products/${editingId}`, payload, headers)
        setMessage({ type: 'success', text: 'Product updated successfully.' })
      } else {
        await api.post('/products', payload, headers)
        setMessage({ type: 'success', text: 'Product created successfully.' })
      }
      setForm(initialForm)
      setEditingId(null)
      fetchProducts()
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || error.message })
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Product management</h1>
            <p className="text-sm text-slate-500">Create, edit, and remove catalog items.</p>
          </div>
        </div>

        {message.text && (
          <div className={`mt-5 rounded-2xl px-4 py-3 text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Name</span>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Price</span>
              <input
                name="price"
                type="number"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Description</span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Image URL</span>
            <input
              name="thumbnail"
              value={form.thumbnail}
              onChange={handleChange}
              className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
              {editingId ? 'Update product' : 'Create product'}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(initialForm)
                setEditingId(null)
                setMessage({ type: '', text: '' })
              }}
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">All products</h2>
        <div className="mt-6 space-y-4">
          {products.map((product) => (
            <div key={product.id || product._id} className="flex flex-col gap-3 rounded-3xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-900">{product.title || product.name}</p>
                <p className="text-sm text-slate-500">${product.price?.toFixed(2)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(product)}
                  className="rounded-2xl border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(product.id || product._id)}
                  className="rounded-2xl border border-red-600 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {!products.length && <p className="text-sm text-slate-500">No products available yet.</p>}
        </div>
      </div>
    </div>
  )
}
