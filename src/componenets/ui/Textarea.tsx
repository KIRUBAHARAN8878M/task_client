import type { TextareaHTMLAttributes } from 'react';

export default function Textarea({
  className = '',
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/50 ${className}`}
      {...rest}
    />
  );
}
