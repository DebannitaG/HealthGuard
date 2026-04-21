import { useEffect, useState } from "react"
import { supabase } from "./supabaseClient"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import History from "./pages/History"
import Sidebar from "./components/Sidebar"

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState("Dashboard")

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  if (!session) return <Login />

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar activePage={page} setPage={setPage} />
      {page === "Dashboard" && <Dashboard />}
      {page === "History"   && <History />}
    </div>
  )
}