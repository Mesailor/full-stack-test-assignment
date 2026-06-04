# Session 8: Frontend - Shopping Cart & Checkout

## 🎯 Session Objectives

Build the complete shopping cart and checkout experience:

- Shopping cart page with item management
- Cart dropdown component in header
- Multi-step checkout flow (review → shipping → payment → confirmation)
- Order creation and submission
- Cart synchronization with backend
- Payment UI (mock for demonstration)
- Order confirmation page

**Duration Estimate:** 3-4 hours  
**Dependencies:** Sessions 6-7 (Frontend core, auth, products)

---

## 📋 Required Context

**IMPORTANT**: Execute `modern-web-guidance` skill for modern checkout UX patterns!

Before starting, review these documents:

1. **`/DESIGN.md`** - Design system for forms and checkout UI
2. **`/ai-blueprint/capability-definitions.md`** - Cart patterns and API structure
3. **Session 4** - Backend cart and order APIs
4. **Session 6** - Zustand cart store implementation
5. **Session 7** - Product components for cart items

---

## 🏗 Implementation Steps

### Step 1: Create Cart Service

Create `apps/web/src/services/cart.service.ts`:

```typescript
import { api } from "./api";
import type { CartResponse, AddToCartRequest } from "@repo/types";

export const cartService = {
  async getCart(): Promise<CartResponse> {
    const response = await api.get("/cart");
    return response.data.data;
  },

  async addItem(data: AddToCartRequest) {
    const response = await api.post("/cart/items", data);
    return response.data.data.item;
  },

  async updateItem(itemId: string, quantity: number) {
    const response = await api.put(`/cart/items/${itemId}`, { quantity });
    return response.data.data.item;
  },

  async removeItem(itemId: string) {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data.data;
  },

  async clearCart() {
    const response = await api.delete("/cart");
    return response.data.data;
  },
};
```

### Step 2: Create Order Service

Create `apps/web/src/services/order.service.ts`:

```typescript
import { api } from "./api";
import type { CreateOrderRequest, Order } from "@repo/types";

export const orderService = {
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    const response = await api.post("/orders", data);
    return response.data.data.order;
  },

  async getOrders(params?: { status?: string; page?: number; limit?: number }) {
    const response = await api.get("/orders", { params });
    return response.data.data;
  },

  async getOrderById(orderId: string): Promise<Order> {
    const response = await api.get(`/orders/${orderId}`);
    return response.data.data.order;
  },
};
```

### Step 3: Create Cart Item Component

Create `apps/web/src/components/CartItem.tsx`:

```typescript
import { motion } from "framer-motion";
import { Button } from "@repo/ui";
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
    >
      {/* Product Image */}
      <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-sm overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1">
        <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
        <p className="text-primary font-bold text-xl">
          {formatCurrency(item.price)}
        </p>
      </div>

      {/* Quantity Controls */}
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
```

### Step 4: Create Cart Dropdown Component

Create `apps/web/src/components/CartDropdown.tsx`:

```typescript
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={closeCart}
          />

          {/* Dropdown */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-surface shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
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

            {/* Cart Items */}
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

            {/* Footer */}
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
                  <Button
                    onClick={handleViewCart}
                    variant="outline"
                    fullWidth
                  >
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
```

### Step 5: Create Shopping Cart Page

Create `apps/web/src/pages/Cart.tsx`:

```typescript
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
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-surface p-6 rounded-md shadow-md sticky top-4">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items ({getTotalItems()}):</span>
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
```

### Step 6: Create Checkout Components

Create `apps/web/src/components/CheckoutSteps.tsx`:

```typescript
interface CheckoutStepsProps {
  currentStep: number;
}

const steps = [
  { number: 1, label: "Review Cart" },
  { number: 2, label: "Shipping" },
  { number: 3, label: "Payment" },
  { number: 4, label: "Confirmation" },
];

export const CheckoutSteps = ({ currentStep }: CheckoutStepsProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${
                  currentStep >= step.number
                    ? "bg-primary text-secondary"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {currentStep > step.number ? "✓" : step.number}
              </div>
              <span
                className={`text-sm font-medium ${
                  currentStep >= step.number ? "text-primary" : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`h-1 flex-1 mx-2 ${
                  currentStep > step.number ? "bg-primary" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Step 7: Create Checkout Page

Create `apps/web/src/pages/Checkout.tsx`:

```typescript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button, Input } from "@repo/ui";
import { formatCurrency } from "@repo/utils";
import { useCartStore } from "../stores/cart.store";
import { useUIStore } from "../stores/ui.store";
import { orderService } from "../services/order.service";
import { CheckoutSteps } from "../components/CheckoutSteps";

interface ShippingFormData {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PaymentFormData {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
}

export const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { addNotification } = useUIStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);

  const {
    register: registerShipping,
    handleSubmit: handleShippingSubmit,
    formState: { errors: shippingErrors },
  } = useForm<ShippingFormData>();

  const {
    register: registerPayment,
    handleSubmit: handlePaymentSubmit,
    formState: { errors: paymentErrors },
  } = useForm<PaymentFormData>();

  // Redirect if cart is empty
  if (items.length === 0 && currentStep < 4) {
    navigate("/cart");
    return null;
  }

  const onShippingSubmit = (data: ShippingFormData) => {
    setShippingData(data);
    setCurrentStep(3);
  };

  const onPaymentSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true);

    try {
      // Create shipping address string
      const shippingAddress = `${shippingData!.fullName}, ${shippingData!.address}, ${shippingData!.city}, ${shippingData!.state} ${shippingData!.zipCode}, ${shippingData!.country}`;

      // Create order
      const order = await orderService.createOrder({
        shipping_address: shippingAddress,
        items: items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        total_amount: getTotalPrice(),
      });

      // Clear cart
      clearCart();

      // Show success notification
      addNotification({
        type: "success",
        message: "Order placed successfully!",
      });

      // Move to confirmation step
      setCurrentStep(4);

      // Navigate to order details after delay
      setTimeout(() => {
        navigate(`/account/orders/${order.id}`);
      }, 3000);
    } catch (error: any) {
      addNotification({
        type: "error",
        message: error.response?.data?.error?.message || "Failed to place order",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <CheckoutSteps currentStep={currentStep} />

        {/* Step 1: Review Cart */}
        {currentStep === 1 && (
          <div className="bg-surface p-6 rounded-md shadow-md">
            <h2 className="text-2xl font-bold mb-6">Review Your Items</h2>

            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 pb-4 border-b">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-sm bg-gray-100"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span className="text-primary">{formatCurrency(getTotalPrice())}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => navigate("/cart")} fullWidth>
                Back to Cart
              </Button>
              <Button onClick={() => setCurrentStep(2)} fullWidth>
                Continue to Shipping
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Shipping Information */}
        {currentStep === 2 && (
          <div className="bg-surface p-6 rounded-md shadow-md">
            <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>

            <form onSubmit={handleShippingSubmit(onShippingSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                {...registerShipping("fullName", { required: "Full name is required" })}
                error={shippingErrors.fullName?.message}
              />

              <Input
                label="Address"
                {...registerShipping("address", { required: "Address is required" })}
                error={shippingErrors.address?.message}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  {...registerShipping("city", { required: "City is required" })}
                  error={shippingErrors.city?.message}
                />
                <Input
                  label="State/Province"
                  {...registerShipping("state", { required: "State is required" })}
                  error={shippingErrors.state?.message}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="ZIP/Postal Code"
                  {...registerShipping("zipCode", { required: "ZIP code is required" })}
                  error={shippingErrors.zipCode?.message}
                />
                <Input
                  label="Country"
                  {...registerShipping("country", { required: "Country is required" })}
                  error={shippingErrors.country?.message}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  fullWidth
                >
                  Back
                </Button>
                <Button type="submit" fullWidth>
                  Continue to Payment
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Payment Information */}
        {currentStep === 3 && (
          <div className="bg-surface p-6 rounded-md shadow-md">
            <h2 className="text-2xl font-bold mb-6">Payment Information</h2>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-sm mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This is a demo payment form. No actual payment will be processed.
              </p>
            </div>

            <form onSubmit={handlePaymentSubmit(onPaymentSubmit)} className="space-y-4">
              <Input
                label="Card Number"
                placeholder="1234 5678 9012 3456"
                {...registerPayment("cardNumber", {
                  required: "Card number is required",
                  pattern: {
                    value: /^\d{16}$/,
                    message: "Card number must be 16 digits",
                  },
                })}
                error={paymentErrors.cardNumber?.message}
              />

              <Input
                label="Cardholder Name"
                {...registerPayment("cardName", { required: "Cardholder name is required" })}
                error={paymentErrors.cardName?.message}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Expiry Date"
                  placeholder="MM/YY"
                  {...registerPayment("expiryDate", {
                    required: "Expiry date is required",
                    pattern: {
                      value: /^(0[1-9]|1[0-2])\/\d{2}$/,
                      message: "Format: MM/YY",
                    },
                  })}
                  error={paymentErrors.expiryDate?.message}
                />
                <Input
                  label="CVV"
                  placeholder="123"
                  {...registerPayment("cvv", {
                    required: "CVV is required",
                    pattern: {
                      value: /^\d{3,4}$/,
                      message: "CVV must be 3-4 digits",
                    },
                  })}
                  error={paymentErrors.cvv?.message}
                />
              </div>

              <div className="border-t pt-4 mt-6">
                <div className="flex justify-between text-xl font-bold mb-6">
                  <span>Total to Pay:</span>
                  <span className="text-primary">{formatCurrency(getTotalPrice())}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  fullWidth
                >
                  Back
                </Button>
                <Button type="submit" isLoading={isSubmitting} fullWidth>
                  Place Order
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Step 4: Order Confirmation */}
        {currentStep === 4 && (
          <div className="bg-surface p-12 rounded-md shadow-md text-center">
            <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h2 className="text-3xl font-bold mb-4 text-success">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-8">
              Thank you for your purchase. You will receive an order confirmation email shortly.
            </p>

            <div className="space-y-3">
              <Button onClick={() => navigate("/account/orders")} fullWidth>
                View Order History
              </Button>
              <Button variant="outline" onClick={() => navigate("/products")} fullWidth>
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
```

### Step 8: Update App Router

Update `apps/web/src/App.tsx` to include cart and checkout routes:

```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Products } from "./pages/Products";
import { ProductDetail } from "./pages/ProductDetail";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CartDropdown } from "./components/CartDropdown";

function App() {
  return (
    <BrowserRouter>
      <CartDropdown />

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

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
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

- [ ] **Shopping Cart Page**
  - [ ] Cart items display correctly with images
  - [ ] Quantity controls work (increment/decrement)
  - [ ] Remove item functionality works
  - [ ] Clear cart confirmation works
  - [ ] Cart total calculates correctly
  - [ ] Empty cart state displays correctly

- [ ] **Cart Dropdown**
  - [ ] Opens/closes smoothly with animation
  - [ ] Displays cart items in compact format
  - [ ] Shows cart total
  - [ ] Navigate to cart and checkout buttons work
  - [ ] Backdrop dismisses dropdown

- [ ] **Checkout Flow**
  - [ ] Multi-step progress indicator works
  - [ ] Cart review step shows all items
  - [ ] Shipping form validates all fields
  - [ ] Payment form validates card details
  - [ ] Order submission creates order in backend
  - [ ] Cart clears after successful order
  - [ ] Confirmation page displays success message
  - [ ] Navigation between steps works

- [ ] **Integration**
  - [ ] Cart syncs with Zustand store
  - [ ] Order API calls work correctly
  - [ ] Error handling displays messages
  - [ ] Loading states show during submission

### Testing Commands

```bash
# Start frontend
cd apps/web
npm run dev

# Test complete flow:
# 1. Add items to cart from product pages
# 2. Open cart dropdown from header
# 3. Navigate to full cart page
# 4. Update quantities
# 5. Remove items
# 6. Proceed to checkout
# 7. Fill shipping information
# 8. Fill payment information (use dummy data)
# 9. Complete order
# 10. Verify order appears in account

# Test cart badge:
# - Badge should show total item count
# - Updates when items added/removed
```

### Expected User Flows

1. **Add to Cart Flow:**
   - Click "Add to Cart" on product → Item added to cart → Cart badge updates → Notification shows

2. **Cart Management Flow:**
   - View cart → Update quantities → Remove items → See updated totals

3. **Checkout Flow:**
   - Review cart → Enter shipping → Enter payment → Order confirmation → Redirect to orders

---

## 📦 Deliverables

At the end of this session, you should have:

1. ✅ Shopping cart page with full item management
2. ✅ Cart dropdown component with animations
3. ✅ Multi-step checkout process (4 steps)
4. ✅ Order creation and submission
5. ✅ Form validation on all checkout steps
6. ✅ Order confirmation page
7. ✅ Complete cart and checkout flow working end-to-end
8. ✅ Responsive design for all cart pages

---

## 🔄 Next Session

**Session 9: Account Section & Modern Web Features**

Will cover:

- Account dashboard layout
- Profile management page
- Order history with status tracking
- Order details page
- View Transitions API for smooth navigation
- Scroll-driven animations
- Performance optimizations
- Modern CSS features

---

## 📚 Reference Documents

- `/DESIGN.md` - Design system for forms and checkout
- `/ai-blueprint/capability-definitions.md` - Cart and order patterns
- Session 4 - Backend cart and order APIs
- Session 6 - Zustand stores
- Modern Web Guidance - Checkout UX patterns
