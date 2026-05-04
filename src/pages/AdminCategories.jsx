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
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  const headers = authHeaders(token)

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories')
      setCategories(res.data)
      setSelectedCategoryIds([])
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (currentPage > 1) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentPage])

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

  const handleToggleSelectCategory = (categoryId) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const handleSelectAllCategories = () => {
    const allIds = categories.map((category) => category._id || category.id)
    const allSelected = allIds.length > 0 && allIds.every((id) => selectedCategoryIds.includes(id))
    setSelectedCategoryIds(allSelected ? [] : allIds)
  }

  const handleDeleteSelectedCategories = async () => {
    if (selectedCategoryIds.length === 0) return
    if (!window.confirm(`Delete ${selectedCategoryIds.length} selected categories?`)) return
    try {
      await api.delete('/categories/bulk', {
        ...headers,
        data: { ids: selectedCategoryIds },
      })
      setSelectedCategoryIds([])
      fetchCategories()
      toast.success('Selected categories deleted successfully.')
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

  const totalPages = Math.max(1, Math.ceil(categories.length / itemsPerPage))
  const pageCategories = categories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

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
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-bold text-white">All Categories ({categories.length})</h3>
            {categories.length > 0 && (
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={categories.length > 0 && categories.every((category) => selectedCategoryIds.includes(category._id || category.id))}
                  onChange={handleSelectAllCategories}
                  className="h-4 w-4 rounded border-slate-500 text-indigo-500"
                />
                Select All
              </label>
            )}
          </div>
          {selectedCategoryIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-700/50 bg-slate-900/70 p-4 text-sm text-slate-200">
              <span>{selectedCategoryIds.length} selected</span>
              <button
                onClick={handleDeleteSelectedCategories}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedCategoryIds([])}
                className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>

        {categories.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-600 bg-slate-800/20 px-6 py-12 text-center">
            <p className="text-slate-400">No categories yet. Create your first one!</p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-3xl border border-slate-700/50 bg-slate-900">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-950">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Select</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Category</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Description</th>
                    <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700 bg-slate-900">
                  {pageCategories.map((category) => {
                    const categoryId = category._id || category.id
                    return (
                      <tr key={categoryId} className="hover:bg-slate-800/70 transition">
                        <td className="px-4 py-4 align-top">
                          <input
                            type="checkbox"
                            checked={selectedCategoryIds.includes(categoryId)}
                            onChange={() => handleToggleSelectCategory(categoryId)}
                            className="h-4 w-4 rounded border-slate-600 text-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="flex items-start gap-3">
                            <div className="h-14 w-14 overflow-hidden rounded-2xl bg-slate-800">
                              {category.image ? (
                                <img src={getImageUrl(category.image)} alt={category.title} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full items-center justify-center text-xs text-slate-500">No image</div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-white">{category.title || 'Untitled category'}</p>
                              <p className="mt-1 text-xs text-slate-500">{category.slug || 'No slug'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <p className="font-semibold text-slate-200">{category.tagline || 'No tagline'}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-400 line-clamp-2">{category.description || 'No description provided.'}</p>
                        </td>
                        <td className="px-4 py-4 text-right align-top">
                          <div className="inline-flex flex-wrap justify-end gap-2">
                            <button
                              onClick={() => handleEdit(category)}
                              className="inline-flex items-center gap-2 rounded-2xl border border-indigo-600 bg-indigo-600/10 px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-600/15"
                            >
                              <Edit2 className="h-3 w-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(categoryId)}
                              className="inline-flex items-center gap-2 rounded-2xl border border-red-600 bg-red-600/10 px-3 py-2 text-xs font-semibold text-red-200 hover:bg-red-600/15"
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
            {categories.length > itemsPerPage && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentPage(index + 1)}
                    className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                      currentPage === index + 1
                        ? 'bg-indigo-600 text-white'
                        : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
