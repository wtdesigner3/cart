import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { Trash2, Edit2, Plus } from 'lucide-react'
import api, { authHeaders, getImageUrl } from '../utils/api.js'

const initialCategoryForm = {
  title: '',
  slug: '',
  tagline: '',
  description: '',
  image: '',
}

export default function AdminCategories() {
  const token = useSelector((state) => state.user.token)
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(initialCategoryForm)
  const [editingId, setEditingId] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const headers = authHeaders(token)

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories')
      setCategories(res.data)
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const createSlug = (text) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0]
    setImageFile(file || null)
  }

  const uploadImage = async () => {
    if (!imageFile) return form.image
    const formData = new FormData()
    formData.append('image', imageFile)
    const response = await api.post('/upload', formData, {
      headers: {
        ...headers.headers,
      },
    })
    return response.data.url
  }

  const handleEdit = (category) => {
    setForm({
      title: category.title || '',
      slug: category.slug || '',
      tagline: category.tagline || '',
      description: category.description || '',
      image: category.image || '',
    })
    setEditingId(category._id || category.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return
    try {
      await api.delete(`/categories/${categoryId}`, headers)
      fetchCategories()
      toast.success('Category deleted successfully.')
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      const imageUrl = await uploadImage()
      const payload = {
        ...form,
        slug: form.slug || createSlug(form.title),
        image: imageUrl,
      }

      if (editingId) {
        await api.put(`/categories/${editingId}`, payload, headers)
        toast.success('Category updated successfully.')
      } else {
        await api.post('/categories', payload, headers)
        toast.success('Category created successfully.')
      }

      setForm(initialCategoryForm)
      setEditingId(null)
      setImageFile(null)
      setShowForm(false)
      fetchCategories()
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const handleReset = () => {
    setForm(initialCategoryForm)
    setEditingId(null)
    setImageFile(null)
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      {/* Form Section */}
      <div className="rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-800 to-slate-800/50 p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white">
              {editingId ? 'Edit Category' : 'Create New Category'}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {editingId ? 'Update category details' : 'Add a new product category'}
            </p>
          </div>
          {showForm && (
            <button
              onClick={handleReset}
              className="text-slate-400 hover:text-slate-200 transition"
            >
              ✕
            </button>
          )}
        </div>

        {showForm ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-300">Category Name *</span>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  placeholder="e.g., Electronics"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-300">Slug (auto-generated)</span>
                <input
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  placeholder="Optional, auto-generated from title"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-slate-300">Tagline</span>
              <input
                name="tagline"
                value={form.tagline}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                placeholder="Short category description"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-300">Description</span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                placeholder="Detailed description"
              />
            </label>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-300">Category Image URL</span>
                <input
                  name="image"
                  value={form.image}
                  onChange={handleChange}
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

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white hover:from-indigo-700 hover:to-purple-700 transition shadow-lg shadow-indigo-500/20"
              >
                <Plus className="h-4 w-4" />
                {editingId ? 'Update Category' : 'Create Category'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg border border-slate-600 px-6 py-3 font-semibold text-slate-300 hover:bg-slate-700/50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white hover:from-indigo-700 hover:to-purple-700 transition shadow-lg shadow-indigo-500/20"
          >
            <Plus className="h-5 w-5" />
            Add New Category
          </button>
        )}
      </div>

      {/* Categories List */}
      <div className="rounded-2xl border border-slate-700/30 bg-slate-800/30 backdrop-blur-sm p-8 shadow-xl">
        <h3 className="text-2xl font-bold text-white mb-6">All Categories ({categories.length})</h3>

        {categories.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-600 bg-slate-800/20 px-6 py-12 text-center">
            <p className="text-slate-400">No categories yet. Create your first one!</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category._id || category.id}
                className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="rounded-[26px] bg-slate-100 p-5 text-center">
                  <div className="mx-auto mb-5 inline-flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#eef2ff] text-xs font-semibold uppercase tracking-[0.45em] text-indigo-600">
                    {category.tagline ? category.tagline.split(' ').slice(0, 2).join(' ') : 'POPULAR'}
                  </div>
                  <h4 className="text-xl font-bold tracking-tight text-slate-900">
                    {category.title || 'Category Title'}
                  </h4>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {category.description || 'Shop premium selections'}
                  </p>
                </div>

                <div className="mt-5 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                  {category.image ? (
                    <div className="overflow-hidden rounded-3xl">
                      <img src={getImageUrl(category.image)} alt={category.title} className="h-40 w-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-40 rounded-3xl bg-slate-200" />
                  )}
                  <p className="mt-4 text-xs uppercase tracking-[0.24em] text-indigo-500">
                    CATEGORY
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">Manage this collection</p>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex-1 rounded-2xl border border-indigo-600 bg-indigo-600/10 px-4 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-600/15"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category._id || category.id)}
                    className="flex-1 rounded-2xl border border-red-600 bg-red-600/10 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-600/15"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
