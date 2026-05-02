// frontend/src/App.jsx
import { useState, useEffect } from "react"
import Login from "./pages/Login"
import ProfileSetup from "./pages/ProfileSetup"
import Dashboard from "./pages/Dashboard"
import History from "./pages/History"
import Sidebar from "./components/Sidebar"
import { isLoggedIn, getUser, clearAuth } from "./utils/auth"

export default function App() {
  const [page, setPage]               = useState("Dashboard")
  const [loggedIn, setLoggedIn]       = useState(false)
  const [profileDone, setProfileDone] = useState(false)

  useEffect(() => {
    if (isLoggedIn()) {
      const user = getUser()
      setLoggedIn(true)
      setProfileDone(user?.profile_complete || false)
    }
  }, [])

  const handleLogin = (profileComplete) => {
    setLoggedIn(true)
    setProfileDone(profileComplete)
  }

  const handleProfileComplete = () => {
    setProfileDone(true)
  }

  const handleLogout = () => {
    clearAuth()
    setLoggedIn(false)
    setProfileDone(false)
  }

  if (!loggedIn)    return <Login onLogin={handleLogin} />
  if (!profileDone) return <ProfileSetup onComplete={handleProfileComplete} />

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar activePage={page} setPage={setPage} onLogout={handleLogout} />
      {page === "Dashboard" && <Dashboard />}
      {page === "History"   && <History />}
    </div>
  )
}