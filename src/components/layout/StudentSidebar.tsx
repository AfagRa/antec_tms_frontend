import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarCheck,
  FolderOpen,
  UserCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

interface NavItem {
  key: string;
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
}

const navItems: NavItem[] = [
  {
    key: 'dashboard',
    to: ROUTES.STUDENT_DASHBOARD,
    icon: LayoutDashboard,
    label: 'Tələbə Dashboard',
    end: true,
  },
  {
    key: 'groups',
    to: ROUTES.STUDENT_GROUPS,
    icon: Users,
    label: 'Mənim Qruplarım',
    end: true,
  },
  {
    key: 'attendance',
    to: ROUTES.STUDENT_ATTENDANCE,
    icon: BookOpen,
    label: 'Davamiyyatim',
    end: true,
  },
  {
    key: 'grades',
    to: ROUTES.STUDENT_GRADES,
    icon: CalendarCheck,
    label: 'Qiymətlərim',
    end: true,
  },
  {
    key: 'materials',
    to: ROUTES.STUDENT_MATERIALS,
    icon: FolderOpen,
    label: 'Dərs Materialları',
    end: true,
  },
  {
    key: 'profile',
    to: ROUTES.STUDENT_PROFILE,
    icon: UserCircle,
    label: 'Profilim',
    end: true,
  },
];

export default function StudentSidebar() {
  return (
    <aside
      className="fixed left-0 top-0 z-20 flex h-full w-[260px] flex-col bg-lms-student-bg"
      style={{ boxShadow: '4px 0 15px rgba(200,208,216,0.6)' }}
    >
      <div className="flex h-[64px] items-center gap-3 px-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-lms-student-accent"
          aria-hidden="true"
        >
          <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
          <path d="M22 10v6" />
          <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
        </svg>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold leading-tight text-lms-student-text">
            Tədris Mərkəzi
          </p>
          <p className="text-[11px] leading-tight text-lms-student-muted">
            İdarəetmə Sistemi
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-lms-student-accentLt px-2 py-0.5 text-[10px] font-semibold text-lms-student-accent">
          Tələbə
        </span>
      </div>

      <nav className="flex flex-col gap-1 px-3 py-4">
        {navItems.map(({ key, to, icon: Icon, label, end }) => (
          <NavLink
            key={key}
            to={to}
            end={end}
            className={({ isActive }) =>
              isActive ? 'student-nav-item active' : 'student-nav-item'
            }
          >
            <Icon size={18} strokeWidth={1.5} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
