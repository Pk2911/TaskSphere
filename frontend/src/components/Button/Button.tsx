import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  children: ReactNode;
};

export default function Button({
  variant = "primary",
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      {...props}
      type={props.type ?? "button"}
      disabled={disabled || loading}
      className={`rounded-md px-4 py-2 font-medium transition ${
        variantStyles[variant]
      } ${
        loading || disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}