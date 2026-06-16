import type { JournalCell } from '../../types'

interface SegmentOption {
  value: JournalCell['attendance']
  label: string
  activeClass: string
}

const OPTIONS: SegmentOption[] = [
  {
    value: 'I/E',
    label: 'Dərsdə',
    activeClass: 'bg-green-600 text-white border-green-600',
  },
  {
    value: 'G',
    label: 'Gecikdi',
    activeClass: 'bg-amber-500 text-white border-amber-500',
  },
  {
    value: 'QÜ',
    label: 'Q/Üzrlü',
    activeClass: 'bg-blue-500 text-white border-blue-500',
  },
  {
    value: 'Q',
    label: 'Q/Üzrsüz',
    activeClass: 'bg-red-500 text-white border-red-500',
  },
]

interface Props {
  value: JournalCell['attendance']
  onChange: (v: JournalCell['attendance']) => void
  minutesLate?: number
  onMinutesChange?: (v: number) => void
}

export function AttendanceSegment({
  value, onChange, minutesLate = 0, onMinutesChange
}: Props) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center rounded-lg border border-surface-dark/20 overflow-hidden divide-x divide-surface-dark/20 w-fit">
        {OPTIONS.map((opt) => {
          const isActive = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(isActive && value !== 'I/E' ? 'I/E' : opt.value)}
              title={opt.label}
              className={`
                px-2.5 py-1 text-[11px] font-medium transition-all
                whitespace-nowrap select-none
                ${isActive
                  ? opt.activeClass
                  : 'bg-surface text-text-base/60 hover:bg-surface-dark/20'}
              `}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      {value === 'G' && (
        <div className="flex items-center gap-1 pl-0.5">
          <input
            type="number"
            min={1}
            max={90}
            value={minutesLate || ''}
            onChange={e =>
              onMinutesChange?.(
                e.target.value === '' ? 0 : Number(e.target.value)
              )
            }
            placeholder="dəq"
            className="w-[52px] text-xs border border-amber-300 rounded-md
                       px-1.5 py-0.5 text-center bg-amber-50
                       focus:ring-1 focus:ring-amber-400 outline-none"
          />
          <span className="text-[10px] text-text-base/50">dəq gecikdi</span>
        </div>
      )}
    </div>
  )
}
