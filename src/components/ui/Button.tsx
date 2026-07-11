<<<<<<< HEAD
import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { twMerge } from "tailwind-merge";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "success"
  | "warning"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg";
=======
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
<<<<<<< HEAD
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-blue-700 bg-blue-700 text-white hover:border-blue-800 hover:bg-blue-800",

  secondary:
    "border border-slate-900 bg-slate-900 text-white hover:border-slate-800 hover:bg-slate-800",

  outline:
    "border border-blue-700 bg-white text-blue-700 hover:bg-blue-50 hover:text-blue-800",

  ghost:
    "border border-transparent bg-transparent text-blue-700 hover:bg-blue-50 hover:text-blue-800",

  success:
    "border border-green-600 bg-green-600 text-white hover:border-green-700 hover:bg-green-700",

  warning:
    "border border-amber-500 bg-amber-500 text-slate-950 hover:border-amber-600 hover:bg-amber-600",

  danger:
    "border border-red-600 bg-red-600 text-white hover:border-red-700 hover:bg-red-700",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 py-2 text-sm",
  md: "min-h-11 px-5 py-2.5 text-sm",
  lg: "min-h-12 px-6 py-3 text-base",
=======
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-blue-700 text-white hover:bg-blue-800",
  secondary: "bg-slate-900 text-white hover:bg-slate-800",
  outline: "border border-slate-300 text-slate-700 hover:border-blue-700 hover:text-blue-700",
  ghost: "text-slate-700 hover:text-blue-700",
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
};

export default function Button({
  children,
  variant = "primary",
<<<<<<< HEAD
  size = "md",
  fullWidth = false,
  loading = false,
  disabled = false,
  type = "button",
  className = "",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={twMerge(
        "inline-flex items-center justify-center gap-2",
        "rounded-xl font-semibold",
        "transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm",
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-blue-500",
        "focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed",
        "disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? "w-full" : "",
        className
      )}
      {...props}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden="true"
        />
      )}

      <span>{loading ? "Please wait..." : children}</span>
=======
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl px-5 py-2.5 font-semibold transition ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
    </button>
  );
}