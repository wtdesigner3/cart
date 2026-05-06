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
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Customer management</h1>
            <p className="text-sm text-gray-600">Manage users and admin permissions.</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-900">Name</th>
              <th className="px-6 py-3 font-semibold text-gray-900">Email</th>
              <th className="px-6 py-3 font-semibold text-gray-900">Role</th>
              <th className="px-6 py-3 font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {users.map((user) => (
              <tr key={user.id || user._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-3 text-gray-900 font-medium">{user.name}</td>
                <td className="px-6 py-3 text-gray-600">{user.email}</td>
                <td className="px-6 py-3">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${user.isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                    {user.isAdmin ? 'Admin' : 'Customer'}
                  </span>
                </td>
                <td className="px-6 py-3 space-x-2">
                  <button
                    type="button"
                    onClick={() => toggleAdmin(user._id, !user.isAdmin)}
                    disabled={user._id === userInfo?._id}
                    className="rounded-lg border border-primary px-3 py-2 text-xs font-semibold text-primary hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-50 transition"
                  >
                    {user.isAdmin ? 'Revoke' : 'Make Admin'}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteUser(user._id)}
                    disabled={user._id === userInfo?._id}
                    className="rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length && <p className="p-6 text-sm text-gray-600">No users found yet.</p>}
      </div>
    </div>
  )
}
