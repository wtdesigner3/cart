import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ChevronDown, Home, Package, ShoppingCart, Users, ImageIcon, Gift, Zap, Search, Bell, Settings, LogOut } from 'lucide-react'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function AdminLayout() {
  const userInfo = useSelector((state) => state.user.userInfo)
  const location = useLocation()
  const [expandedMenu, setExpandedMenu] = useState(null)

  const menuItems = [
    { label: 'Dashboard', to: '/admin', icon: Home },
    { label: 'Orders', to: '/admin/orders', icon: ShoppingCart },
    {
      label: 'Products',
      icon: Package,
      submenu: [
        { label: 'View Products', to: '/admin/products' },
        { label: 'Manage Categories', to: '/admin/categories' },
      ],
    },
    { label: 'Customers', to: '/admin/users', icon: Users },
    { label: 'Gift Cards', to: '/admin/gift-cards', icon: Gift },
    {
      label: 'Promotions',
      icon: Zap,
      submenu: [
        { label: 'Banners', to: '/admin/banners' },
        { label: 'Carousel', to: '/admin/carousel' },
      ],
    },
    { label: 'Discounts', to: '/admin/discounts', icon: Gift },
  ]

  const teamMembers = [
    { name: 'Cameron Williamson', initial: 'C', color: 'bg-blue-500' },
    { name: 'Jenny Wilson', initial: 'J', color: 'bg-purple-500' },
    { name: 'Leslie Alexander', initial: 'L', color: 'bg-pink-500' },
  ]

  const getBreadcrumbLabel = () => {
    const breadcrumbMap = {
      '/admin': 'Dashboard',
      '/admin/products': "Product's",
      '/admin/categories': 'Categories',
      '/admin/banners': 'Banners',
      '/admin/carousel': 'Product Carousel',
      '/admin/orders': 'Orders',
      '/admin/users': 'Customers',
    }
    return breadcrumbMap[location.pathname] || 'Dashboard'
  }

  const toggleMenu = (label) => {
    setExpandedMenu(expandedMenu === label ? null : label)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 h-screen w-64 border-r border-gray-200 bg-white p-6 overflow-y-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg">
                W
              </div>
              <h1 className="text-lg font-bold text-gray-900">Admin</h1>
            </div>
          </div>

          <nav className="space-y-1 mb-8">
            {menuItems.map((item) => (
              <div key={item.label}>
                {item.submenu ? (
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={classNames(
                      expandedMenu === item.label
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      'w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
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
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
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
                      <NavLink
                        key={subitem.to}
                        to={subitem.to}
                        end
                        onClick={() => {
                          if (subitem.to === '/admin/products') {
                            window.dispatchEvent(new CustomEvent('admin-view-products-click'))
                          }
                        }}
                      >
                        {({ isActive }) => (
                          <div
                            className={classNames(
                              isActive
                                ? 'bg-blue-50 text-blue-600 font-medium border-l-2 border-blue-600'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-2 border-transparent',
                              'flex items-center gap-3 rounded-r-lg px-3 py-2 text-sm font-medium transition-colors',
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

          {/* Team Members Section */}
          <div className="mb-8 border-t border-gray-200 pt-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Team Members</p>
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div key={member.name} className="flex items-center gap-3">
                  <div className={classNames(member.color, 'h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0')}>
                    {member.initial}
                  </div>
                  <span className="text-sm text-gray-700">{member.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="border-t border-gray-200 pt-6">
            <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <Settings className="h-5 w-5" />
              Settings
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 overflow-auto">
          {/* Header */}
          <div className="sticky top-0 z-40 border-b border-gray-200 bg-white px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{getBreadcrumbLabel()}</h2>
              </div>
              <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="hidden md:flex relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search anything..."
                    className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Time */}
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">15:55</p>
                  <p className="text-xs text-gray-500">26 Feb</p>
                </div>

                {/* Notifications */}
                <button className="relative rounded-lg p-2 hover:bg-gray-100 transition-colors">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
                </button>

                {/* Settings Icon */}
                <button className="rounded-lg p-2 hover:bg-gray-100 transition-colors">
                  <Settings className="h-5 w-5 text-gray-600" />
                </button>

                {/* Profile Avatar */}
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {userInfo?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
