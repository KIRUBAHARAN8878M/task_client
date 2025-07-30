import type { ReactNode } from 'react';

export function Field({
  label, htmlFor, required, hint, error, children
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;

  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {children}
      {error ? (
        <p id={errorId} className="text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}
