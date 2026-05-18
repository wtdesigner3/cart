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
    buttonText: 'View all',
    link: '/products',
  },
  recommendationsSection: {
    label: "Today's For You!",
    title: 'Personalized recommendations',
  },
  promoSection: {
    badgeLabel: 'Limited Time Offer',
    title: 'Lets Shop Beyond Boundaries',
    subtitle:
      'From the best seller collections to curated local storefronts, find what you love faster with trusted sellers and premium deals.',
  },
  recommendationTabs: [
    { key: 'bestSeller', label: 'Best Seller' },
    { key: 'keepStylish', label: 'Keep Stylish' },
    { key: 'specialDiscount', label: 'Special Discount' },
    { key: 'officialStore', label: 'Official Store' },
    { key: 'covetedProduct', label: 'Coveted Product' },
  ],
}

export default function AdminHomepageContent() {
  const token = useSelector((state) => state.user.token)
  const [content, setContent] = useState(defaultHomepageContent)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newTabLabel, setNewTabLabel] = useState('')
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

  const handleTabLabelChange = (index, value) => {
    setContent((prev) => {
      const recommendationTabs = [...(prev.recommendationTabs || [])]
      recommendationTabs[index] = {
        ...recommendationTabs[index],
        label: value,
      }
      return {
        ...prev,
        recommendationTabs,
      }
    })
  }

  const generateTabKey = (label) => {
    const baseKey = label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `tab-${Date.now()}`
    let key = baseKey
    let count = 1
    while (content.recommendationTabs?.some((tab) => tab.key === key)) {
      key = `${baseKey}-${count++}`
    }
    return key
  }

  const handleAddTab = () => {
    const label = newTabLabel.trim()
    if (!label) return
    const key = generateTabKey(label)
    setContent((prev) => ({
      ...prev,
      recommendationTabs: [...(prev.recommendationTabs || []), { key, label }],
    }))
    setNewTabLabel('')
  }

  const handleRemoveTab = (index) => {
    setContent((prev) => {
      const recommendationTabs = [...(prev.recommendationTabs || [])]
      recommendationTabs.splice(index, 1)
      return {
        ...prev,
        recommendationTabs,
      }
    })
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
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Button text</span>
              <input
                name="flashSaleSection.buttonText"
                value={content.flashSaleSection.buttonText}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Button link</span>
              <input
                name="flashSaleSection.link"
                value={content.flashSaleSection.link}
                onChange={handleChange}
                placeholder="/products or /category/sale"
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
            <h2 className="text-xl font-semibold text-slate-900">Recommendation tabs</h2>
            {content.recommendationTabs?.map((tab, index) => (
              <div key={tab.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">{tab.key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}</p>
                  <button
                    type="button"
                    onClick={() => handleRemoveTab(index)}
                    className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                    disabled={content.recommendationTabs.length <= 1}
                  >
                    Remove
                  </button>
                </div>
                <label className="mt-4 block">
                  <span className="text-sm font-semibold text-slate-700">Label</span>
                  <input
                    value={tab.label}
                    onChange={(event) => handleTabLabelChange(index, event.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-primary"
                  />
                </label>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                value={newTabLabel}
                onChange={(event) => setNewTabLabel(event.target.value)}
                placeholder="Add new tab label"
                className="flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-primary"
              />
              <button
                type="button"
                onClick={handleAddTab}
                className="rounded-full bg-[#0a0a0a] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#333]"
              >
                Add tab
              </button>
            </div>
            <p className="text-xs text-slate-500">Create homepage recommendation tabs here and they will appear in the product manager.</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Promo section</h2>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Badge label</span>
              <input
                name="promoSection.badgeLabel"
                value={content.promoSection.badgeLabel}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-primary"
              />
            </label>
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
