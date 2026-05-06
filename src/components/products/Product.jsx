import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { fetchProduct } from '../../features/cart/productSlice'
import { addCartItem } from '../../features/cartadd/cartSlice'
import { getImageUrl } from '../../utils/api.js'
import Loader from '../Loader.jsx'

export default function Product() {
  const dispatch = useDispatch()
  const products = useSelector((state) => state.product.products)
  const status = useSelector((state) => state.product.status)
  const error = useSelector((state) => state.product.error)

  useEffect(() => {
    dispatch(fetchProduct())
  }, [dispatch])

  const handleAddToCart = (product) => {
    dispatch(addCartItem(product))
    // Scroll to top and show notification
    window.scrollTo({ top: 0, behavior: 'smooth' })
    toast.success(`${product.title} added to cart!`, { autoClose: 2000 })
  }

  if (status === 'loading') {
    return <Loader message="Loading products..." />
  }

  if (status === 'failed') {
    return (
      <div className="p-8 text-center text-lg text-red-600">
        {error || 'Unable to load products right now. Please try again later.'}
      </div>
    )
  }

  if (!products.length) {
    return <div className="p-8 text-center text-lg">No products available.</div>
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Our Products</h2>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <div key={product.id} className="group relative rounded-lg border border-gray-200 bg-white shadow-sm">
              <Link to={`/product/${product.id}`} className="block overflow-hidden rounded-t-lg bg-gray-100">
                <img
                  alt={product.title}
                  src={getImageUrl(product.thumbnail)}
                  className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </Link>
              <div className="p-4">
                <div className="mb-2 text-sm text-gray-500">{product.category}</div>
                <Link to={`/product/${product.id}`} className="text-sm font-semibold text-gray-900 hover:text-indigo-600">
                  {product.title}
                </Link>
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">{product.description}</p>
                <div className="mt-4 flex flex-col gap-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
                    {product.mrp > product.price && (
                      <span className="text-sm text-gray-500 line-through">${product.mrp.toFixed(2)}</span>
                    )}
                    {product.discountPercentage > 0 && (
                      <span className="text-sm font-semibold text-secondary">Save {product.discountPercentage}%</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      Add to cart
                    </button>
                    <Link
                      to={`/product/${product.id}`}
                      className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:border-indigo-600 hover:text-indigo-600"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
