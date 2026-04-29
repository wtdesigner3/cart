import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function AdminLayout() {
  const userInfo = useSelector((state) => state.user.userInfo)
  const location = useLocation()

  const breadcrumbLabel = {
    '/admin': 'Overview',
    '/admin/products': 'Products',
    '/admin/orders': 'Orders',
    '/admin/users': 'Users',
  }[location.pathname] || 'Overview'

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="hidden w-72 shrink-0 flex-col rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm lg:flex">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Admin panel</p>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">Manage your store</h1>
            <p className="mt-2 text-sm text-slate-500">Signed in as {userInfo?.name || 'Admin'}</p>
          </div>

          <nav className="space-y-3 text-sm font-semibold">
            {[
              { label: 'Overview', to: '/admin' },
              { label: 'Products', to: '/admin/products' },
              { label: 'Orders', to: '/admin/orders' },
              { label: 'Users', to: '/admin/users' },
            ].map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/admin'}>
                {({ isActive }) => (
                  <div
                    className={classNames(
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
                      'flex items-center gap-3 rounded-2xl px-4 py-3 transition',
                    )}
                  >
                    <span
                      className={classNames(
                        'h-10 w-1 rounded-full transition-colors',
                        isActive ? 'bg-white' : 'bg-transparent',
                      )}
                    />
                    {item.label}
                  </div>
                )}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Admin / {breadcrumbLabel}</p>
              <h2 className="text-2xl font-semibold text-slate-900">{breadcrumbLabel}</h2>
            </div>
            <p className="text-sm text-slate-500">Signed in as {userInfo?.name || 'Admin'}</p>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
