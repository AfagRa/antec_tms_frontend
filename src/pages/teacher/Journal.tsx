import React, { useState, useEffect, useCallback } from 'react';
import { Save } from 'lucide-react';
import type { JournalLesson, JournalCell, GradeCategory } from '../../types';

const ATTENDANCE_OPTIONS: Array<{ value: JournalCell['attendance']; label: string }> = [
  { value: null,  label: '—' },
  { value: 'D',   label: 'Dərsdə' },
  { value: 'Q',   label: 'Qayıb' },
  { value: 'QÜ',  label: 'Q/Üzrlü' },
  { value: 'G',   label: 'Gecikdi' },
];

const ATTENDANCE_COLOR: Record<string, string> = {
  D:  '#16a34a',
  Q:  '#ef4444',
  QÜ: '#3b82f6',
  G:  '#d97706',
};

const CATEGORY_OPTIONS: { value: GradeCategory; label: string }[] = [
  { value: 'daily',    label: 'Dərs' },
  { value: 'homework', label: 'Ev tapşırığı' },
  { value: 'module',   label: 'Modul' },
  { value: 'project',  label: 'Layihə' },
  { value: 'final',    label: 'Final' },
];

const GROUPS = [
  { id: '1', name: 'Python-A1' },
  { id: '2', name: 'Code-A2' },
  { id: '3', name: 'JS-B1' },
];

const LESSONS_BY_GROUP: Record<string, JournalLesson[]> = {
  '1': [
    { id: 'l1', date: '01.06.2026', topic: 'Giriş' },
    { id: 'l2', date: '03.06.2026', topic: 'Dəyişənlər' },
    { id: 'l3', date: '06.06.2026', topic: 'Massivlər' },
    { id: 'l4', date: '08.06.2026', topic: 'Funksiyalar' },
    { id: 'l5', date: '10.06.2026', topic: 'Döngülər' },
  ],
  '2': [
    { id: 'l6', date: '02.06.2026', topic: 'HTML Əsasları' },
    { id: 'l7', date: '05.06.2026', topic: 'CSS Flex' },
    { id: 'l8', date: '09.06.2026', topic: 'JS Giriş' },
  ],
  '3': [
    { id: 'l9',  date: '04.06.2026', topic: 'Dəyişənlər' },
    { id: 'l10', date: '07.06.2026', topic: 'Funksiyalar' },
  ],
};

const STUDENTS_BY_GROUP: Record<string, { id: string; fullName: string }[]> = {
  '1': [
    { id: 's1', fullName: 'Əli Məmmədov' },
    { id: 's2', fullName: 'Sona Quliyeva' },
    { id: 's3', fullName: 'Orxan Rəsulov' },
    { id: 's4', fullName: 'Leyla Əliyeva' },
    { id: 's5', fullName: 'Murad Həsənov' },
  ],
  '2': [
    { id: 's6', fullName: 'Nigar Babayeva' },
    { id: 's7', fullName: 'Rauf İsmayılov' },
  ],
  '3': [
    { id: 's8', fullName: 'Könül Nəsirov' },
    { id: 's9', fullName: 'Tural Qədirov' },
  ],
};

type JournalData = Record<string, Record<string, JournalCell>>;

export default function TeacherJournal() {
  const [selectedGroupId, setSelectedGroupId] = useState('1');
  const [journalData, setJournalData] = useState<JournalData>({});
  const [toast, setToast] = useState<'idle' | 'saving' | 'done'>('idle');

  useEffect(() => {
    if (toast === 'done') {
      const t = setTimeout(() => setToast('idle'), 2000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  useEffect(() => {
    /* re-render on group change — data persists per group in journalData */
  }, [selectedGroupId]);

  const lessons = LESSONS_BY_GROUP[selectedGroupId] ?? [];
  const students = STUDENTS_BY_GROUP[selectedGroupId] ?? [];

  const getCell = useCallback(
    (studentId: string, lessonId: string): JournalCell =>
      journalData[studentId]?.[lessonId] ?? { attendance: null, grade: null, minutesLate: 0 },
    [journalData],
  );

  const setCell = useCallback(
    (studentId: string, lessonId: string, patch: Partial<JournalCell>) => {
      setJournalData((prev) => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [lessonId]: { ...getCell(studentId, lessonId), ...patch },
        },
      }));
    },
    [getCell],
  );

  const handleSaveJournal = () => {
    setToast('saving');
    console.log('Saving journal:', journalData);
    setTimeout(() => setToast('done'), 400);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-lms-heading mb-5">Jurnal</h1>

      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <label className="text-sm text-lms-muted mr-2">Qrup seçin:</label>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="border border-lms-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lms-green/30 focus:border-lms-green bg-white"
          >
            {GROUPS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="lms-card px-3 py-1.5 text-sm">👥 {students.length} tələbə</span>
          <span className="lms-card px-3 py-1.5 text-sm">📅 {lessons.length} dərs</span>
          <button
            onClick={handleSaveJournal}
            disabled={toast === 'saving'}
            className="bg-lms-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-lms-green-dark flex items-center gap-2 disabled:opacity-60 transition-all cursor-pointer"
          >
            <Save size={15} />
            {toast === 'saving' ? 'Saxlanılır...' : 'Yadda Saxla'}
          </button>
          {toast === 'done' && (
            <span className="text-sm text-green-600 font-medium">Jurnal yadda saxlanıldı ✓</span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="lms-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table
            className="border-collapse text-sm"
            style={{ minWidth: `${180 + lessons.length * 240 + 80}px` }}
          >
            <thead>
              {/* Row 1 — lesson dates */}
              <tr>
                <th className="sticky left-0 z-20 bg-white border-b border-r border-lms-border px-4 py-3 text-left font-medium text-lms-muted text-xs uppercase tracking-wide min-w-[180px]">
                  Tələbənin adı
                </th>
                {lessons.map((lesson) => (
                  <th
                    key={lesson.id}
                    colSpan={2}
                    className="border-b border-r border-lms-border px-2 py-2 text-center font-medium text-lms-heading text-xs min-w-[120px]"
                    title={lesson.topic}
                  >
                    <div className="font-semibold">{lesson.date}</div>
                    <div className="text-lms-muted font-normal truncate max-w-[96px] mx-auto" title={lesson.topic}>
                      {lesson.topic.length > 12 ? `${lesson.topic.slice(0, 12)}…` : lesson.topic}
                    </div>
                  </th>
                ))}
                <th className="sticky right-0 z-20 bg-gray-50 border-b border-l border-lms-border px-3 py-3 text-center font-medium text-lms-muted text-xs uppercase tracking-wide min-w-[80px]">
                  Ümumi %
                </th>
              </tr>

              {/* Row 2 — sub-headers */}
              <tr>
                <th className="sticky left-0 z-20 bg-white border-b border-r border-lms-border px-4 py-1" />
                {lessons.map((lesson) => (
                  <React.Fragment key={lesson.id}>
                    <th className="border-b border-r border-lms-border px-1 py-1 text-center text-xs text-lms-muted bg-gray-50 w-[140px]">
                      Davamiyyət
                    </th>
                    <th className="border-b border-r border-lms-border px-1 py-1 text-center text-xs text-lms-muted bg-gray-50 w-[100px]">
                      Qiymət
                    </th>
                  </React.Fragment>
                ))}
                <th className="sticky right-0 z-20 bg-gray-50 border-b border-l border-lms-border px-3 py-1" />
              </tr>
            </thead>

            <tbody>
              {students.map((student) => {
                const studentGrades = lessons
                  .map((l) => getCell(student.id, l.id).grade)
                  .filter((g): g is number => g !== null && g !== undefined);
                const avg =
                  studentGrades.length > 0
                    ? Math.round(studentGrades.reduce((a, b) => a + b, 0) / studentGrades.length)
                    : null;
                const avgColor =
                  avg === null ? 'text-gray-300' : avg >= 80 ? 'text-green-600 font-semibold' : avg >= 60 ? 'text-amber-600 font-semibold' : 'text-red-500 font-semibold';

                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="sticky left-0 z-10 bg-white border-b border-r border-lms-border px-4 py-2 font-medium text-lms-heading whitespace-nowrap">
                      {student.fullName}
                    </td>
                    {lessons.map((lesson) => {
                      const cell = getCell(student.id, lesson.id);
                      const isWriteable = cell.attendance === 'D' || cell.attendance === 'G';

                      return (
                        <React.Fragment key={lesson.id}>
                          {/* Attendance cell */}
                          <td className="border-b border-r border-lms-border px-1 py-1.5 w-[140px]">
                            <div className="flex items-center gap-1">
                              <select
                                value={cell.attendance ?? ''}
                                onChange={(e) => {
                                  const val = (e.target.value || null) as JournalCell['attendance'];
                                  setCell(student.id, lesson.id, {
                                    attendance: val,
                                    minutesLate: val !== 'G' ? 0 : (cell.minutesLate ?? 0),
                                  });
                                }}
                                className="text-xs border border-lms-border rounded px-1 py-1 focus:ring-1 focus:ring-lms-green/40 focus:border-lms-green bg-white outline-none w-[80px]"
                                style={{ color: cell.attendance ? (ATTENDANCE_COLOR[cell.attendance] ?? '#94a3b8') : '#94a3b8' }}
                              >
                                {ATTENDANCE_OPTIONS.map((opt) => (
                                  <option key={opt.value ?? ''} value={opt.value ?? ''} style={{ color: opt.value ? ATTENDANCE_COLOR[opt.value] : '#94a3b8' }}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>

                              {cell.attendance === 'G' && (
                                <div className="flex items-center gap-0.5">
                                  <span className="text-xs text-lms-muted">(</span>
                                  <input
                                    type="number"
                                    min={1}
                                    max={90}
                                    value={cell.minutesLate ?? ''}
                                    onChange={(e) =>
                                      setCell(student.id, lesson.id, {
                                        minutesLate: e.target.value === '' ? 0 : Number(e.target.value),
                                      })
                                    }
                                    placeholder="dəq"
                                    className="w-[36px] text-xs border border-amber-300 rounded px-1 py-0.5 text-center focus:ring-1 focus:ring-amber-400 outline-none bg-amber-50"
                                    title="Gecikdiyi dəqiqə"
                                  />
                                  <span className="text-xs text-lms-muted">)</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Grade cell */}
                          <td className="border-b border-r border-lms-border px-1 py-1.5 w-[100px]">
                            {isWriteable ? (
                              <div className="flex flex-col gap-1">
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={cell.grade ?? ''}
                                  onChange={(e) =>
                                    setCell(student.id, lesson.id, {
                                      grade: e.target.value === '' ? null : Number(e.target.value),
                                    })
                                  }
                                  placeholder="Bal"
                                  className="w-full text-center text-xs border border-lms-border rounded px-1 py-1 focus:border-lms-green focus:ring-1 focus:ring-lms-green/30 outline-none bg-white"
                                />
                                <select
                                  value={cell.category ?? 'daily'}
                                  onChange={(e) =>
                                    setCell(student.id, lesson.id, {
                                      category: e.target.value as GradeCategory,
                                    })
                                  }
                                  className="w-full text-center text-xs border border-lms-border rounded px-1 py-0.5 focus:border-lms-green outline-none bg-white text-lms-muted"
                                  title="Qiymət kateqoriyası"
                                >
                                  {CATEGORY_OPTIONS.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                      {cat.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ) : (
                              <div className="text-center text-gray-300 text-sm select-none">—</div>
                            )}
                          </td>
                        </React.Fragment>
                      );
                    })}
                    {/* Average cell */}
                    <td className={`sticky right-0 z-10 bg-gray-50 border-b border-l border-lms-border px-3 py-2 text-center font-medium text-sm ${avgColor}`}>
                      {avg !== null ? `${avg}%` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-lms-muted px-4 pb-4 flex-wrap mt-3">
        <span>Əfsanə:</span>
        <span className="text-green-600 font-bold">D</span><span>= Dərsdə</span>
        <span className="text-red-500 font-bold">Q</span><span>= Qayıb</span>
        <span className="text-blue-500 font-bold">QÜ</span><span>= Qayıb (üzrlü)</span>
        <span className="text-amber-500 font-bold">G</span><span>= Gecikdi</span>
        <span className="text-amber-500 font-bold">G(15)</span><span>= 15 dəqiqə gecikdi</span>
        <span className="ml-2 italic">Status və bal sahələrini redaktə edin.</span>
      </div>
    </div>
  );
}
