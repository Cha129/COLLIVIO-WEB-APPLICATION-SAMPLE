import React from "react";
import { motion } from "motion/react";

interface CollivioLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  light?: boolean;
}

export const CollivioLogo: React.FC<CollivioLogoProps> = ({
  className = "",
  size = "md",
  showTagline = true,
  light = false,
}) => {
  // Dimensions mapping
  const logoDimensions = {
    sm: { globe: "w-8 h-8", text: "text-lg", tagline: "text-[6px]" },
    md: { globe: "w-11 h-11", text: "text-2xl", tagline: "text-[8px]" },
    lg: { globe: "w-16 h-16", text: "text-3xl", tagline: "text-[10px]" },
    xl: { globe: "w-28 h-28", text: "text-5xl", tagline: "text-[13px]" },
  };

  const dim = logoDimensions[size];

  return (
    <motion.div
      className={`flex flex-col items-center justify-center text-center ${className} select-none`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* ── 3D GLOWING GLOBE BRAND SYMBOL (SVGs exactly mirroring uploaded illustration) ── */}
      <motion.div
        className={`${dim.globe} relative flex items-center justify-center`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        {/* Soft elegant glowing particle background layer */}
        <div className="absolute inset-0 bg-red-wine/10 blur-xl rounded-full scale-125 hover:bg-caramel/15 transition-all duration-300" />
        
        {/* Crisp globe rendering with accurate coordinates lines */}
        <svg
          viewBox="0 0 100 100"
          className={`w-full h-full stroke-current ${
            light ? "text-white" : "text-chestnut"
          }`}
          fill="none"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Outer Ring */}
          <circle cx="50" cy="50" r="43" strokeWidth="4.5" />
          
          {/* Main Equator Line */}
          <line x1="7" y1="50" x2="93" y2="50" strokeWidth="3" />
          
          {/* Curved Latitudes (Slight horizontal elliptic arches) */}
          <path d="M12 30 C30 38, 70 38, 88 30" strokeWidth="2.5" />
          <path d="M12 70 C30 62, 70 62, 88 70" strokeWidth="2.5" />
          
          {/* Curved Longitudes (Vertical coordinates looking like a premium lens) */}
          {/* Center line */}
          <line x1="50" y1="7" x2="50" y2="93" strokeWidth="3" />
          {/* Left curved longitude line */}
          <path d="M50 7 C25 25, 25 75, 50 93" strokeWidth="3.5" />
          {/* Right curved longitude line */}
          <path d="M50 7 C75 25, 75 75, 50 93" strokeWidth="3.5" />
        </svg>
      </motion.div>

      {/* ── BEAUTIFUL SCRIPTY CALLIGRAPHIC/ACADEMIC TYPOGRAPHY ── */}
      <div className="mt-2.5 flex flex-col items-center">
        <h1 
          className={`font-display tracking-tight font-bold ${dim.text} leading-none ${
            light 
              ? "text-white [text-shadow:0_2px_10px_rgba(255,255,255,0.15)]" 
              : "text-red-wine bg-gradient-to-r from-red-wine to-caramel bg-clip-text text-transparent"
          }`}
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Collivio
        </h1>

        {/* ── CRISP BRAND TAGLINE "THINK IT. DROP IT. BUILD IT." ── */}
        {showTagline && (
          <p 
            className={`font-mono uppercase font-bold tracking-[0.25em] leading-none mt-2 ${
              light ? "text-white/60" : "text-chestnut/70"
            } ${dim.tagline}`}
          >
            Think it. Drop it. Build it.
          </p>
        )}
      </div>
    </motion.div>
  );
};
