import { useNavigate } from 'react-router-dom';
import { BookOpen, FileText, Users, UserCheck } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import WeeklySchedule, { type ScheduleLesson } from '../../components/ui/WeeklySchedule';
import { ROUTES } from '../../constants/routes';
import { MOCK_DASHBOARD_STATS, MOCK_NOTIFICATIONS } from '../../data/teacherMock';

const schedule: ScheduleLesson[] = [
  { id:'s1', groupId:'1', groupName:'Python-A1', topic:'Dəyişənlər', timeSlot:'09:00–10:30', day:0 },
  { id:'s2', groupId:'2', groupName:'Code-A2',   topic:'Funksiyalar', timeSlot:'11:00–12:30', day:0 },
  { id:'s3', groupId:'1', groupName:'Python-A1', topic:'Massivlər',   timeSlot:'09:00–10:30', day:2 },
  { id:'s4', groupId:'3', groupName:'JS-B1',     topic:'Döngülər',    timeSlot:'14:00–15:30', day:2 },
  { id:'s5', groupId:'2', groupName:'Code-A2',   topic:'Obyektlər',   timeSlot:'11:00–12:30', day:4 },
  { id:'s6', groupId:'3', groupName:'JS-B1',     topic:'Siniflər',    timeSlot:'09:00–10:30', day:3 },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLessonClick = (groupId: string) =>
    navigate(ROUTES.TEACHER_GROUP(groupId));

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
          <h2 className="mb-4 text-base font-semibold text-text-base">Dərs Cədvəli</h2>
          <WeeklySchedule lessons={schedule} onLessonClick={handleLessonClick} />
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
