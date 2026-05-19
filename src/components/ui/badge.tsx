import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/20 text-primary",
        secondary: "bg-secondary/20 text-secondary",
        success: "bg-success/20 text-success",
        warning: "bg-warning/20 text-warning",
        error: "bg-error/20 text-error",
        orange: "bg-orange-500/20 text-orange-600 dark:text-orange-400",
        purple: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
        outline: "border border-border text-text-secondary",
        white: "bg-white/20 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
