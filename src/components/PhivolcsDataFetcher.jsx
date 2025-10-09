import React, { useState, useEffect } from 'react'
import { RefreshCw, AlertCircle, Clock, MapPin, Activity, Server, Wifi, WifiOff, ChevronDown } from 'lucide-react'
import EarthquakeMap from './EarthquakeMap'

export default function PhivolcsDataFetcher() {
  const [earthquakes, setEarthquakes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [isCached, setIsCached] = useState(false)
  const [backendUrl] = useState('https://phivolcs-earthquake-api.onrender.com')
  const [filterMagnitude, setFilterMagnitude] = useState(0)
  const [searchLocation, setSearchLocation] = useState('')
  const [expandedRow, setExpandedRow] = useState(null)
  const [expandedSection, setExpandedSection] = useState(null);

  const fetchData = async (forceRefresh = false) => {
    setLoading(true)
    setError(null)
    try {
      const endpoint = forceRefresh ? '/api/earthquakes/refresh' : '/api/earthquakes'
      const response = await fetch(`${backendUrl}${endpoint}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const result = await response.json()
      if (result.success) {
        setEarthquakes(result.data)
        setLastUpdated(result.lastUpdated ? new Date(result.lastUpdated) : new Date())
        setIsCached(Boolean(result.cached))
      } else {
        throw new Error(result.error || 'Failed to fetch data')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getMagnitudeBadge = (mag) => {
    const magnitude = parseFloat(mag)
    if (Number.isNaN(magnitude)) return 'bg-slate-100 text-slate-600'
    if (magnitude >= 6) return 'bg-red-100 text-red-700'
    if (magnitude >= 5) return 'bg-orange-100 text-orange-700'
    if (magnitude >= 4) return 'bg-yellow-100 text-yellow-700'
    return 'bg-green-100 text-green-700'
  }

  const filteredEarthquakes = earthquakes.filter((quake) => {
    const magnitude = parseFloat(quake.magnitude)
    const matchesMagnitude = magnitude >= filterMagnitude
    const matchesLocation =
      searchLocation === '' || String(quake.location).toLowerCase().includes(searchLocation.toLowerCase())
    return matchesMagnitude && matchesLocation
  })

  const getStats = () => {
    if (earthquakes.length === 0) return null
    const magnitudes = earthquakes
      .map((q) => parseFloat(q.magnitude))
      .filter((m) => !Number.isNaN(m))
    const maxMag = Math.max(...magnitudes)
    const avgMag = (magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length).toFixed(2)
    const strong = magnitudes.filter((m) => m >= 5).length
    return { maxMag, avgMag, strong, total: earthquakes.length }
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-blue-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-800 flex items-center gap-3">
                <Activity className="text-blue-600" size={36} />
                PHIVOLCS Earthquake Monitor
              </h1>
              <p className="text-slate-600 mt-2">Real-time seismic events in the Philippines</p>
              <div className="flex items-center gap-2 mt-2">
                {loading ? (
                  <WifiOff className="text-slate-400" size={16} />
                ) : (
                  <Wifi className="text-green-500" size={16} />
                )}
                <span className="text-sm text-slate-500">{backendUrl.replace('https://', '')}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchData(false)}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all shadow-md hover:shadow-lg"
              >
                <RefreshCw className={loading ? 'animate-spin' : ''} size={18} />
                Refresh
              </button>
              <button
                onClick={() => fetchData(true)}
                disabled={loading}
                className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-all shadow-md hover:shadow-lg"
              >
                <Server size={18} />
                Force Refresh
              </button>
            </div>
          </div>

          {lastUpdated && (
            <div className="flex items-center gap-4 text-sm text-slate-600 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Clock size={16} />
                Last updated: {lastUpdated.toLocaleString()}
              </div>
              {isCached && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">Cached</span>
              )}
            </div>
          )}





        </div>

        {stats && !loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
              <div className="text-sm text-slate-600 mb-1">Total Earthquakes</div>
              <div className="text-3xl font-bold text-slate-800">{stats.total}</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
              <div className="text-sm text-slate-600 mb-1">Average Magnitude</div>
              <div className="text-3xl font-bold text-slate-800">{stats.avgMag}</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-orange-500">
              <div className="text-sm text-slate-600 mb-1">Highest Magnitude</div>
              <div className="text-3xl font-bold text-slate-800">{stats.maxMag}</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-red-500">
              <div className="text-sm text-slate-600 mb-1">Strong (≥5.0)</div>
              <div className="text-3xl font-bold text-slate-800">{stats.strong}</div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-5 mb-6 shadow-md">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 text-lg">Error fetching data</h3>
                <p className="text-red-700 mt-1">{error}</p>
                {String(error).includes('Failed to fetch') && (
                  <p className="text-red-600 text-sm mt-2">The server might be spinning up (first request can take 50 seconds). Please wait and try again.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-10 text-center shadow-lg">
            <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={56} />
            <p className="text-blue-800 font-semibold text-lg">Fetching earthquake data...</p>
            <p className="text-blue-600 text-sm mt-2">This may take up to 50 seconds on first request</p>
          </div>
        )}

        {earthquakes.length > 0 && !loading && (
          <div className="bg-white rounded-xl shadow-md p-5 mb-6">
            <h3 className="font-semibold text-slate-800 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Minimum Magnitude: {filterMagnitude}</label>
                <input
                  type="range"
                  min="0"
                  max="6"
                  step="0.5"
                  value={filterMagnitude}
                  onChange={(e) => setFilterMagnitude(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Search Location</label>
                <input
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="e.g., Cebu, Bogo"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-3 text-sm text-slate-600">Showing {filteredEarthquakes.length} of {earthquakes.length} earthquakes</div>
          </div>
        )}

        {filteredEarthquakes.length > 0 && (
          <EarthquakeMap
            earthquakes={filteredEarthquakes}
            title="Earthquake Activity Map"
            subtitle="October 2025 - Philippines Region"
            isExpanded={true}
            onToggle={() => setExpandedSection(
              expandedSection === 'filteredEarthquakes' ? null : 'filteredEarthquakes'
            )}
            headerClassName="bg-blue-50" // optional
            contentClassName="bg-gray-50" // optional
          />
        )}

        {!loading && !error && earthquakes.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-16 text-center">
            <Activity size={64} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600 text-lg mb-2">No earthquake data available</p>
            <p className="text-slate-500 text-sm">Click "Refresh Data" to fetch latest information</p>
          </div>
        )}

        <div className="mt-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-6 text-sm text-slate-700 border border-slate-200">
          <p className="font-semibold mb-3 text-slate-800">About this data:</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Data sourced from PHIVOLCS (Philippine Institute of Volcanology and Seismology)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Times are in Philippine Standard Time (PST = UTC+8)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                Magnitude scale: <span className="text-green-600 font-medium">Minor (&lt;4)</span>,{' '}
                <span className="text-yellow-600 font-medium">Light (4-5)</span>,{' '}
                <span className="text-orange-600 font-medium">Moderate (5-6)</span>,{' '}
                <span className="text-red-600 font-medium">Strong (≥6)</span>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Data is cached for 5 minutes to reduce server load</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}


