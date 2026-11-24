import { Search } from "lucide-react";

export function ProjectDirectorySearch({
  value,
  onSearch,
}: {
  value: string;
  onSearch: (value: string) => void;
}) {
  return (
    <label className="shell-search project-directory-search">
      <Search size={18} aria-hidden="true" />
      <input
        type="search"
        aria-label="Search project directory"
        placeholder="Search projects…"
        value={value}
        onChange={(event) => onSearch(event.target.value)}
      />
    </label>
  );
}
