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
  'w-full border border-lms-border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-lms-navy/30';

const disabledInputClassName =
  'w-full border border-lms-border rounded-md px-2 py-1 text-sm bg-gray-50 text-gray-300 cursor-not-allowed';

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
      <h1 className="mb-4 text-2xl font-semibold text-lms-heading">Davamiyyət Daxil Et</h1>

      <div className="mb-6 flex items-center justify-between gap-4 rounded-lg bg-slate-100 px-4 py-3">
        <p className="text-sm text-lms-heading">
          <span className="font-medium">Dərs Tarixi:</span> {lesson?.lessonDate ?? '—'}
          <span className="mx-3 text-lms-muted">|</span>
          <span className="font-medium">Qrup:</span> {lesson?.groupName ?? '—'}
          <span className="mx-3 text-lms-muted">|</span>
          <span className="font-medium">Mövzu:</span> {lesson?.topic ?? '—'}
        </p>
        <button
          type="button"
          onClick={markAllPresent}
          className="shrink-0 rounded-lg bg-lms-navy px-4 py-2 text-sm font-medium text-white hover:bg-lms-navy-dark"
        >
          Hamısını İştirak Etdi kimi işarələ
        </button>
      </div>

      <div className="lms-card overflow-x-auto p-0">
        <table className="w-full min-w-[960px]">
          <thead>
            <tr className="border-b border-lms-border bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-lms-muted">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-lms-muted">
                Ad + Soyad
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-lms-muted">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-lms-muted">
                Gecikmə dəqiqəsi (varsa)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-lms-muted">
                Səbəb (varsa)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-lms-muted">
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
                  className="border-b border-lms-border last:border-0"
                >
                  <td className="px-4 py-3 text-sm text-lms-heading">{index + 1}</td>
                  <td className="px-4 py-3 text-sm text-lms-heading">
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

      <p className="mt-4 text-sm font-medium text-lms-muted">
        İştirak edən: {present} | Qayıb: {absent} | Gecikən: {late}
      </p>

      <div className="mt-6 flex items-center justify-between">
        <Link
          to={ROUTES.TEACHER_GROUP(lesson?.groupId ?? DEFAULT_GROUP_ID)}
          className="text-sm text-lms-muted hover:text-lms-heading"
        >
          ← Dərslərə Qayıt
        </Link>
        <div className="flex gap-3">
          <button
            type="button"
            className="rounded-lg border border-lms-navy px-4 py-2 text-sm font-medium text-lms-navy hover:bg-lms-navy-light"
          >
            Saxla
          </button>
          <Link
            to={ROUTES.TEACHER_GRADES(lessonId)}
            className="rounded-lg bg-lms-navy px-4 py-2 text-sm font-medium text-white hover:bg-lms-navy-dark"
          >
            Növbəti: Qiymətləri Daxil Et →
          </Link>
        </div>
      </div>
    </div>
  );
}
