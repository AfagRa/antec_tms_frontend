import { NavLink, useNavigate } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  User,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import logo from "../../antec_logo.png";

interface Props {
  open: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/courses", icon: BookOpen, label: "Kurslar" },
  { to: "/admin/groups", icon: Users, label: "Qruplar" },
  { to: "/admin/teachers", icon: UserCheck, label: "Müəllimlər" },
  { to: "/admin/students", icon: GraduationCap, label: "Tələbələr" },
  { to: "/admin/journal", icon: BookOpen, label: "Jurnal" },
  { to: "/admin/profile", icon: User, label: "Profil" },
];

export default function Sidebar({ open, onToggle }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
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
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-neu px-4 py-2.5 text-sm font-bold tracking-wide transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary ${
                open ? 'justify-start' : 'justify-center px-0'
              } ${isActive ? "bg-primary text-white shadow-neu-sm" : "text-text-base/60 hover:text-text-base hover:shadow-neu-sm"}`
            }
          >
            <Icon size={16} aria-hidden className="shrink-0" />
            {open && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {open && (
        <div className="border-t border-surface-dark/20 p-4">
          <button
            onClick={() => navigate('/admin/profile')}
            className="mb-3 w-full rounded-neu px-3 py-2.5 shadow-neu-inset-sm hover:bg-surface-dark/10 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shrink-0">
                {user?.name?.[0]}{user?.surname?.[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-text-base">
                  {user?.name} {user?.surname}
                </p>
                <p className="truncate text-xs text-text-base/40">{user?.email}</p>
              </div>
            </div>
          </button>
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
