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
      <h1 className="mb-6 text-2xl font-semibold text-lms-heading">Hesabatlar</h1>

      <div className="mb-6 grid grid-cols-4 gap-4">
        <StatCard value={REPORT_STATS.totalLessons} label="Ümumi Keçirilmiş Dərslər" />
        <StatCard value={REPORT_STATS.averageAttendance} label="Orta Davamiyyət Faizi" />
        <StatCard value={REPORT_STATS.averageGrade} label="Orta Qiymət Balı" />
        <StatCard value={REPORT_STATS.activeGroups} label="Aktiv Qruplar" />
      </div>

      <div className="mb-6 grid grid-cols-[1fr_320px] gap-4">
        <div className="lms-card">
          <h2 className="mb-4 text-base font-semibold text-lms-heading">
            Qruplar üzrə performans
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-lms-border bg-gray-50">
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-lms-muted">
                    Qrup adı
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-lms-muted">
                    Dərslər
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-lms-muted">
                    Davamiyyət
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-lms-muted">
                    Orta bal
                  </th>
                </tr>
              </thead>
              <tbody>
                {REPORT_ROWS.map((row) => (
                  <tr key={row.id} className="border-b border-lms-border last:border-0">
                    <td className="px-3 py-3 text-sm text-lms-heading">{row.groupName}</td>
                    <td className="px-3 py-3 text-sm text-lms-heading">{row.lessonsHeld}</td>
                    <td className="px-3 py-3 text-sm text-lms-navy">{row.attendanceRate}</td>
                    <td className="px-3 py-3 text-sm font-medium text-lms-heading">
                      {row.averageGrade}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lms-card">
          <h2 className="mb-4 text-base font-semibold text-lms-heading">Aylıq aktivlik</h2>
          <div className="flex h-48 items-end justify-between gap-2">
            {MONTHLY_ACTIVITY.map((item) => (
              <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-lms-navy transition-all"
                  style={{ height: `${(item.value / maxActivity) * 100}%` }}
                  title={`${item.value} dərs`}
                />
                <span className="text-xs text-lms-muted">{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lms-card">
        <h2 className="mb-4 text-base font-semibold text-lms-heading">Son hesabatlar</h2>
        <ul className="divide-y divide-lms-border">
          {[
            'Həftəlik davamiyyət hesabatı — 01.06.2023',
            'Qrup performans xülasəsi — 25.05.2023',
            'Qiymətləndirmə statistikası — 15.05.2023',
          ].map((report) => (
            <li
              key={report}
              className="flex items-center justify-between py-3 text-sm text-lms-heading"
            >
              <span>{report}</span>
              <button
                type="button"
                className="text-sm font-medium text-lms-navy hover:underline"
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
