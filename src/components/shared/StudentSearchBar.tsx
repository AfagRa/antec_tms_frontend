import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, Search, Users, UsersRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { searchGlobalStudent, initSearchCache, type GlobalSearchResult, type SearchResultType } from '../../utils/globalSearch';

const TYPE_ICONS: Record<SearchResultType, LucideIcon> = {
  group: UsersRound,
  student: Users,
  lesson: BookOpen,
  material: FileText,
};

function highlightMatch(text: string, query: string): ReactNode {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return text;

  const lowerText = text.toLowerCase();
  const index = lowerText.indexOf(normalizedQuery);

  if (index === -1) return text;

  return (
    <>
      {text.slice(0, index)}
      <span className="font-semibold text-primary">
        {text.slice(index, index + normalizedQuery.length)}
      </span>
      {text.slice(index + normalizedQuery.length)}
    </>
  );
}

export default function StudentSearchBar() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initSearchCache();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(timer);
  }, [query]);

  const results = useMemo(() => searchGlobalStudent(debouncedQuery), [debouncedQuery]);
  const showDropdown = isFocused && query.trim().length > 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleResultClick() {
    setQuery('');
    setIsFocused(false);
    inputRef.current?.blur();
  }

  const grouped = useMemo(() => {
    if (results.length === 0) return [];
    const map: Record<string, GlobalSearchResult[]> = {};
    for (const r of results) {
      (map[r.category] ??= []).push(r);
    }
    return Object.entries(map);
  }, [results]);

  return (
    <div ref={containerRef} className="relative w-full min-w-[320px] max-w-2xl">
      <Search
        size={18}
        className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-text-base/40"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setIsFocused(true)}
        placeholder="Axtarış..."
        className="w-full rounded-neu border border-surface-dark/20 bg-surface py-2.5 pl-10 pr-3 text-sm text-text-base placeholder:text-text-base/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
        aria-label="Axtarış"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
      />

      {showDropdown && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-surface-dark/20 bg-surface shadow-neu"
          role="listbox"
        >
          {grouped.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-text-base/50">
              Nəticə tapılmadı
            </p>
          ) : (
            <ul className="max-h-96 overflow-y-auto py-1">
              {grouped.map(([category, items]) => (
                <li key={category}>
                  <p className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-text-base/40">
                    {category}
                  </p>
                  {items.map((result) => (
                    <SearchResultItem
                      key={result.id}
                      result={result}
                      query={query}
                      onSelect={handleResultClick}
                    />
                  ))}
                </li>
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
        className="flex items-center justify-between gap-4 px-4 py-2.5 transition-colors hover:bg-surface-dark/10"
      >
        <span className="flex min-w-0 flex-1 items-center gap-2.5 text-sm text-text-base">
          <Icon size={16} strokeWidth={1.5} className="shrink-0 text-primary" />
          <span className="truncate">{highlightMatch(result.label, query)}</span>
        </span>
        <span className="shrink-0 text-xs font-medium text-text-base/50">
          {result.category}
        </span>
      </Link>
    </li>
  );
}
