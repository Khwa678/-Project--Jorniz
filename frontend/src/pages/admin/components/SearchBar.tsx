import { Search } from "lucide-react";

export interface SearchBarProps {
  value: string;
  section: string;
  onValueChange: (value: string) => void;
}

export function SearchBar({ value, section, onValueChange }: SearchBarProps) {
  return (
    <label className="admin-search-bar">
      <Search size={17} aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={`Search ${section}`}
        aria-label={`Search ${section}`}
      />
    </label>
  );
}
