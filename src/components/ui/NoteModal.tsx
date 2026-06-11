import { useEffect } from 'react'
import { X } from 'lucide-react'

interface NoteModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  content: string
  meta?: string
  variant?: 'teacher' | 'student'
}

export default function NoteModal({ isOpen, onClose, title, content, meta, variant = 'student' }: NoteModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const cardClass = variant === 'teacher'
    ? 'lms-card rounded-neu bg-surface shadow-neu-sm p-6 max-w-md w-full relative'
    : 'neu-card max-w-md w-full relative'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)' }}
      onClick={onClose}
    >
      <div
        className={cardClass}
        style={{ maxHeight: '80vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-lms-student-text">{title}</h3>
            {meta && <p className="text-xs text-lms-student-muted mt-0.5">{meta}</p>}
          </div>
          <button
            onClick={onClose}
            className="neu-btn-primary p-1.5 ml-3 flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>
        <div className="neu-card-inset rounded-xl p-4">
          <p className="text-sm text-lms-student-text leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        </div>
      </div>
    </div>
  )
}
