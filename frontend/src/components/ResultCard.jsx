const SEV_STYLES = {
  HIGH:    { bar: "bg-red-500",    badge: "bg-red-500/10 text-red-400 border-red-500/30"    },
  MEDIUM:  { bar: "bg-yellow-500", badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" },
  LOW:     { bar: "bg-teal-500",   badge: "bg-teal-500/10 text-teal-400 border-teal-500/30" },
  UNKNOWN: { bar: "bg-slate-500",  badge: "bg-slate-500/10 text-slate-400 border-slate-500/30"  },
}

export default function ResultCard({ result }) {
  const sev = result.severity?.toUpperCase() || "UNKNOWN"
  const styles = SEV_STYLES[sev] || SEV_STYLES.UNKNOWN

  return (
    <div className="space-y-4">

      {/* Severity */}
      <div className={`border rounded-2xl p-5 ${styles.badge}`}>
        <p className="text-xs uppercase tracking-widest mb-1 opacity-70">Severity Level</p>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${styles.bar}`}></div>
          <p className="text-2xl font-semibold">{sev}</p>
        </div>
        {result.safety_override && (
          <p className="text-xs mt-2 opacity-70">
            Safety rule applied: {result.override_reason}
          </p>
        )}
      </div>

      {/* Conditions + Doctor */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-3">
            Possible Conditions
          </p>
          <ul className="space-y-2">
            {result.conditions?.map((c, i) => (
              <li key={i} className="text-white text-sm flex gap-2 items-start">
                <span className="text-teal-500 mt-0.5">·</span>{c}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-3">
            See a Specialist
          </p>
          <p className="text-white text-sm font-medium">{result.doctor}</p>
          <p className="text-slate-500 text-xs mt-2">Recommended doctor type</p>
        </div>
      </div>

      {/* Advice */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <p className="text-slate-500 text-xs uppercase tracking-wider mb-3">
          Advice
        </p>
        <ul className="space-y-2">
          {result.advice?.map((a, i) => (
            <li key={i} className="text-slate-300 text-sm flex gap-2 items-start">
              <span className="text-teal-500 shrink-0 mt-0.5">→</span>{a}
            </li>
          ))}
        </ul>
      </div>

      {/* Reasoning */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <p className="text-slate-500 text-xs uppercase tracking-wider mb-3">
          AI Reasoning
        </p>
        <p className="text-slate-400 text-sm leading-relaxed">
          {result.reasoning}
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
        <p className="text-yellow-600 text-xs leading-relaxed">
          ⚠ {result.disclaimer}
        </p>
      </div>
    </div>
  )
}