import type { ReactNode, SelectHTMLAttributes } from 'react'

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  children: ReactNode
}

export default function Select({ label, error, children, className = '', id, ...rest }: Props) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-xs font-bold uppercase tracking-widest text-text-base/70">
          {label}
        </label>
      )}
      <select
        id={selectId}
        aria-invalid={!!error}
        className={`w-full cursor-pointer rounded-neu bg-surface px-4 py-2.5 text-sm text-text-base shadow-neu-inset outline-none transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary ${error ? 'ring-2 ring-danger' : ''} ${className}`}
        {...rest}
      >
        {children}
      </select>
      {error && <p role="alert" className="text-xs font-medium text-danger">{error}</p>}
    </div>
  )
}
