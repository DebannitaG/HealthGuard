import { useState } from "react"
import Dashboard from "./pages/Dashboard"
import History from "./pages/History"
import Sidebar from "./components/Sidebar"

export default function App() {
  const [page, setPage] = useState("Dashboard")

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar activePage={page} setPage={setPage} />
      {page === "Dashboard" && <Dashboard />}
      {page === "History"   && <History />}
    </div>
  )
}