import { RefreshCcw } from "lucide-react";
import { Button, GlassCard, cn } from "@repo/ui";

interface Specimen {
  id: number;
  name: string;
  health: number;
  moisture: number;
  status: string;
  warning?: boolean;
}

export function SpecimenRow({ name, health, moisture, status, warning }: Specimen) {
  return (
    <GlassCard className={cn(
      "p-4 flex flex-col md:flex-row md:items-center gap-4 transition-all hover:bg-white/[0.05]",
      warning && "border-destructive/30"
    )}>
      <div className="flex items-center gap-4 flex-1">
        <div className="h-12 w-12 rounded-lg bg-white/5 flex items-center justify-center text-xl shadow-inner border border-white/5">
          🌿
        </div>
        <div>
          <h4 className="font-medium text-white">{name}</h4>
          <p className={cn(
            "text-[10px] font-mono uppercase tracking-widest",
            warning ? "text-destructive" : "text-primary"
          )}>{status}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-12">
        <div className="text-right">
          <p className="text-[10px] text-slate-500 uppercase font-mono mb-1">Vitals</p>
          <p className={cn("font-bold", warning ? 'text-destructive' : 'text-primary')}>{health}%</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 uppercase font-mono mb-1">Hydration</p>
          <p className="font-bold text-blue-400">{moisture}%</p>
        </div>
        <div className="pl-4">
          <Button variant="ghost" size="icon" className="text-slate-600 hover:text-white">
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}
