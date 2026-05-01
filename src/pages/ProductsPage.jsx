import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api, { getImageUrl } from '../utils/api.js'
import Loader from '../components/Loader.jsx'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const location = useLocation()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortOrder, setSortOrder] = useState('newest')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setStatus('loading')
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products?limit=100'),
          api.get('/categories'),
        ])
        setProducts(productsRes.data)
        setCategories(categoriesRes.data)
        setStatus('succeeded')
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || fetchError.message)
        setStatus('failed')
      }
    }

    loadProducts()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const query = params.get('search') || ''
    setSearchTerm(query)
  }, [location.search])

  const filteredProducts = useMemo(() => {
    const numericMin = minPrice ? Number(minPrice) : null
    const numericMax = maxPrice ? Number(maxPrice) : null

    return products
      .filter((product) => {
        const query = searchTerm.trim().toLowerCase()
        const matchesSearch = query
          ? [product.title, product.description, product.category, product.brand, product.sku]
              .filter(Boolean)
              .some((field) => field.toLowerCase().includes(query))
          : true
        const matchesCategory = selectedCategory ? product.category === selectedCategory : true
        const matchesMin = numericMin !== null ? Number(product.price) >= numericMin : true
        const matchesMax = numericMax !== null ? Number(product.price) <= numericMax : true
        return matchesSearch && matchesCategory && matchesMin && matchesMax
      })
      .sort((a, b) => {
        if (sortOrder === 'price-asc') return Number(a.price) - Number(b.price)
        if (sortOrder === 'price-desc') return Number(b.price) - Number(a.price)
        if (sortOrder === 'alpha') return a.title.localeCompare(b.title)
        return new Date(b.createdAt || b._id)?.getTime() - new Date(a.createdAt || a._id)?.getTime()
      })
  }, [products, searchTerm, selectedCategory, minPrice, maxPrice, sortOrder])

  if (status === 'loading') {
    return <Loader message="Loading products..." />
  }

  if (status === 'failed') {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-lg text-red-600">
        {error || 'Unable to load products.'}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">All products</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Shop everything</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Filter by category, price, and search for the perfect product.</p>
          </div>
          <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-900">{filteredProducts.length}</span> of <span className="font-semibold text-slate-900">{products.length}</span> products
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="sticky top-4 h-fit space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
            <p className="mt-1 text-sm text-slate-500">Refine results instantly.</p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Search</label>
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Min price</label>
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Max price</label>
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                placeholder="999"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Sort by</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="alpha">Name: A to Z</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('')
                setMinPrice('')
                setMaxPrice('')
                setSortOrder('newest')
              }}
              className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Reset filters
            </button>
          </div>
        </aside>

        <main className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.length ? (
              filteredProducts.map((product) => (
                <Link
                  to={`/product/${product.id || product._id}`}
                  key={product.id || product._id}
                  className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-indigo-200"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100 relative">
                    <img src={getImageUrl(product.thumbnail)} alt={product.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="space-y-2 p-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-indigo-600 font-medium">{product.category}</p>
                      <h3 className="mt-1 text-lg font-bold text-slate-900 leading-tight">{product.title}</h3>
                    </div>
                    <p className="text-sm leading-5 text-slate-600 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between gap-3 pt-2">
                      <span className="text-xl font-extrabold text-slate-900">${product.price?.toFixed(2)}</span>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">Buy now</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500">
                No products match your current filters.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
