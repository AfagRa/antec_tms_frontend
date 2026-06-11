import { useNavigate } from 'react-router-dom';
import { Search, User } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';

const ROLE_LABEL: Record<string, string> = { teacher: 'Müəllim', student: 'Tələbə' };

export default function StudentHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header
      className="sticky top-0 z-10 flex h-[64px] items-center justify-between bg-lms-student-bg px-6"
      style={{ boxShadow: '0 4px 10px rgba(200,208,216,0.5)' }}
    >
      <div className="relative w-full max-w-md">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-lms-student-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Axtarış..."
          className="neu-input pl-9"
          aria-label="Axtarış"
        />
      </div>

      <div className="flex items-center gap-3">
        <span className="rounded-full bg-lms-student-accentLt px-2.5 py-1 text-xs font-medium text-lms-student-accent">
          {user ? ROLE_LABEL[user.role] ?? user.role : 'Tələbə'}
        </span>
        <button
          onClick={() => navigate(ROUTES.STUDENT_PROFILE)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-0 outline-none text-left"
          aria-label="İstifadəçi profilinə keç"
        >
          <span className="text-sm font-medium text-lms-student-text">
            {user ? `${user.name} ${user.surname}` : 'Tələbə Adı'}
          </span>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-lms-student-inset"
            style={{ boxShadow: '3px 3px 6px #C8D0D8, -3px -3px 6px #FFFFFF' }}
          >
            <User size={18} className="text-lms-student-muted" aria-hidden="true" />
          </div>
        </button>
      </div>
    </header>
  );
}
