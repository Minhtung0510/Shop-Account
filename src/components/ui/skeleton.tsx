"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "text" | "circular";
  width?: string | number;
  height?: string | number;
}

function Skeleton({
  className,
  variant = "default",
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-skeleton rounded-[12px]",
        variant === "circular" && "rounded-full",
        variant === "text" && "h-4 rounded",
        className
      )}
      style={{
        width,
        height: variant === "text" ? undefined : height,
        ...style,
      }}
      {...props}
    />
  );
}

export { Skeleton };
