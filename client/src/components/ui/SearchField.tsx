import { Search } from 'lucide-react';
import { cn } from '../../lib/cn';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchField({ value, onChange, placeholder = 'Search by title or description' }: SearchFieldProps) {
  return (
    <label className="search">
      <span className="sr-only">Search tasks</span>
      <Search className="search-icon" aria-hidden="true" />
      <input
        type="search"
        className={cn('control', 'search-input')}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
