import Button from './Button'
import Modal from './Modal'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
  loading?: boolean
  confirmLabel?: string
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Əminsinizmi?',
  message = 'Bu əməliyyat geri alına bilməz.',
  loading = false,
  confirmLabel = 'Sil',
}: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="mb-6 text-sm text-text-base/70">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Ləğv et
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
