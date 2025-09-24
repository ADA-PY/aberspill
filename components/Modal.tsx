import { ReactNode } from "react";
export default function Modal({ open, onClose, children }:
  { open: boolean; onClose: () => void; children: ReactNode }): JSX.Element | null {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 p-4" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
