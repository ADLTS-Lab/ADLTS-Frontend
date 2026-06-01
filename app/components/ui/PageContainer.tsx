import { type ReactNode } from "react";

import { spacing } from "./design-tokens";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
  width?: "default" | "narrow" | "wide";
};

const widthClasses = {
  default: "max-w-5xl",
  narrow: "max-w-3xl",
  wide: "max-w-7xl",
};

export function PageContainer({ children, className = "", width = "default" }: PageContainerProps) {
  return <div className={`${widthClasses[width]} ${spacing.pageY} ${className}`}>{children}</div>;
}
