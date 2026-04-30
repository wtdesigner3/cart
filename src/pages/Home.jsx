import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api.js'
import Loader from '../components/Loader.jsx'

export default function Home() {
  const [categories, setCategories] = useState([])
  const [categoryProducts, setCategoryProducts] = useState({})
  const [featured, setFeatured] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setStatus('loading')
        const [categoryRes, featuredRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products?limit=8'),
        ])
        setCategories(categoryRes.data)
        setFeatured(featuredRes.data)

        const categorySet = categoryRes.data.slice(0, 4)
        const productsByCategory = {}
        await Promise.all(
          categorySet.map(async (category) => {
            const response = await api.get(`/products?category=${encodeURIComponent(category.slug)}&limit=6`)
            productsByCategory[category.slug] = response.data
          }),
        )
        setCategoryProducts(productsByCategory)
        setStatus('succeeded')
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || fetchError.message)
        setStatus('failed')
      }
    }

    loadHomeData()
  }, [])

  const productGridColumns = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

  if (status === 'loading') {
    return <Loader message="Loading homepage data..." />
  }

  if (status === 'failed') {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-lg text-red-600">
        {error || 'Unable to load homepage content. Please try again later.'}
      </div>
    )
  }

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <p className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.32em] text-white/80">
                New arrivals
              </p>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Seasonal styles that stand out</h1>
              <p className="max-w-xl text-lg leading-8 text-white/80">Explore curated collections with premium deals for every look.</p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/cart"
                  className="inline-flex items-center justify-center rounded-3xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-900/20 transition hover:bg-slate-100"
                >
                  Shop new arrivals
                </Link>
                <Link to="/user" className="inline-flex items-center justify-center rounded-3xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10">
                  My account
                </Link>
              </div>
            </div>
            <div className="grid gap-4">
              <div className="rounded-[32px] bg-pink-600 p-10 shadow-2xl shadow-pink-500/20">
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-white/80">Bold essentials</p>
                <h2 className="mt-4 text-3xl font-bold text-white">Refresh your wardrobe with statement pieces.</h2>
              </div>
              <div className="rounded-[32px] bg-indigo-600 p-10 shadow-2xl shadow-indigo-500/20">
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-white/80">Curated collections</p>
                <h2 className="mt-4 text-3xl font-bold text-white">Discover designer favorites for every occasion.</h2>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Find your next favorite collection</h2>
            <p className="mt-2 text-sm text-slate-600">Categories designed for fast browsing, better performance, and strong merchandising.</p>
          </div>
          <Link to="/cart" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
            Explore all categories →
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 4).map((category) => (
            <Link
              to={`/category/${category.slug}`}
              key={category.slug}
              className="group overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 h-40 rounded-3xl bg-slate-100 p-6 text-left">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">{category.title}</p>
                <p className="mt-4 text-base font-semibold text-slate-900">{category.tagline || 'Shop premium selections'}</p>
              </div>
              <p className="text-sm leading-6 text-slate-600 line-clamp-3">{category.description || 'Curated products with quality, style, and fast delivery.'}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Featured products</h2>
            <p className="mt-1 text-sm text-slate-600">Only a small selection loads on the homepage for better performance.</p>
          </div>
          <Link to="/cart" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
            View all products
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.slice(0, 8).map((product) => (
            <Link
              key={product.id || product._id}
              to={`/product/${product.id || product._id}`}
              className="group overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <div className="space-y-2 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{product.category}</p>
                <h3 className="text-lg font-semibold text-slate-900">{product.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between pt-3">
                  <span className="text-lg font-bold text-slate-900">${product.price.toFixed(2)}</span>
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">Buy now</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {categories.slice(0, 3).map((category) => (
        <section key={category.slug} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">{category.title}</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{category.tagline || 'Top picks'}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{category.description || 'Shop this collection for curated favorites.'}</p>
            </div>
            <Link to={`/category/${category.slug}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
              View all in {category.title}
            </Link>
          </div>

          <div className={`grid gap-4 ${productGridColumns}`}>
            {categoryProducts[category.slug]?.map((product) => (
              <Link
                key={product.id || product._id}
                to={`/product/${product.id || product._id}`}
                className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                  <img src={product.thumbnail} alt={product.title} className="h-full w-full object-cover" />
                </div>
                <div className="space-y-2 p-4">
                  <p className="text-sm font-semibold text-slate-900">{product.title}</p>
                  <p className="text-sm text-slate-500 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between pt-3">
                    <span className="text-sm font-semibold text-slate-900">${product.price.toFixed(2)}</span>
                    <span className="text-xs uppercase tracking-[0.2em] text-indigo-600">{product.category}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

