import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AttendanceStatusPicker from '../../components/ui/AttendanceStatusPicker';
import { ROUTES } from '../../constants/routes';
import {
  DEFAULT_GROUP_ID,
  DEFAULT_LESSON_ID,
  createAttendanceRecords,
  getLessonById,
} from '../../data/teacherMock';
import type { AttendanceRecord, AttendanceStatus } from '../../types';

const inputClassName =
  'w-full border border-surface-dark/20 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

const disabledInputClassName =
  'w-full border border-surface-dark/20 rounded-md px-2 py-1 text-sm bg-surface-light text-text-base/30 cursor-not-allowed';

const STATUS_OPTIONS: AttendanceStatus[] = [
  'present',
  'absent_excused',
  'absent_unexcused',
  'late',
];

export default function Attendance() {
  const { id: lessonId = DEFAULT_LESSON_ID } = useParams();
  const lesson = getLessonById(lessonId);

  const [records, setRecords] = useState<AttendanceRecord[]>(() =>
    createAttendanceRecords(lessonId),
  );

  const present = records.filter((record) => record.status === 'present').length;
  const absent = records.filter(
    (record) => record.status !== 'present' && record.status !== 'late',
  ).length;
  const late = records.filter((record) => record.status === 'late').length;

  function updateRecord<K extends keyof AttendanceRecord>(
    studentId: string,
    field: K,
    value: AttendanceRecord[K],
  ) {
    setRecords((prev) =>
      prev.map((record) =>
        record.studentId === studentId ? { ...record, [field]: value } : record,
      ),
    );
  }

  function markAllPresent() {
    setRecords((prev) =>
      prev.map((record) => ({
        ...record,
        status: 'present',
        minutesLate: 0,
      })),
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold text-text-base">Davamiyyət Daxil Et</h1>

      <div className="mb-6 flex items-center justify-between gap-4 rounded-neu bg-surface px-4 py-3 shadow-neu-inset-sm">
        <p className="text-sm text-text-base">
          <span className="font-medium">Dərs Tarixi:</span> {lesson?.lessonDate ?? '—'}
          <span className="mx-3 text-text-base/50">|</span>
          <span className="font-medium">Qrup:</span> {lesson?.groupName ?? '—'}
          <span className="mx-3 text-text-base/50">|</span>
          <span className="font-medium">Mövzu:</span> {lesson?.topic ?? '—'}
        </p>
        <button
          type="button"
          onClick={markAllPresent}
          className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          Hamısını İştirak Etdi kimi işarələ
        </button>
      </div>

      <div className="rounded-neu bg-surface shadow-neu-sm overflow-hidden">
        <table className="w-full min-w-[960px]">
          <thead>
            <tr className="border-b border-surface-dark/20 bg-surface-light">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">
                Ad + Soyad
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">
                Gecikmə dəqiqəsi (varsa)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">
                Səbəb (varsa)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">
                Müəllim Qeydi (optional)
              </th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => {
              const isLate = record.status === 'late';
              const isExcusedAbsent = record.status === 'absent_excused';
              const useDropdown = record.studentId === '5';

              return (
                <tr
                  key={record.id}
                  className="border-b border-surface-dark/20 last:border-0"
                >
                  <td className="px-4 py-3 text-sm text-text-base">{index + 1}</td>
                  <td className="px-4 py-3 text-sm text-text-base">
                    {record.studentName} {record.studentSurname}
                  </td>
                  <td className="px-4 py-3">
                    {useDropdown ? (
                      <select
                        value={record.status}
                        onChange={(event) =>
                          updateRecord(
                            record.studentId,
                            'status',
                            event.target.value as AttendanceStatus,
                          )
                        }
                        className={inputClassName}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <AttendanceStatusPicker
                        value={record.status}
                        onChange={(status) =>
                          updateRecord(record.studentId, 'status', status)
                        }
                      />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      value={record.minutesLate ?? 0}
                      disabled={!isLate}
                      onChange={(event) =>
                        updateRecord(
                          record.studentId,
                          'minutesLate',
                          Number(event.target.value),
                        )
                      }
                      className={isLate ? inputClassName : disabledInputClassName}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={record.reason ?? ''}
                      placeholder={isExcusedAbsent ? 'Səbəb *' : 'Səbəb'}
                      required={isExcusedAbsent}
                      aria-required={isExcusedAbsent}
                      onChange={(event) =>
                        updateRecord(record.studentId, 'reason', event.target.value)
                      }
                      className={inputClassName}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <textarea
                      rows={1}
                      value={record.teacherNote ?? ''}
                      placeholder="optional"
                      onChange={(event) =>
                        updateRecord(record.studentId, 'teacherNote', event.target.value)
                      }
                      className={`${inputClassName} resize-none`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm font-medium text-text-base/50">
        İştirak edən: {present} | Qayıb: {absent} | Gecikən: {late}
      </p>

      <div className="mt-6 flex items-center justify-between">
        <Link
          to={ROUTES.TEACHER_GROUP(lesson?.groupId ?? DEFAULT_GROUP_ID)}
          className="text-sm text-text-base/50 hover:text-text-base"
        >
          ← Dərslərə Qayıt
        </Link>
        <div className="flex gap-3">
          <button
            type="button"
            className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10"
          >
            Saxla
          </button>
          <Link
            to={ROUTES.TEACHER_GRADES(lessonId)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Növbəti: Qiymətləri Daxil Et →
          </Link>
        </div>
      </div>
    </div>
  );
}
