import type { ReactNode } from 'react'
import Card from './Card'

interface Props {
  title: string
  value: number | string
  icon: ReactNode
  color?: string
  loading?: boolean
}

export default function StatCard({ title, value, icon, color = 'text-primary', loading }: Props) {
  return (
    <Card className="flex items-center gap-4 p-6">
      <div className={`rounded-neu bg-surface-dark/30 p-3 ${color}`}>
        <span className="text-2xl" aria-hidden>
          {icon}
        </span>
      </div>
      <div>
        <p className="text-sm text-text-base/60">{title}</p>
        {loading ? <div className="mt-1 h-7 w-16 animate-pulse rounded bg-surface-dark/30" /> : <p className="text-2xl font-bold text-text-base">{value}</p>}
      </div>
    </Card>
  )
}
