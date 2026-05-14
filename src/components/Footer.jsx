import { Link } from 'react-router-dom'

const FOOTER_LINKS = [
  {
    heading: 'About',
    links: [
      { label: 'About Us', to: '/' },
      { label: 'Careers', to: '/' },
      { label: 'Promotions', to: '/' },
      { label: 'Press', to: '/' },
    ],
  },
  {
    heading: 'Shop',
    links: [
      { label: 'All Products', to: '/products' },
      { label: 'Cart', to: '/cart' },
      { label: 'Track Order', to: '/orders' },
      { label: 'Payment', to: '/' },
    ],
  },
  {
    heading: 'Sell',
    links: [
      { label: 'Seller Education', to: '/' },
      { label: 'Brand Index', to: '/' },
      { label: 'Register Store', to: '/' },
      { label: 'Seller Support', to: '/' },
    ],
  },
  {
    heading: 'Help',
    links: [
      { label: 'Help Center', to: '/' },
      { label: 'Terms & Conditions', to: '/' },
      { label: 'Privacy Policy', to: '/' },
      { label: 'Returns', to: '/' },
    ],
  },
]

const SOCIAL = ['Instagram', 'Twitter', 'Facebook', 'Pinterest']

export default function Footer() {
  return (
    <footer className="bg-[#0f0f0f] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top: brand + links */}
        <div className="grid gap-10 border-b border-white/[0.08] py-14 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <p className="text-lg font-black uppercase tracking-[0.12em] text-white">
              MINIMAL<span className="opacity-40">.</span>
            </p>
            <p className="mt-4 max-w-xs text-sm leading-7 text-white/40">
              Premium products designed for the way you live. Quality,
              comfort, and style in every piece.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {SOCIAL.map((s) => (
                <Link
                  key={s}
                  to="/"
                  className="border border-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40 transition-colors hover:border-white/30 hover:text-white/80"
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map(({ heading, links }) => (
            <div key={heading}>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
                {heading}
              </h3>
              <ul className="mt-5 space-y-3">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm text-white/50 transition-colors hover:text-white"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 py-7 text-center sm:flex-row">
          <p className="text-[11px] text-white/30">
            © {new Date().getFullYear()} MINIMAL. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {['Privacy', 'Terms', 'Cookies'].map((t) => (
              <Link
                key={t}
                to="/"
                className="text-[11px] text-white/30 transition-colors hover:text-white/60"
              >
                {t}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
