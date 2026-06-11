import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Save } from 'lucide-react';
import type { JournalLesson, JournalCell, GradeCategory } from '../../types';

const ATTENDANCE_OPTIONS: Array<{ value: JournalCell['attendance']; label: string }> = [
  { value: null,  label: '—' },
  { value: 'I/E', label: 'İştirak edir' },
  { value: 'Q',   label: 'Qayıb' },
  { value: 'QÜ',  label: 'Q/Üzrlü' },
  { value: 'G',   label: 'Gecikdi' },
];

const ATTENDANCE_COLOR: Record<string, string> = {
  'I/E': '#08529C',
  Q:    '#ef4444',
  QÜ:   '#3b82f6',
  G:    '#d97706',
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
  const [columnCategories, setColumnCategories] = useState<Record<string, GradeCategory>>({});
  const [extraLessons, setExtraLessons] = useState<JournalLesson[]>([]);
  const [lessonTopics, setLessonTopics] = useState<Record<string, string>>({});
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (toast === 'done') {
      const t = setTimeout(() => setToast('idle'), 2000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  useEffect(() => {
    setExtraLessons([]);
    setColumnCategories({});
    setLessonTopics({});
  }, [selectedGroupId]);

  const lessons = LESSONS_BY_GROUP[selectedGroupId] ?? [];
  const allLessons = [...lessons, ...extraLessons];
  const students = STUDENTS_BY_GROUP[selectedGroupId] ?? [];

  const getLessonTopic = useCallback((lesson: JournalLesson): string =>
    lesson.id in lessonTopics ? lessonTopics[lesson.id] : (lesson.topic ?? ''),
  [lessonTopics]);

  const setLessonTopic = useCallback((lessonId: string, topic: string) => {
    setLessonTopics((prev) => ({ ...prev, [lessonId]: topic }));
  }, []);

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

  // ── CHANGE 2: open native date picker, on pick → append new lesson column ──
  const handleNewDateClick = () => {
    const input = dateInputRef.current;
    if (!input) return;
    try { input.showPicker(); } catch { /* fallback below */ }
  };

  const handleDatePicked = (dateStr: string) => {
    if (!dateStr) return;
    const [year, month, day] = dateStr.split('-');
    const formatted = `${day}.${month}.${year}`;
    const newLesson: JournalLesson = {
      id: `extra-${Date.now()}`,
      date: formatted,
      topic: '',
    };
    setExtraLessons((prev) => [...prev, newLesson]);
    // reset input so the same date can be picked again if needed
    if (dateInputRef.current) dateInputRef.current.value = '';
  };

  const handleSaveJournal = () => {
    setToast('saving');
    console.log('Saving journal:', journalData);
    setTimeout(() => setToast('done'), 400);
  };

  return (
    /*
     * ── CHANGE 1: Isolated Canvas Layout ──────────────────────────────────────
     * The outermost wrapper (`h-full overflow-hidden flex flex-col`) anchors
     * to the parent layout shell (sidebar + main). Nothing here scrolls.
     * The inner `flex-1 min-h-0` canvas is the ONLY element that scrolls,
     * and only in both axes, so the sidebar and the top bar never move.
     */
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Fixed top bar: title + controls — never scrolls ── */}
      <div className="shrink-0">
        <h1 className="text-2xl font-semibold text-lms-heading mb-4">Jurnal</h1>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <label className="text-sm text-lms-muted mr-2">Qrup seçin:</label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="border border-lms-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lms-navy/30 focus:border-lms-navy bg-white"
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
            <span className="lms-card px-3 py-1.5 text-sm">📅 {allLessons.length} dərs</span>
            <button
              onClick={handleSaveJournal}
              disabled={toast === 'saving'}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-60 transition-all cursor-pointer"
            >
              <Save size={15} />
              {toast === 'saving' ? 'Saxlanılır...' : 'Yadda Saxla'}
            </button>
            {toast === 'done' && (
              <span className="text-sm text-emerald-600 font-medium ml-2">
                Jurnal yadda saxlanıldı ✓
              </span>
            )}
          </div>
        </div>
      </div>

      {/*
       * ── CHANGE 1: Isolated scroll canvas ────────────────────────────────────
       * `flex-1 min-h-0` lets this div fill all remaining vertical space.
       * `overflow-auto` on the inner div is the SOLE scroll surface.
       * The table's `sticky` columns work because the scroll container is
       * this div, not the window.
       */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="lms-card p-0 h-full overflow-hidden">
          <div className="overflow-auto h-full w-full">
            <table
              className="border-collapse text-sm"
              style={{ minWidth: `${180 + allLessons.length * 260 + 80 + 130}px` }}
            >
              <thead>
                {/* ── Row 1: lesson dates + persistent "+ Yeni Tarix" placeholder ── */}
                <tr>
                  {/* Frozen student-name column header */}
                  <th
                    className="sticky left-0 z-30 bg-white border-b border-r-2 border-lms-border px-4 py-3 text-left font-medium text-lms-muted text-xs uppercase tracking-wide min-w-[180px]"
                  >
                    Tələbənin adı
                  </th>

                  {allLessons.map((lesson) => (
                    <th
                      key={lesson.id}
                      colSpan={2}
                      className="border-b border-r border-lms-border px-2 py-2 text-center font-medium text-lms-heading text-xs min-w-[130px]"
                    >
                      <div className="font-semibold mb-0.5">{lesson.date}</div>
                      <input
                        type="text"
                        value={getLessonTopic(lesson)}
                        onChange={(e) => setLessonTopic(lesson.id, e.target.value)}
                        placeholder="Mövzu adı..."
                        className="text-[11px] px-1 py-0.5 border border-lms-border rounded bg-slate-50 focus:bg-white text-lms-heading focus:border-lms-navy outline-none w-full text-center"
                      />
                    </th>
                  ))}

                  {/*
                   * ── CHANGE 2: Persistent "+ Yeni Tarix" placeholder column ──
                   * This header cell is always the rightmost date header.
                   * Clicking it opens the native date picker. Once a date is
                   * selected, a real lesson column is appended and this
                   * placeholder remains—just like inserting columns in Excel.
                   */}
                  <th
                    colSpan={2}
                    className="relative border-b border-l border-lms-border px-2 py-2 text-center min-w-[130px] bg-slate-50/60"
                  >
                    <button
                      type="button"
                      onClick={handleNewDateClick}
                      className="inline-flex items-center gap-1 text-xs font-medium text-lms-navy hover:text-lms-navy-dark transition-colors cursor-pointer"
                    >
                      <Plus size={14} />
                      Yeni Tarix
                    </button>
                    <input
                      ref={dateInputRef}
                      type="date"
                      onChange={(e) => handleDatePicked(e.target.value)}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-px opacity-0"
                      tabIndex={-1}
                    />
                  </th>

                  {/* Sticky average column header */}
                  <th
                    className="sticky right-0 z-20 bg-slate-100 border-b border-l border-lms-border px-3 py-3 text-center font-semibold text-slate-700 text-xs uppercase tracking-wide min-w-[80px]"
                  >
                    Ümumi %
                  </th>
                </tr>

                {/* ── Row 2: sub-headers ── */}
                <tr>
                  <th className="sticky left-0 z-30 bg-white border-b border-r-2 border-lms-border px-4 py-1" />
                  {allLessons.map((lesson) => (
                    <React.Fragment key={lesson.id}>
                      <th className="border-b border-r border-lms-border px-1 py-1 text-center text-xs text-lms-muted bg-gray-50 w-[140px]">
                        Davamiyyət
                      </th>
                      <th className="border-b border-r border-lms-border px-1 py-1 text-center text-xs text-lms-muted bg-gray-50 w-[120px]">
                        Qiymət
                      </th>
                    </React.Fragment>
                  ))}
                  {/* Placeholder sub-headers */}
                  <th className="border-b border-l border-lms-border px-1 py-1 text-center text-xs text-lms-muted bg-slate-50/60 w-[140px]">
                    Davamiyyət
                  </th>
                  <th className="border-b border-lms-border px-1 py-1 text-center text-xs text-lms-muted bg-slate-50/60 w-[120px]">
                    Qiymət
                  </th>
                  <th className="sticky right-0 z-20 bg-slate-100 border-b border-l border-lms-border px-3 py-1" />
                </tr>

                {/* ── Row 3: category selects ── */}
                <tr>
                  <th className="sticky left-0 z-30 bg-white border-b border-r-2 border-lms-border px-4 py-1" />
                  {allLessons.map((lesson) => (
                    <React.Fragment key={lesson.id}>
                      <th className="border-b border-r border-lms-border px-1 py-1" />
                      <th className="border-b border-r border-lms-border px-1 py-1 text-center">
                        <select
                          value={columnCategories[lesson.id] ?? 'daily'}
                          onChange={(e) =>
                            setColumnCategories((prev) => ({
                              ...prev,
                              [lesson.id]: e.target.value as GradeCategory,
                            }))
                          }
                          className="w-[90px] text-center text-xs border border-lms-border rounded px-1 py-0.5 focus:border-lms-navy focus:ring-1 focus:ring-lms-navy/30 outline-none bg-white text-lms-muted"
                          title="Qiymət kateqoriyası"
                        >
                          {CATEGORY_OPTIONS.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </th>
                    </React.Fragment>
                  ))}
                  {/* Placeholder category cells (disabled — no date yet) */}
                  <th className="border-b border-l border-lms-border px-1 py-1 bg-slate-50/60" />
                  <th className="border-b border-lms-border px-1 py-1 text-center bg-slate-50/60">
                    <select
                      className="w-[90px] text-center text-xs border border-lms-border rounded px-1 py-0.5 outline-none bg-gray-100 text-lms-muted cursor-not-allowed"
                      disabled
                      title="Yeni tarix seçdikdən sonra kateqoriya seçilə bilər"
                    >
                      <option>—</option>
                    </select>
                  </th>
                  <th className="sticky right-0 z-20 bg-slate-100 border-b border-l border-lms-border px-3 py-1" />
                </tr>
              </thead>

              <tbody>
                {students.map((student) => {
                  const studentGrades = allLessons
                    .map((l) => getCell(student.id, l.id).grade)
                    .filter((g): g is number => g !== null && g !== undefined);
                  const avg =
                    studentGrades.length > 0
                      ? Math.round(
                          studentGrades.reduce((a, b) => a + b, 0) / studentGrades.length,
                        )
                      : null;
                  const avgColor =
                    avg === null
                      ? 'text-gray-300'
                      : avg >= 80
                        ? 'text-lms-navy font-semibold'
                        : avg >= 60
                          ? 'text-amber-600 font-semibold'
                          : 'text-red-500 font-semibold';

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      {/*
                       * ── CHANGE 1: Frozen left column ────────────────────────
                       * `sticky left-0 z-30 bg-white` keeps the name pinned
                       * while the date columns scroll underneath it.
                       */}
                      <td className="sticky left-0 z-30 bg-white border-b border-r-2 border-lms-border px-4 py-2 font-medium text-lms-heading whitespace-nowrap">
                        {student.fullName}
                      </td>

                      {allLessons.map((lesson) => {
                        const cell = getCell(student.id, lesson.id);
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
                                  className={`text-xs border border-lms-border rounded px-1 py-1 focus:ring-1 focus:ring-lms-navy/40 focus:border-lms-navy bg-white outline-none ${
                                    cell.attendance === 'G' ? 'w-[60px]' : 'w-full'
                                  }`}
                                  style={{
                                    color: cell.attendance
                                      ? (ATTENDANCE_COLOR[cell.attendance] ?? '#94a3b8')
                                      : '#94a3b8',
                                  }}
                                >
                                  {ATTENDANCE_OPTIONS.map((opt) => (
                                    <option
                                      key={opt.value ?? ''}
                                      value={opt.value ?? ''}
                                      style={{
                                        color: opt.value
                                          ? (ATTENDANCE_COLOR[opt.value] ?? '#94a3b8')
                                          : '#94a3b8',
                                      }}
                                    >
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>

                                {cell.attendance === 'G' && (
                                  <div className="flex items-center gap-0.5 shrink-0">
                                    <span className="text-xs text-lms-muted">(</span>
                                    <input
                                      type="number"
                                      min={1}
                                      max={90}
                                      value={cell.minutesLate ?? ''}
                                      onChange={(e) =>
                                        setCell(student.id, lesson.id, {
                                          minutesLate:
                                            e.target.value === '' ? 0 : Number(e.target.value),
                                        })
                                      }
                                      placeholder="dəq"
                                      className="w-[38px] text-xs border border-amber-300 rounded px-1 py-0.5 text-center focus:ring-1 focus:ring-amber-400 outline-none bg-amber-50 text-amber-700"
                                      title="Gecikdiyi dəqiqə"
                                    />
                                    <span className="text-xs text-lms-muted">)</span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Grade cell */}
                            <td className="border-b border-r border-lms-border px-1 py-1.5 w-[80px]">
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
                                className="w-[60px] mx-auto block text-center text-xs border border-lms-border rounded px-1 py-1 focus:border-lms-navy focus:ring-1 focus:ring-lms-navy/30 outline-none bg-white text-lms-heading"
                              />
                            </td>
                          </React.Fragment>
                        );
                      })}

                      {/* ── CHANGE 2: Placeholder body cells (dimmed, non-interactive) ── */}
                      <td className="border-b border-l border-lms-border px-1 py-1.5 w-[140px] bg-slate-50/60">
                        <span className="text-gray-300 text-xs block text-center">—</span>
                      </td>
                      <td className="border-b border-lms-border px-1 py-1.5 w-[80px] bg-slate-50/60">
                        <span className="text-gray-300 text-xs block text-center">—</span>
                      </td>

                      {/* Sticky average column */}
                      <td
                        className={`sticky right-0 z-10 bg-slate-100 border-b border-l border-lms-border px-3 py-2 text-center font-semibold text-sm ${avgColor}`}
                      >
                        {avg !== null ? `${avg}%` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Legend — fixed below table, never scrolls */}
      <div className="flex items-center gap-4 text-xs text-lms-muted flex-wrap mt-3 shrink-0">
        <span>Təlimat:</span>
        <span className="text-lms-navy font-bold">I/E</span><span>= İştirak edir</span>
        <span className="text-red-500 font-bold">Q</span><span>= Qayıb</span>
        <span className="text-blue-500 font-bold">QÜ</span><span>= Qayıb (üzrlü)</span>
        <span className="text-amber-500 font-bold">G</span><span>= Gecikdi</span>
        <span className="text-amber-600 font-bold">G(15)</span><span>= 15 dəqiqə gecikdi</span>
        <span className="ml-2 italic">Bal sahələrini redaktə edin.</span>
      </div>
    </div>
  );
}