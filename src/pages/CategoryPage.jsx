import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api, { getImageUrl } from '../utils/api.js'
import Loader from '../components/Loader.jsx'

export default function CategoryPage() {
  const { slug } = useParams()
  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const loadCategory = async () => {
      try {
        setStatus('loading')
        const [categoryRes, productsRes] = await Promise.all([
          api.get('/categories'),
          api.get(`/products?category=${encodeURIComponent(slug)}&limit=20`),
        ])
        const current = categoryRes.data.find((item) => item.slug === slug)
        setCategory(current || null)
        setProducts(productsRes.data)
        setStatus('succeeded')
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || fetchError.message)
        setStatus('failed')
      }
    }
    loadCategory()
  }, [slug])

  if (status === 'loading') {
    return <Loader message="Loading category..." />
  }

  if (status === 'failed') {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-lg text-red-600">
        {error || 'Unable to load this category.'}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Category</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">{category?.title || slug}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{category?.description || 'Explore top products in this collection.'}</p>
          </div>
          <Link to="/" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
            Back to home
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.length ? (
          products.map((product) => (
            <Link
              to={`/product/${product.id || product._id}`}
              key={product.id || product._id}
              className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                <img src={getImageUrl(product.thumbnail)} alt={product.title} className="h-full w-full object-cover" />
              </div>
              <div className="space-y-2 p-5">
                <p className="text-lg font-semibold text-slate-900">{product.title}</p>
                <p className="text-sm text-slate-500 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between pt-3">
                  <span className="text-lg font-bold text-slate-900">${product.price?.toFixed(2)}</span>
                  <span className="text-xs uppercase tracking-[0.2em] text-indigo-600">{product.category || 'Shop'}</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
            No products found for this category.
          </div>
        )}
      </div>
    </div>
  )
}
