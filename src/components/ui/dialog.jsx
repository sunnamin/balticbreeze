import React, { useRef, useEffect } from "react"
export function Dialog({ open, onOpenChange, children }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
    const handleClose = () => onOpenChange?.(false)
    el.addEventListener("close", handleClose)
    return () => el.removeEventListener("close", handleClose)
  }, [open])
  return <dialog ref={ref} className="rounded-2xl border border-white/15 bg-black/80 text-white p-0">{children}</dialog>
}
export function DialogTrigger({ asChild=false, children }) { return children }
export function DialogHeader({ children }) { return <div className="p-4 border-b border-white/10">{children}</div> }
export function DialogTitle({ children }) { return <div className="text-lg font-semibold">{children}</div> }
export function DialogContent({ children }) { return <div className="p-4">{children}</div> }
