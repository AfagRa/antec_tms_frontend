import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import type { Toast, ToastType } from '@/hooks/useToast'

const icons: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const colors: Record<ToastType, string> = {
  success: 'text-success',
  error: 'text-danger',
  warning: 'text-warning',
  info: 'text-primary',
}

interface Props {
  toasts: Toast[]
  onRemove: (id: number) => void
}

export default function ToastContainer({ toasts, onRemove }: Props) {
  return (
    <div aria-live="polite" className="fixed bottom-6 right-6 z-[60] flex max-w-sm flex-col gap-3">
      {toasts.map((toast) => {
        const Icon = icons[toast.type]
        return (
          <div key={toast.id} role="status" className="flex items-center gap-3 rounded-neu bg-surface px-5 py-3 shadow-neu-lg">
            <Icon size={18} className={colors[toast.type]} aria-hidden />
            <p className="flex-1 text-sm font-medium text-text-base">{toast.message}</p>
            <button onClick={() => onRemove(toast.id)} aria-label="Bağla" className="text-text-base/40 transition-colors hover:text-text-base">
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
