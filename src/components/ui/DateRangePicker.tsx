import { CalendarDays, X } from 'lucide-react'

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onStartChange: (v: string) => void
  onEndChange: (v: string) => void
  variant?: 'student' | 'teacher'
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  variant = 'student',
}: DateRangePickerProps) {
  const wrapperClass =
    variant === 'teacher'
      ? 'flex items-center gap-2 w-full border border-lms-border rounded-lg px-3 py-2'
      : 'neu-input flex items-center gap-2 w-full'

  const inputClass =
    variant === 'teacher'
      ? 'bg-transparent border-0 outline-none text-sm text-lms-heading min-w-0 flex-1 cursor-pointer [color-scheme:light]'
      : 'bg-transparent border-0 outline-none text-sm text-lms-student-text min-w-0 flex-1 cursor-pointer [color-scheme:light]'

  return (
    <div className={wrapperClass}>
      <CalendarDays size={16} className="text-lms-student-muted flex-shrink-0" />
      <input
        type="date"
        value={startDate}
        onChange={(e) => onStartChange(e.target.value)}
        max={endDate || undefined}
        className={inputClass}
      />
      <span className="text-lms-student-muted text-sm">—</span>
      <input
        type="date"
        value={endDate}
        onChange={(e) => onEndChange(e.target.value)}
        min={startDate || undefined}
        className={inputClass}
      />
      {(startDate || endDate) && (
        <button
          onClick={() => { onStartChange(''); onEndChange('') }}
          className="ml-auto text-lms-student-muted hover:text-lms-student-text transition-colors"
          title="Tarixi sıfırla"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
