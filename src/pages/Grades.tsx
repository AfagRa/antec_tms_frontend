import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import {
  DEFAULT_LESSON_ID,
  createAttendanceRecords,
  getLessonById,
} from '../data/teacherMock';
import type { GradeRecord } from '../types';

const inputClassName =
  'w-full rounded-md border border-lms-border px-2 py-1 text-sm text-lms-heading focus:outline-none focus:ring-2 focus:ring-lms-navy/30';

function attendanceLabel(status: GradeRecord['attendanceStatus']) {
  switch (status) {
    case 'present':
      return 'İştirak etdi';
    case 'absent_excused':
      return 'Üzrlü qayıb';
    case 'absent_unexcused':
      return 'Üzrsüz qayıb';
    case 'late':
      return 'Gecikdi';
    default:
      return '—';
  }
}

function createGradeRecords(lessonId: string): GradeRecord[] {
  const attendance = createAttendanceRecords(lessonId);

  return attendance.map((record, index) => ({
    id: `grade-${record.studentId}`,
    lessonId,
    studentId: record.studentId,
    studentName: record.studentName,
    studentSurname: record.studentSurname,
    attendanceStatus: record.status,
    score: index === 0 ? 85 : index === 1 ? 72 : undefined,
    maxScore: 100,
    teacherNote: '',
  }));
}

function calcPercent(score: number | undefined, maxScore: number) {
  if (score === undefined || maxScore === 0) {
    return 'N%';
  }
  return `${Math.round((score / maxScore) * 100)}%`;
}

export default function Grades() {
  const { id: lessonId = DEFAULT_LESSON_ID } = useParams();
  const lesson = getLessonById(lessonId);

  const [records, setRecords] = useState<GradeRecord[]>(() => createGradeRecords(lessonId));

  const scored = records.filter((record) => record.score !== undefined);
  const average =
    scored.length > 0
      ? (
          scored.reduce((sum, record) => sum + (record.score! / record.maxScore) * 100, 0) /
          scored.length
        ).toFixed(1)
      : '0';
  const highest = scored.length > 0 ? Math.max(...scored.map((r) => r.score!)) : 0;
  const lowest =
    scored.length > 0 ? Math.min(...scored.map((r) => r.score!)) : 0;

  function updateRecord<K extends keyof GradeRecord>(
    studentId: string,
    field: K,
    value: GradeRecord[K],
  ) {
    setRecords((prev) =>
      prev.map((record) =>
        record.studentId === studentId ? { ...record, [field]: value } : record,
      ),
    );
  }

  function applyMaxToAll() {
    setRecords((prev) => prev.map((record) => ({ ...record, maxScore: 100 })));
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold text-lms-heading">Qiymət Daxil Et</h1>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-slate-100 px-4 py-3">
        <p className="text-sm text-lms-heading">
          <span className="font-medium">Dərs Tarixi:</span> {lesson?.lessonDate ?? '—'}
          <span className="mx-3 text-lms-muted">|</span>
          <span className="font-medium">Qrup:</span> {lesson?.groupName ?? '—'}
          <span className="mx-3 text-lms-muted">|</span>
          <span className="font-medium">Mövzu:</span> {lesson?.topic ?? '—'}
        </p>
        <button
          type="button"
          onClick={applyMaxToAll}
          className="shrink-0 rounded-lg bg-lms-navy px-4 py-2 text-sm font-medium text-white hover:bg-lms-navy-dark"
        >
          Bütün Max Bal
        </button>
      </div>

      <div className="lms-card overflow-x-auto p-0">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-lms-border bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-lms-muted">
                Ad + Soyad
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-lms-muted">
                Davamiyyət statusu
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-lms-muted">
                Bal (score)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-lms-muted">
                Maksimum bal
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-lms-muted">
                Faiz (%)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-lms-muted">
                Müəllim qeydi (optional)
              </th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-b border-lms-border last:border-0">
                <td className="px-4 py-3 text-sm text-lms-heading">
                  {record.studentName} {record.studentSurname}
                </td>
                <td className="px-4 py-3 text-sm text-lms-muted">
                  {attendanceLabel(record.attendanceStatus)}
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={0}
                    max={record.maxScore}
                    value={record.score ?? ''}
                    onChange={(event) =>
                      updateRecord(
                        record.studentId,
                        'score',
                        event.target.value === '' ? undefined : Number(event.target.value),
                      )
                    }
                    className={inputClassName}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={1}
                    value={record.maxScore}
                    onChange={(event) =>
                      updateRecord(record.studentId, 'maxScore', Number(event.target.value))
                    }
                    className={inputClassName}
                  />
                </td>
                <td className="px-4 py-3 text-sm font-medium text-lms-navy">
                  {calcPercent(record.score, record.maxScore)}
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
            ))}
          </tbody>
        </table>

        <div className="border-t border-lms-border bg-gray-50 px-4 py-3 text-sm font-medium text-lms-muted">
          Qrup ortalama balı (%): {average} | ən yüksək bal: {highest} | ən aşağı bal: {lowest}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Link
          to={ROUTES.TEACHER_ATTENDANCE(lessonId)}
          className="text-sm text-lms-muted hover:text-lms-heading"
        >
          ← Davamiyyətə Qayıt
        </Link>
        <div className="flex gap-3">
          <button
            type="button"
            className="rounded-lg border border-lms-navy px-4 py-2 text-sm font-medium text-lms-navy hover:bg-lms-navy-light"
          >
            Saxla
          </button>
          <button
            type="button"
            className="rounded-lg bg-lms-navy px-4 py-2 text-sm font-medium text-white hover:bg-lms-navy-dark"
          >
            Dərsi Tamamla ✓
          </button>
        </div>
      </div>
    </div>
  );
}
