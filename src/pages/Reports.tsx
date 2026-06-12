import { useState } from 'react';
import { Users, BookOpen, CalendarCheck, PenLine } from 'lucide-react';

const REPORT_DATA = {
  groups: [
    {
      id: '1', name: 'Python-A1', studentCount: 6,
      avgAttendance: 87, avgGrade: 78,
      lessonCount: 12, completedLessons: 10,
    },
    {
      id: '2', name: 'Code-A2', studentCount: 2,
      avgAttendance: 92, avgGrade: 84,
      lessonCount: 8, completedLessons: 8,
    },
    {
      id: '3', name: 'JS-B1', studentCount: 2,
      avgAttendance: 75, avgGrade: 71,
      lessonCount: 6, completedLessons: 4,
    },
  ],
  attendanceOverall: {
    present: 68, late: 8, excused: 5, unexcused: 9,
  },
  gradesByCategory: [
    { category: 'Dərs qiyməti',  count: 32, avg: 76 },
    { category: 'Ev tapşırığı',  count: 18, avg: 82 },
    { category: 'Modul imtahanı', count: 6,  avg: 74 },
    { category: 'Layihə',        count: 4,  avg: 88 },
    { category: 'Final imtahanı', count: 2,  avg: 79 },
  ],
  topStudents: [
    { name: 'Leyla Əliyeva',    group: 'Python-A1', avg: 94, attendance: 100 },
    { name: 'Nigar Babayeva',   group: 'Code-A2',   avg: 91, attendance: 95  },
    { name: 'Könül Nəsirov',    group: 'JS-B1',     avg: 88, attendance: 92  },
    { name: 'Əli Məmmədov',     group: 'Python-A1', avg: 85, attendance: 88  },
    { name: 'Rauf İsmayılov',   group: 'Code-A2',   avg: 81, attendance: 85  },
  ],
};

export default function Reports() {
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');

  const totalStudents = REPORT_DATA.groups.reduce((s, g) => s + g.studentCount, 0);
  const totalLessons = REPORT_DATA.groups.reduce((s, g) => s + g.lessonCount, 0);
  const att = REPORT_DATA.attendanceOverall;
  const attTotal = att.present + att.late + att.excused + att.unexcused;
  const overallAttendance = Math.round((att.present / attTotal) * 100);
  const overallAvgGrade = Math.round(
    REPORT_DATA.groups.reduce((s, g) => s + g.avgGrade, 0) / REPORT_DATA.groups.length,
  );

  const filteredGroups = selectedGroupFilter === 'all'
    ? REPORT_DATA.groups
    : REPORT_DATA.groups.filter((g) => g.id === selectedGroupFilter);

  const attendanceRows = [
    { label: 'Dərsdə',        value: att.present,  color: 'bg-green-500' },
    { label: 'Gecikdi',       value: att.late,      color: 'bg-amber-400' },
    { label: 'Qayıb (üzrlü)',  value: att.excused,   color: 'bg-blue-400'  },
    { label: 'Qayıb (üzrsüz)', value: att.unexcused, color: 'bg-red-400'   },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-lms-heading mb-6">Hesabatlar</h1>

      {/* Group filter */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-sm text-lms-muted">Qrup:</span>
        {['all', ...REPORT_DATA.groups.map((g) => g.id)].map((id) => {
          const label = id === 'all'
            ? 'Bütün qruplar'
            : REPORT_DATA.groups.find((g) => g.id === id)?.name ?? id;
          return (
            <button
              key={id}
              onClick={() => setSelectedGroupFilter(id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                ${selectedGroupFilter === id
                  ? 'bg-lms-navy text-white border-lms-navy'
                  : 'bg-white text-lms-muted border-lms-border hover:border-lms-navy/50'}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── SECTION A: KPI cards ── */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { icon: <Users size={20} />, label: 'Ümumi Tələbə', value: totalStudents },
          { icon: <BookOpen size={20} />, label: 'Ümumi Dərs', value: totalLessons },
          { icon: <CalendarCheck size={20} />, label: 'Ortalama Davamiyyət', value: `${overallAttendance}%` },
          { icon: <PenLine size={20} />, label: 'Ortalama Qiymət', value: `${overallAvgGrade}%` },
        ].map((card) => (
          <div key={card.label} className="lms-card flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-lms-navy/10 text-lms-navy flex items-center justify-center flex-shrink-0">
              {card.icon}
            </div>
            <div>
              <div className="text-2xl font-bold text-lms-heading">{card.value}</div>
              <div className="text-sm text-lms-muted">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── SECTION B: Two-column grid ── */}
      <div className="grid grid-cols-[1fr_1fr] gap-4 mb-4">
        {/* LEFT — Qrup üzrə müqayisə */}
        <div className="lms-card">
          <h3 className="text-base font-semibold mb-4 text-lms-heading">Qrup üzrə müqayisə</h3>
          {filteredGroups.map((g) => (
            <div key={g.id} className="mb-4 last:mb-0">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm font-medium text-lms-heading">{g.name}</span>
                <span className="text-xs text-lms-muted">{g.studentCount} tələbə</span>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-lms-muted w-[80px]">Davamiyyət</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${g.avgAttendance}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-lms-heading w-[36px] text-right">
                  {g.avgAttendance}%
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-lms-muted w-[80px]">Ortalama bal</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${g.avgGrade}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-lms-heading w-[36px] text-right">
                  {g.avgGrade}%
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-lms-muted w-[80px]">Dərslər</span>
                <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-amber-400 h-1.5 rounded-full"
                    style={{ width: `${Math.round((g.completedLessons / g.lessonCount) * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-lms-muted w-[36px] text-right">
                  {g.completedLessons}/{g.lessonCount}
                </span>
              </div>
            </div>
          ))}
          {filteredGroups.length === 0 && (
            <p className="text-sm text-lms-muted">Bu qrup üçün məlumat yoxdur.</p>
          )}
        </div>

        {/* RIGHT — Davamiyyət xülasəsi */}
        <div className="lms-card">
          <h3 className="text-base font-semibold mb-4 text-lms-heading">Davamiyyət xülasəsi</h3>
          {attendanceRows.map((row) => (
            <div key={row.label} className="mb-3 last:mb-0">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-lms-heading">{row.label}</span>
                <span className="text-sm font-medium text-lms-muted">
                  {row.value} ({Math.round((row.value / attTotal) * 100)}%)
                </span>
              </div>
              <div className="bg-gray-100 rounded-full h-2.5">
                <div
                  className={`${row.color} h-2.5 rounded-full`}
                  style={{ width: `${Math.round((row.value / attTotal) * 100)}%` }}
                />
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-2 mt-4">
            {attendanceRows.map((row) => (
              <span key={row.label} className="flex items-center gap-1.5 text-xs text-lms-muted">
                <span className={`w-2.5 h-2.5 rounded-full ${row.color}`} />
                {row.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION C: Two-column grid ── */}
      <div className="grid grid-cols-[1fr_1fr] gap-4">
        {/* LEFT — Qiymət kateqoriyaları */}
        <div className="lms-card">
          <h3 className="text-base font-semibold mb-4 text-lms-heading">Qiymət kateqoriyaları üzrə</h3>
          {REPORT_DATA.gradesByCategory.map((cat) => (
            <div key={cat.category} className="flex items-center gap-3 mb-3 last:mb-0">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-lms-heading">{cat.category}</span>
                  <span className="text-xs text-lms-muted">{cat.count} qiymət · ort. {cat.avg}%</span>
                </div>
                <div className="bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${cat.avg}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT — Ən yüksək nəticəli tələbələr */}
        <div className="lms-card">
          <h3 className="text-base font-semibold mb-1 text-lms-heading">Ən yüksək nəticəli tələbələr</h3>
          <p className="text-xs text-lms-muted mb-4">Ortalama bal əsasında sıralama</p>
          {REPORT_DATA.topStudents.map((s, i) => (
            <div
              key={s.name}
              className="flex items-center gap-3 py-2.5 border-b border-lms-border last:border-0"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center
                  text-xs font-bold flex-shrink-0
                  ${i === 0 ? 'bg-amber-100 text-amber-700' :
                    i === 1 ? 'bg-gray-100 text-gray-600' :
                    i === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-slate-50 text-slate-500'}`}
              >
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-lms-heading truncate">{s.name}</p>
                <p className="text-xs text-lms-muted">{s.group}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-lms-heading">{s.avg}%</p>
                <p className="text-xs text-lms-muted">Davamiyyət: {s.attendance}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
