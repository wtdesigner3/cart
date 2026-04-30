import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import api, { authHeaders } from '../utils/api.js'

export default function AdminUsers() {
  const token = useSelector((state) => state.user.token)
  const userInfo = useSelector((state) => state.user.userInfo)
  const [users, setUsers] = useState([])

  const headers = authHeaders(token)

  useEffect(() => {
    if (token) {
      fetchUsers()
    }
  }, [token])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users', headers)
      setUsers(response.data)
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const toggleAdmin = async (userId, isAdmin) => {
    try {
      await api.put(`/auth/users/${userId}`, { isAdmin }, headers)
      toast.success('User role updated.')
      fetchUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const deleteUser = async (userId) => {
    try {
      await api.delete(`/auth/users/${userId}`, headers)
      toast.success('User deleted.')
      fetchUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">User management</h1>
            <p className="text-sm text-slate-500">Manage users and admin permissions.</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-900">Name</th>
              <th className="px-4 py-3 font-semibold text-slate-900">Email</th>
              <th className="px-4 py-3 font-semibold text-slate-900">Role</th>
              <th className="px-4 py-3 font-semibold text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {users.map((user) => (
              <tr key={user.id || user._id}>
                <td className="px-4 py-3 text-slate-700">{user.name}</td>
                <td className="px-4 py-3 text-slate-700">{user.email}</td>
                <td className="px-4 py-3 text-slate-700">{user.isAdmin ? 'Admin' : 'Customer'}</td>
                <td className="px-4 py-3 text-slate-700 space-x-2">
                  <button
                    type="button"
                    onClick={() => toggleAdmin(user._id, !user.isAdmin)}
                    disabled={user._id === userInfo?._id}
                    className="rounded-2xl border border-indigo-600 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {user.isAdmin ? 'Revoke admin' : 'Make admin'}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteUser(user._id)}
                    disabled={user._id === userInfo?._id}
                    className="rounded-2xl border border-red-600 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length && <p className="mt-4 text-sm text-slate-500">No users found yet.</p>}
      </div>
    </div>
  )
}
