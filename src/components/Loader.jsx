export default function Loader({ message = 'Loading…' }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl rounded-3xl border border-gray-200 bg-white p-10 shadow-lg shadow-slate-200/60">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-xl shadow-indigo-500/20">
            <svg
              className="h-10 w-10 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" strokeOpacity="0.15" />
              <path d="M22 12a10 10 0 0 1-10 10" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-semibold text-slate-900">{message}</p>
            <p className="mt-2 text-sm text-slate-500">Please wait while we prepare fresh content for you.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
