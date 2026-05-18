import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#3B82F6]/20 text-[#3B82F6]",
        secondary: "bg-[#06B6D4]/20 text-[#06B6D4]",
        success: "bg-[#22C55E]/20 text-[#22C55E]",
        warning: "bg-[#F59E0B]/20 text-[#F59E0B]",
        error: "bg-[#EF4444]/20 text-[#EF4444]",
        orange: "bg-orange-500/20 text-orange-400",
        purple: "bg-purple-500/20 text-purple-400",
        outline: "border border-[#334155] text-[#94A3B8]",
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
