import { Link } from 'react-router-dom';
import StatCard from '../../components/ui/StatCard';
import { ROUTES } from '../../constants/routes';
import {
  MOCK_DASHBOARD_STATS,
  MOCK_NOTIFICATIONS,
  MOCK_TODAY_LESSONS,
  formatLessonDateTime,
} from '../../data/teacherMock';

export default function Dashboard() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-lms-heading">Dashboard</h1>

      <div className="mb-6 grid grid-cols-4 gap-4">
        <StatCard
          value={MOCK_DASHBOARD_STATS.activeGroupCount}
          label="Mənim Aktiv Qruplarım Sayı"
        />
        <StatCard
          value={MOCK_DASHBOARD_STATS.weeklyLessonCount}
          label="Bu Həftə Keçirilmiş Dərslər Sayı"
        />
        <StatCard
          value={MOCK_DASHBOARD_STATS.draftJournalCount}
          label="Doldurulmamış Jurnallar Sayı"
        />
        <StatCard
          value={MOCK_DASHBOARD_STATS.totalStudentCount}
          label="Ümumi Tələbə Sayı (Bütün qruplar)"
        />
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-4">
        <div className="lms-card">
          <h2 className="mb-4 text-base font-semibold text-lms-heading">Bugünkü Dərs Cədvəli</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-lms-border">
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-lms-muted">
                  Qrup adı
                </th>
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-lms-muted">
                  Dərs mövzusu
                </th>
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-lms-muted">
                  Tarix/Zaman
                </th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody>
              {MOCK_TODAY_LESSONS.map((lesson) => (
                <tr key={lesson.id} className="border-b border-lms-border last:border-0">
                  <td className="py-3 text-sm text-lms-heading">{lesson.groupName}</td>
                  <td className="py-3 text-sm text-lms-heading">{lesson.topic}</td>
                  <td className="py-3 text-sm text-lms-heading">{formatLessonDateTime(lesson)}</td>
                  <td className="py-3 text-right">
                    <Link
                      to={ROUTES.TEACHER_ATTENDANCE(lesson.id)}
                      className="text-sm font-medium text-lms-navy hover:underline"
                    >
                      Jurnala keç
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lms-card">
          <h2 className="mb-4 text-base font-semibold text-lms-heading">
            Son Bildirişlər və Elanlar
          </h2>
          <ul>
            {MOCK_NOTIFICATIONS.map((notification) => (
              <li
                key={notification.id}
                className="flex items-center justify-between border-b border-lms-border py-3 last:border-0"
              >
                <span className="text-sm text-lms-heading">{notification.text}</span>
                <span className="text-xs text-lms-muted">{notification.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
