'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <h1 className="text-6xl font-bold text-gray-900 mb-4">500</h1>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Something went wrong</h2>
              <p className="text-gray-600 mb-8">
                We're experiencing some technical difficulties. Please try again later.
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => reset()}
                className="inline-block bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Try Again
              </button>
              
              <div className="text-sm text-gray-500">
                <a href="/" className="hover:text-gray-700 underline">
                  Back to Home
                </a>
                {' · '}
                <a href="/contact" className="hover:text-gray-700 underline">
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
