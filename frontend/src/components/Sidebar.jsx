// frontend/src/components/Sidebar.jsx
import { getUser } from "../utils/auth"

const links = [
  { icon: "◈", label: "Dashboard" },
  { icon: "☰", label: "History"   },
]

export default function Sidebar({ activePage, setPage, onLogout }) {
  const user = getUser()

  return (
    <aside className="w-60 bg-slate-950 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs">HG</span>
        </div>
        <div>
          <span className="text-white font-semibold text-sm">HealthGuard</span>
          <p className="text-slate-500 text-xs">AI Triage</p>
        </div>
      </div>

      {/* User info */}
      {user?.full_name && (
        <div className="px-4 py-3 border-b border-slate-800">
          <p className="text-white text-sm font-medium">{user.full_name}</p>
          <p className="text-slate-500 text-xs">{user.email}</p>
        </div>
      )}

      <nav className="flex-1 p-4 space-y-1">
        {links.map(l => (
          <div
            key={l.label}
            onClick={() => setPage(l.label)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl
              cursor-pointer text-sm transition
              ${activePage === l.label
                ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
          >
            <span>{l.icon}</span>
            {l.label}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-xl p-3 mb-3">
          <p className="text-slate-400 text-xs text-center">
            ⚠ Not for medical use
          </p>
        </div>
        <button
          onClick={onLogout}
          className="w-full text-slate-500 text-xs hover:text-red-400 transition py-2"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}