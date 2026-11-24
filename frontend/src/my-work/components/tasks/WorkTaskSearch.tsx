import { Search } from "lucide-react";
export function WorkTaskSearch({
  search,
  onSearch,
}: {
  search: string;
  onSearch: (search: string) => void;
}) {
  return (
    <label className="my-work-search">
      <Search size={16} />
      <input
        type="search"
        value={search}
        onChange={(event) => onSearch(event.target.value)}
        aria-label="Search my tasks"
        placeholder="Search tasks…"
      />
    </label>
  );
}
