import { useState } from 'react'
import { Maximize2 } from 'lucide-react'
import NoteModal from './NoteModal'

interface NoteCellProps {
  note: string
  meta?: string
  variant?: 'teacher' | 'student'
}

const TRUNCATE_AT = 40

export default function NoteCell({ note, meta, variant }: NoteCellProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const isLong = note.length > TRUNCATE_AT

  return (
    <div className="flex items-center gap-1 max-w-[200px]">
      <span
        className={`text-sm text-lms-student-text ${isLong ? 'truncate cursor-pointer hover:text-lms-student-accent' : ''}`}
        onClick={isLong ? () => setModalOpen(true) : undefined}
        title={isLong ? 'Tam oxumaq üçün klikləyin' : undefined}
      >
        {note || '—'}
      </span>
      {isLong && (
        <button
          onClick={() => setModalOpen(true)}
          className="flex-shrink-0 text-lms-student-muted hover:text-lms-student-accent transition-colors"
          title="Tam oxu"
        >
          <Maximize2 size={13} />
        </button>
      )}
      <NoteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Müəllim Qeydi"
        content={note}
        meta={meta}
        variant={variant}
      />
    </div>
  )
}
