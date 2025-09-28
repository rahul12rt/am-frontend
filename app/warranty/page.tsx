export default function WarrantyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-wider">
              ALBAN MARCUS WARRANTY
            </h1>
            <div className="w-24 h-1 bg-white mx-auto"></div>
          </div>

          {/* Main Content */}
          <div className="space-y-12">
            {/* Coverage Section */}
            <section className="bg-gray-900/50 border border-gray-700 rounded-lg p-8">
              <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-center">
                For your watch line, common coverage includes:
              </h2>
              <ul className="space-y-4 text-lg md:text-xl">
                <li className="flex items-start">
                  <span className="text-white mr-3">•</span>
                  <span>Movement (automatic/quartz defects, timekeeping issues)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white mr-3">•</span>
                  <span>Manufacturing defects (dial, hands, case, crown, clasp, etc.)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white mr-3">•</span>
                  <span>Water resistance failure (within rated ATM, if not opened by customer)</span>
                </li>
              </ul>
            </section>

            {/* Not Covered Section */}
            <section className="bg-red-900/20 border border-red-700/50 rounded-lg p-8">
              <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-center text-red-300">
                What is not covered:
              </h2>
              <ul className="space-y-4 text-lg md:text-xl">
                <li className="flex items-start">
                  <span className="text-red-300 mr-3">•</span>
                  <span>Normal wear & tear (scratches, fading)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-300 mr-3">•</span>
                  <span>Straps, crystals, batteries (for quartz)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-300 mr-3">•</span>
                  <span>Damage due to accidents, misuse, unauthorized repair</span>
                </li>
              </ul>
            </section>

            {/* Warranty Claim Process */}
            <section className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-8">
              <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-center text-blue-300">
                Warranty Claim Process
              </h2>
              <div className="space-y-6 text-lg md:text-xl">
                <div className="flex items-start">
                  <span className="text-blue-300 mr-3">•</span>
                  <div>
                    <span>Upload proof of purchase (invoice/order confirmation) to </span>
                    <a 
                      href="mailto:contact@albanmarcus.com" 
                      className="text-blue-400 hover:text-blue-300 underline transition-colors"
                    >
                      contact@albanmarcus.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-300 mr-3">•</span>
                  <span>After inspection, we repair/replace and ship back free of cost.</span>
                </div>
              </div>
            </section>

            {/* Thank You Section */}
            <div className="text-center py-12">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-600 rounded-lg p-8">
                <h2 className="text-3xl md:text-4xl font-bold tracking-wider">
                  THANK YOU - ALBAN MARCUS
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
