import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Spinner } from "@repo/ui";
import { orderService } from "../../services/order.service";
import { formatCurrency, formatDate } from "@repo/utils";
import type { Order } from "@repo/types";
import { OrderStatus } from "@repo/types";

type FilterStatus = OrderStatus | "ALL";

export const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("ALL");

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
      case OrderStatus.DELIVERED:
        return "bg-success/10 text-success";
      case OrderStatus.SHIPPED:
        return "bg-blue-100 text-blue-700";
      case OrderStatus.PROCESSING:
        return "bg-yellow-100 text-yellow-700";
      case OrderStatus.CANCELLED:
        return "bg-danger/10 text-danger";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filterOptions: FilterStatus[] = [
    "ALL",
    OrderStatus.PENDING,
    OrderStatus.PROCESSING,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
  ];

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
          {filterOptions.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-sm font-medium transition-colors ${
                filter === status
                  ? "bg-primary text-secondary"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {status}
            </button>
          ))}
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
