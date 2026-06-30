import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarCheck,
  FolderOpen,
  UserCircle,
  LogOut,
  Menu,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import logo from '../../antec_logo.png';

interface NavItem {
  key: string;
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
}

interface Props {
  open: boolean;
  onToggle: () => void;
}

const navItems: NavItem[] = [
  { key: 'dashboard',  to: ROUTES.STUDENT_DASHBOARD,  icon: LayoutDashboard, label: 'Tələbə Dashboard',  end: true },
  { key: 'groups',     to: ROUTES.STUDENT_GROUPS,     icon: Users,           label: 'Mənim Qruplarım',    end: true },
  { key: 'attendance', to: ROUTES.STUDENT_ATTENDANCE, icon: BookOpen,        label: 'Davamiyyətim',       end: true },
  { key: 'grades',     to: ROUTES.STUDENT_GRADES,     icon: CalendarCheck,   label: 'Qiymətlərim',        end: true },
  { key: 'materials',  to: ROUTES.STUDENT_MATERIALS,  icon: FolderOpen,      label: 'Dərs Materialları',  end: true },
  { key: 'profile',    to: ROUTES.STUDENT_PROFILE,    icon: UserCircle,      label: 'Profilim',           end: true },
];

export default function StudentSidebar({ open, onToggle }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-surface shadow-neu-lg transition-all duration-300 ease-in-out ${
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-16'
      }`}
      aria-label="Əsas naviqasiya"
    >
      <div className="flex shrink-0 items-center border-b border-surface-dark/20 px-4 py-5">
        <button
          onClick={onToggle}
          className="p-2 rounded-md text-text-base/50 hover:text-text-base hover:bg-surface-dark/20 transition-colors"
          aria-label={open ? 'Menyunu gizlət' : 'Menyunu göstər'}
        >
          <Menu size={20} />
        </button>
        {open && (
          <>
            <img src={logo} alt="ANTEC Academy" className="ml-2 h-8 w-auto" />
            <span className="ml-1 text-lg font-bold tracking-wide text-text-base">ANTEC Academy</span>
          </>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map(({ key, to, icon: Icon, label, end }) => (
          <NavLink
            key={key}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-neu px-4 py-2.5 text-sm font-bold tracking-wide transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary ${
                open ? 'justify-start' : 'justify-center px-0'
              } ${
                isActive
                  ? 'bg-primary text-white shadow-neu-sm'
                  : 'text-text-base/60 hover:text-text-base hover:shadow-neu-sm'
              }`
            }
          >
            <Icon size={16} aria-hidden className="shrink-0" />
            {open && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {open && (
        <div className="border-t border-surface-dark/20 p-4">
          <div className="mb-3 rounded-neu px-3 py-2.5 shadow-neu-inset-sm">
            <p className="truncate text-xs font-bold text-text-base">
              {user?.name} {user?.surname}
            </p>
            <p className="truncate text-xs text-text-base/40">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-danger hover:text-danger"
          >
            <LogOut size={14} />
            Çıxış
          </Button>
        </div>
      )}

      {!open && (
        <div className="border-t border-surface-dark/20 py-4 flex justify-center">
          <button
            onClick={handleLogout}
            className="p-2 rounded-md text-danger/60 hover:text-danger transition-colors"
            aria-label="Çıxış"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </aside>
  );
}
