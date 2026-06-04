import { NavLink, useNavigate } from 'react-router-dom'
import { BookOpen, GraduationCap, LayoutDashboard, LogOut, Users, UserCheck } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/courses', icon: BookOpen, label: 'Kurslar' },
  { to: '/admin/groups', icon: Users, label: 'Qruplar' },
  { to: '/admin/teachers', icon: UserCheck, label: 'Müəllimlər' },
  { to: '/admin/students', icon: GraduationCap, label: 'Tələbələr' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col bg-surface shadow-neu-lg" aria-label="Əsas naviqasiya">
      <div className="flex items-center gap-3 border-b border-surface-dark/20 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-neu bg-primary shadow-neu-sm">
          <span className="text-sm font-bold text-white">N</span>
        </div>
        <div>
          <p className="text-sm font-bold leading-none text-text-base">Neumorphism</p>
          <p className="mt-0.5 text-xs text-text-base/40">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-neu px-4 py-2.5 text-sm font-bold tracking-wide transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary ${isActive ? 'bg-primary text-white shadow-neu-sm' : 'text-text-base/60 hover:text-text-base hover:shadow-neu-sm'}`
            }
          >
            <Icon size={16} aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-surface-dark/20 p-4">
        <div className="mb-3 rounded-neu px-3 py-2.5 shadow-neu-inset-sm">
          <p className="truncate text-xs font-bold text-text-base">{user?.name} {user?.surname}</p>
          <p className="truncate text-xs text-text-base/40">{user?.email}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start text-danger hover:text-danger">
          <LogOut size={14} />
          Çıxış
        </Button>
      </div>
    </aside>
  )
}
