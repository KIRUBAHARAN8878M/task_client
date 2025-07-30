import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'ghost' | 'danger';
const base = 'inline-flex items-center justify-center rounded p-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
const variants: Record<Variant, string> = {
  ghost: 'hover:bg-gray-100 focus-visible:ring-gray-300',
  danger: 'text-red-600 hover:bg-red-50 focus-visible:ring-red-600',
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  label: string;      // accessible name
  icon: ReactNode;
};

export default function IconButton({ variant='ghost', icon, label, className='', ...rest }: Props) {
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      aria-label={label}
      title={label}
      {...rest}
    >
      {icon}
    </button>
  );
}
