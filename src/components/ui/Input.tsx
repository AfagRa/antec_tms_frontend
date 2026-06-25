import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: ReactNode
}

export default function Input({ label, error, leftIcon, className = '', id, ...rest }: Props) {
  const reactId = useId()
  const inputId = id
    ?? (label
        ? `${label.toLowerCase().replace(/\s+/g, '-')}-${reactId.replace(/:/g, '')}`
        : reactId.replace(/:/g, ''))

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-bold uppercase tracking-widest text-text-base/70">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-text-base/40">{leftIcon}</span>}
        <input
          id={inputId}
          aria-invalid={!!error}
          className={`w-full rounded-neu bg-surface px-4 py-2.5 text-sm text-text-base shadow-neu-inset outline-none transition-all duration-150 placeholder:text-text-base/30 focus-visible:ring-2 focus-visible:ring-primary ${leftIcon ? 'pl-10' : ''} ${error ? 'ring-2 ring-danger' : ''} ${className}`}
          {...rest}
        />
      </div>
      {error && <p role="alert" className="text-xs font-medium text-danger">{error}</p>}
    </div>
  )
}
