import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import TeacherSearchBar from '../shared/TeacherSearchBar';
import { useAuth } from '../../hooks/useAuth';

const ROLE_LABEL: Record<string, string> = { teacher: 'Müəllim', student: 'Tələbə' };

export default function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 flex h-[64px] items-center justify-between border-b border-surface-dark/20 bg-surface px-6">
      <div className="flex-1 max-w-md">
        <TeacherSearchBar />
      </div>

      <div className="flex items-center gap-3">
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          {user ? ROLE_LABEL[user.role] ?? user.role : 'Müəllim'}
        </span>
        <button
          onClick={() => navigate(ROUTES.TEACHER_PROFILE)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-0 outline-none text-left"
          aria-label="İstifadəçi profilinə keç"
        >
          <span className="text-sm font-medium text-text-base">
            {user ? `${user.name} ${user.surname}` : 'Username'}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-dark">
            <User size={18} className="text-text-base/50" aria-hidden="true" />
          </div>
        </button>
      </div>
    </header>
  );
}
