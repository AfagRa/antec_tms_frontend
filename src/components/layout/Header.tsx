import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import SearchBar from './SearchBar';

export default function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-[64px] items-center justify-between border-b border-surface-dark/20 bg-surface px-6">
      <SearchBar />
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          Müəllim
        </span>
        <Link
          to={ROUTES.TEACHER_PROFILE}
          className="flex items-center gap-3 rounded-lg transition-opacity hover:opacity-80"
          aria-label="İstifadəçi profilinə keç"
        >
          <span className="text-sm font-medium text-text-base">Admin</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-dark">
            <User size={18} className="text-text-base/50" aria-hidden="true" />
          </div>
        </Link>
      </div>
    </header>
  );
}
