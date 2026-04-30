import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold">E-Shop</h3>
            <p className="mt-4 text-sm text-gray-400">
              Your one-stop shop for amazing products at unbeatable prices.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Quick Links</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/" className="hover:text-indigo-400">Home</Link></li>
              <li><Link to="/cart" className="hover:text-indigo-400">Cart</Link></li>
              <li><Link to="/orders" className="hover:text-indigo-400">Orders</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Support</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/" className="hover:text-indigo-400">Contact Us</Link></li>
              <li><Link to="/" className="hover:text-indigo-400">FAQ</Link></li>
              <li><Link to="/" className="hover:text-indigo-400">Shipping</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Follow Us</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/" className="hover:text-indigo-400">Facebook</Link></li>
              <li><Link to="/" className="hover:text-indigo-400">Twitter</Link></li>
              <li><Link to="/" className="hover:text-indigo-400">Instagram</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 E-Shop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}