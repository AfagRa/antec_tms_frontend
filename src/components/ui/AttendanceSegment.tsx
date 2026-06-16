import type { JournalCell } from '../../types'

interface SegmentOption {
  value: JournalCell['attendance']
  label: string
  fullLabel: string
  activeClass: string
}

const OPTIONS: SegmentOption[] = [
  {
    value: 'I/E',
    label: 'İE',
    fullLabel: 'İştirak Edir',
    activeClass: 'bg-green-600 text-white border-green-600',
  },
  {
    value: 'G',
    label: 'G',
    fullLabel: 'Gecikib',
    activeClass: 'bg-amber-500 text-white border-amber-500',
  },
  {
    value: 'QÜ',
    label: 'QÜ',
    fullLabel: 'Qaib Üzrlü',
    activeClass: 'bg-blue-500 text-white border-blue-500',
  },
  {
    value: 'Q',
    label: 'Q',
    fullLabel: 'Qaib Üzrsüz',
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
      <div className="flex items-center rounded-md border border-surface-dark/20 overflow-hidden divide-x divide-surface-dark/20 w-fit">
        {OPTIONS.map((opt) => {
          const isActive = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(isActive && opt.value !== 'I/E' ? 'I/E' : opt.value)}
              title={opt.fullLabel}
              className={`
                px-2 py-1 text-[11px] font-bold transition-all
                whitespace-nowrap select-none min-w-[28px] text-center
                ${isActive
                  ? opt.activeClass
                  : 'bg-surface text-text-base/60 hover:bg-surface-dark/20'}
              `}
            >
              {opt.value === 'G' && isActive && minutesLate > 0
                ? `G[${minutesLate}]`
                : opt.label
              }
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
