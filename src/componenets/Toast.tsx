import { useEffect, useState } from 'react';

export function Toast({ message, onClose }: { message: string; onClose: ()=>void }) {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => { setOpen(false); onClose(); }, 2500);
    return () => clearTimeout(t);
  }, [onClose]);
  if (!open) return null;
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded shadow">
    {message}
  </div>
  );
}
