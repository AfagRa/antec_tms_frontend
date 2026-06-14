import type { AttendanceStatus } from '../../types';

interface AttendanceStatusPickerProps {
  value: AttendanceStatus;
  onChange: (value: AttendanceStatus) => void;
  minutesLate?: number;
  onMinutesChange?: (v: number) => void;
}

const OPTIONS: { value: AttendanceStatus; abbr: string; activeColor: string }[] = [
  { value: 'present',          abbr: 'DR', activeColor: 'bg-green-100 border-green-400 text-green-700' },
  { value: 'late',             abbr: 'GC', activeColor: 'bg-amber-100 border-amber-400 text-amber-700' },
  { value: 'absent_excused',   abbr: 'QÜ', activeColor: 'bg-blue-100  border-blue-400  text-blue-700'  },
  { value: 'absent_unexcused', abbr: 'QS', activeColor: 'bg-red-100   border-red-400   text-red-700'   },
];

export default function AttendanceStatusPicker({
  value,
  onChange,
  minutesLate = 0,
  onMinutesChange,
}: AttendanceStatusPickerProps) {
  return (
    <div>
      <div className="flex items-center gap-1">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`w-9 h-8 rounded-md text-xs font-bold border-2 transition-all ${
              value === opt.value
                ? opt.activeColor
                : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300'
            }`}
            title={opt.abbr}
          >
            {opt.abbr}
          </button>
        ))}
      </div>
      {value === 'late' && onMinutesChange && (
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-text-base/50">Gecikdi:</span>
          <input
            type="number"
            min={1}
            max={90}
            value={minutesLate || ''}
            onChange={(e) => onMinutesChange(Number(e.target.value))}
            className="w-14 text-xs border border-amber-300 rounded px-1.5 py-0.5 text-center focus:ring-1 focus:ring-amber-400 outline-none bg-amber-50"
            placeholder="dəq"
          />
          <span className="text-xs text-text-base/50">dəq</span>
        </div>
      )}
    </div>
  );
}
