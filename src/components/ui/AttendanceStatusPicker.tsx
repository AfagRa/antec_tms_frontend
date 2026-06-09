import { useId } from 'react';
import type { AttendanceStatus } from '../../types';

interface AttendanceStatusPickerProps {
  value: AttendanceStatus;
  onChange: (value: AttendanceStatus) => void;
}

const STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: 'present', label: 'present' },
  { value: 'absent_excused', label: 'absent_excused' },
  { value: 'absent_unexcused', label: 'absent_unexcused' },
  { value: 'late', label: 'late' },
];

export default function AttendanceStatusPicker({
  value,
  onChange,
}: AttendanceStatusPickerProps) {
  const groupName = useId();

  return (
    <div className="flex flex-wrap gap-3">
      {STATUS_OPTIONS.map((option) => {
        const selected = value === option.value;

        return (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2"
          >
            <input
              type="radio"
              name={groupName}
              value={option.value}
              checked={selected}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                selected ? 'ring-2 ring-primary' : 'border border-surface-dark/20'
              }`}
            >
              {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
            </span>
            <span className="text-sm text-text-base">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}
