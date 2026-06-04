import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Button } from "@repo/ui";
import { formatCurrency } from "@repo/utils";
import { useCartStore } from "../stores/cart.store";
import { CartItem } from "../components/CartItem";

export const Cart = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, getTotalItems, clearCart } = useCartStore();

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      clearCart();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Shopping Cart</h1>
          {items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-danger hover:underline"
            >
              Clear Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-surface p-12 rounded-md shadow-md text-center">
            <p className="text-xl text-gray-600 mb-6">Your cart is empty</p>
            <Button onClick={() => navigate("/products")}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-surface p-6 rounded-md shadow-md sticky top-4">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Items ({getTotalItems()}):
                    </span>
                    <span>{formatCurrency(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="text-success">FREE</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-primary">
                      {formatCurrency(getTotalPrice())}
                    </span>
                  </div>
                </div>

                <Button onClick={handleCheckout} fullWidth size="lg">
                  Proceed to Checkout
                </Button>

                <button
                  onClick={() => navigate("/products")}
                  className="w-full mt-3 text-primary hover:underline"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
