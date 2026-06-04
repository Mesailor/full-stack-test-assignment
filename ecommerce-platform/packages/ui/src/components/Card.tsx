import { ReactNode } from "react";
import { motion } from "framer-motion";

export interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card = ({
  children,
  className = "",
  hover = false,
  padding = "md",
}: CardProps) => {
  const paddingClasses = {
    none: "",
    sm: "p-2",
    md: "p-4",
    lg: "p-6",
  };

  const baseClasses = `bg-surface rounded-md shadow-md ${paddingClasses[padding]} ${className}`;

  if (hover) {
    return (
      <motion.div
        className={baseClasses}
        whileHover={{
          y: -4,
          boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
        }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={baseClasses}>{children}</div>;
};
