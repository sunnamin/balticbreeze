import React from "react"
const base = "inline-flex items-center justify-center rounded-2xl border transition px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
const variants = {
  default: "bg-white/10 hover:bg-white/20 border-white/10",
  secondary: "bg-white/20 hover:bg-white/30 border-white/10",
  outline: "bg-transparent hover:bg-white/10 border-white/20"
}
const sizes = { sm:"text-xs px-3 py-1.5", md:"", lg:"text-base px-5 py-3" }
export function Button({ variant="default", size="md", className="", ...props }) {
  return <button className={`${base} ${variants[variant]||variants.default} ${sizes[size]||""} ${className}`} {...props} />
}
export default Button
