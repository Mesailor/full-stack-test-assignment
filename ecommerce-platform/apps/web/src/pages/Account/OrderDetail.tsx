import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button, Spinner } from "@repo/ui";
import { orderService } from "../../services/order.service";
import { formatCurrency, formatDate } from "@repo/utils";
import type { Order } from "@repo/types";
import { OrderStatus } from "@repo/types";

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

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED:
        return "bg-success text-white";
      case OrderStatus.SHIPPED:
        return "bg-blue-500 text-white";
      case OrderStatus.PROCESSING:
        return "bg-yellow-500 text-white";
      case OrderStatus.CANCELLED:
        return "bg-danger text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const timelineStatuses = [
    OrderStatus.PENDING,
    OrderStatus.PROCESSING,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
  ];

  const isStatusReached = (status: OrderStatus) => {
    const currentIndex = timelineStatuses.indexOf(order.status);
    const targetIndex = timelineStatuses.indexOf(status);
    return currentIndex >= targetIndex && currentIndex !== -1;
  };

  const isConnectorFilled = (index: number) => {
    if (order.status === OrderStatus.DELIVERED) return true;
    if (order.status === OrderStatus.SHIPPED && index < 2) return true;
    if (order.status === OrderStatus.PROCESSING && index < 1) return true;
    return false;
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
            {timelineStatuses.map((status, index) => (
              <div key={status} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      isStatusReached(status)
                        ? "bg-primary text-secondary"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {isStatusReached(status) ? "✓" : index + 1}
                  </div>
                  <span className="text-xs mt-1">{status}</span>
                </div>
                {index < timelineStatuses.length - 1 && (
                  <div
                    className={`h-1 flex-1 ${
                      isConnectorFilled(index) ? "bg-primary" : "bg-gray-300"
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
                src={item.product?.image_url}
                alt={item.product?.name}
                className="w-20 h-20 object-cover rounded-sm bg-gray-100"
              />

              <div className="flex-1">
                <h3 className="font-semibold">{item.product?.name}</h3>
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
