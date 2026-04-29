import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProduct } from '../../features/cart/productSlice'
import { addCartItem } from '../../features/cartadd/cartSlice'

export default function Product() {
  const dispatch = useDispatch()
  const products = useSelector((state) => state.product.products)
  const status = useSelector((state) => state.product.status)

  useEffect(() => {
    dispatch(fetchProduct())
  }, [dispatch])

  if (status === 'loading') {
    return <div className="p-8 text-center text-lg">Loading products...</div>
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
              <img
                alt={product.title}
                src={product.thumbnail}
                className="aspect-square w-full rounded-t-lg bg-gray-100 object-cover"
              />
              <div className="p-4">
                <div className="mb-2 text-sm text-gray-500">{product.category}</div>
                <h3 className="text-sm font-semibold text-gray-900">{product.title}</h3>
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">{product.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">${product.price}</span>
                  <button
                    type="button"
                    onClick={() => dispatch(addCartItem(product))}
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
