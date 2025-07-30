import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Spinner from './Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

const base =
  'inline-flex items-center justify-center rounded font-medium transition disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
const variants: Record<Variant, string> = {
  primary: 'bg-black text-white hover:bg-black/90 focus-visible:ring-black',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-300',
  ghost: 'bg-transparent text-gray-900 hover:bg-gray-100 focus-visible:ring-gray-300',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
};
const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading,
  leftIcon,
  rightIcon,
  children,
  className = '',
  ...rest
}: Props) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      aria-busy={loading ? 'true' : undefined}
      {...rest}
    >
      {loading ? (
        <Spinner className="mr-2" />
      ) : (
        leftIcon && <span className="mr-2" aria-hidden>{leftIcon}</span>
      )}
      {children}
      {rightIcon && !loading && <span className="ml-2" aria-hidden>{rightIcon}</span>}
    </button>
  );
}
