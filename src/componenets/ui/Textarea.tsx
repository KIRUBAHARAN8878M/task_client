import type { TextareaHTMLAttributes } from 'react';

export default function Textarea({
  className = '',
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded border px-3 py-2 text-sm
      bg-white text-gray-900 border-gray-300
      focus:outline-none focus:ring-2 focus:ring-black/50
      dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 dark:focus:ring-white/30
      ${className}`}
      {...rest}
    />
  );
}
