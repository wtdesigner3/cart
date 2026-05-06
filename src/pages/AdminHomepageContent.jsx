import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import api, { authHeaders } from '../utils/api.js'

const defaultHomepageContent = {
  categoriesSection: {
    label: 'Browse categories',
    title: 'All Categories',
    buttonText: 'View all categories →',
  },
  flashSaleSection: {
    label: 'Flash Sale',
    title: 'Shop hot deals before they disappear',
  },
  recommendationsSection: {
    label: "Today's For You!",
    title: 'Personalized recommendations',
  },
  promoSection: {
    title: 'Lets Shop Beyond Boundaries',
    subtitle:
      'From the best seller collections to curated local storefronts, find what you love faster with trusted sellers and premium deals.',
  },
  theme: {
    primaryColor: '#10b981',
    secondaryColor: '#f59e0b',
  },
}

export default function AdminHomepageContent() {
  const token = useSelector((state) => state.user.token)
  const [content, setContent] = useState(defaultHomepageContent)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const headers = authHeaders(token)

  useEffect(() => {
    if (!token) return

    const fetchContent = async () => {
      try {
        const res = await api.get('/homepage')
        setContent((prev) => ({ ...prev, ...res.data }))
      } catch (error) {
        toast.error(error.response?.data?.message || error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [token])

  const handleChange = (event) => {
    const { name, value } = event.target
    const [section, field] = name.split('.')
    setContent((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)

    try {
      await api.put('/homepage', content, headers)
      toast.success('Homepage content saved successfully.')
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">Loading homepage content...</div>
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Homepage Content Management</h1>
        <p className="mt-2 text-sm text-slate-500">Manage homepage section headings and CTA text for the storefront.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Theme settings</h2>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Primary color</span>
              <input
                type="color"
                name="theme.primaryColor"
                value={content.theme.primaryColor}
                onChange={handleChange}
                className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Secondary color</span>
              <input
                type="color"
                name="theme.secondaryColor"
                value={content.theme.secondaryColor}
                onChange={handleChange}
                className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-secondary"
              />
            </label>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Categories section</h2>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Label</span>
              <input
                name="categoriesSection.label"
                value={content.categoriesSection.label}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Title</span>
              <input
                name="categoriesSection.title"
                value={content.categoriesSection.title}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Button text</span>
              <input
                name="categoriesSection.buttonText"
                value={content.categoriesSection.buttonText}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-primary"
              />
            </label>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Flash sale section</h2>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Label</span>
              <input
                name="flashSaleSection.label"
                value={content.flashSaleSection.label}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Title</span>
              <input
                name="flashSaleSection.title"
                value={content.flashSaleSection.title}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-primary"
              />
            </label>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Recommendations section</h2>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Label</span>
              <input
                name="recommendationsSection.label"
                value={content.recommendationsSection.label}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Title</span>
              <input
                name="recommendationsSection.title"
                value={content.recommendationsSection.title}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-primary"
              />
            </label>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Promo section</h2>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Title</span>
              <input
                name="promoSection.title"
                value={content.promoSection.title}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Subtitle</span>
              <textarea
                name="promoSection.subtitle"
                value={content.promoSection.subtitle}
                onChange={handleChange}
                rows={4}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-primary"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
          >
            Save homepage content
          </button>
        </div>
      </form>
    </div>
  )
}
