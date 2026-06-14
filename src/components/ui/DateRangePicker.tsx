import { CalendarDays, X } from 'lucide-react'

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onStartChange: (v: string) => void
  onEndChange: (v: string) => void
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
}: DateRangePickerProps) {
  const wrapperClass =
    'flex items-center gap-2 w-full rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-2'

  const inputClass =
    'bg-transparent border-0 outline-none text-sm text-text-base min-w-0 flex-1 cursor-pointer [color-scheme:light]'

  return (
    <div className={wrapperClass}>
      <CalendarDays size={16} className="text-text-base/50 flex-shrink-0" />
      <input
        type="date"
        value={startDate}
        onChange={(e) => onStartChange(e.target.value)}
        max={endDate || undefined}
        className={inputClass}
      />
      <span className="text-text-base/50 text-sm">—</span>
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
          className="ml-auto text-text-base/50 hover:text-text-base transition-colors"
          title="Tarixi sıfırla"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
