import React from "react";
import { CollivioLogo } from "../../components/CollivioLogo";

export interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  light?: boolean;
}

export default function Logo(props: LogoProps) {
  return <CollivioLogo {...props} />;
}
