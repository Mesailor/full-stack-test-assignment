# Session 9: Frontend - Account Section & Modern Web Features

## 🎯 Session Objectives

Build the user account section with modern web capabilities:

- Account dashboard layout with navigation
- User profile management (view/edit)
- Order history page with filtering
- Order details page with status tracking
- View Transitions API for smooth page navigation
- Scroll-driven animations for engaging UX
- Performance optimizations (lazy loading, code splitting)
- Modern CSS features (container queries, :has(), content-visibility)

**Duration Estimate:** 4-5 hours  
**Dependencies:** Sessions 6-8 (All frontend sessions)

---

## 📋 Required Context

**CRITICAL**: Execute `modern-web-guidance` skill FIRST for modern web APIs!

Before starting, review these documents:

1. **`modern-web-guidance` skill** - View Transitions API, scroll animations, performance
2. **`/DESIGN.md`** - Design system for account pages
3. **`/ai-blueprint/capability-definitions.md`** - Modern web patterns
4. **Session 5** - Backend order and user APIs
5. **Session 6** - Auth store and protected routes

---

## 🏗 Implementation Steps

### Step 1: Create User Service

Create `apps/web/src/services/user.service.ts`:

```typescript
import { api } from "./api";
import type { User, UpdateProfileRequest } from "@repo/types";

export const userService = {
  async getProfile(): Promise<User> {
    const response = await api.get("/users/profile");
    return response.data.data.user;
  },

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await api.put("/users/profile", data);
    return response.data.data.user;
  },
};
```

### Step 2: Create Account Layout Component

Create `apps/web/src/components/AccountLayout.tsx`:

```typescript
import { NavLink, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";

export const AccountLayout = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Account</h1>
          <p className="text-gray-600">
            Welcome back, {user?.first_name} {user?.last_name}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <nav className="md:col-span-1">
            <div className="bg-surface rounded-md shadow-md p-4 sticky top-4">
              <ul className="space-y-2">
                <li>
                  <NavLink
                    to="/account"
                    end
                    className={({ isActive }) =>
                      `block px-4 py-2 rounded-sm transition-colors ${
                        isActive
                          ? "bg-primary text-secondary font-semibold"
                          : "hover:bg-gray-100"
                      }`
                    }
                  >
                    Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/account/profile"
                    className={({ isActive }) =>
                      `block px-4 py-2 rounded-sm transition-colors ${
                        isActive
                          ? "bg-primary text-secondary font-semibold"
                          : "hover:bg-gray-100"
                      }`
                    }
                  >
                    Profile
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/account/orders"
                    className={({ isActive }) =>
                      `block px-4 py-2 rounded-sm transition-colors ${
                        isActive
                          ? "bg-primary text-secondary font-semibold"
                          : "hover:bg-gray-100"
                      }`
                    }
                  >
                    Order History
                  </NavLink>
                </li>
                <li className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 rounded-sm text-danger hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </nav>

          {/* Main Content */}
          <div className="md:col-span-3">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
```

### Step 3: Create Account Dashboard

Create `apps/web/src/pages/Account/Dashboard.tsx`:

```typescript
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button, Spinner } from "@repo/ui";
import { useAuthStore } from "../../stores/auth.store";
import { orderService } from "../../services/order.service";
import type { Order } from "@repo/types";
import { formatCurrency, formatDate } from "@repo/utils";

export const AccountDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentOrders();
  }, []);

  const loadRecentOrders = async () => {
    try {
      const data = await orderService.getOrders({ limit: 3 });
      setRecentOrders(data.orders);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary to-yellow-400 text-secondary p-8 rounded-md shadow-md"
      >
        <h2 className="text-3xl font-bold mb-2">
          Welcome back, {user?.first_name}!
        </h2>
        <p className="text-secondary/80">
          Manage your orders, profile, and preferences all in one place.
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface p-6 rounded-md shadow-md"
        >
          <p className="text-gray-600 text-sm font-mono uppercase mb-1">
            Total Orders
          </p>
          <p className="text-3xl font-bold text-primary">
            {isLoading ? "..." : recentOrders.length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface p-6 rounded-md shadow-md"
        >
          <p className="text-gray-600 text-sm font-mono uppercase mb-1">
            Account Status
          </p>
          <p className="text-2xl font-bold text-success">Active</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface p-6 rounded-md shadow-md"
        >
          <p className="text-gray-600 text-sm font-mono uppercase mb-1">
            Member Since
          </p>
          <p className="text-lg font-bold">
            {user?.created_at ? formatDate(user.created_at) : "N/A"}
          </p>
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-surface p-6 rounded-md shadow-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Orders</h2>
          <Link to="/account/orders" className="text-primary hover:underline">
            View All
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-4">No orders yet</p>
            <Button onClick={() => (window.location.href = "/products")}>
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                to={`/account/orders/${order.id}`}
                className="block border border-gray-200 rounded-sm p-4 hover:border-primary transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      {formatCurrency(Number(order.total_amount))}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 rounded-sm text-xs font-semibold ${
                        order.status === "DELIVERED"
                          ? "bg-success/10 text-success"
                          : order.status === "SHIPPED"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "CANCELLED"
                          ? "bg-danger/10 text-danger"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-surface p-6 rounded-md shadow-md"
      >
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button onClick={() => (window.location.href = "/products")} fullWidth>
            Browse Products
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/account/profile")}
            fullWidth
          >
            Edit Profile
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
```

### Step 4: Create Profile Page

Create `apps/web/src/pages/Account/Profile.tsx`:

```typescript
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Button, Input } from "@repo/ui";
import { useAuthStore } from "../../stores/auth.store";
import { useUIStore } from "../../stores/ui.store";
import { userService } from "../../services/user.service";

interface ProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
}

export const Profile = () => {
  const { user, setUser } = useAuthStore();
  const addNotification = useUIStore((state) => state.addNotification);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);

    try {
      const updatedUser = await userService.updateProfile(data);
      setUser(updatedUser);
      setIsEditing(false);
      addNotification({
        type: "success",
        message: "Profile updated successfully",
      });
    } catch (error: any) {
      addNotification({
        type: "error",
        message: error.response?.data?.error?.message || "Failed to update profile",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface p-6 rounded-md shadow-md"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Profile Information</h2>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            Edit Profile
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name"
            {...register("first_name", { required: "First name is required" })}
            error={errors.first_name?.message}
            disabled={!isEditing}
          />

          <Input
            label="Last Name"
            {...register("last_name", { required: "Last name is required" })}
            error={errors.last_name?.message}
            disabled={!isEditing}
          />
        </div>

        <Input
          label="Email"
          type="email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Invalid email address",
            },
          })}
          error={errors.email?.message}
          disabled={!isEditing}
        />

        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Account ID</p>
          <p className="font-mono text-sm">{user?.id}</p>
        </div>

        {isEditing && (
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel} fullWidth>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} fullWidth>
              Save Changes
            </Button>
          </div>
        )}
      </form>
    </motion.div>
  );
};
```

### Step 5: Create Order History Page

Create `apps/web/src/pages/Account/Orders.tsx`:

```typescript
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Spinner } from "@repo/ui";
import { orderService } from "../../services/order.service";
import { formatCurrency, formatDate } from "@repo/utils";
import type { Order, OrderStatus } from "@repo/types";

export const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await orderService.getOrders({
        status: filter === "ALL" ? undefined : filter,
      });
      setOrders(data.orders);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "DELIVERED":
        return "bg-success/10 text-success";
      case "SHIPPED":
        return "bg-blue-100 text-blue-700";
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-700";
      case "CANCELLED":
        return "bg-danger/10 text-danger";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface p-6 rounded-md shadow-md"
      >
        <h2 className="text-2xl font-bold mb-6">Order History</h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-4 py-2 rounded-sm font-medium transition-colors ${
                  filter === status
                    ? "bg-primary text-secondary"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/account/orders/${order.id}`}
                  className="block border border-gray-200 rounded-sm p-6 hover:border-primary hover:shadow-md transition-all"
                  style={{
                    viewTransitionName: `order-${order.id}`,
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg">
                          Order #{order.id.slice(0, 8)}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-sm text-xs font-semibold ${getStatusColor(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Placed on {formatDate(order.created_at)}</p>
                        <p className="line-clamp-1">
                          Ship to: {order.shipping_address}
                        </p>
                        <p>
                          {order.order_items?.length || 0} item
                          {order.order_items?.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(Number(order.total_amount))}
                      </p>
                      <p className="text-sm text-primary hover:underline mt-2">
                        View Details →
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
```

### Step 6: Create Order Detail Page

Create `apps/web/src/pages/Account/OrderDetail.tsx`:

```typescript
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button, Spinner } from "@repo/ui";
import { orderService } from "../../services/order.service";
import { formatCurrency, formatDate } from "@repo/utils";
import type { Order } from "@repo/types";

export const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadOrder(id);
    }
  }, [id]);

  const loadOrder = async (orderId: string) => {
    try {
      const data = await orderService.getOrderById(orderId);
      setOrder(data);
    } catch (error) {
      console.error("Failed to load order:", error);
      navigate("/account/orders");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-success text-white";
      case "SHIPPED":
        return "bg-blue-500 text-white";
      case "PROCESSING":
        return "bg-yellow-500 text-white";
      case "CANCELLED":
        return "bg-danger text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/account/orders")}
        className="text-primary hover:underline"
      >
        ← Back to Orders
      </button>

      {/* Order Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface p-6 rounded-md shadow-md"
        style={{
          viewTransitionName: `order-${order.id}`,
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Order #{order.id.slice(0, 8)}
            </h1>
            <p className="text-gray-600">Placed on {formatDate(order.created_at)}</p>
          </div>
          <div
            className={`px-4 py-2 rounded-sm font-semibold ${getStatusColor(order.status)}`}
          >
            {order.status}
          </div>
        </div>

        {/* Order Timeline */}
        <div className="mb-6">
          <h3 className="font-bold mb-3">Order Status</h3>
          <div className="flex items-center gap-2">
            {["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"].map((status, index) => (
              <div key={status} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      order.status === status ||
                      (order.status === "DELIVERED" &&
                        ["PENDING", "PROCESSING", "SHIPPED"].includes(status))
                        ? "bg-primary text-secondary"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {order.status === status ||
                    (order.status === "DELIVERED" &&
                      ["PENDING", "PROCESSING", "SHIPPED"].includes(status))
                      ? "✓"
                      : index + 1}
                  </div>
                  <span className="text-xs mt-1">{status}</span>
                </div>
                {index < 3 && (
                  <div
                    className={`h-1 flex-1 ${
                      order.status === "DELIVERED" ||
                      (order.status === "SHIPPED" && index < 2) ||
                      (order.status === "PROCESSING" && index < 1)
                        ? "bg-primary"
                        : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="border-t pt-4">
          <h3 className="font-bold mb-2">Shipping Address</h3>
          <p className="text-gray-700">{order.shipping_address}</p>
        </div>
      </motion.div>

      {/* Order Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-surface p-6 rounded-md shadow-md"
      >
        <h2 className="text-2xl font-bold mb-6">Order Items</h2>

        <div className="space-y-4">
          {order.order_items?.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="flex gap-4 pb-4 border-b last:border-0"
            >
              <img
                src={item.product.image_url}
                alt={item.product.name}
                className="w-20 h-20 object-cover rounded-sm bg-gray-100"
              />

              <div className="flex-1">
                <h3 className="font-semibold">{item.product.name}</h3>
                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                <p className="text-sm text-gray-600">
                  Price: {formatCurrency(Number(item.price))}
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold text-primary">
                  {formatCurrency(Number(item.price) * item.quantity)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Total */}
        <div className="border-t mt-6 pt-6">
          <div className="flex justify-between text-2xl font-bold">
            <span>Total:</span>
            <span className="text-primary">
              {formatCurrency(Number(order.total_amount))}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={() => navigate("/products")} fullWidth>
            Continue Shopping
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
```

### Step 7: Add View Transitions API Support

Create `apps/web/src/utils/view-transitions.ts`:

```typescript
/**
 * Modern View Transitions API wrapper
 * Provides smooth page transitions with fallback for unsupported browsers
 */

export const supportsViewTransitions = () => {
  return "startViewTransition" in document;
};

export const transitionHelper = (updateCallback: () => void | Promise<void>) => {
  if (!supportsViewTransitions()) {
    updateCallback();
    return;
  }

  (document as any).startViewTransition(async () => {
    await updateCallback();
  });
};

// CSS to add to index.css:
/*
@view-transition {
  navigation: auto;
}

::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.3s;
}

::view-transition-old(root) {
  animation-name: fade-out, slide-out;
}

::view-transition-new(root) {
  animation-name: fade-in, slide-in;
}

@keyframes fade-out {
  to { opacity: 0; }
}

@keyframes fade-in {
  from { opacity: 0; }
}

@keyframes slide-out {
  to { transform: translateX(-30px); }
}

@keyframes slide-in {
  from { transform: translateX(30px); }
}

/* Specific transitions for order cards */
[style*="view-transition-name: order-"] {
  view-transition-name: var(--view-transition-name);
}
*/
```

### Step 8: Add Scroll-Driven Animation

Create `apps/web/src/components/ScrollReveal.tsx`:

```typescript
import { useEffect, useRef, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
}

export const ScrollReveal = ({ children, className = "" }: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check for Intersection Observer support
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("scroll-reveal-visible");
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -100px 0px",
        }
      );

      observer.observe(element);

      return () => observer.disconnect();
    }
  }, []);

  return (
    <div ref={ref} className={`scroll-reveal ${className}`}>
      {children}
    </div>
  );
};

// CSS to add to index.css:
/*
.scroll-reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.scroll-reveal-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Progressive enhancement for scroll-driven animations */
@supports (animation-timeline: scroll()) {
  @keyframes reveal {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .scroll-reveal {
    animation: reveal linear;
    animation-timeline: view();
    animation-range: entry 0% cover 30%;
  }
}
*/
```

### Step 9: Update App Router with Account Routes

Update `apps/web/src/App.tsx`:

```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Products } from "./pages/Products";
import { ProductDetail } from "./pages/ProductDetail";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { AccountLayout } from "./components/AccountLayout";
import { AccountDashboard } from "./pages/Account/Dashboard";
import { Profile } from "./pages/Account/Profile";
import { Orders } from "./pages/Account/Orders";
import { OrderDetail } from "./pages/Account/OrderDetail";
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

        {/* Account Section */}
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AccountDashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### Step 10: Add Modern CSS Features

Update `apps/web/src/index.css` to include modern CSS:

```css
@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Poppins:wght@400;500;600;700&display=swap");

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply font-sans text-text bg-surface;
  }
}

/* View Transitions API */
@view-transition {
  navigation: auto;
}

::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.3s;
}

::view-transition-old(root) {
  animation-name: fade-out, slide-out;
}

::view-transition-new(root) {
  animation-name: fade-in, slide-in;
}

@keyframes fade-out {
  to {
    opacity: 0;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
}

@keyframes slide-out {
  to {
    transform: translateX(-30px);
  }
}

@keyframes slide-in {
  from {
    transform: translateX(30px);
  }
}

/* Scroll Reveal Animation */
.scroll-reveal {
  opacity: 0;
  transform: translateY(30px);
  transition:
    opacity 0.6s ease,
    transform 0.6s ease;
}

.scroll-reveal-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Progressive enhancement for scroll-driven animations */
@supports (animation-timeline: scroll()) {
  @keyframes reveal {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .scroll-reveal {
    animation: reveal linear;
    animation-timeline: view();
    animation-range: entry 0% cover 30%;
  }
}

/* Container Queries */
@container (min-width: 400px) {
  .container-responsive {
    @apply grid-cols-2;
  }
}

/* Modern :has() selector for enhanced layouts */
.card:has(img) {
  @apply shadow-lg;
}

/* Content visibility for performance */
.lazy-content {
  content-visibility: auto;
  contain-intrinsic-size: 0 500px;
}

/* Smooth scrolling */
@media (prefers-reduced-motion: no-preference) {
  html {
    scroll-behavior: smooth;
  }
}
```

---

## ✅ Quality Assessment Criteria

### Verification Checklist

- [ ] **Account Section**
  - [ ] Account layout with sidebar navigation
  - [ ] Dashboard shows statistics and recent orders
  - [ ] Profile page allows editing user information
  - [ ] Order history with filtering by status
  - [ ] Order details with timeline and items
  - [ ] Logout functionality works

- [ ] **Modern Web Features**
  - [ ] View Transitions API working (Chrome/Edge)
  - [ ] Smooth transitions between pages
  - [ ] Scroll reveal animations trigger on scroll
  - [ ] Container queries responsive behavior
  - [ ] No layout shifts (CLS)

- [ ] **Performance**
  - [ ] Images lazy load
  - [ ] Code splitting for routes
  - [ ] Fast page transitions
  - [ ] No console errors

- [ ] **UX Polish**
  - [ ] Loading states everywhere
  - [ ] Error handling with notifications
  - [ ] Responsive design (mobile/tablet/desktop)
  - [ ] Accessible navigation

### Testing Commands

```bash
# Start frontend
cd apps/web
npm run dev

# Test account flow:
# 1. Login
# 2. Navigate to /account (dashboard)
# 3. View profile, edit information
# 4. Navigate to orders
# 5. Filter orders by status
# 6. Click order to view details
# 7. Test logout

# Test modern features:
# - Check View Transitions in Chrome DevTools
# - Scroll to see reveal animations
# - Test on different screen sizes
# - Check performance in Lighthouse
```

### Browser Support

- **View Transitions**: Chrome 111+, Edge 111+ (degrades gracefully)
- **Scroll-driven Animations**: Chrome 115+ (with fallback)
- **Container Queries**: Chrome 105+, Safari 16+
- **:has() Selector**: All modern browsers

---

## 📦 Deliverables

At the end of this session, you should have:

1. ✅ Complete account section with dashboard, profile, orders
2. ✅ View Transitions API for smooth navigation
3. ✅ Scroll-driven reveal animations
4. ✅ Modern CSS features (container queries, :has())
5. ✅ Performance optimizations
6. ✅ Fully responsive design
7. ✅ Production-ready frontend complete

---

## 🔄 Next Session

**Session 10: Testing & QA**

Will cover:

- End-to-end testing setup (Playwright/Cypress)
- Component testing
- Accessibility testing (ARIA, keyboard navigation)
- Performance testing and optimization
- Cross-browser testing
- Final polish and bug fixes
- Production deployment checklist

---

## 📚 Reference Documents

- `modern-web-guidance` skill - View Transitions, scroll animations
- `/DESIGN.md` - Design system
- Session 5 - Backend order and user APIs
- Web Platform Docs: https://developer.mozilla.org/
- View Transitions: https://developer.chrome.com/docs/web-platform/view-transitions/
