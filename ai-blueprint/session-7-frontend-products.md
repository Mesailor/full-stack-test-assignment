# Session 7: Frontend - Product Catalog

## 🎯 Session Objectives

Build the product browsing experience:

- Product listing page with responsive grid
- Product search and filters
- Category navigation
- Sorting options
- Product detail page
- Add to cart functionality
- Loading states and error handling

**Duration Estimate:** 3-4 hours  
**Dependencies:** Session 6 (Frontend core & auth)

---

## 📋 Required Context

**IMPORTANT**: Execute `modern-web-guidance` skill for View Transitions API!

1. **`/DESIGN.md`** - Design system for product cards
2. **Session 2** - Shared UI components (@repo/ui)
3. **Session 4** - Backend product API structure
4. **Session 6** - Zustand stores and API service

---

## 🏗 Implementation Steps

### Step 1: Create Product Service

Create `apps/web/src/services/product.service.ts`:

```typescript
import { api } from "./api";
import type { Product } from "@repo/types";

export const productService = {
  async getProducts(params?: {
    category?: string;
    search?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get("/products", { params });
    return response.data.data;
  },

  async getProductById(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data.data.product;
  },

  async getCategories() {
    const response = await api.get("/products/categories");
    return response.data.data.categories;
  },
};
```

### Step 2: Create Product Components

Create `apps/web/src/components/ProductCard.tsx`:

```typescript
import { motion } from "framer-motion";
import { Card, Button } from "@repo/ui";
import { formatCurrency } from "@repo/utils";
import type { Product } from "@repo/types";
import { useCartStore } from "../stores/cart.store";
import { useUIStore } from "../stores/ui.store";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export const ProductCard = ({ product, onClick }: ProductCardProps) => {
  const addItem = useCartStore((state) => state.addItem);
  const addNotification = useUIStore((state) => state.addNotification);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
    addNotification({
      type: "success",
      message: `${product.name} added to cart`,
    });
  };

  return (
    <Card hover padding="none" className="cursor-pointer overflow-hidden">
      <div onClick={onClick}>
        <div className="relative pb-[75%] bg-gray-100">
          <img
            src={product.image_url}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-bold">Out of Stock</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm mb-2 font-mono uppercase">
            {product.category}
          </p>
          <p className="text-2xl font-bold text-primary mb-3">
            {formatCurrency(product.price)}
          </p>

          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            fullWidth
            size="sm"
          >
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </div>
    </Card>
  );
};
```

Create `apps/web/src/components/ProductFilters.tsx`:

```typescript
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
```

### Step 3: Create Products List Page

Create `apps/web/src/pages/Products.tsx`:

```typescript
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spinner } from "@repo/ui";
import { productService } from "../services/product.service";
import { ProductCard } from "../components/ProductCard";
import { ProductFilters } from "../components/ProductFilters";
import type { Product } from "@repo/types";

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
        <h1 className="text-4xl font-bold mb-8">Products</h1>

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
```

### Step 4: Create Product Detail Page

Create `apps/web/src/pages/ProductDetail.tsx`:

```typescript
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button, Spinner } from "@repo/ui";
import { formatCurrency } from "@repo/utils";
import { productService } from "../services/product.service";
import { useCartStore } from "../stores/cart.store";
import { useUIStore } from "../stores/ui.store";
import type { Product } from "@repo/types";

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const addNotification = useUIStore((state) => state.addNotification);

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    setIsLoading(true);
    try {
      const data = await productService.getProductById(productId);
      setProduct(data);
    } catch (err: any) {
      addNotification({
        type: "error",
        message: "Failed to load product",
      });
      navigate("/products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      addNotification({
        type: "success",
        message: `${product.name} added to cart`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <button
          onClick={() => navigate("/products")}
          className="mb-6 text-primary hover:underline"
        >
          ← Back to Products
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-surface p-8 rounded-md shadow-md">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative pb-[100%] bg-gray-100 rounded-md overflow-hidden"
          >
            <img
              src={product.image_url}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <p className="text-sm font-mono uppercase text-gray-600 mb-2">
              {product.category}
            </p>

            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

            <p className="text-3xl font-bold text-primary mb-6">
              {formatCurrency(product.price)}
            </p>

            <p className="text-gray-700 mb-6 leading-relaxed">
              {product.description}
            </p>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">
                Stock: {product.stock} available
              </p>

              {product.stock > 0 && (
                <div className="flex items-center gap-4">
                  <label className="font-mono uppercase text-sm">
                    Quantity:
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-sm">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 border-x">{quantity}</span>
                    <button
                      onClick={() =>
                        setQuantity(Math.min(product.stock, quantity + 1))
                      }
                      className="px-3 py-1 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              size="lg"
              fullWidth
            >
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
```

### Step 5: Create Search Bar Component

Create `apps/web/src/components/SearchBar.tsx`:

```typescript
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const SearchBar = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
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
```

### Step 6: Update App Router

Update `apps/web/src/App.tsx`:

```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Products } from "./pages/Products";
import { ProductDetail } from "./pages/ProductDetail";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id"
          element={
            <ProtectedRoute>
              <ProductDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

## ✅ Quality Assessment Criteria

### Verification Checklist

- [ ] **Product Listing**
  - [ ] Products display in responsive grid (3 cols desktop, 2 tablet, 1 mobile)
  - [ ] Product cards show image, name, price, category, stock status
  - [ ] Hover effects working
  - [ ] Add to cart button functional

- [ ] **Filters & Search**
  - [ ] Category filter working
  - [ ] Sort by working (price, name, newest)
  - [ ] Search functionality working
  - [ ] URL params updating correctly

- [ ] **Product Detail**
  - [ ] Large product image displays
  - [ ] Full description shown
  - [ ] Quantity selector working
  - [ ] Add to cart with quantity working
  - [ ] Stock availability shown

- [ ] **State Management**
  - [ ] Cart updates when items added
  - [ ] Notifications show on add to cart
  - [ ] Loading states display correctly

### Testing Commands

```bash
# Start frontend
cd apps/web
npm run dev

# Test flows:
# 1. Browse products at /products
# 2. Filter by category
# 3. Search for products
# 4. Click product card
# 5. View product details
# 6. Add to cart with quantity
# 7. Verify cart badge updates
```

---

## 📦 Deliverables

1. ✅ Product listing page with grid
2. ✅ Product filters and sorting
3. ✅ Product search functionality
4. ✅ Product detail page
5. ✅ Add to cart functionality
6. ✅ Responsive design
7. ✅ Loading and error states

---

## 🔄 Next Session

**Session 8: Frontend - Shopping Cart & Checkout**

Will cover:

- Shopping cart page
- Cart item management
- Cart dropdown component
- Multi-step checkout process
- Order creation
- Payment UI (mock)

---

## 📚 Reference Documents

- `/DESIGN.md` - Design system
- Session 2 - Shared UI components
- Session 4 - Backend product API
- Modern Web Guidance - View Transitions for page navigation
