import type { InputHTMLAttributes } from 'react';

export default function Input({
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/50 ${className}`}
      {...rest}
    />
  );
}
