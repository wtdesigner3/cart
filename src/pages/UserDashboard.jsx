import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Link, Outlet, useLocation } from 'react-router-dom'

export default function UserDashboard() {
  const { userInfo } = useSelector((state) => state.user)
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    const path = location.pathname
    if (path === '/user' || path === '/user/profile') {
      setActiveTab('profile')
    } else if (path === '/user/addresses') {
      setActiveTab('addresses')
    } else if (path === '/user/orders') {
      setActiveTab('orders')
    }
  }, [location.pathname])

  const tabs = [
    { id: 'profile', name: 'Profile', href: '/user/profile' },
    { id: 'addresses', name: 'Addresses', href: '/user/addresses' },
    { id: 'orders', name: 'Orders', href: '/user/orders' },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
        <p className="mt-2 text-sm text-gray-600">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-gray-200"></div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{userInfo?.name}</h3>
              <p className="text-sm text-gray-500">{userInfo?.email}</p>
            </div>

            <nav className="mt-8 space-y-2">
              {tabs.map((tab) => (
                <Link
                  key={tab.id}
                  to={tab.href}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                    activeTab === tab.id
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.name}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <main className="lg:col-span-3">
          <Outlet />
        </main>
      </div>
    </div>
  )
}