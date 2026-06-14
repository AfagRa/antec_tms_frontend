import { useEffect } from 'react'
import { X } from 'lucide-react'

interface NoteModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  content: string
  meta?: string
}

export default function NoteModal({ isOpen, onClose, title, content, meta }: NoteModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)' }}
      onClick={onClose}
    >
      <div
        className="rounded-neu bg-surface shadow-neu-sm p-6 max-w-md w-full relative"
        style={{ maxHeight: '80vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-text-base">{title}</h3>
            {meta && <p className="text-xs text-text-base/50 mt-0.5">{meta}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-primary/10 p-1.5 ml-3 flex-shrink-0 text-primary hover:bg-primary/20 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="rounded-neu bg-surface shadow-neu-inset-sm p-4">
          <p className="text-sm text-text-base leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        </div>
      </div>
    </div>
  )
}
