import React from "react"
export function Progress({ value=0, className="" }) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div className={`w-full h-2 rounded-full bg-white/10 overflow-hidden ${className}`}>
      <div className="h-full bg-white/40" style={{ width: `${v}%` }} />
    </div>
  )
}
