import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "caramel" | "glass" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg" | "xs";
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyle = "font-sans font-semibold rounded-lg transition-all duration-200 inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";
  
  const variants = {
    primary: "bg-[#741717] text-white hover:bg-[#5C1010] shadow-[0_4px_12px_rgba(116,23,23,0.15)] border border-transparent",
    secondary: "bg-[#8D695D] text-white hover:bg-[#725349] border border-transparent",
    caramel: "bg-[#8D695D] text-white hover:bg-[#725349] [text-shadow:none] font-bold shadow-[0_4px_12px_rgba(141,105,93,0.15)]",
    glass: "glass-button text-[#741717]",
    outline: "border border-[#8D695D] text-[#8D695D] hover:text-[#741717] hover:border-[#741717] hover:bg-[#F7F4F2] bg-transparent",
    danger: "bg-red-700 hover:bg-red-800 text-white border border-transparent",
    ghost: "bg-transparent hover:bg-[#F7F4F2] text-[#3A241E]"
  };

  const sizes = {
    xs: "px-2.5 py-1 text-xs",
    sm: "px-3.5 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3 text-base rounded-xl"
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
};
