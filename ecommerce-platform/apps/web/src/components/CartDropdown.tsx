import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@repo/ui";
import { formatCurrency } from "@repo/utils";
import { useCartStore } from "../stores/cart.store";
import { useUIStore } from "../stores/ui.store";

export const CartDropdown = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, getTotalItems } = useCartStore();
  const { isCartOpen, closeCart } = useUIStore();

  const handleCheckout = () => {
    closeCart();
    navigate("/checkout");
  };

  const handleViewCart = () => {
    closeCart();
    navigate("/cart");
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={closeCart}
          />

          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-surface shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">
                Shopping Cart ({getTotalItems()})
              </h2>
              <button
                onClick={closeCart}
                className="text-gray-500 hover:text-gray-700 text-3xl"
                aria-label="Close cart"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <p className="text-lg">Your cart is empty</p>
                  <Button
                    onClick={() => {
                      closeCart();
                      navigate("/products");
                    }}
                    className="mt-4"
                  >
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 pb-4 border-b border-gray-200 last:border-0"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-sm bg-gray-100"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{item.name}</h3>
                        <p className="text-gray-600 text-sm">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-primary font-bold">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t p-6 space-y-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-primary">
                    {formatCurrency(getTotalPrice())}
                  </span>
                </div>

                <div className="space-y-2">
                  <Button onClick={handleCheckout} fullWidth size="lg">
                    Checkout
                  </Button>
                  <Button onClick={handleViewCart} variant="outline" fullWidth>
                    View Cart
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
