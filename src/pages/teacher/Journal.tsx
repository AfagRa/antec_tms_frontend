import React, { useState, useEffect, useCallback } from 'react';
import { Save } from 'lucide-react';
import type { JournalLesson, JournalCell, GradeCategory } from '../../types';

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

const STATUSES: Array<{ value: JournalCell['attendance']; label: string; color: string }> = [
  { value: null,  label: '·',  color: 'text-gray-300' },
  { value: 'D',   label: 'D',  color: 'text-green-600 font-bold' },
  { value: 'Q',   label: 'Q',  color: 'text-red-500 font-bold' },
  { value: 'QÜ',  label: 'QÜ', color: 'text-blue-500 font-bold' },
  { value: 'G',   label: 'G',  color: 'text-amber-500 font-bold' },
];

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
      journalData[studentId]?.[lessonId] ?? { attendance: null, grade: null },
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

  const handleAttendanceCycle = (studentId: string, lessonId: string) => {
    const cell = getCell(studentId, lessonId);
    const currentIdx = STATUSES.findIndex((s) => s.value === cell.attendance);
    const nextIdx = (currentIdx + 1) % STATUSES.length;
    setCell(studentId, lessonId, { attendance: STATUSES[nextIdx].value });
  };

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
      <div className="overflow-x-auto lms-card p-0 overflow-hidden">
        <table className="w-full border-collapse text-sm">
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
                  className="border-b border-r border-lms-border px-2 py-2 text-center font-medium text-lms-heading text-xs min-w-[100px]"
                  title={lesson.topic}
                >
                  <div className="font-semibold">{lesson.date}</div>
                  <div className="text-lms-muted font-normal truncate max-w-[96px] mx-auto" title={lesson.topic}>
                    {lesson.topic.length > 12 ? `${lesson.topic.slice(0, 12)}…` : lesson.topic}
                  </div>
                </th>
              ))}
              <th className="sticky right-0 z-20 bg-white border-b border-l border-lms-border px-3 py-3 text-center font-medium text-lms-muted text-xs uppercase tracking-wide min-w-[80px]">
                Ümumi %
              </th>
            </tr>

            {/* Row 2 — sub-headers */}
            <tr>
              <th className="sticky left-0 z-20 bg-white border-b border-r border-lms-border px-4 py-1" />
              {lessons.map((lesson) => (
                <React.Fragment key={lesson.id}>
                  <th className="border-b border-r border-lms-border px-1 py-1 text-center text-xs text-lms-muted bg-gray-50 w-[48px]">
                    D/Q
                  </th>
                  <th className="border-b border-r border-lms-border px-1 py-1 text-center text-xs text-lms-muted bg-gray-50 w-[52px]">
                    Bal
                  </th>
                </React.Fragment>
              ))}
              <th className="sticky right-0 z-20 bg-white border-b border-l border-lms-border px-3 py-1" />
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
                    const attIdx = STATUSES.findIndex((s) => s.value === cell.attendance);

                    return (
                      <React.Fragment key={lesson.id}>
                        {/* Attendance cell */}
                        <td className="border-b border-r border-lms-border px-1 py-2 text-center w-[48px]">
                          <button
                            onClick={() => handleAttendanceCycle(student.id, lesson.id)}
                            className={`w-8 h-8 rounded-md text-xs transition-all hover:bg-gray-100 ${STATUSES[attIdx].color}`}
                            title={`Növbəti: ${STATUSES[(attIdx + 1) % STATUSES.length].label}`}
                          >
                            {cell.attendance ?? '·'}
                          </button>
                        </td>
                        {/* Grade cell */}
                        <td className="border-b border-r border-lms-border px-1 py-2 w-[52px]">
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
                            placeholder="—"
                            className="w-full text-center text-xs border border-transparent rounded hover:border-lms-border focus:border-lms-green focus:ring-1 focus:ring-lms-green/30 outline-none py-1 bg-transparent focus:bg-white transition-all"
                          />
                        </td>
                      </React.Fragment>
                    );
                  })}
                  {/* Average cell */}
                  <td className={`sticky right-0 z-10 bg-white border-b border-l border-lms-border px-3 py-2 text-center font-medium text-sm ${avgColor}`}>
                    {avg !== null ? `${avg}%` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-lms-muted px-4 pb-4 flex-wrap mt-3">
        <span>Əfsanə:</span>
        <span className="text-green-600 font-bold">D</span><span>= Dərsdə</span>
        <span className="text-red-500 font-bold">Q</span><span>= Qayıb</span>
        <span className="text-blue-500 font-bold">QÜ</span><span>= Qayıb (üzrlü)</span>
        <span className="text-amber-500 font-bold">G</span><span>= Gecikdi</span>
        <span className="ml-2 italic">Hücrəyə klikləyin → statusu dəyişdirin. Bal sahəsinə rəqəm daxil edin.</span>
      </div>
    </div>
  );
}
