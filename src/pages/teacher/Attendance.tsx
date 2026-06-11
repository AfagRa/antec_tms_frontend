import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AttendanceStatusPicker from '../../components/ui/AttendanceStatusPicker';
import { ATTENDANCE_STATUS_LABELS } from '../../types';
import { ROUTES } from '../../constants/routes';
import { createAttendanceRecords } from '../../data/teacherMock';
import type { AttendanceRecord, AttendanceStatus } from '../../types';

const MOCK_GROUPS = [
  { id: '1', name: 'Python-A1' },
  { id: '2', name: 'Code-A2' },
  { id: '3', name: 'JS-B1' },
];

const MOCK_LESSONS_BY_GROUP: Record<string, { id: string; date: string; topic: string }[]> = {
  '1': [
    { id: 'l1', date: '04.06.2026', topic: 'Döngələr ve Massivlər' },
    { id: 'l2', date: '06.06.2026', topic: 'Funksiyalar' },
  ],
  '2': [
    { id: 'l3', date: '05.06.2026', topic: 'HTML Əsasları' },
  ],
  '3': [
    { id: 'l4', date: '07.06.2026', topic: 'Dəyişənlər' },
  ],
};

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
  const [selectedGroupId, setSelectedGroupId] = useState(MOCK_GROUPS[0].id);
  const lessons = MOCK_LESSONS_BY_GROUP[selectedGroupId] ?? [];
  const [selectedLessonId, setSelectedLessonId] = useState(lessons[0]?.id ?? '');

  const selectedLesson = useMemo(
    () => lessons.find((l) => l.id === selectedLessonId),
    [lessons, selectedLessonId],
  );

  const selectedGroup = useMemo(
    () => MOCK_GROUPS.find((g) => g.id === selectedGroupId),
    [selectedGroupId],
  );

  const [records, setRecords] = useState<AttendanceRecord[]>(() =>
    createAttendanceRecords(selectedLessonId || 'l1'),
  );

  const present = records.filter((record) => record.status === 'present').length;
  const absent = records.filter(
    (record) => record.status !== 'present' && record.status !== 'late',
  ).length;
  const late = records.filter((record) => record.status === 'late').length;

  function handleGroupChange(groupId: string) {
    setSelectedGroupId(groupId);
    const firstLesson = (MOCK_LESSONS_BY_GROUP[groupId] ?? [])[0];
    const lessonId = firstLesson?.id ?? '';
    setSelectedLessonId(lessonId);
    setRecords(createAttendanceRecords(lessonId || 'l1'));
  }

  function handleLessonChange(lessonId: string) {
    setSelectedLessonId(lessonId);
    setRecords(createAttendanceRecords(lessonId || 'l1'));
  }

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

      {/* Group + Lesson selection */}
      <div className="lms-card mb-4 p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-lms-muted mb-1 block">Qrup seçin</label>
            <select
              value={selectedGroupId}
              onChange={(e) => handleGroupChange(e.target.value)}
              className="border border-lms-border rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-lms-green/30 focus:border-lms-green"
            >
              {MOCK_GROUPS.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-lms-muted mb-1 block">Dərs seçin</label>
            <select
              value={selectedLessonId}
              onChange={(e) => handleLessonChange(e.target.value)}
              className="border border-lms-border rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-lms-green/30 focus:border-lms-green"
            >
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>{l.date} — {l.topic}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div className="mb-6 flex items-center justify-between gap-4 rounded-neu bg-surface px-4 py-3 shadow-neu-inset-sm">
        <p className="text-sm text-text-base">
          <span className="font-medium">Dərs Tarixi:</span> {selectedLesson?.date ?? '—'}
          <span className="mx-3 text-text-base/50">|</span>
          <span className="font-medium">Qrup:</span> {selectedGroup?.name ?? '—'}
          <span className="mx-3 text-text-base/50">|</span>
          <span className="font-medium">Mövzu:</span> {selectedLesson?.topic ?? '—'}
        </p>
        <button
          type="button"
          onClick={markAllPresent}
          className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          Hamısını İştirak Etdi kimi işarələ
        </button>
      </div>

      {/* Table */}
      <div className="rounded-neu bg-surface shadow-neu-sm overflow-hidden">
        <table className="w-full min-w-[960px]">
          <thead>
            <tr className="border-b border-surface-dark/20 bg-surface-light">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">Ad + Soyad</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">Gecikmə dəqiqəsi (varsa)</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">Səbəb (varsa)</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">Müəllim Qeydi (optional)</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => {
              const isLate = record.status === 'late';
              const isExcusedAbsent = record.status === 'absent_excused';
              const useDropdown = record.studentId === '5';

              return (
                <tr key={record.id} className="border-b border-surface-dark/20 last:border-0">
                  <td className="px-4 py-3 text-sm text-text-base">{index + 1}</td>
                  <td className="px-4 py-3 text-sm text-text-base">
                    {record.studentName} {record.studentSurname}
                  </td>
                  <td className="px-4 py-3">
                    {useDropdown ? (
                      <select
                        value={record.status}
                        onChange={(event) =>
                          updateRecord(record.studentId, 'status', event.target.value as AttendanceStatus)
                        }
                        className={inputClassName}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {ATTENDANCE_STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <AttendanceStatusPicker
                        value={record.status}
                        onChange={(status) => updateRecord(record.studentId, 'status', status)}
                      />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      value={record.minutesLate ?? 0}
                      disabled={!isLate}
                      onChange={(event) => updateRecord(record.studentId, 'minutesLate', Number(event.target.value))}
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
                      onChange={(event) => updateRecord(record.studentId, 'reason', event.target.value)}
                      className={inputClassName}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <textarea
                      rows={1}
                      value={record.teacherNote ?? ''}
                      placeholder="optional"
                      onChange={(event) => updateRecord(record.studentId, 'teacherNote', event.target.value)}
                      className={`${inputClassName} resize-none`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <p className="mt-4 text-sm font-medium text-text-base/50">
        {ATTENDANCE_STATUS_LABELS.present}: {present} | Qayıb: {absent} | {ATTENDANCE_STATUS_LABELS.late}: {late}
      </p>

      <div className="mt-6 flex items-center justify-between">
        <Link
          to={ROUTES.TEACHER_GROUP(selectedGroupId)}
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
            to={ROUTES.TEACHER_GRADES(selectedLessonId)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Növbəti: Qiymətləri Daxil Et →
          </Link>
        </div>
      </div>
    </div>
  );
}
