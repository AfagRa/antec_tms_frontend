import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Save, Check, Pencil } from 'lucide-react';
import type { JournalLesson, JournalCell, GradeCategory, AttendanceStatus } from '../../types';
import {
  useAcademic, SHARED_GROUPS, SHARED_LESSONS, SHARED_STUDENTS,
  getAttendanceForLesson, getGradesForLesson,
} from '../../store/academicStore.tsx';
import { AttendanceSegment } from '../../components/ui/AttendanceSegment';

const CATEGORY_OPTIONS: { value: GradeCategory; label: string }[] = [
  { value: 'daily',    label: 'Dərs' },
  { value: 'homework', label: 'Ev tapşırığı' },
  { value: 'module',   label: 'Modul' },
  { value: 'project',  label: 'Layihə' },
  { value: 'final',    label: 'Final' },
];

type JournalData = Record<string, Record<string, JournalCell>>;

export default function TeacherJournal() {
  const { state, dispatch } = useAcademic();
  const [selectedGroupId, setSelectedGroupId] = useState(SHARED_GROUPS[0].id);
  const [journalData, setJournalData] = useState<JournalData>({});
  const [toast, setToast] = useState<'idle' | 'saving' | 'done'>('idle');
  const [columnCategories, setColumnCategories] = useState<Record<string, GradeCategory>>({});
  const [extraLessons, setExtraLessons] = useState<JournalLesson[]>([]);
  const [lessonTopics, setLessonTopics] = useState<Record<string, string>>({});
  const [editingTopics, setEditingTopics] = useState<Record<string, boolean>>({});
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
    setEditingTopics({});
  }, [selectedGroupId]);

  // Auto-mark all students as present when group loads
  useEffect(() => {
    lessons.forEach(lesson => {
      const existing = getAttendanceForLesson(state, lesson.id)
      const lessonStudents = SHARED_STUDENTS.filter(s =>
        s.groupIds.includes(selectedGroupId)
      )
      if (existing.length === 0 && lessonStudents.length > 0) {
        dispatch({
          type: 'BULK_ATTENDANCE',
          lessonId: lesson.id,
          entries: lessonStudents.map(s => ({
            lessonId: lesson.id,
            studentId: s.studentId,
            status: 'present' as AttendanceStatus,
            minutesLate: 0,
            reason: '',
            teacherNote: '',
          }))
        })
      }
    })
  }, [selectedGroupId])

  const lessons = SHARED_LESSONS.filter((l) => l.groupId === selectedGroupId);
  const allLessons = [...lessons, ...extraLessons];
  const students = SHARED_STUDENTS.filter((s) => s.groupIds.includes(selectedGroupId));

  // Initialize journal data from store
  useEffect(() => {
    setJournalData((prev) => {
      const next = { ...prev };
      allLessons.forEach((lesson) => {
        const storedAtt = getAttendanceForLesson(state, lesson.id);
        const storedGrades = getGradesForLesson(state, lesson.id);
        students.forEach((student) => {
          if (!next[student.studentId]) next[student.studentId] = {};
          const existing = next[student.studentId][lesson.id];
          const attEntry = storedAtt.find((e) => e.studentId === student.studentId);
          const gradeEntry = storedGrades.find((e) => e.studentId === student.studentId);
          if (!existing || attEntry || gradeEntry) {
            next[student.studentId][lesson.id] = {
              attendance: attEntry ? attStatusToJournalCode(attEntry.status) : (existing?.attendance ?? null),
              grade: gradeEntry?.score ?? (existing?.grade ?? null),
              minutesLate: attEntry?.minutesLate ?? (existing?.minutesLate ?? 0),
            };
          }
        });
      });
      return next;
    });
  }, [selectedGroupId, state.attendance, state.grades, students.length]);

  function attStatusToJournalCode(status: string): JournalCell['attendance'] {
    switch (status) {
      case 'present':          return 'I/E';
      case 'late':             return 'G';
      case 'absent_excused':   return 'QÜ';
      case 'absent_unexcused': return 'Q';
      default:                 return null;
    }
  }

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

  const dispatchCell = useCallback(
    (studentId: string, lessonId: string, patch: Partial<JournalCell>) => {
      if ('attendance' in patch || 'minutesLate' in patch) {
        const status = patch.attendance !== undefined
          ? journalCodeToAttStatus(patch.attendance)
          : journalCodeToAttStatus(journalData[studentId]?.[lessonId]?.attendance ?? null);
        dispatch({
          type: 'UPSERT_ATTENDANCE',
          payload: {
            studentId,
            lessonId,
            status,
            minutesLate: patch.minutesLate ?? (journalData[studentId]?.[lessonId]?.minutesLate ?? 0),
            reason: '',
            teacherNote: '',
          },
        });
      }
      if ('grade' in patch) {
        dispatch({
          type: 'UPSERT_GRADE',
          payload: {
            studentId,
            lessonId,
            score: patch.grade ?? 0,
            maxScore: 100,
            teacherNote: '',
            category: columnCategories[lessonId] ?? 'daily',
          },
        });
      }
    },
    [dispatch, journalData, columnCategories],
  );

  function journalCodeToAttStatus(code: JournalCell['attendance']): string {
    switch (code) {
      case 'I/E': return 'present';
      case 'G':   return 'late';
      case 'QÜ':  return 'absent_excused';
      case 'Q':   return 'absent_unexcused';
      default:    return 'present';
    }
  }

  const getLessonTopic = useCallback((lesson: JournalLesson): string =>
    lesson.id in lessonTopics ? lessonTopics[lesson.id] : (lesson.topic ?? ''),
  [lessonTopics]);

  const setLessonTopic = useCallback((lessonId: string, topic: string) => {
    setLessonTopics((prev) => ({ ...prev, [lessonId]: topic }));
  }, []);

  const handleNewDateClick = () => {
    const input = dateInputRef.current;
    if (!input) return;
    try { input.showPicker(); } catch { /* fallback */ }
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
    setEditingTopics((prev) => ({ ...prev, [newLesson.id]: true }));
    if (dateInputRef.current) dateInputRef.current.value = '';
  };

  const handleSaveJournal = () => {
    setToast('saving');
    setTimeout(() => setToast('done'), 400);
  };

  const handleBulkPresent = useCallback((lessonId: string) => {
    setJournalData((prev) => {
      const updated = { ...prev };
      students.forEach((student) => {
        const existing = updated[student.studentId]?.[lessonId];
        updated[student.studentId] = {
          ...updated[student.studentId],
          [lessonId]: {
            attendance: 'I/E',
            grade: existing?.grade ?? null,
            minutesLate: 0,
          },
        };
      });
      return updated;
    });
    // Dispatch bulk update
    dispatch({
      type: 'BULK_ATTENDANCE',
      lessonId,
      entries: students.map((s) => ({
        studentId: s.studentId,
        lessonId,
        status: 'present',
        minutesLate: 0,
        reason: '',
        teacherNote: '',
      })),
    });
  }, [students, dispatch]);

  return (
    <div className="flex flex-col h-full overflow-hidden">

      <div className="shrink-0">
        <h1 className="text-2xl font-semibold text-text-base mb-4">Jurnal</h1>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <label className="text-sm text-text-base/50 mr-2">Qrup seçin:</label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-2 text-sm text-text-base focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            >
              {SHARED_GROUPS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-neu-sm bg-surface shadow-neu-sm px-3 py-1.5 text-sm text-text-base">👥 {students.length} tələbə</span>
            <span className="rounded-neu-sm bg-surface shadow-neu-sm px-3 py-1.5 text-sm text-text-base">📅 {allLessons.length} dərs</span>
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

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="rounded-neu bg-surface shadow-neu-sm p-0 h-full overflow-hidden">
          <div className="overflow-auto h-full w-full">
            <table
              className="border-collapse text-sm"
              style={{ minWidth: `${48 + 180 + allLessons.length * 250 + 80}px` }}
            >
              <thead>
                <tr>
                  <th
                    className="sticky left-0 z-20 bg-white border-b border-r border-surface-dark/20
                               px-2 py-3 text-center text-xs font-medium text-text-base/50
                               uppercase tracking-wide w-[48px] min-w-[48px]"
                  >
                    №
                  </th>

                  <th
                    className="sticky left-[48px] z-30 bg-white border-b border-r-2 border-surface-dark/20 px-4 py-3 text-left font-medium text-text-base/50 text-xs uppercase tracking-wide min-w-[180px]"
                  >
                    Tələbənin adı
                  </th>

                  {allLessons.map((lesson) => {
                    const isEditing = editingTopics[lesson.id] ?? false;
                    const isExtra = extraLessons.some((el) => el.id === lesson.id);
                    const topic = lessonTopics[lesson.id] ?? lesson.topic;
                    return (
                    <th
                      key={lesson.id}
                      colSpan={2}
                      className="border-b border-r border-surface-dark/20 px-2 py-2 text-center font-medium text-text-base text-xs min-w-[140px]"
                    >
                      <div className="font-semibold text-text-base">{lesson.date}</div>
                      {isEditing ? (
                        <div className="flex items-center gap-1 mt-1">
                          <input
                            type="text"
                            value={topic}
                            onChange={(e) => setLessonTopic(lesson.id, e.target.value)}
                            placeholder="Mövzu..."
                            className="w-full text-[10px] px-1 py-0.5 border border-surface-dark/20 rounded bg-white text-text-base focus:border-primary outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => setEditingTopics((prev) => ({ ...prev, [lesson.id]: false }))}
                            title="Tamamla"
                            className="shrink-0 p-1 rounded bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center justify-center"
                          >
                            <Check size={11} strokeWidth={2.5} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="inline-flex items-center gap-1 justify-center mt-0.5">
                            <span
                              className="text-text-base/50 font-normal text-[11px] truncate max-w-[110px] leading-tight"
                              title={topic}
                            >
                              {topic.length > 16 ? topic.slice(0, 16) + '…' : topic}
                            </span>
                            {isExtra && (
                              <button
                                onClick={() => setEditingTopics((prev) => ({ ...prev, [lesson.id]: true }))}
                                title="Redaktə et"
                                className="p-1 rounded text-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center shrink-0"
                              >
                                <Pencil size={11} strokeWidth={2.5} />
                              </button>
                            )}
                          </span>
                        </>
                      )}
                    </th>
                    );
                  })}

                  <th
                    colSpan={2}
                    className="relative border-b border-l border-surface-dark/20 px-2 py-2 text-center min-w-[130px] bg-slate-50/60"
                  >
                    <button
                      type="button"
                      onClick={handleNewDateClick}
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark transition-colors cursor-pointer"
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

                  <th
                    className="sticky right-0 z-20 bg-slate-100 border-b border-l border-surface-dark/20 px-3 py-3 text-center font-semibold text-slate-700 text-xs uppercase tracking-wide min-w-[80px]"
                  >
                    Ümumi %
                  </th>
                </tr>

                <tr>
                  <th className="sticky left-0 z-20 bg-white border-b border-r border-surface-dark/20
                                 w-[48px] min-w-[48px]" />
                  <th className="sticky left-[48px] z-30 bg-white border-b border-r-2 border-surface-dark/20 px-4 py-1" />
                  {allLessons.map((lesson) => (
                    <React.Fragment key={lesson.id}>
                      <th className="border-b border-r border-surface-dark/20 px-1 py-1 text-center text-xs text-text-base/50 bg-gray-50 w-[130px]">
                        Davamiyyət
                      </th>
                      <th className="border-b border-r border-surface-dark/20 px-1 py-1 text-center text-xs text-text-base/50 bg-gray-50 w-[120px]">
                        Qiymət
                      </th>
                    </React.Fragment>
                  ))}
                  <th className="border-b border-l border-surface-dark/20 px-1 py-1 text-center text-xs text-text-base/50 bg-slate-50/60 w-[130px]">
                    <div>Davamiyyət</div>
                  </th>
                  <th className="border-b border-surface-dark/20 px-1 py-1 text-center text-xs text-text-base/50 bg-slate-50/60 w-[120px]">
                    Qiymət
                  </th>
                  <th className="sticky right-0 z-20 bg-slate-100 border-b border-l border-surface-dark/20 px-3 py-1" />
                </tr>

                <tr>
                  <th className="sticky left-0 z-20 bg-white border-b border-r border-surface-dark/20
                                 w-[48px] min-w-[48px]" />
                  <th className="sticky left-[48px] z-30 bg-white border-b border-r-2 border-surface-dark/20 px-4 py-1" />
                  {allLessons.map((lesson) => (
                    <React.Fragment key={lesson.id}>
                      <th className="border-b border-r border-surface-dark/20 px-1 py-1 text-center">
                        <button
                          onClick={() => handleBulkPresent(lesson.id)}
                          className="w-full text-[9px] font-medium px-0.5 py-0.5 rounded
                                     bg-green-50 text-green-700 border border-green-200
                                     hover:bg-green-100 hover:border-green-400 transition-all
                                     flex items-center justify-center gap-0.5 whitespace-nowrap"
                          title="Bütün tələbələri 'İştirak edib' kimi işarələ"
                        >
                          <span className="text-[8px]">✔</span>
                          Hamısı dərsdə
                        </button>
                      </th>
                      <th className="border-b border-r border-surface-dark/20 px-1 py-1 text-center">
                        <select
                          value={columnCategories[lesson.id] ?? 'daily'}
                          onChange={(e) =>
                            setColumnCategories((prev) => ({
                              ...prev,
                              [lesson.id]: e.target.value as GradeCategory,
                            }))
                          }
                          className="w-[90px] text-center text-xs border border-surface-dark/20 rounded px-1 py-0.5 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none bg-white text-text-base/50"
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
                  <th className="border-b border-l border-surface-dark/20 px-1 py-1 bg-slate-50/60" />
                  <th className="border-b border-surface-dark/20 px-1 py-1 text-center bg-slate-50/60">
                    <select
                      className="w-[90px] text-center text-xs border border-surface-dark/20 rounded px-1 py-0.5 outline-none bg-gray-100 text-text-base/50 cursor-not-allowed"
                      disabled
                      title="Yeni tarix seçdikdən sonra kateqoriya seçilə bilər"
                    >
                      <option>—</option>
                    </select>
                  </th>
                  <th className="sticky right-0 z-20 bg-slate-100 border-b border-l border-surface-dark/20 px-3 py-1" />
                </tr>
              </thead>

              <tbody>
                {students.map((student, index) => {
                  const studentGrades = allLessons
                    .map((l) => getCell(student.studentId, l.id).grade)
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
                        ? 'text-primary font-semibold'
                        : avg >= 60
                          ? 'text-amber-600 font-semibold'
                          : 'text-red-500 font-semibold';

                  return (
                    <tr key={student.studentId} className="hover:bg-slate-50 transition-colors">
                      <td className="sticky left-0 z-10 bg-white border-b border-r border-surface-dark/20
                                     px-2 py-2 text-center text-xs font-medium text-text-base/50
                                     w-[48px] min-w-[48px] select-none">
                        {index + 1}
                      </td>

                      <td className="sticky left-[48px] z-30 bg-white border-b border-r-2 border-surface-dark/20 px-4 py-2 font-medium text-text-base whitespace-nowrap">
                        {student.studentName} {student.studentSurname}
                      </td>

                      {allLessons.map((lesson) => {
                        const cell = getCell(student.studentId, lesson.id);
                        return (
                          <React.Fragment key={lesson.id}>
                            <td
                              className="border-b border-r border-surface-dark/20 px-2 py-1.5"
                              style={{ minWidth: '150px' }}
                            >
                              <AttendanceSegment
                                value={cell.attendance}
                                onChange={val => {
                                  setCell(student.studentId, lesson.id, {
                                    attendance: val,
                                    minutesLate: val !== 'G' ? 0 : (cell.minutesLate ?? 0),
                                  })
                                  dispatchCell(student.studentId, lesson.id, {
                                    attendance: val,
                                    minutesLate: val !== 'G' ? 0 : (cell.minutesLate ?? 0),
                                  })
                                }}
                                minutesLate={cell.minutesLate ?? 0}
                                onMinutesChange={mins => {
                                  setCell(student.studentId, lesson.id, { minutesLate: mins })
                                  dispatchCell(student.studentId, lesson.id, { minutesLate: mins })
                                }}
                              />
                            </td>

                            <td className="border-b border-r border-surface-dark/20 px-1 py-1.5" style={{ minWidth: '90px' }}>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={cell.grade ?? ''}
                                onChange={(e) => {
                                  const grade = e.target.value === '' ? null : Number(e.target.value);
                                  setCell(student.studentId, lesson.id, { grade });
                                  dispatchCell(student.studentId, lesson.id, { grade });
                                }}
                                placeholder="Bal"
                                className="w-[60px] mx-auto block text-center text-xs border border-surface-dark/20 rounded px-1 py-1 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none bg-white text-text-base"
                              />
                            </td>
                          </React.Fragment>
                        );
                      })}

                      <td className="border-b border-l border-surface-dark/20 px-1 py-1.5 w-[130px] bg-slate-50/60">
                        <span className="text-gray-300 text-xs block text-center">—</span>
                      </td>
                      <td className="border-b border-surface-dark/20 px-1 py-1.5 w-[80px] bg-slate-50/60">
                        <span className="text-gray-300 text-xs block text-center">—</span>
                      </td>

                      <td
                        className={`sticky right-0 z-10 bg-slate-100 border-b border-l border-surface-dark/20 px-3 py-2 text-center font-semibold text-sm ${avgColor}`}
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

      <div className="flex items-center gap-5 text-xs text-text-base/50 px-4 pb-4 flex-wrap">
        <span className="font-medium">Status rəngləri:</span>
        <span className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-sm text-[10px] font-bold text-white bg-green-600">İE</span>
          <span>İştirak Edir</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-sm text-[10px] font-bold text-white bg-amber-500">G</span>
          <span>Gecikib</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-sm text-[10px] font-bold text-white bg-blue-500">QÜ</span>
          <span>Qaib (üzrlü)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-sm text-[10px] font-bold text-white bg-red-500">Q</span>
          <span>Qaib (üzrsüz)</span>
        </span>
        <span className="ml-2 italic text-text-base/70">
          Hamı "İE" olaraq işarələnib. Yalnız fərqli statusları dəyişin.
        </span>
      </div>
    </div>
  );
}
