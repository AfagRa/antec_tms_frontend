import { useState, useMemo } from 'react';
import { Users, BookOpen, CalendarCheck, PenLine } from 'lucide-react';
import {
  useAcademic, SHARED_GROUPS, SHARED_LESSONS, SHARED_STUDENTS,
  getAttendanceStats, getGroupStats,
} from '../store/academicStore.tsx';

export default function Reports() {
  const { state } = useAcademic();
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');

  const filteredGroupIds = useMemo(() => {
    if (selectedGroupFilter === 'all') return SHARED_GROUPS.map((g) => g.id);
    return [selectedGroupFilter];
  }, [selectedGroupFilter]);

  const groupsWithStats = useMemo(
    () => SHARED_GROUPS.map((g) => ({ ...g, ...getGroupStats(state, g.id) })),
    [state.attendance, state.grades],
  );

  const filteredGroups = useMemo(
    () => groupsWithStats.filter((g) => filteredGroupIds.includes(g.id)),
    [groupsWithStats, filteredGroupIds],
  );

  const totalStudents = filteredGroups.reduce((s, g) => s + g.studentCount, 0);
  const totalLessons = filteredGroups.reduce((s, g) => s + g.lessonCount, 0);

  const overallAttendance = filteredGroups.length
    ? Math.round(filteredGroups.reduce((s, g) => s + g.avgAttendance, 0) / filteredGroups.length)
    : 0;

  const overallAvgGrade = filteredGroups.length
    ? Math.round(filteredGroups.reduce((s, g) => s + g.avgGrade, 0) / filteredGroups.length)
    : 0;

  const attStats = getAttendanceStats(state, selectedGroupFilter === 'all' ? undefined : selectedGroupFilter);
  const attTotal = attStats.total || 1;

  const attendanceRows = [
    { label: 'Dərsdə',        value: attStats.present,  color: 'bg-green-500' },
    { label: 'Gecikdi',       value: attStats.late,      color: 'bg-amber-400' },
    { label: 'Qayıb (üzrlü)',  value: attStats.excused,   color: 'bg-blue-400'  },
    { label: 'Qayıb (üzrsüz)', value: attStats.unexcused, color: 'bg-red-400'   },
  ];

  // Grade categories from raw grades
  const gradeCategories = useMemo(() => {
    const filteredLessons = selectedGroupFilter === 'all'
      ? SHARED_LESSONS
      : SHARED_LESSONS.filter((l) => l.groupId === selectedGroupFilter);
    const lessonIds = new Set(filteredLessons.map((l) => l.id));
    const relevant = state.grades.filter((g) => lessonIds.has(g.lessonId) && g.score !== null);
    const byCat: Record<string, { scores: number[]; count: number }> = {};
    relevant.forEach((g) => {
      if (!byCat[g.category]) byCat[g.category] = { scores: [], count: 0 };
      byCat[g.category].scores.push(g.score as number);
      byCat[g.category].count++;
    });
    return Object.entries(byCat).map(([category, data]) => ({
      category,
      count: data.count,
      avg: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length) || 0,
    }));
  }, [state.grades, selectedGroupFilter]);

  // Top students
  const topStudents = useMemo(() => {
    const filteredLessons = selectedGroupFilter === 'all'
      ? SHARED_LESSONS
      : SHARED_LESSONS.filter((l) => l.groupId === selectedGroupFilter);
    const lessonIds = new Set(filteredLessons.map((l) => l.id));
    const relevant = state.grades.filter((g) => lessonIds.has(g.lessonId) && g.score !== null);

    const studentScores: Record<string, number[]> = {};
    relevant.forEach((g) => {
      if (!studentScores[g.studentId]) studentScores[g.studentId] = [];
      studentScores[g.studentId].push(g.score as number);
    });

    const students = SHARED_STUDENTS.filter((s) => filteredGroupIds.includes(s.groupId));
    const studentMap = new Map(students.map((s) => [s.studentId, s]));
    const groupNameMap = new Map(SHARED_GROUPS.map((g) => [g.id, g.name]));

    const ranked = Object.entries(studentScores)
      .map(([studentId, scores]) => {
        const info = studentMap.get(studentId);
        if (!info) return null;
        const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        const totalAtt = state.attendance.filter((a) => a.studentId === studentId && lessonIds.has(a.lessonId));
        const presentCount = totalAtt.filter((a) => a.status === 'present' || a.status === 'late').length;
        const attendance = totalAtt.length > 0 ? Math.round((presentCount / totalAtt.length) * 100) : 0;
        return { name: `${info.studentName} ${info.studentSurname}`, group: groupNameMap.get(info.groupId) ?? '', avg, attendance };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null)
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5);

    return ranked;
  }, [state.grades, state.attendance, selectedGroupFilter, filteredGroupIds]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-base mb-6">Hesabatlar</h1>

      <div className="flex items-center gap-3 mb-5">
        <span className="text-sm text-text-base/50">Qrup:</span>
        {['all', ...SHARED_GROUPS.map((g) => g.id)].map((id) => {
          const label = id === 'all'
            ? 'Bütün qruplar'
            : SHARED_GROUPS.find((g) => g.id === id)?.name ?? id;
          return (
            <button
              key={id}
              onClick={() => setSelectedGroupFilter(id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                ${selectedGroupFilter === id
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-text-base/50 border-surface-dark/20 hover:border-primary/50'}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { icon: <Users size={20} />, label: 'Ümumi Tələbə', value: totalStudents },
          { icon: <BookOpen size={20} />, label: 'Ümumi Dərs', value: totalLessons },
          { icon: <CalendarCheck size={20} />, label: 'Ortalama Davamiyyət', value: `${overallAttendance}%` },
          { icon: <PenLine size={20} />, label: 'Ortalama Qiymət', value: `${overallAvgGrade}%` },
        ].map((card) => (
          <div key={card.label} className="rounded-neu bg-surface shadow-neu-sm p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              {card.icon}
            </div>
            <div>
              <div className="text-2xl font-bold text-text-base">{card.value}</div>
              <div className="text-sm text-text-base/50">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-4 mb-4">
        <div className="rounded-neu bg-surface shadow-neu-sm p-5">
          <h3 className="text-base font-semibold mb-4 text-text-base">Qrup üzrə müqayisə</h3>
          {filteredGroups.map((g) => (
            <div key={g.id} className="mb-4 last:mb-0">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm font-medium text-text-base">{g.name}</span>
                <span className="text-xs text-text-base/50">{g.studentCount} tələbə</span>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-text-base/50 w-[80px]">Davamiyyət</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${g.avgAttendance}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-text-base w-[36px] text-right">
                  {g.avgAttendance}%
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-text-base/50 w-[80px]">Ortalama bal</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${g.avgGrade}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-text-base w-[36px] text-right">
                  {g.avgGrade}%
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-text-base/50 w-[80px]">Dərslər</span>
                <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-amber-400 h-1.5 rounded-full"
                    style={{ width: `${Math.round((g.completedLessons / g.lessonCount) * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-text-base/50 w-[36px] text-right">
                  {g.completedLessons}/{g.lessonCount}
                </span>
              </div>
            </div>
          ))}
          {filteredGroups.length === 0 && (
            <p className="text-sm text-text-base/50">Bu qrup üçün məlumat yoxdur.</p>
          )}
        </div>

        <div className="rounded-neu bg-surface shadow-neu-sm p-5">
          <h3 className="text-base font-semibold mb-4 text-text-base">Davamiyyət xülasəsi</h3>
          {attendanceRows.map((row) => (
            <div key={row.label} className="mb-3 last:mb-0">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-text-base">{row.label}</span>
                <span className="text-sm font-medium text-text-base/50">
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
              <span key={row.label} className="flex items-center gap-1.5 text-xs text-text-base/50">
                <span className={`w-2.5 h-2.5 rounded-full ${row.color}`} />
                {row.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-4">
        <div className="rounded-neu bg-surface shadow-neu-sm p-5">
          <h3 className="text-base font-semibold mb-4 text-text-base">Qiymət kateqoriyaları üzrə</h3>
          {gradeCategories.length > 0 ? gradeCategories.map((cat) => (
            <div key={cat.category} className="flex items-center gap-3 mb-3 last:mb-0">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-text-base">{cat.category}</span>
                  <span className="text-xs text-text-base/50">{cat.count} qiymət · ort. {cat.avg}%</span>
                </div>
                <div className="bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${cat.avg}%` }}
                  />
                </div>
              </div>
            </div>
          )) : (
            <p className="text-sm text-text-base/50">Hələ qiymət daxil edilməyib.</p>
          )}
        </div>

        <div className="rounded-neu bg-surface shadow-neu-sm p-5">
          <h3 className="text-base font-semibold mb-1 text-text-base">Ən yüksək nəticəli tələbələr</h3>
          <p className="text-xs text-text-base/50 mb-4">Ortalama bal əsasında sıralama</p>
          {topStudents.length > 0 ? topStudents.map((s, i) => (
            <div
              key={s.name}
              className="flex items-center gap-3 py-2.5 border-b border-surface-dark/20 last:border-0"
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
                <p className="text-sm font-medium text-text-base truncate">{s.name}</p>
                <p className="text-xs text-text-base/50">{s.group}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-text-base">{s.avg}%</p>
                <p className="text-xs text-text-base/50">Davamiyyət: {s.attendance}%</p>
              </div>
            </div>
          )) : (
            <p className="text-sm text-text-base/50">Hələ qiymət daxil edilməyib.</p>
          )}
        </div>
      </div>
    </div>
  );
}
