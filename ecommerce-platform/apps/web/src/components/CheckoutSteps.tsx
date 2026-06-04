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
