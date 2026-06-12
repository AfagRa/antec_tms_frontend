import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays, Save, CheckCircle, Loader2, ArrowLeft,
} from 'lucide-react';
import { ROUTES } from '../constants/routes';
import type { GradeCategory, AttendanceStatus, GradeRecord } from '../types';

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

const MOCK_STUDENTS_BY_GROUP: Record<string, {
  studentId: string; studentName: string; studentSurname: string;
  attendanceStatus: AttendanceStatus
}[]> = {
  '1': [
    { studentId: 's1', studentName: 'Əli',    studentSurname: 'Məmmədov', attendanceStatus: 'present' },
    { studentId: 's2', studentName: 'Sona',   studentSurname: 'Quliyeva', attendanceStatus: 'absent_unexcused' },
    { studentId: 's3', studentName: 'Orxan',  studentSurname: 'Rəsulov',  attendanceStatus: 'absent_unexcused' },
    { studentId: 's4', studentName: 'Vüsal',  studentSurname: 'Qəfarov',  attendanceStatus: 'late' },
    { studentId: 's5', studentName: 'Leyla',  studentSurname: 'Əliyeva',  attendanceStatus: 'present' },
    { studentId: 's6', studentName: 'Murad',  studentSurname: 'Həsənov',  attendanceStatus: 'present' },
  ],
  '2': [
    { studentId: 's7', studentName: 'Nigar',  studentSurname: 'Babayeva', attendanceStatus: 'present' },
    { studentId: 's8', studentName: 'Rauf',   studentSurname: 'İsmayılov',attendanceStatus: 'late' },
  ],
  '3': [
    { studentId: 's9', studentName: 'Könül',  studentSurname: 'Nəsirov',  attendanceStatus: 'present' },
    { studentId: 's10',studentName: 'Tural',  studentSurname: 'Qədirov',  attendanceStatus: 'present' },
  ],
};

export default function Grades() {
  const navigate = useNavigate();
  const [selectedGroupId, setSelectedGroupId] = useState(MOCK_GROUPS[0].id);
  const [selectedLessonId, setSelectedLessonId] = useState(
    MOCK_LESSONS_BY_GROUP[MOCK_GROUPS[0].id][0].id,
  );
  const [lessonCategory, setLessonCategory] = useState<GradeCategory>('daily');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [bulkMax, setBulkMax] = useState(100);

  const currentLesson = (MOCK_LESSONS_BY_GROUP[selectedGroupId] ?? [])
    .find((l) => l.id === selectedLessonId);

  const [records, setRecords] = useState<GradeRecord[]>([]);

  useEffect(() => {
    const students = MOCK_STUDENTS_BY_GROUP[selectedGroupId] ?? [];
    setRecords(students.map((s) => ({
      id: s.studentId,
      lessonId: selectedLessonId,
      studentId: s.studentId,
      studentName: s.studentName,
      studentSurname: s.studentSurname,
      attendanceStatus: s.attendanceStatus,
      score: undefined,
      maxScore: 100,
      teacherNote: '',
      category: lessonCategory,
    })));
    setSaveStatus('idle');
    setLessonCompleted(false);
  }, [selectedGroupId, selectedLessonId]);

  const updateRecord = (studentId: string, field: keyof GradeRecord, value: unknown) => {
    setRecords((prev) => prev.map((r) =>
      r.studentId === studentId ? { ...r, [field]: value } : r,
    ));
    setSaveStatus('idle');
  };

  const handleSave = () => {
    const errors = records.filter((r) => {
      const writeable = r.attendanceStatus === 'present' || r.attendanceStatus === 'late';
      return writeable && (r.score === undefined || r.score === null);
    });
    if (errors.length > 0) {
      alert(`${errors.length} tələbənin balı boşdur. Zəhmət olmasa doldurun.`);
      return;
    }
    setSaveStatus('saving');
    setTimeout(() => {
      console.log('Grades saved:', { lessonId: selectedLessonId, lessonCategory, records });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 800);
  };

  const writeableScores = records
    .filter((r) => (r.attendanceStatus === 'present' || r.attendanceStatus === 'late')
      && r.score !== undefined && r.score !== null)
    .map((r) => r.score as number);

  const avg = writeableScores.length
    ? Math.round(writeableScores.reduce((a, b) => a + b, 0) / writeableScores.length)
    : null;
  const highest = writeableScores.length ? Math.max(...writeableScores) : null;
  const lowest = writeableScores.length ? Math.min(...writeableScores) : null;

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
      <h1 className="mb-4 text-2xl font-semibold text-lms-heading">Qiymət Daxil Et</h1>

      {/* Top selector bar */}
      <div className="lms-card mb-4">
        <div className="grid grid-cols-3 gap-4 items-end">
          <div>
            <label className="text-xs text-lms-muted mb-1 block">Qrup</label>
            <select
              value={selectedGroupId}
              onChange={(e) => {
                setSelectedGroupId(e.target.value);
                const firstLesson = MOCK_LESSONS_BY_GROUP[e.target.value]?.[0];
                if (firstLesson) setSelectedLessonId(firstLesson.id);
              }}
              className="border border-lms-border rounded-lg px-3 py-2 text-sm w-full
                         focus:ring-2 focus:ring-lms-navy/30 focus:border-lms-navy bg-white"
            >
              {MOCK_GROUPS.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-lms-muted mb-1 block">Dərs</label>
            <select
              value={selectedLessonId}
              onChange={(e) => setSelectedLessonId(e.target.value)}
              className="border border-lms-border rounded-lg px-3 py-2 text-sm w-full
                         focus:ring-2 focus:ring-lms-navy/30 focus:border-lms-navy bg-white"
            >
              {(MOCK_LESSONS_BY_GROUP[selectedGroupId] ?? []).map((l) => (
                <option key={l.id} value={l.id}>{l.date} — {l.topic}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-lms-muted mb-1 block">Tarix</label>
            <div className="border border-lms-border rounded-lg px-3 py-2 text-sm
                            bg-gray-50 text-lms-muted flex items-center gap-2">
              <CalendarDays size={15} className="text-lms-muted" />
              {currentLesson?.date ?? '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <span className="text-sm font-medium text-lms-heading">
          {MOCK_GROUPS.find((g) => g.id === selectedGroupId)?.name}
        </span>
        <span className="text-lms-muted">·</span>
        <span className="text-sm text-lms-muted">{currentLesson?.topic}</span>
        <span className="text-lms-muted">·</span>
        <span className="text-sm text-lms-muted">{currentLesson?.date}</span>
      </div>

      {/* Table */}
      <div className="rounded-neu bg-surface shadow-neu-sm overflow-hidden">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-surface-dark/20 bg-surface-light">
              <th className="border-b border-lms-border px-3 py-3 text-center text-xs
                             font-medium text-lms-muted w-[48px] uppercase tracking-wide">
                №
              </th>
              <th className="border-b border-lms-border px-3 py-3 text-left text-xs
                             font-medium text-lms-muted uppercase tracking-wide">
                Ad + Soyad
              </th>
              <th className="border-b border-lms-border px-3 py-3 text-left text-xs
                             font-medium text-lms-muted uppercase tracking-wide">
                Davamiyyət statusu
              </th>
              <th className="border-b border-lms-border px-3 py-2 text-left text-xs
                             font-medium text-lms-muted uppercase tracking-wide">
                <div className="mb-1">Bal</div>
                <select
                  value={lessonCategory}
                  onChange={(e) => {
                    const cat = e.target.value as GradeCategory;
                    setLessonCategory(cat);
                    setRecords((prev) => prev.map((r) => ({ ...r, category: cat })));
                  }}
                  className="border border-lms-border rounded px-1.5 py-0.5 text-[11px]
                             font-normal normal-case tracking-normal text-lms-heading
                             focus:ring-1 focus:ring-lms-navy/30 focus:border-lms-navy
                             bg-white w-[110px]"
                >
                  <option value="daily">Dərs qiyməti</option>
                  <option value="homework">Ev tapşırığı</option>
                  <option value="module">Modul imtahanı</option>
                  <option value="project">Layihə</option>
                  <option value="final">Final imtahanı</option>
                </select>
              </th>
              <th className="border-b border-lms-border px-3 py-3 text-center text-xs
                             font-medium text-lms-muted uppercase tracking-wide w-[80px] min-w-[80px]">
                Maks.
              </th>
              <th className="border-b border-lms-border px-3 py-3 text-left text-xs
                             font-medium text-lms-muted uppercase tracking-wide">
                Faiz (%)
              </th>
              <th className="border-b border-lms-border px-3 py-3 text-left text-xs
                             font-medium text-lms-muted uppercase tracking-wide">
                Müəllim qeydi (optional)
              </th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={record.id} className="border-b border-surface-dark/20 last:border-0">
                <td className="border-b border-lms-border px-3 py-3 text-center text-xs
                               text-lms-muted font-medium w-[48px] select-none">
                  {index + 1}
                </td>
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
                    onChange={(e) =>
                      updateRecord(record.studentId, 'score',
                        e.target.value === '' ? undefined : Number(e.target.value))
                    }
                    className="w-full border border-surface-dark/20 rounded-md px-2 py-1 text-sm
                               focus:outline-none focus:ring-2 focus:ring-lms-navy/30
                               focus:border-lms-navy"
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="number"
                    min={1}
                    value={record.maxScore}
                    onChange={(e) =>
                      updateRecord(record.studentId, 'maxScore', Number(e.target.value))
                    }
                    className="w-full border border-surface-dark/20 rounded-md px-2 py-1 text-sm
                               text-center focus:outline-none focus:ring-2 focus:ring-lms-navy/30
                               focus:border-lms-navy"
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
                    onChange={(e) =>
                      updateRecord(record.studentId, 'teacherNote', e.target.value)
                    }
                    className="w-full border border-surface-dark/20 rounded-md px-2 py-1 text-sm
                               focus:outline-none focus:ring-2 focus:ring-lms-navy/30
                               focus:border-lms-navy resize-none"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary footer */}
        <div className="border-t border-surface-dark/20 bg-surface-light px-4 py-3 text-sm text-lms-muted">
          <div className="flex items-center gap-4">
            <span>Ortalama: <strong className="text-lms-heading">{avg ?? '—'}%</strong></span>
            <span>Ən yüksək: <strong className="text-green-600">{highest ?? '—'}</strong></span>
            <span>Ən aşağı: <strong className="text-red-500">{lowest ?? '—'}</strong></span>
            <span className="text-xs">
              ({writeableScores.length} / {records.length} tələbə qiymətləndirildi)
            </span>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            type="number" min={1} max={200}
            value={bulkMax}
            onChange={(e) => setBulkMax(Number(e.target.value))}
            className="border border-lms-border rounded-lg px-2 py-1.5 text-sm
                       w-[72px] text-center focus:ring-2 focus:ring-lms-navy/30"
          />
          <button
            onClick={() => setRecords((prev) => prev.map((r) => ({ ...r, maxScore: bulkMax })))}
            className="border border-lms-navy text-lms-navy px-3 py-1.5 rounded-lg
                       text-sm font-medium hover:bg-lms-navy/5 transition-colors"
          >
            Hamısına tətbiq et
          </button>
        </div>

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
              if (saveStatus !== 'saved') {
                alert('Əvvəlcə qiymətləri saxlayın.');
                return;
              }
              setLessonCompleted(true);
              console.log('Lesson marked completed:', selectedLessonId);
            }}
            disabled={saveStatus !== 'saved'}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                       border-2 transition-all
                       ${lessonCompleted
                         ? 'border-emerald-600 bg-emerald-50 text-emerald-700 cursor-default'
                         : 'border-emerald-600 text-emerald-600 hover:bg-emerald-50 cursor-pointer'}
                       ${saveStatus !== 'saved' ? 'border-gray-200 text-gray-300 cursor-not-allowed' : ''}`}
          >
            <CheckCircle size={15} />
            {lessonCompleted ? 'Tamamlandı' : 'Dərsi Tamamla'}
          </button>
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={() => navigate(ROUTES.TEACHER_ATTENDANCE_HOME)}
          className="text-sm text-lms-muted hover:text-lms-heading flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft size={15} /> Davamiyyətə Qayıt
        </button>
      </div>
    </div>
  );
}
