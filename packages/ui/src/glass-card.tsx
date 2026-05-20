import * as React from "react";
import { cn } from "./utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, glow = false, intensity = 'medium', ...props }, ref) => {
    const intensities = {
      low: "bg-card/40 backdrop-blur-sm",
      medium: "bg-card/60 backdrop-blur-md",
      high: "bg-card/80 backdrop-blur-xl",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-white/10 shadow-2xl transition-all",
          intensities[intensity],
          glow && "shadow-[0_0_20px_rgba(0,255,65,0.1)] border-primary/20",
          className
        )}
        {...props}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";

export { GlassCard };
