import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'sm' | 'md' | 'lg'
}

const paddingMap = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export default function Card({ children, padding = 'md', className = '', ...rest }: CardProps) {
  return (
    <div className={`rounded-neu-lg bg-surface shadow-neu ${paddingMap[padding]} ${className}`} {...rest}>
      {children}
    </div>
  )
}
