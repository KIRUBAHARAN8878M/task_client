import { type ReactNode, useEffect } from 'react';

export default function Modal({
  open, onClose, title, children
}: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div role="dialog" aria-modal="true" className="relative w-full max-w-lg bg-white rounded shadow-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="text-sm underline" onClick={onClose} aria-label="Close">Close</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
