import { BookOpen, CheckCircle, GraduationCap, TrendingUp } from 'lucide-react';
import StatCard from '../components/ui/StatCard';

interface ReportRow {
  id: string;
  groupName: string;
  lessonsHeld: number;
  attendanceRate: string;
  averageGrade: string;
}

const REPORT_STATS = {
  totalLessons: 156,
  averageAttendance: '87%',
  averageGrade: '78.4%',
  activeGroups: 19,
};

const REPORT_ROWS: ReportRow[] = [
  { id: '1', groupName: 'Python-A1', lessonsHeld: 24, attendanceRate: '92%', averageGrade: '82.3%' },
  { id: '2', groupName: 'Qrup adı 2', lessonsHeld: 18, attendanceRate: '85%', averageGrade: '76.1%' },
  { id: '3', groupName: 'Qrup adı 3', lessonsHeld: 12, attendanceRate: '79%', averageGrade: '71.5%' },
  { id: '4', groupName: 'Java-B2', lessonsHeld: 20, attendanceRate: '88%', averageGrade: '80.0%' },
];

const MONTHLY_ACTIVITY = [
  { month: 'Yan', value: 12 },
  { month: 'Fev', value: 18 },
  { month: 'Mar', value: 22 },
  { month: 'Apr', value: 28 },
  { month: 'May', value: 33 },
  { month: 'İyn', value: 25 },
];

const maxActivity = Math.max(...MONTHLY_ACTIVITY.map((item) => item.value));

export default function Reports() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-text-base">Hesabatlar</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Ümumi Keçirilmiş Dərslər" value={REPORT_STATS.totalLessons} icon={<BookOpen size={22} />} />
        <StatCard title="Orta Davamiyyət Faizi" value={REPORT_STATS.averageAttendance} icon={<CheckCircle size={22} />} color="text-success" />
        <StatCard title="Orta Qiymət Balı" value={REPORT_STATS.averageGrade} icon={<TrendingUp size={22} />} color="text-primary" />
        <StatCard title="Aktiv Qruplar" value={REPORT_STATS.activeGroups} icon={<GraduationCap size={22} />} color="text-warning" />
      </div>

      <div className="mb-6 grid grid-cols-[1fr_320px] gap-4">
        <div className="rounded-neu bg-surface shadow-neu-sm p-6">
          <h2 className="mb-4 text-base font-semibold text-text-base">
            Qruplar üzrə performans
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-dark/20 bg-surface-light">
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">
                    Qrup adı
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">
                    Dərslər
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">
                    Davamiyyət
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">
                    Orta bal
                  </th>
                </tr>
              </thead>
              <tbody>
                {REPORT_ROWS.map((row) => (
                  <tr key={row.id} className="border-b border-surface-dark/20 last:border-0">
                    <td className="px-3 py-3 text-sm text-text-base">{row.groupName}</td>
                    <td className="px-3 py-3 text-sm text-text-base">{row.lessonsHeld}</td>
                    <td className="px-3 py-3 text-sm text-primary">{row.attendanceRate}</td>
                    <td className="px-3 py-3 text-sm font-medium text-text-base">
                      {row.averageGrade}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-neu bg-surface shadow-neu-sm p-6">
          <h2 className="mb-4 text-base font-semibold text-text-base">Aylıq aktivlik</h2>
          <div className="flex h-48 items-end justify-between gap-2">
            {MONTHLY_ACTIVITY.map((item) => (
              <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-primary transition-all"
                  style={{ height: `${(item.value / maxActivity) * 100}%` }}
                  title={`${item.value} dərs`}
                />
                <span className="text-xs text-text-base/50">{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-neu bg-surface shadow-neu-sm p-6">
        <h2 className="mb-4 text-base font-semibold text-text-base">Son hesabatlar</h2>
        <ul className="divide-y divide-surface-dark/20">
          {[
            'Həftəlik davamiyyət hesabatı — 01.06.2023',
            'Qrup performans xülasəsi — 25.05.2023',
            'Qiymətləndirmə statistikası — 15.05.2023',
          ].map((report) => (
            <li
              key={report}
              className="flex items-center justify-between py-3 text-sm text-text-base"
            >
              <span>{report}</span>
              <button
                type="button"
                className="text-sm font-medium text-primary hover:underline"
              >
                Yüklə
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
