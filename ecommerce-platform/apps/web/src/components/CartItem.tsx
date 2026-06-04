import { motion } from "framer-motion";
import { formatCurrency } from "@repo/utils";
import { useCartStore } from "../stores/cart.store";

interface CartItemProps {
  item: {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
  };
}

export const CartItem = ({ item }: CartItemProps) => {
  const { updateQuantity, removeItem } = useCartStore();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(item.productId);
    } else {
      updateQuantity(item.productId, newQuantity);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex gap-4 bg-surface p-4 rounded-md shadow-sm border border-gray-200"
      data-testid="cart-item"
    >
      <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-sm overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1">
        <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
        <p className="text-primary font-bold text-xl">
          {formatCurrency(item.price)}
        </p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center border border-gray-300 rounded-sm">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            className="px-3 py-1 hover:bg-gray-100 transition-colors"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="px-4 py-1 border-x border-gray-300 min-w-[3rem] text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            className="px-3 py-1 hover:bg-gray-100 transition-colors"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <p className="text-gray-600 text-sm">
          Subtotal: {formatCurrency(item.price * item.quantity)}
        </p>

        <button
          onClick={() => removeItem(item.productId)}
          className="text-danger hover:underline text-sm"
        >
          Remove
        </button>
      </div>
    </motion.div>
  );
};
