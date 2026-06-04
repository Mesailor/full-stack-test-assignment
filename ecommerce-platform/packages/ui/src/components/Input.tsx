import { forwardRef, InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, name, ...props }, ref) => {
    const inputId = id || name;

    const inputClasses = `
      w-full px-4 py-2 border rounded-sm
      font-sans text-base
      focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
      disabled:bg-gray-100 disabled:cursor-not-allowed
      ${error ? "border-danger" : "border-gray-300"}
      ${className}
    `;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="font-mono text-label-caps uppercase text-text font-medium"
          >
            {label}
          </label>
        )}
        <input id={inputId} name={name} ref={ref} className={inputClasses} {...props} />
        {error && <span className="text-danger text-sm">{error}</span>}
        {helperText && !error && (
          <span className="text-gray-500 text-sm">{helperText}</span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
