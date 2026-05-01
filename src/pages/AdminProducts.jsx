import { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import * as CKEditorBuild from '@ckeditor/ckeditor5-build-classic'
import { Trash2, Edit2, Plus, Search } from 'lucide-react'
import api, { authHeaders, getImageUrl } from '../utils/api.js'

const ClassicEditor = CKEditorBuild.default || CKEditorBuild

const initialProductForm = {
  id: '',
  title: '',
  description: '',
  price: 0,
  category: '',
  thumbnail: '',
  stock: 0,
  brand: '',
  sku: '',
}

export default function AdminProducts() {
  const token = useSelector((state) => state.user.token)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(initialProductForm)
  const [editingId, setEditingId] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const formRef = useRef(null)
  const headers = authHeaders(token)

  const fetchData = async () => {
    try {
      const [productRes, categoryRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
      ])
      setProducts(productRes.data)
      setCategories(categoryRes.data)
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const createSlug = (text) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

  const handleProductChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value,
    }))
  }

  const handleEditorChange = (event, editor) => {
    setForm((prev) => ({ ...prev, description: editor.getData() }))
  }

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0]
    setImageFile(file || null)
  }

  const uploadImage = async () => {
    if (!imageFile) return form.thumbnail
    const formData = new FormData()
    formData.append('image', imageFile)
    const response = await api.post('/upload', formData, {
      headers: {
        ...headers.headers,
      },
    })
    return response.data.url
  }

  const handleEditProduct = (product) => {
    setForm({
      id: product.id || product._id,
      title: product.title || '',
      description: product.description || '',
      price: product.price || 0,
      category: product.category || '',
      thumbnail: product.thumbnail || '',
      stock: product.stock || 0,
      brand: product.brand || '',
      sku: product.sku || '',
    })
    setEditingId(product.id || product._id)
    setImageFile(null)
    setShowForm(true)
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' })
      formRef.current?.classList.add('highlight-form')
    }, 100)
  }

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      await api.delete(`/products/${productId}`, headers)
      fetchData()
      toast.success('Product deleted successfully.')
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const handleProductSubmit = async (event) => {
    event.preventDefault()
    try {
      const imageUrl = await uploadImage()
      const payload = {
        ...form,
        id: form.id || Date.now().toString(),
        thumbnail: imageUrl,
      }
      if (editingId) {
        await api.put(`/products/${editingId}`, payload, headers)
        toast.success('Product updated successfully.')
      } else {
        await api.post('/products', payload, headers)
        toast.success('Product created successfully.')
      }
      setForm(initialProductForm)
      setEditingId(null)
      setImageFile(null)
      setShowForm(false)
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const handleReset = () => {
    setForm(initialProductForm)
    setEditingId(null)
    setImageFile(null)
    setShowForm(false)
  }

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku?.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [products, searchTerm],
  )

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ label: category.title, value: category.slug })),
    [categories],
  )

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes highlight {
          0% { background-color: rgba(99, 102, 241, 0.1); border-color: rgb(99, 102, 241); }
          100% { background-color: transparent; border-color: rgb(55, 65, 81); }
        }
        .highlight-form {
          animation: highlight 2s ease-in-out;
        }
      `}</style>

      {/* Add Product Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white">Product Management</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white hover:from-indigo-700 hover:to-purple-700 transition shadow-lg shadow-indigo-500/20"
          >
            <Plus className="h-5 w-5" />
            Add New Product
          </button>
        )}
      </div>

      {/* Form Section */}
      {showForm && (
        <div
          ref={formRef}
          className="rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-800 to-slate-800/50 p-8 shadow-xl"
        >
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white">
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {editingId ? 'Update product details' : 'Fill in all the details below'}
            </p>
          </div>

          <form onSubmit={handleProductSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="rounded-lg border border-slate-700/50 bg-slate-700/20 p-6">
              <h4 className="font-semibold text-white mb-4">Basic Information</h4>
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-300">Product Name *</span>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleProductChange}
                    required
                    className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                    placeholder="e.g., iPhone 15 Pro"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-300">Category *</span>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleProductChange}
                    required
                    className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  >
                    <option value="">Select category</option>
                    {categoryOptions.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="rounded-lg border border-slate-700/50 bg-slate-700/20 p-6">
              <h4 className="font-semibold text-white mb-4">Pricing & Inventory</h4>
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-300">Price ($) *</span>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={handleProductChange}
                    required
                    className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                    placeholder="0.00"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-300">Stock Quantity</span>
                  <input
                    name="stock"
                    type="number"
                    value={form.stock}
                    onChange={handleProductChange}
                    className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                    placeholder="0"
                  />
                </label>
              </div>
            </div>

            {/* Brand & SKU */}
            <div className="rounded-lg border border-slate-700/50 bg-slate-700/20 p-6">
              <h4 className="font-semibold text-white mb-4">Additional Details</h4>
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-300">Brand</span>
                  <input
                    name="brand"
                    value={form.brand}
                    onChange={handleProductChange}
                    className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                    placeholder="e.g., Apple"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-300">SKU</span>
                  <input
                    name="sku"
                    value={form.sku}
                    onChange={handleProductChange}
                    className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                    placeholder="Product SKU"
                  />
                </label>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-lg border border-slate-700/50 bg-slate-700/20 p-6">
              <label className="block">
                <span className="text-sm font-semibold text-slate-300 mb-2 block">Product Description</span>
                <div className="rounded-lg border border-slate-600 bg-slate-700/50 overflow-hidden">
                  <CKEditor
                    editor={ClassicEditor}
                    data={form.description}
                    onChange={handleEditorChange}
                  />
                </div>
              </label>
            </div>

            {/* Image */}
            <div className="rounded-lg border border-slate-700/50 bg-slate-700/20 p-6">
              <h4 className="font-semibold text-white mb-4">Product Image</h4>
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-300">Image URL</span>
                  <input
                    name="thumbnail"
                    value={form.thumbnail}
                    onChange={handleProductChange}
                    className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                    placeholder="https://example.com/image.jpg"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-300">Or Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="mt-2 w-full text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-700"
                  />
                </label>
              </div>
              {form.thumbnail && (
                <div className="mt-4">
                  <img
                    src={getImageUrl(form.thumbnail)}
                    alt="Preview"
                    className="h-32 w-32 rounded-lg object-cover border border-slate-600"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white hover:from-indigo-700 hover:to-purple-700 transition shadow-lg shadow-indigo-500/20"
              >
                <Plus className="h-4 w-4" />
                {editingId ? 'Update Product' : 'Create Product'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 rounded-lg border border-slate-600 px-6 py-3 font-semibold text-slate-300 hover:bg-slate-700/50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div className="rounded-2xl border border-slate-700/30 bg-slate-800/30 backdrop-blur-sm p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-4">
          <h3 className="text-2xl font-bold text-white">All Products ({filteredProducts.length})</h3>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-700/50 pl-10 pr-4 py-2 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
            />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-600 bg-slate-800/20 px-6 py-12 text-center">
            <p className="text-slate-400">
              {searchTerm ? 'No products found.' : 'No products yet. Create your first product!'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Product
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Category
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Price
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Stock
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id || product._id}
                    className="hover:bg-slate-700/20 transition"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {product.thumbnail && (
                          <img
                            src={getImageUrl(product.thumbnail)}
                            alt={product.title}
                            className="h-10 w-10 rounded object-cover bg-slate-700"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-white">{product.title}</p>
                          <p className="text-xs text-slate-500">{product.sku || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-block rounded-full bg-indigo-600/20 px-3 py-1 text-sm font-medium text-indigo-300">
                        {product.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-semibold text-white">${product.price?.toFixed(2)}</td>
                    <td className="px-4 py-4">
                      <span className={`font-semibold ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {product.stock ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="inline-flex items-center gap-1 rounded-lg border border-indigo-600 bg-indigo-600/10 px-3 py-2 text-sm font-semibold text-indigo-400 hover:bg-indigo-600/20 transition"
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id || product._id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-600 bg-red-600/10 px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-600/20 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
