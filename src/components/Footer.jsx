import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[40px] border border-white/10 bg-slate-900/80 p-10 shadow-2xl shadow-black/30">
          <div className="grid gap-10 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">BeliBeli.com</p>
              <h2 className="mt-4 text-3xl font-bold text-white">Let's Shop Beyond Boundaries</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
                Discover curated stores, flash deals, and the best daily recommendations all in one elegant marketplace experience.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-300">About</h3>
              <ul className="mt-6 space-y-3 text-sm text-slate-400">
                <li><Link to="/" className="hover:text-white">About BeliBeli</Link></li>
                <li><Link to="/" className="hover:text-white">Career</Link></li>
                <li><Link to="/" className="hover:text-white">BeliBeli COD</Link></li>
                <li><Link to="/" className="hover:text-white">Promo</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-300">Buy</h3>
              <ul className="mt-6 space-y-3 text-sm text-slate-400">
                <li><Link to="/products" className="hover:text-white">Shop products</Link></li>
                <li><Link to="/cart" className="hover:text-white">Cart</Link></li>
                <li><Link to="/orders" className="hover:text-white">Track order</Link></li>
                <li><Link to="/" className="hover:text-white">Payment</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-300">Sell</h3>
              <ul className="mt-6 space-y-3 text-sm text-slate-400">
                <li><Link to="/" className="hover:text-white">Seller education</Link></li>
                <li><Link to="/" className="hover:text-white">Brand index</Link></li>
                <li><Link to="/" className="hover:text-white">Register store</Link></li>
                <li><Link to="/" className="hover:text-white">BeliBeli care</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 grid gap-10 border-t border-white/10 pt-10 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-300">Guide and Help</h3>
              <ul className="mt-6 space-y-3 text-sm text-slate-400">
                <li><Link to="/" className="hover:text-white">Help center</Link></li>
                <li><Link to="/" className="hover:text-white">Terms & Conditions</Link></li>
                <li><Link to="/" className="hover:text-white">Privacy policy</Link></li>
                <li><Link to="/" className="hover:text-white">Mitra support</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-300">Follow us</h3>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-400">
                <Link to="/" className="rounded-full border border-white/10 px-4 py-2 hover:bg-white/5 hover:text-white">Facebook</Link>
                <Link to="/" className="rounded-full border border-white/10 px-4 py-2 hover:bg-white/5 hover:text-white">Twitter</Link>
                <Link to="/" className="rounded-full border border-white/10 px-4 py-2 hover:bg-white/5 hover:text-white">Instagram</Link>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-300">Newsletter</h3>
              <p className="mt-6 text-sm leading-7 text-slate-400">Sign up for the latest deals, top sellers, and exclusive offers.</p>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-8 text-center text-sm text-slate-500">
            <p>© 2024 BeliBeli.com. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
