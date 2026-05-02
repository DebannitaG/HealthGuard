// frontend/src/pages/ProfileSetup.jsx
import { useState } from "react"
import axios from "axios"
import { getToken, getUser, setAuth } from "../utils/auth"

const API = "https://healthguard-backend-7zgt.onrender.com"

export default function ProfileSetup({ onComplete }) {
  const [fullName, setFullName]       = useState("")
  const [gender, setGender]           = useState("")
  const [age, setAge]                 = useState("")
  const [bloodGroup, setBloodGroup]   = useState("")
  const [conditions, setConditions]   = useState("")
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState("")

  const handleSubmit = async () => {
    if (!fullName || !gender || !age) {
      setError("Name, gender and age are required.")
      return
    }
    setLoading(true)
    setError("")
    try {
      await axios.post(
        `${API}/profile`,
        { full_name: fullName, gender, age: parseInt(age),
          blood_group: bloodGroup, conditions },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      )

      // Update user in localStorage
      const user = getUser()
      setAuth(getToken(), {
        ...user,
        full_name:        fullName,
        profile_complete: true,
      })

      onComplete()
    } catch (e) {
      setError(e.response?.data?.error || "Failed to save profile.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 w-full max-w-lg">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">HG</span>
          </div>
          <div>
            <h1 className="text-white font-semibold text-xl">Complete Your Profile</h1>
            <p className="text-slate-500 text-xs">Help us personalize your experience</p>
          </div>
        </div>

        <div className="space-y-4">

          {/* Full Name */}
          <div>
            <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white
                rounded-xl px-4 py-3 text-sm focus:outline-none
                focus:border-teal-500 transition"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">
              Gender *
            </label>
            <div className="flex gap-3">
              {["Male", "Female", "Other"].map(g => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition border
                    ${gender === g
                      ? "bg-teal-500/10 border-teal-500 text-teal-400"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Age */}
          <div>
            <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">
              Age *
            </label>
            <input
              type="number"
              placeholder="25"
              value={age}
              onChange={e => setAge(e.target.value)}
              min="0"
              max="120"
              className="w-full bg-slate-800 border border-slate-700 text-white
                rounded-xl px-4 py-3 text-sm focus:outline-none
                focus:border-teal-500 transition"
            />
          </div>

          {/* Blood Group */}
          <div>
            <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">
              Blood Group
            </label>
            <div className="flex flex-wrap gap-2">
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                <button
                  key={bg}
                  onClick={() => setBloodGroup(bg)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition border
                    ${bloodGroup === bg
                      ? "bg-teal-500/10 border-teal-500 text-teal-400"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Existing Conditions */}
          <div>
            <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">
              Existing Medical Conditions
            </label>
            <textarea
              placeholder="e.g. Diabetes, Hypertension, Asthma (optional)"
              value={conditions}
              onChange={e => setConditions(e.target.value)}
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 text-white
                rounded-xl px-4 py-3 text-sm focus:outline-none
                focus:border-teal-500 transition resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-teal-500 hover:bg-teal-400 text-white
              font-medium py-3 rounded-xl text-sm transition
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Complete Setup →"}
          </button>
        </div>
      </div>
    </div>
  )
}