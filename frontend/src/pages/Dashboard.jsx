import { useState } from "react"
import axios from "axios"
import { supabase } from "../supabaseClient"
import ResultCard from "../components/ResultCard"

const API = "http://localhost:5000"

export default function Dashboard() {
  const [input, setInput]     = useState("")
  const [chips, setChips]     = useState([])
  const [age, setAge]         = useState("")
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")

  const addChip = () => {
    const trimmed = input.trim()
    if (trimmed && !chips.includes(trimmed)) {
      setChips([...chips, trimmed])
    }
    setInput("")
  }

  const removeChip = (c) => setChips(chips.filter(x => x !== c))

  const analyze = async () => {
    if (!chips.length) { setError("Add at least one symptom."); return }
    if (!age)          { setError("Please enter your age."); return }
    setLoading(true); setError(""); setResult(null)
    try {
      const { data } = await axios.post(`${API}/analyze`, {
        symptoms: chips,
        age: parseInt(age),
      })
      setResult(data)

      // Save report to Supabase
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from("reports").insert({
            user_id:  user.id,
            symptoms: chips,
            age:      parseInt(age),
            result:   data,
          })
          console.log("[DB] Report saved successfully")
        }
      } catch (err) {
        console.error("[DB] Save failed:", err.message)
      }

    } catch (e) {
      setError(e.response?.data?.error || "Something went wrong. Is the backend running?")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex-1 p-8 overflow-y-auto">

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-white text-2xl font-semibold">Symptom Analysis</h2>
        <p className="text-slate-400 text-sm mt-1">
          Describe your symptoms for an AI-powered triage assessment.
        </p>
      </div>

      {/* Input Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">

        {/* Symptom Input */}
        <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">
          Add Symptoms
        </label>
        <div className="flex gap-2 mb-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addChip()}
            placeholder="Type a symptom and press Enter or Add..."
            className="flex-1 bg-slate-800 border border-slate-700 text-white
              rounded-xl px-4 py-2.5 text-sm focus:outline-none
              focus:border-teal-500 transition"
          />
          <button
            onClick={addChip}
            className="bg-teal-500 hover:bg-teal-400 text-white
              px-5 rounded-xl text-sm font-medium transition"
          >
            Add
          </button>
        </div>

        {/* Chips */}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {chips.map(c => (
              <span
                key={c}
                className="bg-slate-800 border border-slate-700 text-white
                  text-xs px-3 py-1.5 rounded-full flex items-center gap-2"
              >
                {c}
                <button
                  onClick={() => removeChip(c)}
                  className="text-slate-500 hover:text-red-400 transition"
                >✕</button>
              </span>
            ))}
          </div>
        )}

        {/* Age Input */}
        <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">
          Patient Age
        </label>
        <input
          type="number"
          value={age}
          onChange={e => setAge(e.target.value)}
          placeholder="Enter age"
          min="0"
          max="120"
          className="w-32 bg-slate-800 border border-slate-700 text-white
            rounded-xl px-4 py-2.5 text-sm focus:outline-none
            focus:border-teal-500 transition"
        />

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={analyze}
          disabled={loading}
          className="mt-6 w-full bg-teal-500 hover:bg-teal-400 text-white
            font-medium py-3 rounded-xl text-sm transition
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Analyzing symptoms...
            </span>
          ) : "Run Triage Analysis"}
        </button>
      </div>

      {/* Results */}
      {result && <ResultCard result={result} />}

    </main>
  )
}