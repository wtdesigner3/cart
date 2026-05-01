import { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import * as CKEditorBuild from '@ckeditor/ckeditor5-build-classic'
import { Trash2, Edit2, Plus, Search } from 'lucide-react'
import api, { authHeaders, getImageUrl } from '../utils/api.js'
import { parseCsv } from '../utils/csvParser.js'

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
  isActive: true,
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
  const [bulkFile, setBulkFile] = useState(null)
  const [bulkErrors, setBulkErrors] = useState([])
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkPreviewRows, setBulkPreviewRows] = useState([])
  const [bulkProgress, setBulkProgress] = useState(0)
  const [selectedProductIds, setSelectedProductIds] = useState([])
  const formRef = useRef(null)
  const progressIntervalRef = useRef(null)
  const headers = authHeaders(token)

  const fetchData = async () => {
    try {
      const [productRes, categoryRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
      ])
      setProducts(productRes.data)
      setCategories(categoryRes.data)
      setSelectedProductIds([])
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

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
      isActive: product.isActive ?? true,
    })
    setEditingId(product.id || product._id)
    setImageFile(null)
    setShowForm(true)
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' })
      formRef.current?.classList.add('highlight-form')
    }, 100)
  }

  const handleToggleProduct = async (productId) => {
    try {
      await api.patch(`/products/${productId}/toggle`, {}, headers)
      fetchData()
      toast.success('Product status updated successfully.')
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
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

  const handleDeleteSelectedProducts = async () => {
    if (selectedProductIds.length === 0) return
    if (!window.confirm(`Delete ${selectedProductIds.length} selected products?`)) return
    try {
      await api.delete('/products/bulk', {
        ...headers,
        data: { ids: selectedProductIds },
      })
      setSelectedProductIds([])
      fetchData()
      toast.success('Selected products deleted successfully.')
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const handleToggleSelectProduct = (productId) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }

  const handleSelectAllProducts = () => {
    const visibleProductIds = filteredProducts.map((product) => product.id || product._id)
    const allSelected = visibleProductIds.length > 0 && visibleProductIds.every((id) => selectedProductIds.includes(id))
    setSelectedProductIds(allSelected ? [] : visibleProductIds)
  }

  const startBulkProgress = () => {
    setBulkProgress(0)
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }
    progressIntervalRef.current = setInterval(() => {
      setBulkProgress((prev) => {
        if (prev >= 95) return 95
        return prev + Math.max(1, Math.floor(Math.random() * 4))
      })
    }, 200)
  }

  const stopBulkProgress = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
    setBulkProgress(100)
    setTimeout(() => setBulkProgress(0), 500)
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

  const parseBulkProductRows = (rows) =>
    rows.map((row) => ({
      title: row.title || row.name || '',
      description: row.description || '',
      price: Number(row.price || row.priceUsd || 0),
      category: row.category || row.categorySlug || '',
      thumbnail: row.thumbnail || row.image || '',
      stock: Number(row.stock || row.quantity || 0),
      brand: row.brand || '',
      sku: row.sku || row.SKU || '',
      isActive: ['true', '1', 'yes', 'active'].includes((row.isActive || 'true').toString().toLowerCase()),
      id: row.id || row.sku || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    }))

  const handleBulkUpload = async () => {
    if (!bulkFile) return
    setBulkLoading(true)
    setBulkErrors([])
    setBulkPreviewRows([])
    startBulkProgress()

    try {
      const text = await bulkFile.text()
      const rows = parseCsv(text)
      const parsedProducts = parseBulkProductRows(rows)
      const errors = []

      parsedProducts.forEach((product, index) => {
        if (!product.title) errors.push(`Row ${index + 2}: title is required.`)
        if (!product.price || Number.isNaN(product.price)) errors.push(`Row ${index + 2}: price must be a number.`)
      })

      if (errors.length) {
        setBulkErrors(errors)
        setBulkPreviewRows(parsedProducts.slice(0, 3))
        setBulkLoading(false)
        stopBulkProgress()
        return
      }

      await api.post('/products/bulk', { products: parsedProducts }, {
        ...headers,
        timeout: 60000,
      })
      toast.success('Bulk products uploaded successfully.')
      setBulkFile(null)
      setBulkPreviewRows([])
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setBulkLoading(false)
      stopBulkProgress()
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">Product Management</h3>
          <p className="mt-1 text-sm text-slate-400">Upload products in bulk using a CSV file with category mapping.</p>
          <p className="mt-1 text-xs text-slate-500">
            📄 <a href="/sample-products.csv" target="_blank" className="text-indigo-400 hover:text-indigo-300 underline">Download sample CSV</a> to see the required format
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="inline-flex cursor-pointer items-center gap-3 rounded-full border border-slate-600 bg-slate-900/80 px-4 py-3 text-sm font-semibold text-white transition hover:border-indigo-500">
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(event) => setBulkFile(event.target.files?.[0] || null)}
            />
            <span>{bulkFile ? bulkFile.name : 'Choose CSV file'}</span>
          </label>
          <button
            onClick={handleBulkUpload}
            disabled={!bulkFile || bulkLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white hover:from-indigo-700 hover:to-purple-700 transition shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            <Plus className="h-5 w-5" />
            Upload Bulk
          </button>
        </div>
      </div>
      {bulkFile && (
        <div className="rounded-2xl border border-slate-700/30 bg-slate-900/60 p-4 text-sm text-slate-300">
          <p className="font-semibold text-slate-100">CSV format:</p>
          <p className="mt-1">title,description,price,category,thumbnail,stock,brand,sku,isActive</p>
          <p className="mt-2 text-slate-400">Category should be slug or title. Missing categories will be created automatically.</p>
          {bulkPreviewRows.length > 0 && (
            <div className="mt-3 rounded-lg bg-slate-950/70 p-3 text-xs text-slate-300">
              <p className="font-semibold">Preview rows:</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {bulkPreviewRows.slice(0, 3).map((row, index) => (
                  <div key={index} className="rounded-lg bg-slate-900/80 p-3">
                    <p className="text-slate-100">{row.title || '(no title)'}</p>
                    <p className="text-slate-400">{row.category || '(no category)'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {bulkErrors.length > 0 && (
            <div className="mt-3 rounded-lg bg-rose-950/80 p-3 text-xs text-rose-200">
              <p className="font-semibold">Errors:</p>
              <ul className="mt-2 list-disc pl-5">
                {bulkErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {bulkLoading && (
            <div className="mt-4 rounded-2xl border border-indigo-500/20 bg-slate-900/70 p-4 text-sm text-slate-300">
              <div className="flex items-center gap-4">
                <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-indigo-500/30 bg-slate-950">
                  <span className="absolute inset-0 animate-spin rounded-full border-2 border-indigo-500/30 border-t-transparent" />
                  <span className="relative text-sm font-semibold text-white">{bulkProgress}%</span>
                </div>
                <div className="flex-1">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-indigo-500 transition-all duration-300" style={{ width: `${bulkProgress}%` }} />
                  </div>
                  <p className="mt-2 text-slate-300">Uploading products... please wait.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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

            {/* Status */}
            <div className="rounded-lg border border-slate-700/50 bg-slate-700/20 p-6">
              <h4 className="font-semibold text-white mb-4">Product Status</h4>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-slate-600 bg-slate-700/50 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-semibold text-slate-300">Active (visible on frontend)</span>
              </label>
              <p className="mt-2 text-xs text-slate-400">
                Uncheck to hide this product from the frontend without deleting it.
              </p>
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
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
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

        {selectedProductIds.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-700/50 bg-slate-900/70 p-4 text-sm text-slate-200">
            <span>{selectedProductIds.length} selected</span>
            <button
              onClick={handleDeleteSelectedProducts}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedProductIds([])}
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              Clear Selection
            </button>
          </div>
        )}

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
                    <input
                      type="checkbox"
                      checked={filteredProducts.length > 0 && filteredProducts.every((product) => selectedProductIds.includes(product.id || product._id))}
                      onChange={handleSelectAllProducts}
                      className="h-4 w-4 rounded border-slate-500 text-indigo-500"
                    />
                  </th>
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
                {filteredProducts.map((product) => {
                  const productId = product.id || product._id
                  return (
                    <tr
                      key={productId}
                      className="hover:bg-slate-700/20 transition"
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedProductIds.includes(productId)}
                          onChange={() => handleToggleSelectProduct(productId)}
                          className="h-4 w-4 rounded border-slate-500 text-indigo-500"
                        />
                      </td>
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
                          onClick={() => handleToggleProduct(product.id || product._id)}
                          className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                            product.isActive ?? true
                              ? 'border-green-600 bg-green-600/10 text-green-400 hover:bg-green-600/20'
                              : 'border-gray-600 bg-gray-600/10 text-gray-400 hover:bg-gray-600/20'
                          }`}
                        >
                          {product.isActive ?? true ? 'Active' : 'Inactive'}
                        </button>
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
                )
              })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
