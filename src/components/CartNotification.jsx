import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { ShoppingBagIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function CartNotification() {
  const cartItems = useSelector((state) => state.cart.items)
  const [showNotification, setShowNotification] = useState(false)
  const [isFading, setIsFading] = useState(false)
  const [lastItemCount, setLastItemCount] = useState(cartItems.length)

  useEffect(() => {
    if (cartItems.length > lastItemCount) {
      setShowNotification(true)
      setIsFading(false)
      setLastItemCount(cartItems.length)
      
      // Auto fade out after 4 seconds
      const timer = setTimeout(() => {
        setIsFading(true)
      }, 4000)

      // Remove from DOM after fade animation (0.5s)
      const removeTimer = setTimeout(() => {
        setShowNotification(false)
      }, 4500)

      return () => {
        clearTimeout(timer)
        clearTimeout(removeTimer)
      }
    }
  }, [cartItems.length, lastItemCount])

  const handleClose = () => {
    setIsFading(true)
    setTimeout(() => {
      setShowNotification(false)
    }, 300)
  }

  if (!showNotification) return null

  const itemCount = cartItems.reduce((total, item) => total + (item.quantity ?? 1), 0)
  const total = cartItems.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0)

  return (
    <div className="fixed top-20 left-0 right-0 z-40 flex justify-center pointer-events-none">
      <div className={`pointer-events-auto animate-slideDown bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden max-w-md w-full mx-4 transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex items-start gap-4 p-5 relative">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close notification"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft">
              <ShoppingBagIcon className="h-6 w-6 text-primary" />
            </div>
          </div>
          
          <div className="flex-1 pr-6">
            <h3 className="text-sm font-semibold text-gray-900">Added to cart</h3>
            <p className="text-xs text-gray-500 mt-1">{itemCount} item{itemCount !== 1 ? 's' : ''} • ${total.toFixed(2)}</p>
            <Link
              to="/cart"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 mt-2 inline-block"
            >
              View Cart →
            </Link>
          </div>
        </div>
        
        <div className="h-1 bg-gradient-to-r from-indigo-600 to-purple-600 animate-pulse"></div>
      </div>
    </div>
  )
}
