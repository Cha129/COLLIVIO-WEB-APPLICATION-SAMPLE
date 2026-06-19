import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "glass" | "glass-light" | "solid";
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "glass",
  hoverEffect = false,
  className = "",
  ...props
}) => {
  const baseStyle = "rounded-xl p-5 border transition-all duration-300";
  
  const variants = {
    glass: "glass-panel shadow-[0_10px_30px_rgba(96,58,48,0.08)]",
    "glass-light": "glass-panel-light shadow-[0_4px_16px_rgba(96,58,48,0.04)]",
    solid: "bg-[#741717] border-[#603A30] text-white shadow-md"
  };

  const hoverStyle = hoverEffect 
    ? "hover:border-caramel/40 hover:shadow-[0_8px_32px_rgba(141,105,93,0.15)] hover:scale-[1.01]" 
    : "";

  return (
    <div
      className={`${baseStyle} ${variants[variant]} ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
