import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import * as CKEditorBuild from '@ckeditor/ckeditor5-build-classic'
import api, { authHeaders } from '../utils/api.js'

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

const initialCategoryForm = {
  title: '',
  slug: '',
  tagline: '',
  description: '',
  image: '',
}

export default function AdminProducts() {
  const token = useSelector((state) => state.user.token)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [categoryForm, setCategoryForm] = useState(initialCategoryForm)
  const [form, setForm] = useState(initialProductForm)
  const [editingId, setEditingId] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const headers = authHeaders(token)

  const fetchData = async () => {
    try {
      const [productRes, categoryRes] = await Promise.all([api.get('/products'), api.get('/categories')])
      setProducts(productRes.data)
      setCategories(categoryRes.data)
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchData()
    }

    loadInitialData()
  }, [])

  const createSlug = (text) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

  const handleCategoryChange = (event) => {
    const { name, value } = event.target
    setCategoryForm((prev) => ({ ...prev, [name]: value }))
  }

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
      ...headers,
      headers: {
        ...headers.headers,
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.url
  }

  const handleCategorySubmit = async (event) => {
    event.preventDefault()
    try {
      const slug = categoryForm.slug || createSlug(categoryForm.title)
      await api.post('/categories', { ...categoryForm, slug }, headers)
      setCategoryForm(initialCategoryForm)
      fetchData()
      toast.success('Category created successfully.')
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
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
  }

  const handleDeleteProduct = async (productId) => {
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
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ label: category.title, value: category.slug })),
    [categories],
  )

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Product & category management</h1>
            <p className="text-sm text-slate-500">Create categories first, then attach products with image uploads.</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_1.5fr]">
          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Create category</h2>
            <form onSubmit={handleCategorySubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Title</span>
                <input
                  name="title"
                  value={categoryForm.title}
                  onChange={handleCategoryChange}
                  required
                  className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Slug</span>
                <input
                  name="slug"
                  value={categoryForm.slug}
                  onChange={handleCategoryChange}
                  className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
                  placeholder="Optional, auto-generated from title"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Tagline</span>
                <input
                  name="tagline"
                  value={categoryForm.tagline}
                  onChange={handleCategoryChange}
                  className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Description</span>
                <textarea
                  name="description"
                  value={categoryForm.description}
                  onChange={handleCategoryChange}
                  rows={3}
                  className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Category image URL</span>
                <input
                  name="image"
                  value={categoryForm.image}
                  onChange={handleCategoryChange}
                  className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
                />
              </label>
              <button type="submit" className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
                Add category
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Manage products</h2>
            <form onSubmit={handleProductSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Name</span>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleProductChange}
                    required
                    className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Category</span>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleProductChange}
                    required
                    className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
                  >
                    <option value="">Select category</option>
                    {categoryOptions.map((category) => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Price</span>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={handleProductChange}
                    required
                    className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Stock</span>
                  <input
                    name="stock"
                    type="number"
                    value={form.stock}
                    onChange={handleProductChange}
                    className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
                  />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Brand</span>
                  <input
                    name="brand"
                    value={form.brand}
                    onChange={handleProductChange}
                    className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">SKU</span>
                  <input
                    name="sku"
                    value={form.sku}
                    onChange={handleProductChange}
                    className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
                  />
                </label>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-700">Product description</span>
                <div className="mt-2 rounded-3xl border border-slate-300 bg-white px-3 py-2">
                  <CKEditor
                    editor={ClassicEditor}
                    data={form.description}
                    onChange={handleEditorChange}
                  />
                </div>
              </div>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Thumbnail URL</span>
                <input
                  name="thumbnail"
                  value={form.thumbnail}
                  onChange={handleProductChange}
                  className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
                  placeholder="Or upload an image below"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Upload image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="mt-1 w-full text-sm text-slate-700"
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
                  {editingId ? 'Update product' : 'Create product'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setForm(initialProductForm)
                    setEditingId(null)
                    setImageFile(null)
                  }}
                  className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Reset
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">All products</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {products.map((product) => (
                <tr key={product.id || product._id}>
                  <td className="px-4 py-4 text-sm text-slate-900">{product.title}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{product.category || 'Uncategorized'}</td>
                  <td className="px-4 py-4 text-sm text-slate-900">${product.price?.toFixed(2)}</td>
                  <td className="px-4 py-4 text-sm text-slate-900">{product.stock ?? '—'}</td>
                  <td className="px-4 py-4 text-sm text-slate-900">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditProduct(product)}
                        className="rounded-2xl border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product.id || product._id)}
                        className="rounded-2xl border border-red-600 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!products.length && <p className="mt-4 text-sm text-slate-500">No products available yet.</p>}
        </div>
      </div>
    </div>
  )
}
