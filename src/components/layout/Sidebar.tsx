import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BookOpen,
  CalendarCheck,
  PenLine,
  FilePlus,
  Table2,
  BarChart3,
  UserCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { DEFAULT_GROUP_ID, DEFAULT_LESSON_ID } from '../../data/teacherMock';

interface NavItem {
  key: string;
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
  isActiveMatch?: (pathname: string) => boolean;
}

const navItems: NavItem[] = [
  {
    key: 'dashboard',
    to: ROUTES.TEACHER_DASHBOARD,
    icon: LayoutDashboard,
    label: 'Müəllim Dashboard',
    end: true,
  },
  {
    key: 'groups',
    to: ROUTES.TEACHER_GROUPS,
    icon: Users,
    label: 'Mənim Qruplarım',
    end: true,
    isActiveMatch: (pathname) => pathname === ROUTES.TEACHER_GROUPS,
  },
  {
    key: 'group-detail',
    to: ROUTES.TEACHER_GROUP(DEFAULT_GROUP_ID),
    icon: ClipboardList,
    label: 'Qrup Detalları',
    isActiveMatch: (pathname) => /^\/teacher\/groups\/[^/]+$/.test(pathname),
  },
  {
    key: 'lesson-create',
    to: ROUTES.TEACHER_LESSON_CREATE,
    icon: BookOpen,
    label: 'Jurnal Doldur',
    isActiveMatch: (pathname) => pathname === ROUTES.TEACHER_LESSON_CREATE,
  },
  {
    key: 'attendance',
    to: ROUTES.TEACHER_ATTENDANCE(DEFAULT_LESSON_ID),
    icon: CalendarCheck,
    label: 'Davamiyyət',
    isActiveMatch: (pathname) => /\/teacher\/lessons\/[^/]+\/attendance$/.test(pathname),
  },
  {
    key: 'grades',
    to: ROUTES.TEACHER_GRADES(DEFAULT_LESSON_ID),
    icon: PenLine,
    label: 'Qiymətləndirmə',
    isActiveMatch: (pathname) => /\/teacher\/lessons\/[^/]+\/grades$/.test(pathname),
  },
  {
    key: 'journal',
    to: ROUTES.TEACHER_JOURNAL,
    icon: Table2,
    label: 'Jurnal',
    end: true,
  },
  {
    key: 'material',
    to: ROUTES.TEACHER_MATERIAL,
    icon: FilePlus,
    label: 'Material Əlavə Etmək',
    end: true,
  },
  {
    key: 'reports',
    to: ROUTES.TEACHER_REPORTS,
    icon: BarChart3,
    label: 'Hesabatlar',
    end: true,
  },
  {
    key: 'profile',
    to: ROUTES.TEACHER_PROFILE,
    icon: UserCircle,
    label: 'Profilim',
    end: true,
  },
];

function resolveIsActive(item: NavItem, pathname: string, navActive: boolean) {
  if (item.isActiveMatch) {
    return item.isActiveMatch(pathname);
  }
  return navActive;
}

export default function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-20 flex h-full w-[260px] flex-col border-r border-surface-dark/20 bg-surface shadow-neu-lg">
      <div className="flex h-[64px] items-center gap-3 border-b border-surface-dark/20 px-4">
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
          className="shrink-0 text-primary"
          aria-hidden="true"
        >
          <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
          <path d="M22 10v6" />
          <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
        </svg>
        <div className="min-w-0">
          <p className="text-[13px] font-bold leading-tight text-text-base">Tədris Mərkəzi</p>
          <p className="text-[11px] leading-tight text-text-base/50">İdarəetmə Sistemi</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3 py-4">
        {navItems.map((item) => {
          const { key, to, icon: Icon, label, end } = item;

          return (
            <NavLink
              key={key}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-neu px-4 py-2.5 text-sm font-bold tracking-wide transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary ${resolveIsActive(item, pathname, isActive)
                  ? 'bg-primary text-white shadow-neu-sm'
                  : 'text-text-base/60 hover:text-text-base hover:shadow-neu-sm'
                }`
              }
            >
              <Icon size={18} strokeWidth={1.5} />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
