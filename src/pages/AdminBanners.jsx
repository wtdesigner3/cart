import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { Trash2, Edit2, Plus, Search } from 'lucide-react'
import api, { authHeaders, getImageUrl } from '../utils/api.js'
import { parseCsv } from '../utils/csvParser.js'

const initialBannerForm = {
  title: '',
  subtitle: '',
  description: '',
  bgColor: '',
  bgImage: '',
  textColor: '',
  image: '',
  link: '',
  buttonText: '',
  isActive: true,
  order: 0,
}

export default function AdminBanners() {
  const token = useSelector((state) => state.user.token)
  const [banners, setBanners] = useState([])
  const [form, setForm] = useState(initialBannerForm)
  const [editingId, setEditingId] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [bulkFile, setBulkFile] = useState(null)
  const [bulkErrors, setBulkErrors] = useState([])
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkPreviewRows, setBulkPreviewRows] = useState([])
  const [pageLoading, setPageLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [activeAction, setActiveAction] = useState({ type: '', id: null })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  const headers = authHeaders(token)

  const fetchBanners = async () => {
    setPageLoading(true)
    try {
      const res = await api.get('/banners/admin/all', headers)
      setBanners(res.data || [])
    } catch (error) {
      console.error('Failed to fetch banners:', error)
      toast.error('Failed to load banners. Please check if you are logged in as admin.')
      setBanners([])
    } finally {
      setPageLoading(false)
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const filteredBanners = useMemo(() => {
    return banners.filter((banner) =>
      banner.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      banner.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [banners, searchTerm])

  const paginatedBanners = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredBanners.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredBanners, currentPage])

  const totalPages = Math.ceil(filteredBanners.length / itemsPerPage)


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

  const handleEdit = (banner) => {
    setForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      bgColor: banner.bgColor || '',
      bgImage: banner.bgImage || '',
      textColor: banner.textColor || '',
      image: banner.image || '',
      link: banner.link || '',
      buttonText: banner.buttonText || '',
      isActive: banner.isActive ?? true,
      order: banner.order || 0,
    })
    setEditingId(banner._id || banner.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (bannerId) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return
    setActionLoading(true)
    setActiveAction({ type: 'delete', id: bannerId })
    try {
      await api.delete(`/banners/${bannerId}`, headers)
      fetchBanners()
      toast.success('Banner deleted successfully.')
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setActionLoading(false)
      setActiveAction({ type: '', id: null })
    }
  }

  const handleToggle = async (bannerId) => {
    setActionLoading(true)
    setActiveAction({ type: 'toggle', id: bannerId })
    try {
      await api.patch(`/banners/${bannerId}/toggle`, {}, headers)
      fetchBanners()
      toast.success('Banner status updated successfully.')
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setActionLoading(false)
      setActiveAction({ type: '', id: null })
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setActionLoading(true)
    setActiveAction({ type: 'submit', id: editingId || null })
    try {
      const imageUrl = await uploadImage()
      const payload = {
        ...form,
        image: imageUrl,
      }

      if (editingId) {
        await api.put(`/banners/${editingId}`, payload, headers)
        toast.success('Banner updated successfully.')
      } else {
        await api.post('/banners', payload, headers)
        toast.success('Banner created successfully.')
      }

      setForm(initialBannerForm)
      setEditingId(null)
      setImageFile(null)
      setShowForm(false)
      fetchBanners()
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setActionLoading(false)
      setActiveAction({ type: '', id: null })
    }
  }

  const parseBulkBannerRows = (rows) =>
    rows.map((row) => ({
      title: row.title || '',
      subtitle: row.subtitle || row.subTitle || '',
      description: row.description || row.desc || row.shortDescription || '',
      bgColor: row.bgColor || row.backgroundColor || '',
      bgImage: row.bgImage || row.backgroundImage || '',
      textColor: row.textColor || row.textColour || row.text_color || '',
      image: row.image || row.thumbnail || '',
      link: row.link || '',
      buttonText: row.buttonText || row.buttontext || row.button || '',
      isActive: ['true', '1', 'yes', 'active'].includes((row.isActive || 'true').toString().toLowerCase()),
      order: Number(row.order || 0),
      id: row.id || Date.now().toString(),
    }))

  const handleBulkUpload = async () => {
    if (!bulkFile) return
    setBulkLoading(true)
    setBulkErrors([])
    setBulkPreviewRows([])

    try {
      const text = await bulkFile.text()
      const rows = parseCsv(text)
      const parsedBanners = parseBulkBannerRows(rows)
      const errors = []

      parsedBanners.forEach((banner, index) => {
        if (!banner.title) errors.push(`Row ${index + 2}: title is required.`)
        if (!banner.image) errors.push(`Row ${index + 2}: image is required.`)
      })

      if (errors.length) {
        setBulkErrors(errors)
        setBulkPreviewRows(parsedBanners.slice(0, 3))
        setBulkLoading(false)
        return
      }

      await api.post('/banners/bulk', { banners: parsedBanners }, headers)
      toast.success('Bulk banners uploaded successfully.')
      setBulkFile(null)
      setBulkPreviewRows([])
      fetchBanners()
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setBulkLoading(false)
    }
  }

  const handleReset = () => {
    setForm(initialBannerForm)
    setEditingId(null)
    setImageFile(null)
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      {(actionLoading || bulkLoading) && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
            <span>
              {bulkLoading
                ? 'Uploading bulk banners...'
                : activeAction.type === 'submit'
                ? 'Saving banner...'
                : activeAction.type === 'toggle'
                ? 'Updating banner status...'
                : activeAction.type === 'delete'
                ? 'Deleting banner...'
                : 'Processing...'}
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Banner Management</h3>
          <p className="mt-1 text-sm text-gray-600">Upload banners in bulk using a CSV file for homepage hero slides.</p>
          <p className="mt-1 text-xs text-gray-500">
            📄 <a href="/sample-banners.csv" target="_blank" className="text-blue-600 hover:text-blue-700 underline">Download sample CSV</a> for bulk upload format
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => {
              setForm(initialBannerForm)
              setEditingId(null)
              setImageFile(null)
              setShowForm(true)
            }}
            disabled={actionLoading || bulkLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-5 w-5" />
            Add Banner
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
      {/* Form Section */}
      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              {editingId ? 'Edit Banner' : 'Add New Banner'}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {editingId ? 'Update banner details' : 'Fill in all the details below'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Banner Title *</span>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    placeholder="e.g., Summer Sale"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Subtitle</span>
                  <input
                    name="subtitle"
                    value={form.subtitle}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    placeholder="e.g., Promotional badge"
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Short Description</span>
                <input
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                  placeholder="e.g., Modern notebooks with fast delivery"
                />
              </label>

              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Background Color</span>
                  <input
                    name="bgColor"
                    value={form.bgColor}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    placeholder="#F3F4F6"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Background Image URL</span>
                  <input
                    name="bgImage"
                    value={form.bgImage}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    placeholder="https://example.com/background.jpg"
                  />
                </label>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Text Color</span>
                  <input
                    name="textColor"
                    value={form.textColor}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    placeholder="#ffffff or #000000"
                  />
                </label>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Button Text</span>
                <input
                  name="buttonText"
                  value={form.buttonText}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                  placeholder="e.g., Shop Now"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Button Link</span>
                <input
                  name="link"
                  value={form.link}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                  placeholder="e.g., /shop/sale"
                />
              </label>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Image URL</span>
                <input
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                  placeholder="https://example.com/banner.jpg"
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

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Display Order</span>
                <input
                  name="order"
                  type="number"
                  value={form.order}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                  placeholder="0"
                />
              </label>
              <label className="flex items-center gap-3 mt-8">
                <input
                  name="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="rounded border-gray-300 bg-white text-primary focus:ring-primary"
                />
                <span className="text-sm font-semibold text-gray-700">Active</span>
              </label>
            </div>

            {form.image && (
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Preview</p>
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
                disabled={actionLoading || bulkLoading}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading && activeAction.type === 'submit' ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving
                  </span>
                ) : (
                  <><Plus className="h-4 w-4" />{editingId ? 'Update Banner' : 'Create Banner'}</>
                )}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Banners List */}
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">All Banners ({filteredBanners.length})</h3>
            <p className="mt-1 text-sm text-gray-600">Manage your homepage banner slides</p>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search banners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:w-80"
            />
          </div>
        </div>

        {pageLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="inline-flex items-center gap-3">
              <span className="inline-flex h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <span className="text-sm text-gray-600">Loading banners...</span>
            </div>
          </div>
        ) : paginatedBanners.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
            <p className="text-gray-500">
              {searchTerm ? 'No banners match your search.' : 'No banners yet. Create your first promotional banner!'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedBanners
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((banner) => (
                  <div
                    key={banner._id || banner.id}
                    className="rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 hover:shadow-sm transition"
                  >
                    <div className="grid gap-4 md:grid-cols-[160px_minmax(0,1fr)] items-start">
                      {banner.image && (
                        <div className="h-40 min-h-[160px] overflow-hidden rounded-lg bg-gray-100">
                          <img
                            src={getImageUrl(banner.image)}
                            alt={banner.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="space-y-2 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-lg font-bold text-gray-900 truncate">{banner.title}</h4>
                            {banner.description && (
                              <p className="mt-1 text-sm text-gray-700 truncate">{banner.description}</p>
                            )}
                            {banner.subtitle && (
                              <p className="mt-1 text-sm text-blue-600 truncate">{banner.subtitle}</p>
                            )}
                            {banner.buttonText && (
                              <p className="mt-2 text-sm text-gray-600">
                                Button: <span className="text-gray-900">{banner.buttonText}</span>
                              </p>
                            )}
                            {banner.link && (
                              <p className="mt-1 text-sm text-gray-500 truncate">Link: {banner.link}</p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            {banner.isActive ? (
                              <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>
                      <div className="flex gap-2 pt-2 flex-wrap">
                        <button
                          onClick={() => handleToggle(banner._id || banner.id)}
                          disabled={actionLoading || bulkLoading}
                          className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                            banner.isActive
                              ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
                              : 'border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100'
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          {banner.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleEdit(banner)}
                          disabled={actionLoading || bulkLoading}
                          className="flex items-center justify-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(banner._id || banner.id)}
                          disabled={actionLoading || bulkLoading}
                          className="flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                ))}
            </div>

            {totalPages > 1 && (
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
