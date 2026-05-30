import { GlassCard } from "@repo/ui";

interface TelemetryCardProps {
  title: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
}

export function TelemetryCard({ title, value, trend, icon }: TelemetryCardProps) {
  return (
    <GlassCard className="p-5 flex flex-col justify-between h-full hover:border-primary/50 transition-all hover:translate-y-[-2px]">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-white/5 rounded-lg border border-white/10">
          {icon}
        </div>
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md">
          {trend}
        </span>
      </div>
      <div>
        <h4 className="text-slate-400 text-sm font-medium mb-1">{title}</h4>
        <div className="text-3xl font-semibold tracking-tight text-white">{value}</div>
      </div>
    </GlassCard>
  );
}
