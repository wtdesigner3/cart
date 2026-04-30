import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api.js'
import { toast } from 'react-toastify'

export default function ResetPassword() {
  const [form, setForm] = useState({ email: '', code: '', newPassword: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/reset-password', form)
      setSuccess(true)
      toast.success('Password reset successful. Please login with your new password.')
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Reset Password</h1>
        <p className="mt-2 text-sm text-gray-500">Use the code we sent to your email to update your password.</p>

        {success ? (
          <div className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
            Your password has been updated successfully.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Email address</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Reset code</span>
              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">New password</span>
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Resetting…' : 'Reset password'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          Back to{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
