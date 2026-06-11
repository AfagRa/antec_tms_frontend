import { useId } from 'react';
import type { AttendanceStatus } from '../../types';
import { ATTENDANCE_STATUS_LABELS } from '../../types';

interface AttendanceStatusPickerProps {
  value: AttendanceStatus;
  onChange: (value: AttendanceStatus) => void;
}

const STATUS_OPTIONS: AttendanceStatus[] = ['present', 'absent_excused', 'absent_unexcused', 'late'];

export default function AttendanceStatusPicker({
  value,
  onChange,
}: AttendanceStatusPickerProps) {
  const groupName = useId();

  return (
    <div className="flex flex-wrap gap-3">
      {STATUS_OPTIONS.map((option) => {
        const selected = value === option;

        return (
          <label
            key={option}
            className="flex cursor-pointer items-center gap-2"
          >
            <input
              type="radio"
              name={groupName}
              value={option}
              checked={selected}
              onChange={() => onChange(option)}
              className="sr-only"
            />
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                selected ? 'ring-2 ring-primary' : 'border border-surface-dark/20'
              }`}
            >
              {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
            </span>
            <span className="text-sm text-text-base">{ATTENDANCE_STATUS_LABELS[option]}</span>
          </label>
        );
      })}
    </div>
  );
}
