import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button, Spinner } from "@repo/ui";
import { useAuthStore } from "../../stores/auth.store";
import { orderService } from "../../services/order.service";
import type { Order } from "@repo/types";
import { formatCurrency, formatDate } from "@repo/utils";

export const AccountDashboard = () => {
  const navigate = useNavigate();
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
            <Button onClick={() => navigate("/products")}>
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
          <Button onClick={() => navigate("/products")} fullWidth>
            Browse Products
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/account/profile")}
            fullWidth
          >
            Edit Profile
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
