import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays, Save, CheckCircle, Loader2, ArrowLeft,
} from 'lucide-react';
import { ROUTES } from '../constants/routes';
import type { GradeCategory, AttendanceStatus, GradeRecord } from '../types';
import {
  useAcademic, SHARED_GROUPS, SHARED_LESSONS, SHARED_STUDENTS,
  getAttendanceForLesson, getGradesForLesson,
  type GradeEntry,
} from '../store/academicStore.tsx';

export default function Grades() {
  const { state, dispatch } = useAcademic();
  const navigate = useNavigate();
  const [selectedGroupId, setSelectedGroupId] = useState(SHARED_GROUPS[0].id);
  const lessons = useMemo(
    () => SHARED_LESSONS.filter((l) => l.groupId === selectedGroupId),
    [selectedGroupId],
  );
  const [selectedLessonId, setSelectedLessonId] = useState(lessons[0]?.id ?? '');
  const [lessonCategory, setLessonCategory] = useState<GradeCategory>('daily');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [hasSaved, setHasSaved] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);

  const currentLesson = lessons.find((l) => l.id === selectedLessonId);

  const [records, setRecords] = useState<GradeRecord[]>([]);

  const storedAttendance = getAttendanceForLesson(state, selectedLessonId);
  const storedGrades = getGradesForLesson(state, selectedLessonId);

  useEffect(() => {
    const students = SHARED_STUDENTS.filter((s) => s.groupId === selectedGroupId);
    const attMap = new Map(storedAttendance.map((e) => [e.studentId, e.status]));
    const gradeMap = new Map(storedGrades.map((e) => [e.studentId, e]));
    setRecords(students.map((s) => ({
      id: `${selectedLessonId}-${s.studentId}`,
      lessonId: selectedLessonId,
      studentId: s.studentId,
      studentName: s.studentName,
      studentSurname: s.studentSurname,
      attendanceStatus: attMap.get(s.studentId) ?? 'present',
      score: gradeMap.get(s.studentId)?.score ?? undefined,
      maxScore: gradeMap.get(s.studentId)?.maxScore ?? 100,
      teacherNote: gradeMap.get(s.studentId)?.teacherNote ?? '',
      category: lessonCategory,
    })));
    setSaveStatus('idle');
  }, [selectedGroupId, selectedLessonId, state.attendance, state.grades]);

  const updateRecord = (studentId: string, field: keyof GradeRecord, value: unknown) => {
    setRecords((prev) => prev.map((r) =>
      r.studentId === studentId ? { ...r, [field]: value } : r,
    ));
    if (saveStatus === 'saved') setSaveStatus('idle');
  };

  const handleSave = () => {
    const errors = records.filter((r) => {
      return r.score === undefined || r.score === null;
    });
    if (errors.length > 0) {
      alert(`${errors.length} tələbənin balı boşdur. Zəhmət olmasa doldurun.`);
      return;
    }
    setSaveStatus('saving');
    const entries: GradeEntry[] = records.map((r) => ({
      lessonId: selectedLessonId,
      studentId: r.studentId,
      score: r.score ?? 0,
      maxScore: r.maxScore,
      teacherNote: r.teacherNote ?? '',
      category: lessonCategory,
    }));
    dispatch({ type: 'BULK_GRADES', lessonId: selectedLessonId, entries });
    setTimeout(() => {
      setSaveStatus('saved');
      setHasSaved(true);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 400);
  };

  const allScores = records
    .filter((r) => r.score !== undefined && r.score !== null)
    .map((r) => r.score as number);

  const avg = allScores.length
    ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
    : null;
  const highest = allScores.length ? Math.max(...allScores) : null;
  const lowest = allScores.length ? Math.min(...allScores) : null;

  function attendanceLabel(status: AttendanceStatus) {
    switch (status) {
      case 'present':          return 'İştirak edib';
      case 'absent_excused':   return 'Üzrlü qayıb';
      case 'absent_unexcused': return 'Üzrsüz qayıb';
      case 'late':             return 'Gecikdi';
      default:                 return '—';
    }
  }

  function calcPercent(score: number | undefined, maxScore: number) {
    if (score === undefined || maxScore === 0) return 'N%';
    return `${Math.round((score / maxScore) * 100)}%`;
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold text-text-base">Qiymət Daxil Et</h1>

      <div className="rounded-neu bg-surface shadow-neu-sm p-4 mb-4">
        <div className="grid grid-cols-3 gap-4 items-end">
          <div>
            <label className="text-xs text-text-base/50 mb-1 block">Qrup</label>
            <select
              value={selectedGroupId}
              onChange={(e) => {
                setSelectedGroupId(e.target.value);
                const firstLesson = SHARED_LESSONS.filter((l) => l.groupId === e.target.value)[0];
                if (firstLesson) setSelectedLessonId(firstLesson.id);
              }}
              className="border border-surface-dark/20 rounded-lg px-3 py-2 text-sm w-full
                         focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
            >
              {SHARED_GROUPS.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-text-base/50 mb-1 block">Dərs</label>
            <select
              value={selectedLessonId}
              onChange={(e) => setSelectedLessonId(e.target.value)}
              className="border border-surface-dark/20 rounded-lg px-3 py-2 text-sm w-full
                         focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
            >
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>{l.date} — {l.topic}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-text-base/50 mb-1 block">Tarix</label>
            <div className="border border-surface-dark/20 rounded-lg px-3 py-2 text-sm
                            bg-gray-50 text-text-base/50 flex items-center gap-2">
              <CalendarDays size={15} className="text-text-base/50" />
              {currentLesson?.date ?? '—'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4 px-1">
        <span className="text-sm font-medium text-text-base">
          {SHARED_GROUPS.find((g) => g.id === selectedGroupId)?.name}
        </span>
        <span className="text-text-base/50">·</span>
        <span className="text-sm text-text-base/50">{currentLesson?.topic}</span>
        <span className="text-text-base/50">·</span>
        <span className="text-sm text-text-base/50">{currentLesson?.date}</span>
      </div>

      <div className="rounded-neu bg-surface shadow-neu-sm overflow-hidden">
        <table className="w-full min-w-[900px]">
          <colgroup>
            <col style={{ width: '48px'  }} />
            <col style={{ width: '140px' }} />
            <col style={{ width: '120px' }} />
            <col style={{ width: '90px'  }} />
            <col style={{ width: '100px' }} />
            <col style={{ width: '70px'  }} />
            <col style={{ width: '180px' }} />
          </colgroup>
          <thead>
            <tr className="border-b border-surface-dark/20 bg-surface-light">
              <th className="border-b border-surface-dark/20 px-3 py-3 text-center text-xs
                             font-medium text-text-base/50 uppercase tracking-wide">
                №
              </th>
              <th className="border-b border-surface-dark/20 px-3 py-3 text-left text-xs
                             font-medium text-text-base/50 uppercase tracking-wide">
                Ad + Soyad
              </th>
              <th className="border-b border-surface-dark/20 px-3 py-3 text-left text-xs
                             font-medium text-text-base/50 uppercase tracking-wide">
                Davamiyyət statusu
              </th>
              <th className="border-b border-surface-dark/20 px-3 py-2 text-left text-xs
                             font-medium text-text-base/50 uppercase tracking-wide">
                <div className="mb-1">Bal</div>
                <select
                  value={lessonCategory}
                  onChange={(e) => {
                    const cat = e.target.value as GradeCategory;
                    setLessonCategory(cat);
                    setRecords((prev) => prev.map((r) => ({ ...r, category: cat })));
                  }}
                  className="border border-surface-dark/20 rounded px-1.5 py-0.5 text-[11px]
                             font-normal normal-case tracking-normal text-text-base
                             focus:ring-1 focus:ring-primary/30 focus:border-primary
                             bg-white w-[110px]"
                >
                  <option value="daily">Dərs qiyməti</option>
                  <option value="homework">Ev tapşırığı</option>
                  <option value="module">Modul imtahanı</option>
                  <option value="project">Layihə</option>
                  <option value="final">Final imtahanı</option>
                </select>
              </th>
              <th className="border-b border-surface-dark/20 px-3 py-3 text-center text-xs
                             font-medium text-text-base/50 uppercase tracking-wide">
                Maks. bal
              </th>
              <th className="border-b border-surface-dark/20 px-3 py-3 text-left text-xs
                             font-medium text-text-base/50 uppercase tracking-wide">
                Faiz (%)
              </th>
              <th className="border-b border-surface-dark/20 px-3 py-3 text-left text-xs
                             font-medium text-text-base/50 uppercase tracking-wide">
                Müəllim qeydi (optional)
              </th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={record.id} className="border-b border-surface-dark/20 last:border-0">
                <td className="border-b border-surface-dark/20 px-3 py-1.5 text-center text-xs
                               text-text-base/50 font-medium select-none">
                  {index + 1}
                </td>
                <td className="px-4 py-1.5 text-sm text-text-base">
                  {record.studentName} {record.studentSurname}
                </td>
                <td className="px-4 py-1.5 text-sm text-text-base/50">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    record.attendanceStatus === 'present' ? 'bg-green-100 text-green-700' :
                    record.attendanceStatus === 'late' ? 'bg-amber-100 text-amber-700' :
                    record.attendanceStatus === 'absent_excused' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {attendanceLabel(record.attendanceStatus)}
                  </span>
                </td>
                <td className="px-4 py-1.5">
                  <input
                    type="number"
                    min={0}
                    max={record.maxScore}
                    value={record.score ?? ''}
                    onChange={(e) => {
                      const raw = e.target.value === '' ? undefined : Number(e.target.value);
                      if (raw !== undefined && raw > record.maxScore) {
                        updateRecord(record.studentId, 'score', record.maxScore);
                      } else {
                        updateRecord(record.studentId, 'score', raw ?? undefined);
                      }
                    }}
                    onBlur={(e) => {
                      const val = Number(e.target.value);
                      if (!isNaN(val) && val > record.maxScore) {
                        updateRecord(record.studentId, 'score', record.maxScore);
                      }
                    }}
                    className="w-full text-center text-sm border border-surface-dark/20 rounded px-1.5 py-0.5
                               bg-white focus:ring-1 focus:ring-primary/30 focus:border-primary outline-none"
                    placeholder="0"
                  />
                </td>
                <td className="px-4 py-1.5 text-center">
                  <input
                    type="number"
                    min={1}
                    value={record.maxScore}
                    onChange={(e) =>
                      updateRecord(record.studentId, 'maxScore', Number(e.target.value))
                    }
                    className="w-full text-center text-sm border border-surface-dark/20 rounded px-1.5 py-0.5
                               focus:ring-1 focus:ring-primary/30 focus:border-primary outline-none"
                  />
                </td>
                <td className="px-4 py-1.5 text-sm font-medium text-primary text-center">
                  {calcPercent(record.score, record.maxScore)}
                </td>
                <td className="px-4 py-1.5">
                  <textarea
                    rows={1}
                    value={record.teacherNote ?? ''}
                    placeholder="optional"
                    onChange={(e) =>
                      updateRecord(record.studentId, 'teacherNote', e.target.value)
                    }
                    className="w-full border border-surface-dark/20 rounded px-1.5 py-0.5 text-sm
                               focus:ring-1 focus:ring-primary/30 focus:border-primary resize-none outline-none"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-surface-dark/20 bg-surface-light px-4 py-3 text-sm text-text-base/50">
          <div className="flex items-center gap-4">
            <span>Ortalama: <strong className="text-text-base">{avg ?? '—'}%</strong></span>
            <span>Ən yüksək: <strong className="text-green-600">{highest ?? '—'}</strong></span>
            <span>Ən aşağı: <strong className="text-red-500">{lowest ?? '—'}</strong></span>
            <span className="text-xs">
              ({allScores.length} / {records.length} tələbə qiymətləndirildi)
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end">
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                       transition-all
                       ${saveStatus === 'saved'
                         ? 'bg-emerald-600 text-white'
                         : 'bg-emerald-600 hover:bg-emerald-700 text-white'}
                       ${saveStatus === 'saving' ? 'opacity-70 cursor-wait' : ''}`}
          >
            {saveStatus === 'saving' ? (
              <><Loader2 size={15} className="animate-spin" /> Saxlanılır...</>
            ) : saveStatus === 'saved' ? (
              <><CheckCircle size={15} /> Saxlanıldı</>
            ) : (
              <><Save size={15} /> Saxla</>
            )}
          </button>
          <button
            onClick={() => {
              if (!hasSaved) {
                alert('Əvvəlcə qiymətləri saxlayın.');
                return;
              }
              setLessonCompleted(true);
            }}
            disabled={!hasSaved}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                       transition-all cursor-pointer
                       ${lessonCompleted
                         ? 'bg-primary text-white'
                         : hasSaved
                           ? 'bg-primary hover:bg-primary-dark text-white'
                           : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
          >
            <CheckCircle size={15} />
            {lessonCompleted ? 'Tamamlandı' : 'Dərsi Tamamla'}
          </button>
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={() => navigate(ROUTES.TEACHER_ATTENDANCE_HOME)}
          className="text-sm text-text-base/50 hover:text-text-base flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft size={15} /> Davamiyyətə Qayıt
        </button>
      </div>
    </div>
  );
}
