import type { SelectHTMLAttributes } from 'react';

export default function Select({
  className = '',
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/50 ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
}
