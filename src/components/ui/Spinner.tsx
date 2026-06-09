interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
}

const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }

export default function Spinner({ size = 'md' }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Yüklənir"
      className={`animate-spin rounded-full border-4 border-surface-dark border-t-primary ${sizes[size]}`}
    />
  )
}
