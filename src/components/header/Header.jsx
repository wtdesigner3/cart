import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon, ShoppingBagIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { Fragment, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { logout } from '../../features/user/userSlice.js'
import api from '../../utils/api.js'

const navigation = [
  { name: 'Home', href: '/' },
]

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
    <Disclosure
      as="nav"
      className="relative bg-gray-800/50 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-white/10"
    >
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="block h-6 w-6 group-data-open:hidden" />
              <XMarkIcon aria-hidden="true" className="hidden h-6 w-6 group-data-open:block" />
            </DisclosureButton>
          </div>
          <div className="flex flex-1 items-center justify-between gap-4 sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center gap-4">
              <Link to="/" className="text-2xl font-semibold text-white">E-Shop</Link>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      classNames(
                        isActive ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white',
                        'rounded-full px-3 py-2 text-sm font-medium'
                      )
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
                <Menu as="div" className="relative">
                  <MenuButton className="inline-flex items-center rounded-full px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    Categories
                    <ChevronDownIcon className="ml-2 h-4 w-4" />
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
                    <MenuItems className="absolute left-0 z-20 mt-3 w-screen max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950/95 shadow-2xl ring-1 ring-white/10">
                      <div className="grid gap-4 px-6 py-6 sm:grid-cols-3 md:px-8">
                        <div className="space-y-3 border-r border-white/10 pr-4">
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Browse categories</p>
                          <p className="text-lg font-semibold text-white">Shop by collection</p>
                          <p className="text-sm leading-6 text-slate-400">Explore curated categories and shop premium collections.</p>
                        </div>
                        <div className="col-span-2 grid gap-3 sm:grid-cols-2">
                          {categories.map((category) => (
                            <MenuItem key={category.slug}>
                              {({ active }) => (
                                <Link
                                  to={`/category/${category.slug}`}
                                  className={classNames(
                                    active ? 'border-indigo-500/50 bg-slate-800' : 'border-white/10 bg-slate-900/90',
                                    'rounded-3xl border p-4 transition'
                                  )}
                                >
                                  <p className="text-xs uppercase tracking-[0.32em] text-indigo-400">{category.tagline || 'Collection'}</p>
                                  <p className="mt-2 text-lg font-semibold text-white">{category.title}</p>
                                  <p className="mt-2 text-sm leading-6 text-slate-400 line-clamp-2">{category.description || `Shop premium ${category.title} products.`}</p>
                                </Link>
                              )}
                            </MenuItem>
                          ))}
                        </div>
                      </div>
                    </MenuItems>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center gap-3 pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <form onSubmit={handleSearch} className="hidden items-center rounded-full border border-white/10 bg-white/5 pr-2 sm:flex">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products"
                className="h-10 min-w-[220px] bg-transparent px-3 text-sm text-white placeholder:text-white/60 focus:outline-none"
              />
              <button type="submit" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/15">
                <MagnifyingGlassIcon className="h-4 w-4" />
              </button>
            </form>
            <Link to="/cart" className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700">
              <ShoppingBagIcon className="h-5 w-5" />
              <span>Cart</span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold">{itemCount}</span>
            </Link>
            <Menu as="div" className="relative ml-2">
              <MenuButton className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {userInfo ? userInfo.name || 'Account' : 'Sign in'}
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
                <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-3xl border border-white/10 bg-slate-950/95 py-1 shadow-2xl ring-1 ring-white/10">
                  {userInfo ? (
                    <>
                      <MenuItem>
                        <Link to="/user" className="block px-4 py-3 text-sm text-slate-200 hover:bg-white/5">
                          My Account
                        </Link>
                      </MenuItem>
                      <MenuItem>
                        <Link to="/orders" className="block px-4 py-3 text-sm text-slate-200 hover:bg-white/5">
                          Orders
                        </Link>
                      </MenuItem>
                      {userInfo.isAdmin && (
                        <MenuItem>
                          <Link to="/admin" className="block px-4 py-3 text-sm text-slate-200 hover:bg-white/5">
                            Admin dashboard
                          </Link>
                        </MenuItem>
                      )}
                      <MenuItem>
                        <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-slate-200 hover:bg-white/5">
                          Sign out
                        </button>
                      </MenuItem>
                    </>
                  ) : (
                    <MenuItem>
                      <Link to="/login" className="block px-4 py-3 text-sm text-slate-200 hover:bg-white/5">
                        Sign in
                      </Link>
                    </MenuItem>
                  )}
                </MenuItems>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-3 border-b border-white/10 px-4 pb-4 pt-4">
          <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-3xl border border-white/10 bg-slate-900 px-3 py-2">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </form>
        </div>
        <div className="space-y-1 px-2 pt-2 pb-3">
          <DisclosureButton
            as={Link}
            to="/products"
            className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white"
          >
            Shop all categories
          </DisclosureButton>
          {categories.slice(0, 5).map((category) => (
            <DisclosureButton
              key={category.slug}
              as={Link}
              to={`/category/${category.slug}`}
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white"
            >
              {category.title}
            </DisclosureButton>
          ))}
          {userInfo ? (
            <>
              <DisclosureButton
                as={Link}
                to="/user"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white"
              >
                My Account
              </DisclosureButton>
              <DisclosureButton
                as={Link}
                to="/orders"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white"
              >
                My Orders
              </DisclosureButton>
              {userInfo.isAdmin && (
                <DisclosureButton
                  as={Link}
                  to="/admin"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white"
                >
                  Admin dashboard
                </DisclosureButton>
              )}
              <DisclosureButton
                as="button"
                onClick={handleLogout}
                className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white"
              >
                Sign out
              </DisclosureButton>
            </>
          ) : (
            <DisclosureButton
              as={Link}
              to="/login"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white"
            >
              Sign in
            </DisclosureButton>
          )}
        </div>
      </DisclosurePanel>
    </Disclosure>
  )
}
