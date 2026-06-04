import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
  children?: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-white shadow-neu-sm hover:shadow-neu-inset-sm',
  secondary: 'bg-surface text-text-base shadow-neu hover:shadow-neu-inset',
  ghost: 'bg-transparent text-text-base hover:shadow-neu-sm',
  danger: 'bg-danger text-white shadow-neu-sm hover:opacity-90',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-neu-sm',
  md: 'px-5 py-2.5 text-sm rounded-neu',
  lg: 'px-7 py-3 text-base rounded-neu-lg',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex min-h-10 items-center justify-center gap-2 font-bold tracking-wide transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  )
}
