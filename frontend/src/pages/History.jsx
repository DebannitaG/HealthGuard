import { useEffect, useState } from "react"
import axios from "axios"

const API = "https://healthguard-backend-7zgt.onrender.com"

export default function History() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(`${API}/history`)
        setReports(data || [])
      } catch (e) {
        setError("Could not load history.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const SEV_COLORS = {
    HIGH:    "text-red-400 border-red-500/30 bg-red-500/10",
    MEDIUM:  "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
    LOW:     "text-teal-400 border-teal-500/30 bg-teal-500/10",
    UNKNOWN: "text-slate-400 border-slate-500/30 bg-slate-500/10",
  }

  if (loading) return (
    <main className="flex-1 p-8 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
    </main>
  )

  return (
    <main className="flex-1 p-8 overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-white text-2xl font-semibold">Report History</h2>
        <p className="text-slate-400 text-sm mt-1">
          All past triage analyses.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {reports.length === 0 && !error ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
          <p className="text-slate-400 text-sm">
            No reports yet. Run your first analysis!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r, index) => {
            const sev = r.result?.severity?.toUpperCase() || "UNKNOWN"
            const cls = SEV_COLORS[sev] || SEV_COLORS.UNKNOWN
            return (
              <div key={index}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex flex-wrap gap-2">
                    {r.symptoms?.map((s, i) => (
                      <span key={i}
                        className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full border ${cls}`}>
                    {sev}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>Age: {r.age}</span>
                  <span>Doctor: {r.result?.doctor}</span>
                  <span>{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}