import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spinner } from "@repo/ui";
import { productService } from "../services/product.service";
import { ProductCard } from "../components/ProductCard";
import { ProductFilters } from "../components/ProductFilters";
import type { Product } from "@repo/types";
import { SearchBar } from "../components/SearchBar";

export const Products = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "newest";

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [category, search, sortBy]);

  const loadCategories = async () => {
    try {
      const data = await productService.getCategories();
      setCategories(data);
    } catch (err: any) {
      console.error("Failed to load categories:", err);
    }
  };

  const loadProducts = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await productService.getProducts({
        category: category || undefined,
        search: search || undefined,
        sortBy,
      });
      setProducts(data.products);
    } catch (err: any) {
      setError("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (newCategory: string) => {
    setSearchParams({ category: newCategory, sortBy });
  };

  const handleSortChange = (newSortBy: string) => {
    setSearchParams({ category, sortBy: newSortBy });
  };

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-4xl font-bold">Products</h1>
          <SearchBar
            defaultValue={search}
            onSearch={(q) =>
              setSearchParams({ category, sortBy, ...(q ? { search: q } : {}) })
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="md:col-span-1">
            <ProductFilters
              categories={categories}
              selectedCategory={category}
              onCategoryChange={handleCategoryChange}
              sortBy={sortBy}
              onSortChange={handleSortChange}
            />
          </div>

          {/* Products Grid */}
          <div className="md:col-span-3">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
              </div>
            ) : error ? (
              <div className="text-center text-danger p-8">{error}</div>
            ) : products.length === 0 ? (
              <div className="text-center text-gray-500 p-8">
                No products found
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => handleProductClick(product.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
