import { Link } from 'react-router-dom';
import { BookOpen, FileText, Users, UserCheck } from 'lucide-react';
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
      <h1 className="mb-6 text-2xl font-semibold text-text-base">Dashboard</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Mənim Aktiv Qruplarım Sayı"
          value={MOCK_DASHBOARD_STATS.activeGroupCount}
          icon={<Users size={22} />}
        />
        <StatCard
          title="Bu Həftə Keçirilmiş Dərslər Sayı"
          value={MOCK_DASHBOARD_STATS.weeklyLessonCount}
          icon={<BookOpen size={22} />}
          color="text-success"
        />
        <StatCard
          title="Doldurulmamış Jurnallar Sayı"
          value={MOCK_DASHBOARD_STATS.draftJournalCount}
          icon={<FileText size={22} />}
          color="text-warning"
        />
        <StatCard
          title="Ümumi Tələbə Sayı"
          value={MOCK_DASHBOARD_STATS.totalStudentCount}
          icon={<UserCheck size={22} />}
        />
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-4">
        <div className="rounded-neu bg-surface shadow-neu-sm p-6">
          <h2 className="mb-4 text-base font-semibold text-text-base">Bugünkü Dərs Cədvəli</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-dark/20">
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-text-base/50">
                  Qrup adı
                </th>
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-text-base/50">
                  Dərs mövzusu
                </th>
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-text-base/50">
                  Tarix/Zaman
                </th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody>
              {MOCK_TODAY_LESSONS.map((lesson) => (
                  <tr key={lesson.id} className="border-b border-surface-dark/20 last:border-0">
                  <td className="py-3 text-sm text-text-base">{lesson.groupName}</td>
                  <td className="py-3 text-sm text-text-base">{lesson.topic}</td>
                  <td className="py-3 text-sm text-text-base">{formatLessonDateTime(lesson)}</td>
                  <td className="py-3 text-right">
                    <Link
                      to={ROUTES.TEACHER_ATTENDANCE(lesson.id)}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Jurnala keç
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-neu bg-surface shadow-neu-sm p-6">
          <h2 className="mb-4 text-base font-semibold text-text-base">
            Son Bildirişlər və Elanlar
          </h2>
          <ul>
            {MOCK_NOTIFICATIONS.map((notification) => (
              <li
                key={notification.id}
                className="flex items-center justify-between border-b border-surface-dark/20 py-3 last:border-0"
              >
                <span className="text-sm text-text-base">{notification.text}</span>
                <span className="text-xs text-text-base/50">{notification.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
