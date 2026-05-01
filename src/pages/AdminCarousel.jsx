import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { Trash2, Edit2, Plus, GripVertical } from 'lucide-react'
import api, { authHeaders, getImageUrl } from '../utils/api.js'

const initialCarouselItemForm = {
  title: '',
  description: '',
  image: '',
  link: '',
  buttonText: '',
  order: 0,
  isActive: true,
}

export default function AdminCarousel() {
  const token = useSelector((state) => state.user.token)
  const [items, setItems] = useState([])
  const [form, setForm] = useState(initialCarouselItemForm)
  const [editingId, setEditingId] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const headers = authHeaders(token)

  const fetchCarouselItems = async () => {
    try {
      const res = await api.get('/carousel')
      setItems(res.data || [])
    } catch (error) {
      // Silently ignore if endpoint doesn't exist yet
      setItems([])
    }
  }

  useEffect(() => {
    fetchCarouselItems()
  }, [])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'order' ? Number(value) : value,
    }))
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

  const handleEdit = (item) => {
    setForm({
      title: item.title || '',
      description: item.description || '',
      image: item.image || '',
      link: item.link || '',
      buttonText: item.buttonText || '',
      order: item.order || 0,
      isActive: item.isActive ?? true,
    })
    setEditingId(item._id || item.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this carousel item?')) return
    try {
      await api.delete(`/carousel/${itemId}`, headers)
      fetchCarouselItems()
      toast.success('Carousel item deleted successfully.')
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
        image: imageUrl,
      }

      if (editingId) {
        await api.put(`/carousel/${editingId}`, payload, headers)
        toast.success('Carousel item updated successfully.')
      } else {
        await api.post('/carousel', payload, headers)
        toast.success('Carousel item created successfully.')
      }

      setForm(initialCarouselItemForm)
      setEditingId(null)
      setImageFile(null)
      setShowForm(false)
      fetchCarouselItems()
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const handleReset = () => {
    setForm(initialCarouselItemForm)
    setEditingId(null)
    setImageFile(null)
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="rounded-lg border border-indigo-600/30 bg-indigo-600/10 p-4">
        <p className="text-sm text-indigo-300">
          💡 <strong>Tip:</strong> Carousel items are displayed using Embla Carousel with auto-rotation. Set the order to control display sequence. Enable/disable items to control visibility.
        </p>
      </div>

      {/* Form Section */}
      <div className="rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-800 to-slate-800/50 p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white">
              {editingId ? 'Edit Carousel Item' : 'Add Carousel Item'}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {editingId ? 'Update carousel item details' : 'Add a new slide to the product carousel'}
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
                <span className="text-sm font-semibold text-slate-300">Slide Title *</span>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  placeholder="e.g., New Collection"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-300">Description</span>
                <input
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  placeholder="Short description"
                />
              </label>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-300">Button Text</span>
                <input
                  name="buttonText"
                  value={form.buttonText}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  placeholder="e.g., View Now"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-300">Button Link</span>
                <input
                  name="link"
                  value={form.link}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  placeholder="e.g., /product/123"
                />
              </label>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-300">Slide Image URL</span>
                <input
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  placeholder="https://example.com/slide.jpg"
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

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-300">Display Order</span>
                <input
                  name="order"
                  type="number"
                  value={form.order}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  placeholder="0"
                />
              </label>
              <label className="flex items-center gap-3 mt-8">
                <input
                  name="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="h-5 w-5 rounded border-slate-600 bg-slate-700/50 text-indigo-600 accent-indigo-600"
                />
                <span className="text-sm font-semibold text-slate-300">Active</span>
              </label>
            </div>

            {form.image && (
              <div className="rounded-lg border border-slate-600 p-4">
                <p className="text-sm font-semibold text-slate-300 mb-2">Preview</p>
                <img
                  src={getImageUrl(form.image)}
                  alt="Preview"
                  className="h-40 w-full rounded-lg object-cover"
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white hover:from-indigo-700 hover:to-purple-700 transition shadow-lg shadow-indigo-500/20"
              >
                <Plus className="h-4 w-4" />
                {editingId ? 'Update Item' : 'Add Item'}
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
            Add New Slide
          </button>
        )}
      </div>

      {/* Carousel Items List */}
      <div className="rounded-2xl border border-slate-700/30 bg-slate-800/30 backdrop-blur-sm p-8 shadow-xl">
        <h3 className="text-2xl font-bold text-white mb-6">Carousel Slides ({items.length})</h3>

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-600 bg-slate-800/20 px-6 py-12 text-center">
            <p className="text-slate-400">No carousel items yet. Create your first slide!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((item) => (
                <div
                  key={item._id || item.id}
                  className="rounded-lg border border-slate-700/50 bg-slate-700/20 p-4 hover:border-slate-600 hover:bg-slate-700/30 transition"
                >
                  <div className="grid gap-4 md:grid-cols-[200px_1fr_auto]">
                    <div className="flex items-start gap-2 md:flex-col md:items-center md:gap-3">
                      <GripVertical className="h-5 w-5 text-slate-500 flex-shrink-0 md:hidden" />
                      {item.image && (
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.title}
                          className="h-32 w-full rounded-lg object-cover bg-slate-800 md:w-40"
                        />
                      )}
                    </div>
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-white">{item.title}</h4>
                          {item.description && (
                            <p className="mt-1 text-sm text-indigo-400">{item.description}</p>
                          )}
                          {item.buttonText && (
                            <p className="mt-2 text-sm text-slate-400">
                              Button: <span className="text-slate-300">{item.buttonText}</span>
                            </p>
                          )}
                          {item.link && (
                            <p className="mt-1 text-sm text-slate-500">Link: {item.link}</p>
                          )}
                          <p className="mt-2 text-xs text-slate-500">Order: {item.order || 0}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
                          {item.isActive ? (
                            <span className="inline-block rounded-full bg-green-600/20 px-3 py-1 text-xs font-semibold text-green-400">
                              Active
                            </span>
                          ) : (
                            <span className="inline-block rounded-full bg-slate-600/20 px-3 py-1 text-xs font-semibold text-slate-400">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex items-center justify-center gap-2 rounded-lg border border-indigo-600 bg-indigo-600/10 px-3 py-2 text-sm font-semibold text-indigo-400 hover:bg-indigo-600/20 transition"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id || item.id)}
                        className="flex items-center justify-center gap-2 rounded-lg border border-red-600 bg-red-600/10 px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-600/20 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

    </div>
  )
}
