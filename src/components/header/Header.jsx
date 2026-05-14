import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from '@headlessui/react'
import { Fragment, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../../features/user/userSlice.js'
import api from '../../utils/api.js'
import {
  Search,
  ShoppingBag,
  User,
  Menu as MenuIcon,
  X,
  ChevronDown,
} from 'lucide-react'

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/products' },
  { label: 'Deals', to: '/products' },
  { label: 'About Us', to: '/' },
  { label: 'Contact', to: '/' },
]

export default function Header() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const cartItems = useSelector((state) => state.cart.items)
  const userInfo = useSelector((state) => state.user.userInfo)
  const itemCount = cartItems.reduce((total, item) => total + (item.quantity ?? 1), 0)

  const [categories, setCategories] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  /* Fetch categories */
  useEffect(() => {
    api
      .get('/categories')
      .then((r) => setCategories(r.data))
      .catch(() => {})
  }, [])

  /* Scroll shadow */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleLogout = () => dispatch(logout())

  const handleSearch = (e) => {
    e.preventDefault()
    const q = searchTerm.trim()
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products')
    setSearchOpen(false)
    setSearchTerm('')
  }

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
        scrolled ? 'shadow-[0_1px_0_#e5e4e2,0_4px_24px_rgba(0,0,0,0.06)]' : 'shadow-[0_1px_0_#e5e4e2]'
      }`}
    >
      <Disclosure>
        {({ open }) => (
          <>
            {/* ── Main row ─────────────────────────────────────────────── */}
            <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-4 sm:px-6 lg:px-8">
              {/* Logo */}
              <Link
                to="/"
                className="shrink-0 text-lg font-black uppercase tracking-[0.12em] text-[#0a0a0a]"
              >
                MINIMAL<span className="opacity-60">.</span>
              </Link>

              {/* Desktop nav */}
              <nav className="hidden items-center gap-7 lg:flex">
                {NAV_LINKS.map(({ label, to }) => (
                  <Link
                    key={label}
                    to={to}
                    className="group relative text-sm font-medium text-[#3d3d3d] transition-colors hover:text-[#0a0a0a]"
                  >
                    {label}
                    <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#0a0a0a] transition-all duration-300 group-hover:w-full" />
                  </Link>
                ))}

                {/* Categories mega-dropdown */}
                <Menu as="div" className="relative">
                  <MenuButton className="group flex items-center gap-1 text-sm font-medium text-[#3d3d3d] transition-colors hover:text-[#0a0a0a] focus:outline-none">
                    Categories
                    <ChevronDown className="h-3.5 w-3.5 transition-transform ui-open:rotate-180" />
                    <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#0a0a0a] transition-all duration-300 group-hover:w-full" />
                  </MenuButton>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-2"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-2"
                  >
                    <MenuItems className="absolute left-0 z-30 mt-4 w-72 overflow-hidden rounded-2xl border border-[#e5e4e2] bg-white shadow-[0_16px_64px_rgba(0,0,0,0.1)] focus:outline-none">
                      <div className="max-h-[60vh] overflow-y-auto p-2">
                        {categories.length > 0 ? (
                          categories.map((category) => (
                            <MenuItem key={category.slug}>
                              {({ active }) => (
                                <Link
                                  to={`/category/${category.slug}`}
                                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                                    active ? 'bg-[#f3f2f0]' : ''
                                  }`}
                                >
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f3f2f0]">
                                    {category.image ? (
                                      <img
                                        src={category.image}
                                        alt={category.title}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-xs font-bold text-[#0a0a0a]">
                                        {category.title?.charAt(0) || 'C'}
                                      </span>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-[#0a0a0a]">
                                      {category.title}
                                    </p>
                                    <p className="truncate text-xs text-[#8a8a8a]">
                                      {category.tagline || 'Shop this collection'}
                                    </p>
                                  </div>
                                </Link>
                              )}
                            </MenuItem>
                          ))
                        ) : (
                          <p className="px-4 py-3 text-sm text-[#8a8a8a]">
                            Loading categories…
                          </p>
                        )}
                      </div>
                    </MenuItems>
                  </Transition>
                </Menu>
              </nav>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Right icons */}
              <div className="flex items-center gap-0.5">
                {/* Search toggle */}
                <button
                  type="button"
                  onClick={() => setSearchOpen((p) => !p)}
                  aria-label="Toggle search"
                  className="hidden h-10 w-10 items-center justify-center rounded-full text-[#3d3d3d] transition-colors hover:bg-[#f3f2f0] hover:text-[#0a0a0a] md:flex"
                >
                  <Search className="h-[18px] w-[18px]" />
                </button>

                {/* User / auth */}
                {userInfo ? (
                  <Menu as="div" className="relative hidden md:block">
                    <MenuButton
                      aria-label="Account"
                      className="flex h-10 w-10 items-center justify-center rounded-full text-[#3d3d3d] transition-colors hover:bg-[#f3f2f0] hover:text-[#0a0a0a] focus:outline-none"
                    >
                      <User className="h-[18px] w-[18px]" />
                    </MenuButton>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-150"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <MenuItems className="absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border border-[#e5e4e2] bg-white shadow-[0_16px_48px_rgba(0,0,0,0.1)] focus:outline-none">
                        <div className="p-1.5">
                          {[
                            { label: 'Profile', to: '/user/profile' },
                            { label: 'Orders', to: '/orders' },
                          ].map(({ label, to }) => (
                            <MenuItem key={label}>
                              {({ active }) => (
                                <Link
                                  to={to}
                                  className={`block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                                    active
                                      ? 'bg-[#f3f2f0] text-[#0a0a0a]'
                                      : 'text-[#3d3d3d]'
                                  }`}
                                >
                                  {label}
                                </Link>
                              )}
                            </MenuItem>
                          ))}
                          <MenuItem>
                            {({ active }) => (
                              <button
                                onClick={handleLogout}
                                className={`block w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                                  active
                                    ? 'bg-[#f3f2f0] text-[#0a0a0a]'
                                    : 'text-[#3d3d3d]'
                                }`}
                              >
                                Logout
                              </button>
                            )}
                          </MenuItem>
                        </div>
                      </MenuItems>
                    </Transition>
                  </Menu>
                ) : (
                  <div className="hidden items-center gap-2 md:flex">
                    <Link
                      to="/login"
                      className="px-4 py-2 text-sm font-medium text-[#3d3d3d] transition-colors hover:text-[#0a0a0a]"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="bg-[#0a0a0a] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#3d3d3d]"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}

                {/* Cart */}
                <Link
                  to="/cart"
                  aria-label={`Cart, ${itemCount} items`}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#3d3d3d] transition-colors hover:bg-[#f3f2f0] hover:text-[#0a0a0a]"
                >
                  <ShoppingBag className="h-[18px] w-[18px]" />
                  {itemCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#0a0a0a] text-[9px] font-bold text-white">
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </Link>

                {/* Mobile menu trigger */}
                <DisclosureButton
                  aria-label="Toggle menu"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[#3d3d3d] transition-colors hover:bg-[#f3f2f0] hover:text-[#0a0a0a] lg:hidden"
                >
                  {open ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <MenuIcon className="h-5 w-5" />
                  )}
                </DisclosureButton>
              </div>
            </div>

            {/* ── Search bar (desktop) ─────────────────────────────────── */}
            {searchOpen && (
              <div className="hidden border-t border-[#e5e4e2] bg-white px-4 py-3 animate-slide-down sm:px-6 md:block lg:px-8">
                <form onSubmit={handleSearch} className="mx-auto max-w-2xl">
                  <div className="relative flex">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a8a8a]" />
                    <input
                      autoFocus
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search products, brands, categories…"
                      className="w-full border border-[#e5e4e2] bg-[#f9f8f6] py-3 pl-11 pr-28 text-sm text-[#0a0a0a] placeholder:text-[#8a8a8a] focus:border-[#0a0a0a] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="absolute right-0 top-0 h-full bg-[#0a0a0a] px-5 text-[10px] font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#3d3d3d]"
                    >
                      SEARCH
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Mobile menu ──────────────────────────────────────────── */}
            <DisclosurePanel className="border-t border-[#e5e4e2] bg-white lg:hidden">
              <div className="space-y-1 px-4 py-4">
                {/* Mobile search */}
                <form onSubmit={handleSearch} className="mb-4">
                  <div className="relative flex">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a8a8a]" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search products…"
                      className="w-full border border-[#e5e4e2] bg-[#f3f2f0] py-3 pl-10 pr-4 text-sm text-[#0a0a0a] placeholder:text-[#8a8a8a] focus:border-[#0a0a0a] focus:outline-none"
                    />
                  </div>
                </form>

                {NAV_LINKS.map(({ label, to }) => (
                  <DisclosureButton
                    key={label}
                    as={Link}
                    to={to}
                    className="block px-3 py-3 text-sm font-medium text-[#3d3d3d] transition-colors hover:bg-[#f3f2f0] hover:text-[#0a0a0a]"
                  >
                    {label}
                  </DisclosureButton>
                ))}

                <div className="mt-4 border-t border-[#e5e4e2] pt-4 flex flex-col gap-2">
                  {userInfo ? (
                    <>
                      <DisclosureButton
                        as={Link}
                        to="/user/profile"
                        className="block px-3 py-3 text-sm font-medium text-[#3d3d3d] hover:bg-[#f3f2f0]"
                      >
                        Profile
                      </DisclosureButton>
                      <DisclosureButton
                        as={Link}
                        to="/orders"
                        className="block px-3 py-3 text-sm font-medium text-[#3d3d3d] hover:bg-[#f3f2f0]"
                      >
                        Orders
                      </DisclosureButton>
                      <button
                        onClick={handleLogout}
                        className="w-full px-3 py-3 text-left text-sm font-medium text-[#3d3d3d] hover:bg-[#f3f2f0]"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <DisclosureButton
                        as={Link}
                        to="/login"
                        className="block border border-[#e5e4e2] px-3 py-3 text-center text-sm font-medium text-[#0a0a0a]"
                      >
                        Login
                      </DisclosureButton>
                      <DisclosureButton
                        as={Link}
                        to="/register"
                        className="block bg-[#0a0a0a] px-3 py-3 text-center text-sm font-semibold text-white"
                      >
                        Sign Up
                      </DisclosureButton>
                    </>
                  )}
                </div>
              </div>
            </DisclosurePanel>
          </>
        )}
      </Disclosure>
    </header>
  )
}
