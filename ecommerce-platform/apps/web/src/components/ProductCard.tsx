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
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
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
    </motion.div>
  );
};
