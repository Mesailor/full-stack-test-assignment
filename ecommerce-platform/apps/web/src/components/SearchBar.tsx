import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface SearchBarProps {
  defaultValue?: string;
  onSearch?: (query: string) => void;
}

export const SearchBar = ({ defaultValue = "", onSearch }: SearchBarProps) => {
  const [search, setSearch] = useState(defaultValue);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(search.trim());
    } else if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-xl">
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products..."
        className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </form>
  );
};
