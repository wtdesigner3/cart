import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { addCartItem } from '../features/cartadd/cartSlice'
import api, { getImageUrl } from '../utils/api.js'
import Loader from '../components/Loader.jsx'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    const loadProduct = async () => {
      setStatus('loading')
      setError('')
      try {
        const [detailRes, allRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get('/products'),
        ])

        const detail = detailRes.data
        const allProducts = allRes.data

        setProduct(detail)
        const relatedProducts = allProducts
          .filter((item) => item.category === detail.category && item.id !== detail.id)
          .slice(0, 4)

        setRelated(relatedProducts)
        setStatus('succeeded')
      } catch (err) {
        setStatus('failed')
        setError(err.response?.data?.message || err.message || 'Unable to load product details.')
      }
    }

    loadProduct()
  }, [id])

  const handleAddToCart = async () => {
    if (product) {
      await dispatch(addCartItem(product))
    }
  }

  const rating = useMemo(() => {
    if (!product?.rating) return null
    return `${product.rating.toFixed(1)} / 5` 
  }, [product])

  if (status === 'loading' || !product) {
    return <Loader message="Loading product details..." />
  }

  if (status === 'failed') {
    return (
      <div className="mx-auto max-w-4xl p-6 text-center">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700 shadow-sm">
          <h2 className="text-xl font-semibold">Unable to load product</h2>
          <p className="mt-3 text-sm">{error}</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-6 inline-flex rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Back to products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-8 flex items-center space-x-2 text-sm text-gray-500">
        <Link to="/" className="hover:text-indigo-600">Home</Link>
        <span>/</span>
        <Link to="/" className="hover:text-indigo-600 capitalize">{product.category}</Link>
        <span>/</span>
        <span className="text-gray-900">{product.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr] lg:items-start">
            {/* Enhanced Hero Section */}
            <div className="space-y-4">
              <div className="overflow-hidden rounded-3xl border border-gray-200 bg-gray-50">
                <img
                  src={getImageUrl(product.thumbnail)}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              </div>
              {/* Highlights */}
              <div className="rounded-3xl border border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Highlights</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                    Premium quality {product.category}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                    {product.stock ? 'In stock and ready to ship' : 'Limited stock available'}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                    Free shipping on orders over $50
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                    30-day return policy
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-indigo-600">{product.category}</p>
                <h1 className="mt-3 text-3xl font-semibold text-slate-900">{product.title}</h1>
                <p className="mt-4 text-sm leading-7 text-slate-600">{product.description}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-gray-200 bg-slate-50 p-5">
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">${product.price.toFixed(2)}</p>
                </div>
                <div className="rounded-3xl border border-gray-200 bg-slate-50 p-5">
                  <p className="text-sm text-gray-500">Availability</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{product.stock ? 'In stock' : 'Out of stock'}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-slate-50 p-5">
                <p className="text-sm text-gray-500">Product information</p>
                <ul className="mt-4 space-y-3 text-sm text-slate-700">
                  <li className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="font-medium text-slate-900">Brand</span>
                    <span>{product.brand || 'Unknown'}</span>
                  </li>
                  <li className="flex justify-between border-b border-gray-200 pb-3 pt-3">
                    <span className="font-medium text-slate-900">Rating</span>
                    <span>{rating ?? 'No rating yet'}</span>
                  </li>
                  <li className="flex justify-between pt-3">
                    <span className="font-medium text-slate-900">Sold</span>
                    <span>{product.sold ?? 'N/A'}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleAddToCart}
              className="inline-flex items-center justify-center rounded-3xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!product.stock}
            >
              Add to cart
            </button>
            <Link
              to="/cart"
              className="inline-flex items-center justify-center rounded-3xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-gray-50"
            >
              View cart
            </Link>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Quick details</p>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <p><span className="font-semibold text-slate-900">Category:</span> {product.category}</p>
              <p><span className="font-semibold text-slate-900">Brand:</span> {product.brand || 'N/A'}</p>
              <p><span className="font-semibold text-slate-900">Stock:</span> {product.stock ?? 'N/A'}</p>
              <p><span className="font-semibold text-slate-900">Item code:</span> {product.id}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Shipping</p>
            <p className="mt-3 text-sm text-slate-600">Free standard shipping on orders over $50. Fast handling and secure delivery.</p>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-indigo-600">Related products</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">Explore more like this</h2>
            </div>
            <Link to="/" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              Browse all products
            </Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {related.map((item) => (
              <Link
                key={item.id}
                to={`/product/${item.id}`}
                className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <img src={getImageUrl(item.thumbnail)} alt={item.title} className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
                <div className="p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-indigo-600">{item.category}</p>
                  <h3 className="mt-3 text-sm font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-500 line-clamp-2">{item.description}</p>
                  <div className="mt-4 flex items-center justify-between text-sm font-semibold text-slate-900">
                    <span>${item.price.toFixed(2)}</span>
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">View</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
