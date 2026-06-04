interface ProductFiltersProps {
  categories: Array<{ name: string; count: number }>;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
}

export const ProductFilters = ({
  categories,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
}: ProductFiltersProps) => {
  return (
    <div className="bg-surface p-4 rounded-md shadow-md">
      <div className="mb-6">
        <h3 className="font-bold mb-3 font-mono uppercase text-sm">
          Category
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => onCategoryChange("")}
            className={`w-full text-left px-3 py-2 rounded-sm ${
              selectedCategory === ""
                ? "bg-primary text-secondary font-semibold"
                : "hover:bg-gray-100"
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => onCategoryChange(cat.name)}
              className={`w-full text-left px-3 py-2 rounded-sm flex justify-between ${
                selectedCategory === cat.name
                  ? "bg-primary text-secondary font-semibold"
                  : "hover:bg-gray-100"
              }`}
            >
              <span>{cat.name}</span>
              <span className="text-gray-500">({cat.count})</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold mb-3 font-mono uppercase text-sm">Sort By</h3>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-sm"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
        </select>
      </div>
    </div>
  );
};
