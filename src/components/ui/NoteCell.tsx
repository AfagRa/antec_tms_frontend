import { useState } from 'react'
import { Maximize2 } from 'lucide-react'
import NoteModal from './NoteModal'

interface NoteCellProps {
  note: string
  meta?: string
}

const TRUNCATE_AT = 40

export default function NoteCell({ note, meta }: NoteCellProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const isLong = note.length > TRUNCATE_AT

  return (
    <div className="flex items-center gap-1 max-w-[200px]">
      <span
        className={`text-sm text-text-base ${isLong ? 'truncate cursor-pointer hover:text-primary' : ''}`}
        onClick={isLong ? () => setModalOpen(true) : undefined}
        title={isLong ? 'Tam oxumaq üçün klikləyin' : undefined}
      >
        {note || '—'}
      </span>
      {isLong && (
        <button
          onClick={() => setModalOpen(true)}
          className="flex-shrink-0 text-text-base/50 hover:text-primary transition-colors"
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
      />
    </div>
  )
}
