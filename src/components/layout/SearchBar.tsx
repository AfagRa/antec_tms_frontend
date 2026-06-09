import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, Search, Users, UsersRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { searchGlobal, type GlobalSearchResult, type SearchResultType } from '../../utils/globalSearch';

const TYPE_ICONS: Record<SearchResultType, LucideIcon> = {
  group: UsersRound,
  student: Users,
  lesson: BookOpen,
  material: FileText,
};

function highlightMatch(text: string, query: string): ReactNode {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return text;
  }

  const lowerText = text.toLowerCase();
  const index = lowerText.indexOf(normalizedQuery);

  if (index === -1) {
    return text;
  }

  return (
    <>
      {text.slice(0, index)}
      <span className="font-semibold text-lms-navy">
        {text.slice(index, index + normalizedQuery.length)}
      </span>
      {text.slice(index + normalizedQuery.length)}
    </>
  );
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => searchGlobal(query), [query]);
  const showDropdown = isFocused && query.trim().length > 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleResultClick() {
    setQuery('');
    setIsFocused(false);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setIsFocused(true)}
        placeholder="Axtarış..."
        className="w-full rounded-lg border border-lms-border bg-white py-2 pl-9 pr-3 text-sm text-lms-heading placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-lms-navy/20"
        aria-label="Axtarış"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
      />

      {showDropdown && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-lms-border bg-white shadow-card"
          role="listbox"
        >
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-lms-muted">
              Nəticə tapılmadı
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((result) => (
                <SearchResultItem
                  key={result.id}
                  result={result}
                  query={query}
                  onSelect={handleResultClick}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

interface SearchResultItemProps {
  result: GlobalSearchResult;
  query: string;
  onSelect: () => void;
}

function SearchResultItem({ result, query, onSelect }: SearchResultItemProps) {
  const Icon = TYPE_ICONS[result.type];

  return (
    <li role="option">
      <Link
        to={result.to}
        onClick={onSelect}
        className="flex items-center justify-between gap-4 px-4 py-2.5 transition-colors hover:bg-slate-50"
      >
        <span className="flex min-w-0 flex-1 items-center gap-2.5 text-sm text-lms-heading">
          <Icon size={16} strokeWidth={1.5} className="shrink-0 text-lms-navy" />
          <span className="truncate">{highlightMatch(result.label, query)}</span>
        </span>
        <span className="shrink-0 text-xs font-medium text-lms-muted">
          {result.category}
        </span>
      </Link>
    </li>
  );
}
