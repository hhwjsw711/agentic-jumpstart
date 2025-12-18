import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const glassPanelVariants = cva(
  "glass rounded-2xl overflow-hidden",
  {
    variants: {
      variant: {
        default: "border border-slate-200/60 dark:border-white/[0.07]",
        cyan: "border border-cyan-600/30 dark:border-cyan-500/20 shadow-[0_0_15px_rgba(14,116,144,0.1)] dark:shadow-[0_0_15px_rgba(34,211,238,0.1)]",
        orange: "border border-orange-500/30 dark:border-orange-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)] dark:shadow-[0_0_15px_rgba(245,158,11,0.1)]",
        green: "border border-emerald-500/30 dark:border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] dark:shadow-[0_0_15px_rgba(16,185,129,0.1)]",
        red: "border border-red-500/30 dark:border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)] dark:shadow-[0_0_15px_rgba(239,68,68,0.1)]",
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "cyan",
      padding: "none",
    },
  }
);

export interface GlassPanelProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassPanelVariants> {}

const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, variant, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(glassPanelVariants({ variant, padding, className }))}
        {...props}
      />
    );
  }
);
GlassPanel.displayName = "GlassPanel";

export { GlassPanel, glassPanelVariants };
