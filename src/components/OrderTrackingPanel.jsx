import { useState } from 'react'
import { useSelector } from 'react-redux'
import api, { authHeaders } from '../utils/api.js'

export default function OrderTrackingPanel({ order }) {
  const token = useSelector((state) => state.user.token)
  const [trackingData, setTrackingData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTrack = async () => {
    setLoading(true)
    setError('')
    setTrackingData(null)

    try {
      const response = await api.get(`/orders/${order._id}/track`, authHeaders(token))
      setTrackingData(response.data.tracking)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to fetch live tracking.')
    } finally {
      setLoading(false)
    }
  }

  if (!order.courier || !order.trackingNumber) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm font-semibold text-gray-900">Tracking</p>
        <p className="mt-2 text-sm text-gray-600">Tracking information is not yet assigned for this order.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Live shipment tracking</p>
          <p className="text-sm text-gray-600">
            Courier: <span className="font-medium text-gray-900">{order.courier}</span>
            {' · '}
            Tracking #: <span className="font-medium text-gray-900">{order.trackingNumber}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={handleTrack}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {loading ? 'Loading…' : 'View live tracking'}
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {trackingData && (
        <div className="mt-4 space-y-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-gray-500">Current status</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">{trackingData.MostRecentStatus || trackingData.status || 'Unknown'}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {trackingData.OriginCity && (
                <div>
                  <p className="text-xs uppercase text-gray-500">Origin</p>
                  <p className="text-sm text-gray-900">{trackingData.OriginCity}</p>
                </div>
              )}
              {trackingData.DestinationCity && (
                <div>
                  <p className="text-xs uppercase text-gray-500">Destination</p>
                  <p className="text-sm text-gray-900">{trackingData.DestinationCity}</p>
                </div>
              )}
              {trackingData.ExpectedDeliveryDate && (
                <div>
                  <p className="text-xs uppercase text-gray-500">Estimated delivery</p>
                  <p className="text-sm text-gray-900">{new Date(trackingData.ExpectedDeliveryDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>

          {Array.isArray(trackingData.checkpoints) && trackingData.checkpoints.length > 0 && (
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-gray-900">Tracking history</p>
              <ul className="mt-4 space-y-3">
                {trackingData.checkpoints.map((checkpoint, idx) => (
                  <li key={idx} className="rounded-2xl border border-gray-200 p-4">
                    <p className="text-sm font-semibold text-gray-900">{checkpoint.status || checkpoint.description || 'Update'}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {checkpoint.timestamp ? new Date(checkpoint.timestamp).toLocaleString() : checkpoint.time || 'Time unknown'}
                      {checkpoint.location ? ` · ${checkpoint.location}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
