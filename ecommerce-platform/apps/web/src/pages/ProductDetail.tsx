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
