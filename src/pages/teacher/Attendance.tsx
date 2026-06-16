import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ATTENDANCE_STATUS_LABELS } from '../../types';
import { ROUTES } from '../../constants/routes';
import type { AttendanceRecord } from '../../types';
import {
  useAcademic, SHARED_GROUPS, SHARED_LESSONS, SHARED_STUDENTS,
  getAttendanceForLesson,
  type AttendanceEntry,
} from '../../store/academicStore.tsx';

type SaveState = 'idle' | 'saving' | 'done';

export default function Attendance() {
  const { state, dispatch } = useAcademic();
  const [selectedGroupId, setSelectedGroupId] = useState(SHARED_GROUPS[0].id);
  const lessons = useMemo(
    () => SHARED_LESSONS.filter((l) => l.groupId === selectedGroupId),
    [selectedGroupId],
  );
  const [selectedLessonId, setSelectedLessonId] = useState(lessons[0]?.id ?? '');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [formRecords, setFormRecords] = useState<AttendanceRecord[]>([]);

  const selectedLesson = useMemo(
    () => lessons.find((l) => l.id === selectedLessonId),
    [lessons, selectedLessonId],
  );

  const selectedGroup = useMemo(
    () => SHARED_GROUPS.find((g) => g.id === selectedGroupId),
    [selectedGroupId],
  );

  const storedEntries = getAttendanceForLesson(state, selectedLessonId);

  useEffect(() => {
    const students = SHARED_STUDENTS.filter((s) => s.groupIds.includes(selectedGroupId));
    const initialized: AttendanceRecord[] = students.map((s) => {
      const existing = storedEntries.find((e) => e.studentId === s.studentId);
      return {
        id: `${selectedLessonId}-${s.studentId}`,
        lessonId: selectedLessonId,
        studentId: s.studentId,
        studentName: s.studentName,
        studentSurname: s.studentSurname,
        status: existing?.status ?? 'present',
        minutesLate: existing?.minutesLate ?? 0,
        reason: existing?.reason ?? '',
        teacherNote: existing?.teacherNote ?? '',
      };
    });
    setFormRecords(initialized);
    setSaveState('idle');
  }, [selectedGroupId, selectedLessonId, state.attendance]);

  const visibleRecords = formRecords

  const present = visibleRecords.filter((r) => r.status === 'present').length;
  const absent = formRecords.filter(
    (r) => r.status !== 'present' && r.status !== 'late',
  ).length;
  const late = formRecords.filter((r) => r.status === 'late').length;

  function handleGroupChange(groupId: string) {
    const firstLesson = SHARED_LESSONS.filter((l) => l.groupId === groupId)[0];
    setSelectedGroupId(groupId);
    setSelectedLessonId(firstLesson?.id ?? '');
  }

  function handleLessonChange(lessonId: string) {
    setSelectedLessonId(lessonId);
  }

  function updateRecord<K extends keyof AttendanceRecord>(
    studentId: string,
    field: K,
    value: AttendanceRecord[K],
  ) {
    setFormRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, [field]: value } : r)),
    );
  }

  function markAllPresent() {
    setFormRecords((prev) =>
      prev.map((r) => ({ ...r, status: 'present', minutesLate: 0 })),
    );
  }

  function handleSave() {
    setSaveState('saving');
    const entries: AttendanceEntry[] = formRecords.map((r) => ({
      lessonId: selectedLessonId,
      studentId: r.studentId,
      status: r.status,
      minutesLate: r.minutesLate,
      reason: r.reason,
      teacherNote: r.teacherNote,
    }));
    dispatch({ type: 'BULK_ATTENDANCE', lessonId: selectedLessonId, entries });
    setTimeout(() => setSaveState('done'), 400);
  }

  useEffect(() => {
    if (saveState === 'done') {
      const t = setTimeout(() => setSaveState('idle'), 3000);
      return () => clearTimeout(t);
    }
  }, [saveState]);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold text-text-base">Davamiyyət Daxil Et</h1>

      <div className="rounded-neu bg-surface shadow-neu-sm mb-4 p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-text-base/50 mb-1 block">Qrup seçin</label>
            <select
              value={selectedGroupId}
              onChange={(e) => handleGroupChange(e.target.value)}
              className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-2 text-sm text-text-base w-full focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            >
              {SHARED_GROUPS.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-text-base/50 mb-1 block">Dərs seçin</label>
            <select
              value={selectedLessonId}
              onChange={(e) => handleLessonChange(e.target.value)}
              className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-2 text-sm text-text-base w-full focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            >
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>{l.date} — {l.topic}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

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

      {saveState === 'done' && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium">
          Davamiyyət uğurla yadda saxlanıldı!
        </div>
      )}

      <div className="rounded-neu bg-surface shadow-neu-sm overflow-hidden">
        <table className="w-full min-w-[960px]">
          <thead>
            <tr className="border-b border-surface-dark/20 bg-surface-light">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">Ad + Soyad</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">Səbəb (varsa)</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">Müəllim Qeydi (optional)</th>
            </tr>
          </thead>
          <tbody>
            {visibleRecords.map((record, index) => (
                <tr key={record.id} className="border-b border-surface-dark/20 last:border-0">
                  <td className="px-4 py-3 text-sm text-text-base">{index + 1}</td>
                  <td className="px-4 py-3 text-sm text-text-base">
                    {record.studentName} {record.studentSurname}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {([
                        { value: 'present',          abbr: 'İ/E', activeColor: 'bg-green-100 border-green-400 text-green-700' },
                        { value: 'late',             abbr: 'G',   activeColor: 'bg-amber-100 border-amber-400 text-amber-700' },
                        { value: 'absent_excused',   abbr: 'Q/Ü', activeColor: 'bg-blue-100  border-blue-400  text-blue-700'  },
                        { value: 'absent_unexcused', abbr: 'Q',   activeColor: 'bg-red-100   border-red-400   text-red-700'   },
                      ] as const).map((opt) => (
                        <label
                          key={opt.value}
                          className={`w-9 h-8 rounded-md text-xs font-bold border-2 flex items-center justify-center cursor-pointer transition-all ${
                            record.status === opt.value
                              ? opt.activeColor
                              : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={record.status === opt.value}
                            onChange={() => updateRecord(record.studentId, 'status', opt.value)}
                            className="sr-only"
                          />
                          {opt.abbr}
                        </label>
                      ))}
                      {record.status === 'late' && (
                        <input
                          type="number"
                          min={1}
                          max={90}
                          value={record.minutesLate || ''}
                          onChange={(e) => updateRecord(record.studentId, 'minutesLate', Number(e.target.value))}
                          className="w-14 text-xs border border-amber-300 rounded px-1.5 py-0.5 text-center focus:ring-1 focus:ring-amber-400 outline-none bg-amber-50"
                          placeholder="dəq"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={record.reason ?? ''}
                      placeholder="Səbəb"
                      onChange={(event) => updateRecord(record.studentId, 'reason', event.target.value)}
                      className="w-full border border-surface-dark/20 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <textarea
                      rows={1}
                      value={record.teacherNote ?? ''}
                      placeholder="optional"
                      onChange={(event) => updateRecord(record.studentId, 'teacherNote', event.target.value)}
                      className="w-full border border-surface-dark/20 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 mb-2 px-1">
        <p className="text-xs font-medium text-text-base/50 mb-1.5 uppercase tracking-wide">
          Status izahı:
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-1">
          {[
            { abbr: 'İ/E', label: 'İştirak edib',  color: 'text-primary'  },
            { abbr: 'G',   label: 'Gecikdi',        color: 'text-amber-600' },
            { abbr: 'Q/Ü', label: 'Qaib (üzrlü)',   color: 'text-blue-600'  },
            { abbr: 'Q',   label: 'Qaib (üzrsüz)',  color: 'text-red-600'   },
          ].map((item) => (
            <span key={item.abbr} className="flex items-center gap-1.5 text-xs text-text-base/50">
              <span className={`font-bold text-xs ${item.color}`}>{item.abbr}</span>
              <span>=</span>
              <span>{item.label}</span>
            </span>
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm font-medium text-text-base/50">
        {ATTENDANCE_STATUS_LABELS.present}: {present} | Qaib: {absent} | {ATTENDANCE_STATUS_LABELS.late}: {late}
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
            onClick={handleSave}
            disabled={saveState === 'saving'}
            className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-medium transition-all disabled:opacity-60"
          >
            {saveState === 'saving' ? 'Saxlanılır...' : 'Yadda saxla'}
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
