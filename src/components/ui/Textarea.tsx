import type { TextareaHTMLAttributes } from 'react'

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export default function Textarea({ label, error, className = '', id, ...rest }: Props) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-xs font-bold uppercase tracking-widest text-text-base/70">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        aria-invalid={!!error}
        rows={4}
        className={`w-full resize-none rounded-neu bg-surface px-4 py-2.5 text-sm text-text-base shadow-neu-inset outline-none transition-all duration-150 placeholder:text-text-base/30 focus-visible:ring-2 focus-visible:ring-primary ${error ? 'ring-2 ring-danger' : ''} ${className}`}
        {...rest}
      />
      {error && <p role="alert" className="text-xs font-medium text-danger">{error}</p>}
    </div>
  )
}
