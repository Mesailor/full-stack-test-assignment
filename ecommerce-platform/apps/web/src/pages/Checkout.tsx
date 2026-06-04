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
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(
    null,
  );

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

  if (items.length === 0 && currentStep < 4) {
    navigate("/cart");
    return null;
  }

  const onShippingSubmit = (data: ShippingFormData) => {
    setShippingData(data);
    setCurrentStep(3);
  };

  const onPaymentSubmit = async (_data: PaymentFormData) => {
    setIsSubmitting(true);

    try {
      const shippingAddress = `${shippingData!.fullName}, ${shippingData!.address}, ${shippingData!.city}, ${shippingData!.state} ${shippingData!.zipCode}, ${shippingData!.country}`;

      const order = await orderService.createOrder({
        shipping_address: shippingAddress,
        items: items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        total_amount: getTotalPrice(),
      });

      clearCart();

      addNotification({
        type: "success",
        message: "Order placed successfully!",
      });

      setCurrentStep(4);

      setTimeout(() => {
        navigate(`/account/orders/${order.id}`);
      }, 3000);
    } catch (error: any) {
      addNotification({
        type: "error",
        message:
          error.response?.data?.error?.message || "Failed to place order",
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
                <div
                  key={item.id}
                  className="flex items-center gap-4 pb-4 border-b"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-sm bg-gray-100"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-gray-600 text-sm">
                      Quantity: {item.quantity}
                    </p>
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
                <span className="text-primary">
                  {formatCurrency(getTotalPrice())}
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/cart")}
                fullWidth
              >
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

            <form
              onSubmit={handleShippingSubmit(onShippingSubmit)}
              className="space-y-4"
            >
              <Input
                label="Full Name"
                {...registerShipping("fullName", {
                  required: "Full name is required",
                })}
                error={shippingErrors.fullName?.message}
              />

              <Input
                label="Address"
                {...registerShipping("address", {
                  required: "Address is required",
                })}
                error={shippingErrors.address?.message}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  {...registerShipping("city", {
                    required: "City is required",
                  })}
                  error={shippingErrors.city?.message}
                />
                <Input
                  label="State/Province"
                  {...registerShipping("state", {
                    required: "State is required",
                  })}
                  error={shippingErrors.state?.message}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="ZIP/Postal Code"
                  {...registerShipping("zipCode", {
                    required: "ZIP code is required",
                  })}
                  error={shippingErrors.zipCode?.message}
                />
                <Input
                  label="Country"
                  {...registerShipping("country", {
                    required: "Country is required",
                  })}
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
                <strong>Note:</strong> This is a demo payment form. No actual
                payment will be processed.
              </p>
            </div>

            <form
              onSubmit={handlePaymentSubmit(onPaymentSubmit)}
              className="space-y-4"
            >
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
                {...registerPayment("cardName", {
                  required: "Cardholder name is required",
                })}
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
                  <span className="text-primary">
                    {formatCurrency(getTotalPrice())}
                  </span>
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

            <h2 className="text-3xl font-bold mb-4 text-success">
              Order Placed Successfully!
            </h2>
            <p className="text-gray-600 mb-8">
              Thank you for your purchase. You will receive an order
              confirmation email shortly.
            </p>

            <div className="space-y-3">
              <Button onClick={() => navigate("/account/orders")} fullWidth>
                View Order History
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/products")}
                fullWidth
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
