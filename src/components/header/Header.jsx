import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon, ChevronDownIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import { Fragment, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../../features/user/userSlice.js'
import api from '../../utils/api.js'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Header() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const cartItems = useSelector((state) => state.cart.items)
  const userInfo = useSelector((state) => state.user.userInfo)
  const itemCount = cartItems.reduce((total, item) => total + (item.quantity ?? 1), 0)
  const [categories, setCategories] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories')
        setCategories(response.data)
      } catch (error) {
        console.error('Failed to load categories', error)
      }
    }

    fetchCategories()
  }, [])

  const handleLogout = () => {
    dispatch(logout())
  }

  const handleSearch = (event) => {
    event.preventDefault()
    const query = searchTerm.trim()
    if (query) {
      navigate(`/products?search=${encodeURIComponent(query)}`)
    } else {
      navigate('/products')
    }
  }

  return (
    <header className="bg-slate-50">
      <div className="border-b border-slate-200 bg-white/90">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs text-slate-600 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <a href="mailto:support@belibeli.com" className="font-medium text-slate-700 hover:text-emerald-600">
              Email us
            </a>
            <span className="text-slate-500">for support or questions</span>
          </div>
          <div className="hidden sm:block text-slate-500">Fast shipping available nationwide</div>
        </div>
      </div>

      <Disclosure as="nav" className="border-b border-slate-200 bg-white shadow-sm">
        {({ open }) => (
          <>
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-4">
                <Link to="/" className="text-2xl font-bold text-slate-900">
                  BeliBeli.com
                </Link>

                <Menu as="div" className="relative">
                  <MenuButton className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                    All Category
                    <ChevronDownIcon className="h-4 w-4" />
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
                    <MenuItems className="absolute left-0 z-30 mt-3 w-80 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl ring-1 ring-slate-200">
                      <div className="space-y-3 max-h-[68vh] overflow-y-auto p-4 pr-2">
                        <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Browse categories</p>
                        {categories.length > 0 ? (
                          categories.map((category) => (
                            <MenuItem
                              key={category.slug}
                              as={Link}
                              to={`/category/${category.slug}`}
                              className={({ active }) =>
                                classNames(
                                  active ? 'bg-slate-100 text-slate-900' : 'text-slate-700',
                                  'flex items-center gap-3 rounded-2xl px-3 py-3 transition'
                                )
                              }
                            >
                              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                                {category.image ? (
                                  <img
                                    src={category.image}
                                    alt={category.title}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="text-sm font-semibold uppercase text-slate-600">
                                    {category.title?.charAt(0) || 'C'}
                                  </span>
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">{category.title}</p>
                                <p className="mt-1 text-xs text-slate-500">{category.tagline || category.description || 'Shop this collection'}</p>
                              </div>
                            </MenuItem>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                            Loading categories...
                          </div>
                        )}
                      </div>
                    </MenuItems>
                  </Transition>
                </Menu>

                <div className="hidden md:flex items-center gap-3">
                  <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                    Mitra BeliBeli
                  </Link>
                  <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                    About BeliBeli
                  </Link>
                  <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                    BeliBeli Care
                  </Link>
                  <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                    Promo
                  </Link>
                </div>
              </div>

              <form onSubmit={handleSearch} className="order-last w-full md:order-none md:max-w-2xl">
                <label htmlFor="site-search" className="sr-only">
                  Search products
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="site-search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search product or brand here..."
                    className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </form>

              <div className="hidden items-center gap-3 md:ml-auto md:flex">
                <Link to="/cart" className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                  <ShoppingBagIcon className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {itemCount}
                    </span>
                  )}
                </Link>

                {userInfo ? (
                  <Menu as="div" className="relative">
                    <MenuButton className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                      My Account
                      <ChevronDownIcon className="h-4 w-4" />
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
                      <MenuItems className="absolute right-0 mt-2 w-48 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl ring-1 ring-slate-200">
                        <div className="p-2">
                          <MenuItem
                            as={Link}
                            to="/user/profile"
                            className={({ active }) => classNames(active ? 'bg-slate-100' : '', 'block rounded-2xl px-4 py-3 text-sm text-slate-700')}
                          >
                            Profile
                          </MenuItem>
                          <MenuItem
                            as={Link}
                            to="/orders"
                            className={({ active }) => classNames(active ? 'bg-slate-100' : '', 'block rounded-2xl px-4 py-3 text-sm text-slate-700')}
                          >
                            Orders
                          </MenuItem>
                          <MenuItem
                            as="button"
                            onClick={handleLogout}
                            className={({ active }) => classNames(active ? 'bg-slate-100' : '', 'block w-full rounded-2xl px-4 py-3 text-left text-sm text-slate-700')}
                          >
                            Logout
                          </MenuItem>
                        </div>
                      </MenuItems>
                    </Transition>
                  </Menu>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-500/20 hover:bg-emerald-500"
                    >
                      Sign Up
                    </Link>
                    <Link
                      to="/login"
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Login
                    </Link>
                  </>
                )}
              </div>

              <div className="flex items-center md:hidden">
                <DisclosureButton className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                  {open ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
                </DisclosureButton>
              </div>
            </div>

            <DisclosurePanel className="border-t border-slate-200 bg-slate-50 px-4 py-4 md:hidden">
              <div className="space-y-3">
                <Link to="/" className="block rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                  Mitra BeliBeli
                </Link>
                <Link to="/" className="block rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                  About BeliBeli
                </Link>
                <Link to="/" className="block rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                  BeliBeli Care
                </Link>
                <Link to="/" className="block rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                  Promo
                </Link>
                <Link to="/cart" className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <ShoppingBagIcon className="h-5 w-5" />
                  Cart
                  {itemCount > 0 && (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-semibold text-white">
                      {itemCount}
                    </span>
                  )}
                </Link>
                {userInfo ? (
                  <>
                    <Link to="/user/profile" className="block rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                      Profile
                    </Link>
                    <Link to="/orders" className="block rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                      Orders
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/register" className="block rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500">
                      Sign Up
                    </Link>
                    <Link to="/login" className="block rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                      Login
                    </Link>
                  </>
                )}
              </div>
            </DisclosurePanel>
          </>
        )}
      </Disclosure>
    </header>
  )
}
