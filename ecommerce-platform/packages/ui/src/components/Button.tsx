import { ButtonHTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = ({
  variant = "primary",
  size = "md",
  children,
  isLoading = false,
  fullWidth = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) => {
  const baseClasses =
    "font-sans font-semibold rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary: "bg-primary text-secondary hover:bg-yellow-500 focus:ring-primary",
    secondary:
      "bg-secondary text-surface hover:bg-gray-800 focus:ring-secondary",
    outline:
      "border-2 border-secondary text-secondary hover:bg-secondary hover:text-surface focus:ring-secondary",
    danger: "bg-danger text-surface hover:bg-red-700 focus:ring-danger",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      type={props.type}
      onClick={props.onClick}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
      aria-label={props["aria-label"]}
      tabIndex={props.tabIndex}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
};
