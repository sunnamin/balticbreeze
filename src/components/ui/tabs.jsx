import React, { createContext, useContext, useState } from "react"

const Ctx = createContext(null)

export function Tabs({ defaultValue, value, onValueChange, children }) {
  const [internal, setInternal] = useState(defaultValue || "")
  const val = value ?? internal
  const set = onValueChange ?? setInternal
  return <Ctx.Provider value={{val,set}}>{children}</Ctx.Provider>
}
export function TabsList({ className="", children }) {
  return <div className={`rounded-2xl border border-white/15 p-1 ${className}`}>{children}</div>
}
export function TabsTrigger({ value, children }) {
  const ctx = useContext(Ctx)
  const active = ctx?.val === value
  return (
    <button
      className={`px-3 py-1.5 text-sm rounded-xl border mx-1 ${active ? "border-white/40 bg-white/10" : "border-transparent hover:border-white/20"}`}
      onClick={() => ctx?.set(value)}
    >
      {children}
    </button>
  )
}
export function TabsContent({ value, className="", children }) {
  const ctx = useContext(Ctx)
  const show = ctx?.val === value
  return <div className={`${show ? "" : "hidden"} ${className}`}>{children}</div>
}
