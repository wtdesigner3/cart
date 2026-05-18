import { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import * as CKEditorBuild from '@ckeditor/ckeditor5-build-classic'
import { Trash2, Edit2, Plus, Search } from 'lucide-react'
import Loader from '../components/Loader.jsx'
import api, { authHeaders, getImageUrl } from '../utils/api.js'
import { parseCsv } from '../utils/csvParser.js'

const ClassicEditor = CKEditorBuild.default || CKEditorBuild

const initialProductForm = {
  id: '',
  title: '',
  description: '',
  price: 0,
  mrp: 0,
  discountedPrice: 0,
  discountPercentage: 0,
  category: '',
  unit: 'pcs',
  tagline: '',
  tags: '',
  thumbnail: '',
  stock: 0,
  brand: '',
  sku: '',
  homepageSection: 'none',
  homepageTabs: [],
  isActive: true,
}

export default function AdminProducts() {
  const token = useSelector((state) => state.user.token)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [recommendationTabs, setRecommendationTabs] = useState([])
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
  const [pageLoading, setPageLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [activeAction, setActiveAction] = useState({ type: '', id: null })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  const formRef = useRef(null)
  const location = useLocation()
  const progressIntervalRef = useRef(null)
  const headers = authHeaders(token)
  const tabLabelMap = useMemo(
    () => recommendationTabs.reduce((map, tab) => ({ ...map, [tab.key]: tab.label }), {}),
    [recommendationTabs],
  )

  const fetchData = async () => {
    setPageLoading(true)
    try {
      const [productRes, categoryRes, homepageRes] = await Promise.all([
        api.get('/products?includeInactive=true'),
        api.get('/categories'),
        api.get('/homepage'),
      ])
      setProducts(productRes.data)
      setCategories(categoryRes.data)
      setRecommendationTabs(homepageRes.data.recommendationTabs || [])
      setSelectedProductIds([])
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setPageLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [searchTerm])

  useEffect(() => {
    if (currentPage > 1) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentPage])

  useEffect(() => {
    const resetView = () => {
      setShowForm(false)
      setEditingId(null)
      setImageFile(null)
    }

    if (location.pathname === '/admin/products') {
      resetView()
    }

    window.addEventListener('admin-view-products-click', resetView)
    return () => {
      window.removeEventListener('admin-view-products-click', resetView)
    }
  }, [location.pathname])

  const handleProductChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: ['price', 'stock', 'mrp', 'discountedPrice', 'discountPercentage'].includes(name)
        ? Number(value)
        : value,
    }))
  }

  const handleHomepageTabsChange = (key) => {
    setForm((prev) => {
      const homepageTabs = prev.homepageTabs || []
      return {
        ...prev,
        homepageTabs: homepageTabs.includes(key)
          ? homepageTabs.filter((tab) => tab !== key)
          : [...homepageTabs, key],
      }
    })
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
      mrp: product.mrp || 0,
      discountedPrice: product.discountedPrice || 0,
      discountPercentage: product.discountPercentage || 0,
      category: product.category || '',
      unit: product.unit || 'pcs',
      tagline: product.tagline || '',
      tags: product.tags?.join(', ') || '',
      thumbnail: product.thumbnail || '',
      stock: product.stock || 0,
      brand: product.brand || '',
      sku: product.sku || '',
      homepageSection: product.homepageSection || 'none',
      homepageTabs: product.homepageTabs || [],
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
    setActionLoading(true)
    setActiveAction({ type: 'toggle', id: productId })
    try {
      await api.patch(`/products/${productId}/toggle`, {}, headers)
      await fetchData()
      toast.success('Product status updated successfully.')
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setActionLoading(false)
      setActiveAction({ type: '', id: null })
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    setActionLoading(true)
    setActiveAction({ type: 'delete', id: productId })
    try {
      await api.delete(`/products/${productId}`, headers)
      await fetchData()
      toast.success('Product deleted successfully.')
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setActionLoading(false)
      setActiveAction({ type: '', id: null })
    }
  }

  const handleDeleteSelectedProducts = async () => {
    if (selectedProductIds.length === 0) return
    if (!window.confirm(`Delete ${selectedProductIds.length} selected products?`)) return
    setActionLoading(true)
    setActiveAction({ type: 'bulk-delete', id: null })
    try {
      await api.delete('/products/bulk', {
        ...headers,
        data: { ids: selectedProductIds },
      })
      setSelectedProductIds([])
      await fetchData()
      toast.success('Selected products deleted successfully.')
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setActionLoading(false)
      setActiveAction({ type: '', id: null })
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
    setActionLoading(true)
    setActiveAction({ type: 'submit', id: editingId || null })
    try {
      const imageUrl = await uploadImage()
      
      // Calculate discounted price based on discount percentage
      let calculatedPrice = form.price
      if (form.discountPercentage && form.discountPercentage > 0 && form.mrp > 0) {
        calculatedPrice = form.mrp - (form.mrp * form.discountPercentage / 100)
      }
      
      const payload = {
        ...form,
        price: calculatedPrice,
        id: form.id || Date.now().toString(),
        thumbnail: imageUrl,
        tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        discountPercentage: form.discountPercentage || (form.mrp > calculatedPrice ? Math.round(((form.mrp - calculatedPrice) / form.mrp) * 100) : 0),
        homepageTabs: form.homepageTabs || [],
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
      await fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setActionLoading(false)
      setActiveAction({ type: '', id: null })
    }
  }

  const parseBulkProductRows = (rows) =>
    rows.map((row) => ({
      title: row.title || row.name || '',
      description: row.description || '',
      price: Number(row.price || row.priceUsd || 0),
      mrp: Number(row.mrp || 0),
      discountedPrice: Number(row.discountedPrice || row.discountPrice || row.price || 0),
      discountPercentage: Number(row.discountPercentage || 0),
      category: row.category || row.categorySlug || '',
      unit: row.unit || 'pcs',
      tagline: row.tagline || '',
      tags: typeof row.tags === 'string' ? row.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
      homepageSection: ['flashSale', 'recommendations'].includes(row.homepageSection) ? row.homepageSection : 'none',
      homepageTabs: typeof row.homepageTabs === 'string'
        ? row.homepageTabs.split(',').map((tab) => tab.trim()).filter(Boolean)
        : [],
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

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage))
  const pageProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ label: category.title, value: category.slug })),
    [categories],
  )

  if (pageLoading) {
    return <Loader message="Loading admin products..." />
  }

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

      {(actionLoading || bulkLoading) && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
            <span>
              {bulkLoading
                ? 'Uploading bulk products...'
                : activeAction.type === 'submit'
                ? 'Saving product...'
                : activeAction.type === 'toggle'
                ? 'Updating product status...'
                : activeAction.type === 'delete'
                ? 'Deleting product...'
                : activeAction.type === 'bulk-delete'
                ? 'Deleting selected products...'
                : 'Processing...'}
            </span>
          </div>
        </div>
      )}

      {/* Add Product Button */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Product Management</h3>
          <p className="mt-1 text-sm text-gray-600">Upload products in bulk using a CSV file with category mapping.</p>
          <p className="mt-1 text-xs text-gray-500">
            📄 <a href="/sample-products.csv" target="_blank" className="text-blue-600 hover:text-blue-700 underline">Download sample CSV</a> to see the required format
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => {
              setForm(initialProductForm)
              setEditingId(null)
              setImageFile(null)
              setShowForm(true)
            }}
            disabled={actionLoading || bulkLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-5 w-5" />
            Add Product
          </button>
          <label className="inline-flex cursor-pointer items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50">
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
            disabled={!bulkFile || bulkLoading || actionLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark transition shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-5 w-5" />
            Upload Bulk
          </button>
        </div>
      </div>
      {bulkFile && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-sm">
          <p className="font-semibold text-gray-900">CSV format:</p>
          <p className="mt-1 text-gray-600">title,description,price,mrp,discountedPrice,discountPercentage,unit,tagline,tags,category,thumbnail,stock,brand,sku,isActive</p>
          <p className="mt-2 text-gray-500">Category should be slug or title. Missing categories will be created automatically.</p>
          {bulkPreviewRows.length > 0 && (
            <div className="mt-3 rounded-lg bg-gray-50 p-3 text-xs text-gray-700">
              <p className="font-semibold">Preview rows:</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {bulkPreviewRows.slice(0, 3).map((row, index) => (
                  <div key={index} className="rounded-lg bg-white p-3 border border-gray-200">
                    <p className="text-gray-900">{row.title || '(no title)'}</p>
                    <p className="text-gray-500">{row.category || '(no category)'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {bulkErrors.length > 0 && (
            <div className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">
              <p className="font-semibold">Errors:</p>
              <ul className="mt-2 list-disc pl-5">
                {bulkErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {bulkLoading && (
            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-blue-300 bg-white">
                  <span className="absolute inset-0 animate-spin rounded-full border-2 border-blue-300 border-t-transparent" />
                  <span className="relative text-sm font-semibold text-blue-600">{bulkProgress}%</span>
                </div>
                <div className="flex-1">
                  <div className="h-2 overflow-hidden rounded-full bg-blue-200">
                    <div className="h-full rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${bulkProgress}%` }} />
                  </div>
                  <p className="mt-2 text-blue-600">Uploading products... please wait.</p>
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
          className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm"
        >
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {editingId ? 'Update product details' : 'Fill in all the details below'}
            </p>
          </div>

          <form onSubmit={handleProductSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Basic Information</h4>
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Product Name *</span>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleProductChange}
                    required
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    placeholder="e.g., iPhone 15 Pro"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Category *</span>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleProductChange}
                    required
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
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
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Pricing & Inventory</h4>
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Price (₹) *</span>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={handleProductChange}
                    required
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    placeholder="0.00"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">MRP (₹)</span>
                  <input
                    name="mrp"
                    type="number"
                    step="0.01"
                    value={form.mrp}
                    onChange={handleProductChange}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    placeholder="0.00"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Discount (%)</span>
                  <input
                    name="discountPercentage"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={form.discountPercentage}
                    onChange={handleProductChange}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    placeholder="0"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Stock Quantity</span>
                  <input
                    name="stock"
                    type="number"
                    value={form.stock}
                    onChange={handleProductChange}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    placeholder="0"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Unit</span>
                  <select
                    name="unit"
                    value={form.unit}
                    onChange={handleProductChange}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                  >
                    <option value="pcs">pcs</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="l">l</option>
                    <option value="ml">ml</option>
                    <option value="m">m</option>
                    <option value="box">box</option>
                    <option value="pack">pack</option>
                  </select>
                </label>
              </div>

              {/* Discount Preview */}
              {form.mrp > 0 && (form.discountPercentage > 0 || form.price > 0) && (
                <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
                  <h5 className="font-semibold text-green-900 mb-3">💰 Price Preview</h5>
                  <div className="grid gap-4 sm:grid-cols-3 text-sm">
                    <div>
                      <p className="text-green-700 mb-1">Original Price (MRP)</p>
                      <p className="text-xl font-bold text-gray-900">₹{form.mrp.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-green-700 mb-1">Discount Amount</p>
                      <p className="text-xl font-bold text-green-900">
                        ₹{(form.mrp * form.discountPercentage / 100).toFixed(2)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-green-100 p-3">
                      <p className="text-green-700 mb-1">Final Price (Selling Price)</p>
                      <p className="text-2xl font-bold text-green-900">
                        ₹{(form.mrp - (form.mrp * form.discountPercentage / 100)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-green-700">
                    ℹ️ When you save, the final price will be automatically set as the selling price
                  </p>
                </div>
              )}
            </div>

            {/* Brand & SKU */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Additional Details</h4>
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Brand</span>
                  <input
                    name="brand"
                    value={form.brand}
                    onChange={handleProductChange}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    placeholder="e.g., Apple"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">SKU</span>
                  <input
                    name="sku"
                    value={form.sku}
                    onChange={handleProductChange}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    placeholder="Product SKU"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-semibold text-gray-700">Tagline</span>
                  <input
                    name="tagline"
                    value={form.tagline}
                    onChange={handleProductChange}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    placeholder="Short product tagline"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-semibold text-gray-700">Tags</span>
                  <input
                    name="tags"
                    value={form.tags}
                    onChange={handleProductChange}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    placeholder="Comma-separated tags"
                  />
                </label>
              </div>
            </div>

            {/* Homepage Placement */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Homepage Placement</h4>
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Homepage Section</span>
                  <select
                    name="homepageSection"
                    value={form.homepageSection}
                    onChange={handleProductChange}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                  >
                    <option value="none">None</option>
                    <option value="flashSale">Flash Sale</option>
                    <option value="recommendations">Recommendations</option>
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-semibold text-gray-700">Recommendation Tabs</span>
                  <div className="mt-2 grid gap-2 rounded-lg border border-gray-300 bg-white p-4">
                    {(recommendationTabs.length > 0 ? recommendationTabs : []).map((tab) => (
                      <label key={tab.key} className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={form.homepageTabs.includes(tab.key)}
                          onChange={() => handleHomepageTabsChange(tab.key)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{tab.label}</span>
                      </label>
                    ))}
                    {recommendationTabs.length === 0 && (
                      <p className="text-sm text-gray-500">Create recommendation tabs in Homepage Content before assigning products.</p>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Assign this product to any homepage tabs. Flash Sale items can still appear in recommendations when selected.</p>
                </label>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <label className="block">
                <span className="text-sm font-semibold text-gray-700 mb-2 block">Product Description</span>
                <div className="rounded-lg border border-gray-300 bg-white overflow-hidden">
                  <CKEditor
                    editor={ClassicEditor}
                    data={form.description}
                    onChange={handleEditorChange}
                  />
                </div>
              </label>
            </div>

            {/* Image */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Product Image</h4>
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Image URL</span>
                  <input
                    name="thumbnail"
                    value={form.thumbnail}
                    onChange={handleProductChange}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    placeholder="https://example.com/image.jpg"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Or Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="mt-2 w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
                  />
                </label>
              </div>
              {form.thumbnail && (
                <div className="mt-4">
                  <img
                    src={getImageUrl(form.thumbnail)}
                    alt="Preview"
                    className="h-32 w-32 rounded-lg object-cover border border-gray-200"
                  />
                </div>
              )}
            </div>

            {/* Status */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Product Status</h4>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-gray-300 bg-white text-primary focus:ring-primary"
                />
                <span className="text-sm font-semibold text-gray-700">Active (visible on frontend)</span>
              </label>
              <p className="mt-2 text-xs text-gray-500">
                Uncheck to hide this product from the frontend without deleting it.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={actionLoading || bulkLoading}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading && activeAction.type === 'submit' ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving
                  </span>
                ) : (
                  <><Plus className="h-4 w-4" />{editingId ? 'Update Product' : 'Create Product'}</>
                )}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={actionLoading || bulkLoading}
                className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-900 hover:bg-gray-50 transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <h3 className="text-2xl font-bold text-gray-900">All Products ({filteredProducts.length})</h3>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product name, date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
            />
          </div>
        </div>

        {selectedProductIds.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            <span>{selectedProductIds.length} selected</span>
            <button
              onClick={handleDeleteSelectedProducts}
              disabled={actionLoading || bulkLoading}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading && activeAction.type === 'bulk-delete' ? 'Deleting...' : 'Delete Selected'}
            </button>
            <button
              onClick={() => setSelectedProductIds([])}
              className="rounded-lg border border-blue-300 px-4 py-2 text-sm font-semibold text-blue-900 transition hover:bg-blue-100"
            >
              Clear Selection
            </button>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
            <p className="text-gray-600">
              {searchTerm ? 'No products found.' : 'No products yet. Create your first product!'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      <input
                        type="checkbox"
                        checked={filteredProducts.length > 0 && filteredProducts.every((product) => selectedProductIds.includes(product.id || product._id))}
                        onChange={handleSelectAllProducts}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">#</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Products Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Inventory</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Homepage</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pageProducts.map((product, index) => {
                    const productId = product.id || product._id
                    return (
                      <tr key={productId} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-left align-top">
                          <input
                            type="checkbox"
                            checked={selectedProductIds.includes(productId)}
                            onChange={() => handleToggleSelectProduct(productId)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 text-left align-top text-sm font-semibold text-gray-900">
                          #{String((currentPage - 1) * itemsPerPage + index + 1).padStart(4, '0')}
                        </td>
                        <td className="px-6 py-4 text-left align-top">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 overflow-hidden rounded-lg bg-gray-100 flex-shrink-0">
                              {product.thumbnail ? (
                                <img src={getImageUrl(product.thumbnail)} alt={product.title} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full items-center justify-center text-xs text-gray-400">No image</div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate">{product.title}</p>
                              <p className="text-xs text-gray-500">{product.sku || 'No SKU'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-left align-top">
                          <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                            {product.category || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-left align-top">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {product.stock ?? 0} in stock {product.stock > 0 ? `for ${product.stock > 1 ? product.stock + ' variants' : '1 variant'}` : ''}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-left align-top">
                          <p className="font-semibold text-gray-900">₹{product.price?.toFixed(2)}</p>
                        </td>
                        <td className="px-6 py-4 text-left align-top">
                          <div className="space-y-1">
                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                              {product.homepageSection === 'flashSale' ? 'Flash Sale' : product.homepageSection === 'recommendations' ? 'Recommendations' : 'None'}
                            </span>
                            {product.homepageTabs?.length > 0 && (
                              <p className="text-xs text-gray-500">Tabs: {product.homepageTabs.map((tab) => tabLabelMap[tab] || tab).join(', ')}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-left align-top">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${product.isActive ?? true ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {product.isActive ?? true ? 'Publish' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right align-top">
                          <div className="flex flex-wrap justify-end gap-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              disabled={actionLoading || bulkLoading}
                              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Edit2 className="h-3 w-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(productId)}
                              disabled={actionLoading || bulkLoading}
                              className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Trash2 className="h-3 w-3" />
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

            {filteredProducts.length > itemsPerPage && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentPage(index + 1)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      currentPage === index + 1
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
