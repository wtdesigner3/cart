import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ChevronDown, Home, Package, ShoppingCart, Users, ImageIcon, Zap } from 'lucide-react'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function AdminLayout() {
  const userInfo = useSelector((state) => state.user.userInfo)
  const location = useLocation()
  const [expandedMenu, setExpandedMenu] = useState(null)

  const menuItems = [
    { label: 'Overview', to: '/admin', icon: Home },
    {
      label: 'Products',
      icon: Package,
      submenu: [
        { label: 'View Products', to: '/admin/products' },
        { label: 'Manage Categories', to: '/admin/categories' },
      ],
    },
    {
      label: 'Content',
      icon: ImageIcon,
      submenu: [
        { label: 'Banners', to: '/admin/banners' },
        { label: 'Carousel', to: '/admin/carousel' },
      ],
    },
    { label: 'Orders', to: '/admin/orders', icon: ShoppingCart },
    { label: 'Users', to: '/admin/users', icon: Users },
  ]

  const getBreadcrumbLabel = () => {
    const breadcrumbMap = {
      '/admin': 'Overview',
      '/admin/products': 'Products',
      '/admin/categories': 'Categories',
      '/admin/banners': 'Banners',
      '/admin/carousel': 'Product Carousel',
      '/admin/orders': 'Orders',
      '/admin/users': 'Users',
    }
    return breadcrumbMap[location.pathname] || 'Dashboard'
  }

  const toggleMenu = (label) => {
    setExpandedMenu(expandedMenu === label ? null : label)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 h-screen w-80 border-r border-slate-700 bg-slate-800/50 p-6 backdrop-blur-xl">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">StoreHub</h1>
            </div>
            <p className="text-sm text-slate-400">Admin Dashboard</p>
            <p className="mt-2 text-xs text-slate-500">Logged in as {userInfo?.name || 'Admin'}</p>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <div key={item.label}>
                {item.submenu ? (
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={classNames(
                      expandedMenu === item.label
                        ? 'bg-slate-700/60 text-white'
                        : 'text-slate-300 hover:bg-slate-700/40 hover:text-white',
                      'w-full flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </div>
                    <ChevronDown
                      className={classNames(
                        'h-4 w-4 transition-transform',
                        expandedMenu === item.label ? 'rotate-180' : '',
                      )}
                    />
                  </button>
                ) : (
                  <NavLink to={item.to} end={item.to === '/admin'}>
                    {({ isActive }) => (
                      <div
                        className={classNames(
                          isActive
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                            : 'text-slate-300 hover:bg-slate-700/40 hover:text-white',
                          'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all',
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </div>
                    )}
                  </NavLink>
                )}

                {/* Submenu */}
                {item.submenu && expandedMenu === item.label && (
                  <div className="mt-1 space-y-1 pl-2">
                    {item.submenu.map((subitem) => (
                      <NavLink key={subitem.to} to={subitem.to} end>
                        {({ isActive }) => (
                          <div
                            className={classNames(
                              isActive
                                ? 'bg-indigo-600/20 text-indigo-300 border-l-2 border-indigo-500'
                                : 'text-slate-400 hover:bg-slate-700/30 hover:text-slate-300 border-l-2 border-transparent',
                              'flex items-center gap-3 rounded-r-lg px-4 py-2 text-sm font-medium transition-colors',
                            )}
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-current" />
                            {subitem.label}
                          </div>
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="ml-80 flex-1 overflow-auto">
          <div className="sticky top-0 z-40 border-b border-slate-700/50 bg-slate-800/50 px-8 py-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Dashboard</p>
                <h2 className="mt-2 text-2xl font-bold text-white">{getBreadcrumbLabel()}</h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                  {userInfo?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
