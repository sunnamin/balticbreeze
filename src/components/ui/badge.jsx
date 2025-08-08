import React from "react"
export function Badge({ className="", ...props }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs border border-white/10 ${className}`} {...props} />
}
