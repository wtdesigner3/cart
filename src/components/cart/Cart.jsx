import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { removeCartItem, updateCartItemQuantity } from '../../features/cartadd/cartSlice'
import { Link } from 'react-router-dom'

export default function Cart() {
  const dispatch = useDispatch()
  const cartItems = useSelector((state) => state.cart.items)

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.quantity ?? 1), 0),
    [cartItems],
  )

  const totalPrice = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0),
    [cartItems],
  )

  if (!cartItems.length) {
    return (
      <div className="mx-auto max-w-4xl p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">Your cart is empty</h2>
        <p className="mt-2 text-gray-600">Add products to your cart to see them here.</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Continue shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Shopping Cart</h1>
          <p className="mt-1 text-sm text-gray-600">You have {totalItems} item{totalItems !== 1 ? 's' : ''} in your cart.</p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <div className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700">Total: ${totalPrice.toFixed(2)}</div>
          <Link
            to="/checkout"
            className="inline-flex rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Proceed to checkout
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {cartItems.map((item) => (
          <div key={item.id} className="grid gap-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:grid-cols-[1.5fr_1fr] lg:grid-cols-[1.7fr_0.8fr_0.8fr]">
            <div className="flex items-start gap-4">
              <img src={item.thumbnail} alt={item.title} className="h-28 w-28 rounded-2xl object-cover" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{item.title}</h2>
                <p className="mt-2 text-sm text-gray-500">{item.category}</p>
                <p className="mt-3 text-sm text-gray-700">${item.price.toFixed(2)} each</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-3xl border border-gray-200 bg-gray-50 p-4">
              <div>
                <p className="text-sm text-gray-500">Quantity</p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      dispatch(
                        updateCartItemQuantity({
                          id: item.id,
                          quantity: (item.quantity ?? 1) - 1,
                        }),
                      )
                    }
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity ?? 1}
                    onChange={(event) =>
                      dispatch(
                        updateCartItemQuantity({
                          id: item.id,
                          quantity: Number(event.target.value) || 1,
                        }),
                      )
                    }
                    className="w-16 rounded-xl border border-gray-300 bg-white px-3 py-2 text-center text-sm text-gray-900 outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      dispatch(
                        updateCartItemQuantity({
                          id: item.id,
                          quantity: (item.quantity ?? 1) + 1,
                        }),
                      )
                    }
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => dispatch(removeCartItem(item.id))}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Order summary</h3>
            <p className="mt-1 text-sm text-gray-500">Review your items before checkout.</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Items</p>
            <p className="text-xl font-semibold text-gray-900">{totalItems}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
          <span className="text-sm text-gray-600">Total price</span>
          <span className="text-lg font-semibold text-gray-900">${totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
