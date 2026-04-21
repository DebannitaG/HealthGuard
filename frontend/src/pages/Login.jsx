import { useState } from "react"
import { supabase } from "../supabaseClient"

export default function Login() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async () => {
    if (!email) return
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.signInWithOtp({ email })
    setLoading(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">HG</span>
          </div>
          <div>
            <h1 className="text-white font-semibold text-xl">HealthGuard</h1>
            <p className="text-slate-500 text-xs">AI Medical Triage</p>
          </div>
        </div>

        {sent ? (
          <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-4">
            <p className="text-teal-400 text-sm font-medium">Magic link sent!</p>
            <p className="text-slate-400 text-xs mt-1">Check your inbox at {email} and click the link to sign in.</p>
          </div>
        ) : (
          <>
            <p className="text-slate-400 text-sm mb-6">
              Enter your email to receive a secure sign-in link. No password needed.
            </p>
            <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">
              Email address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              className="w-full bg-slate-800 border border-slate-700 text-white
                rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none
                focus:border-teal-500 transition"
            />
            {error && (
              <p className="text-red-400 text-xs mb-3">{error}</p>
            )}
            <button
              onClick={handleLogin}
              disabled={loading || !email}
              className="w-full bg-teal-500 hover:bg-teal-400 text-white
                font-medium py-3 rounded-xl text-sm transition
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Magic Link"}
            </button>
          </>
        )}

        <p className="text-slate-600 text-xs text-center mt-6">
          ⚠ For demo purposes only. Not for real medical use.
        </p>
      </div>
    </div>
  )
}