import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ChevronDown, Home, Package, ShoppingCart, Users, Settings, LogOut, ExternalLink } from 'lucide-react'
import './AdminLayout.css'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function AdminLayout() {
  const userInfo = useSelector((state) => state.user.userInfo)
  const navigate = useNavigate()
  const [expandedMenu, setExpandedMenu] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const settingsRef = useRef(null)
  const sidebarRef = useRef(null)

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
  ]

  const toggleMenu = (label) => {
    setExpandedMenu(expandedMenu === label ? null : label)
  }

  // Handle click outside settings dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false)
      }
    }

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSettings])

  const handleLogout = () => {
    // Dispatch logout action
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    navigate('/login')
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        {/* Collapsible Sidebar */}
        <aside 
          ref={sidebarRef}
          className={classNames(
            'admin-sidebar fixed left-0 top-0 h-screen border-r border-gray-200 bg-white overflow-y-auto flex flex-col transition-all duration-300 ease-in-out z-50',
            sidebarExpanded ? 'w-64 p-6' : 'w-20 p-2'
          )}
          onMouseEnter={() => setSidebarExpanded(true)}
          onMouseLeave={() => setSidebarExpanded(false)}
        >
          {/* Logo Section */}
          <div className={classNames(
            'flex items-center gap-3 mb-8 transition-all duration-300',
            sidebarExpanded ? 'justify-start' : 'justify-center'
          )}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg flex-shrink-0">
              W
            </div>
            {sidebarExpanded && (
              <h1 className="text-lg font-bold text-gray-900 whitespace-nowrap">Admin</h1>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-1 mb-8 flex-1">
            {menuItems.map((item) => (
              <div key={item.label}>
                {item.submenu ? (
                  <button
                    onClick={() => sidebarExpanded && toggleMenu(item.label)}
                    title={!sidebarExpanded ? item.label : ''}
                    className={classNames(
                      expandedMenu === item.label && sidebarExpanded
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      'w-full flex items-center justify-center lg:justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                      !sidebarExpanded && 'lg:px-2'
                    )}
                  >
                    <div className={classNames(
                      'flex items-center gap-3 flex-shrink-0',
                      !sidebarExpanded && 'justify-center'
                    )}>
                      <item.icon className="h-5 w-5" />
                      {sidebarExpanded && item.label}
                    </div>
                    {sidebarExpanded && (
                      <ChevronDown
                        className={classNames(
                          'h-4 w-4 transition-transform duration-200',
                          expandedMenu === item.label ? 'rotate-180' : '',
                        )}
                      />
                    )}
                  </button>
                ) : (
                  <NavLink to={item.to} end={item.to === '/admin'} title={!sidebarExpanded ? item.label : ''}>
                    {({ isActive }) => (
                      <div
                        className={classNames(
                          isActive
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                          'flex items-center justify-center lg:justify-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                          !sidebarExpanded && 'lg:px-2'
                        )}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {sidebarExpanded && item.label}
                      </div>
                    )}
                  </NavLink>
                )}

                {/* Submenu - Only show when expanded */}
                {item.submenu && expandedMenu === item.label && sidebarExpanded && (
                  <div className="mt-1 space-y-1 pl-2 animate-slideDown">
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
                              'flex items-center gap-3 rounded-r-lg px-3 py-2 text-sm font-medium transition-colors duration-200',
                            )}
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-current flex-shrink-0" />
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

          {/* Visit Website Section */}
          {sidebarExpanded && (
            <div className="mb-6 rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md group"
              >
                <span className="flex items-center gap-2">
                  <span className="relative h-2 w-2 rounded-full bg-white">
                    <span className="absolute inset-0 animate-pulse rounded-full bg-white"></span>
                  </span>
                  Visit Website
                </span>
                <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <p className="mt-2 text-xs text-indigo-700">View your store as customers see it</p>
            </div>
          )}

          {/* Settings Dropdown */}
          <div className="border-t border-gray-200 pt-4" ref={settingsRef}>
            <button
              onClick={() => sidebarExpanded && setShowSettings(!showSettings)}
              onMouseEnter={() => !sidebarExpanded && setSidebarExpanded(true)}
              title={!sidebarExpanded ? 'Settings' : ''}
              className={classNames(
                'w-full flex items-center justify-center lg:justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 relative',
                !sidebarExpanded && 'lg:px-2'
              )}
            >
              <Settings className="h-5 w-5 flex-shrink-0" />
              {sidebarExpanded && (
                <>
                  Settings
                  <ChevronDown className={classNames('h-4 w-4 ml-auto transition-transform duration-200', showSettings ? 'rotate-180' : '')} />
                </>
              )}
            </button>

            {/* Settings Dropdown Menu - Only show when expanded */}
            {showSettings && sidebarExpanded && (
              <div className="absolute left-6 right-6 bottom-20 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-slideUp">
                <div className="p-3 space-y-1">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Logged in as
                  </div>
                  <div className="px-3 py-2 text-sm font-medium text-gray-900">
                    {userInfo?.name || 'Admin'}
                  </div>
                  <div className="px-3 py-1 text-xs text-gray-500">
                    {userInfo?.email || ''}
                  </div>
                  <div className="my-2 border-t border-gray-200"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className={classNames(
          'flex-1 overflow-auto transition-all duration-300',
          sidebarExpanded ? 'ml-64' : 'ml-20'
        )}>
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
