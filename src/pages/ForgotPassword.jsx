import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api.js'
import { toast } from 'react-toastify'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const response = await api.post('/auth/forgot-password', { email })
      setSent(true)
      setPreviewUrl(response.data.previewUrl || '')
      toast.success(response.data.message)
      if (response.data.previewUrl) {
        toast.info('Email preview is available after sending the reset code.')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Forgot Password</h1>
        <p className="mt-2 text-sm text-gray-500">Enter your email and we will send a reset code.</p>

        {sent ? (
          <div className="mt-6 space-y-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
            <p>Instructions sent. Check your inbox, then use the reset page to create a new password.</p>
            <p>If you are testing locally, open the backend console or use the preview URL shown in the toast.</p>
            {previewUrl ? (
              <p>
                Preview link:{' '}
                <a href={previewUrl} target="_blank" rel="noreferrer" className="font-semibold text-indigo-700 hover:text-indigo-900">
                  Open email preview
                </a>
              </p>
            ) : null}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Email address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Sending…' : 'Send reset code'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          Remembered your password?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
