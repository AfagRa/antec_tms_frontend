import type { UserStatus } from '@/types'

type BadgeVariant = UserStatus | 'scheduled' | 'completed' | 'cancelled'

interface Props {
  status: BadgeVariant
  label?: string
}

const styles: Record<BadgeVariant, string> = {
  active: 'bg-success/10 text-success',
  inactive: 'bg-surface-dark/40 text-text-base',
  scheduled: 'bg-primary/10 text-primary',
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-danger/10 text-danger',
}

const defaultLabels: Record<BadgeVariant, string> = {
  active: 'Aktiv',
  inactive: 'Passiv',
  scheduled: 'Planlanıb',
  completed: 'Tamamlandı',
  cancelled: 'Ləğv edildi',
}

export default function Badge({ status, label }: Props) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-bold tracking-wide ${styles[status]}`}>
      {label ?? defaultLabels[status]}
    </span>
  )
}
