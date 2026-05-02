// frontend/src/pages/Login.jsx
import { useState } from "react"
import axios from "axios"
import { setAuth } from "../utils/auth"

const API = "https://healthguard-backend-7zgt.onrender.com"

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail]           = useState("")
  const [password, setPassword]     = useState("")
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState("")

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Email and password are required.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const endpoint = isRegister ? "/register" : "/login"
      const { data } = await axios.post(`${API}${endpoint}`, {
        email, password
      })

      // Save token and user to localStorage
      setAuth(data.token, {
        user_id:          data.user_id,
        email:            data.email,
        profile_complete: data.profile_complete,
        full_name:        data.full_name,
      })

      onLogin(data.profile_complete)

    } catch (e) {
      setError(e.response?.data?.error || "Something went wrong.")
    } finally {
      setLoading(false)
    }
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

        <h2 className="text-white font-medium text-lg mb-1">
          {isRegister ? "Create account" : "Welcome back"}
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          {isRegister
            ? "Sign up to start using HealthGuard."
            : "Sign in to your account."}
        </p>

        {/* Email */}
        <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">
          Email address
        </label>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 text-white
            rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none
            focus:border-teal-500 transition"
        />

        {/* Password */}
        <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">
          Password
        </label>
        <input
          type="password"
          placeholder="Min 6 characters"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          className="w-full bg-slate-800 border border-slate-700 text-white
            rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none
            focus:border-teal-500 transition"
        />

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-teal-500 hover:bg-teal-400 text-white
            font-medium py-3 rounded-xl text-sm transition
            disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {loading ? "Please wait..." : isRegister ? "Create Account" : "Sign In"}
        </button>

        {/* Toggle */}
        <p className="text-slate-500 text-xs text-center">
          {isRegister ? "Already have an account?" : "Don't have an account?"}
          <button
            onClick={() => { setIsRegister(!isRegister); setError("") }}
            className="text-teal-400 hover:text-teal-300 ml-1 transition"
          >
            {isRegister ? "Sign in" : "Sign up"}
          </button>
        </p>

        <p className="text-slate-600 text-xs text-center mt-4">
          ⚠ For demo purposes only. Not for real medical use.
        </p>
      </div>
    </div>
  )
}