import React from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";

interface VerifiedBadgeProps {
  type: "student" | "organization";
  className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ type, className = "" }) => {
  const isStudent = type === "student";

  // Tailored color themes aligning with the Collivio warm/terracotta/gold canvas archetype:
  // - Students: Soft Emerald theme for verified credentials.
  // - Organizations: Soft Amber/Gold theme for business/partner prestige.
  const bgClass = isStudent
    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-400"
    : "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-400";

  return (
    <motion.span
      id={`verified-badge-${type}`}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ 
        opacity: 1, 
        scale: [0.7, 1.08, 1] 
      }}
      transition={{
        duration: 0.45,
        ease: "easeOut",
      }}
      className={`inline-flex items-center justify-center border text-[9px] font-mono font-black uppercase rounded-full select-none px-2 py-0.5 tracking-wider ${bgClass} ${className}`}
    >
      {/* Repeating continuous pulse loop that begins immediately after entrance */}
      <motion.span
        className="flex items-center gap-1"
        animate={{
          scale: [1, 1.04, 1],
        }}
        transition={{
          duration: 2.0,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      >
        <Check size={10} className="stroke-[3.5] shrink-0" />
        <span>{isStudent ? "Verified Student" : "Verified Org"}</span>
      </motion.span>
    </motion.span>
  );
};
