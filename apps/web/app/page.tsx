"use client";

import { useEffect, useState } from "react";
import { 
  Droplets, Activity, Zap, Cpu, Sprout, Plus, 
  Wifi, WifiOff, RefreshCcw
} from "lucide-react";
import { Button, GlassCard, cn } from "@repo/ui";
import { supabase } from "@/lib/supabase";
import { TelemetryCard } from "@/components/Dashboard/TelemetryCard";
import { SpecimenRow } from "@/components/Dashboard/SpecimenRow";

interface Specimen {
  id: number;
  name: string;
  health: number;
  moisture: number;
  status: string;
  warning?: boolean;
}

export default function MissionControl() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [specimens, setSpecimens] = useState<Specimen[]>([]);

  // Real data fetching and sync status
  useEffect(() => {
    const fetchSpecimens = async () => {
      // For now, using high-fidelity mock data that matches our schema
      // But we will update it dynamically via realtime subscriptions
      setSpecimens([
        { id: 1, name: "Monstera Deliciosa", health: 96, moisture: 42, status: "Thriving" },
        { id: 2, name: "Cherry Tomato", health: 82, moisture: 28, status: "Dry", warning: true },
        { id: 3, name: "Sweet Basil", health: 99, moisture: 65, status: "Optimal" },
      ]);
    };

    fetchSpecimens();

    // Subscribe to IoT hardware telemetry
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'hardware_telemetry',
        },
        (payload) => {
          console.log('New IoT Telemetry Received!', payload.new);
          const newTelemetry = payload.new;
          
          // Update the UI in real-time based on the sensor type
          setSpecimens((prevSpecimens) => 
            prevSpecimens.map((specimen) => {
              if (newTelemetry.sensor_type === 'soil_moisture') {
                return {
                  ...specimen,
                  moisture: newTelemetry.reading_value,
                  status: newTelemetry.reading_value < 30 ? "Dry" : "Optimal",
                  warning: newTelemetry.reading_value < 30
                };
              }
              return specimen;
            })
          );
        }
      )
      .subscribe();

    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      supabase.removeChannel(channel);
    };
  }, []);

  const triggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-slate-50 selection:bg-green-500/30">
      {/* Cinematic Background Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-green-900/10 blur-[120px]" />
        <div className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-emerald-900/5 blur-[150px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-teal-900/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto p-6 md:p-8 space-y-8">
        
        {/* Header / Hero Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
          <div className="space-y-2">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-2 text-primary">
                <Zap className="h-4 w-4" />
                <span className="text-xs font-mono tracking-wider uppercase">System Online • v2.5</span>
              </div>
              <div className={cn(
                "flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border",
                isOnline ? "border-primary/20 text-primary bg-primary/5" : "border-destructive/20 text-destructive bg-destructive/5"
              )}>
                {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                <span>{isOnline ? "Link Established" : "Signal Lost"}</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-white">
              Mission <span className="text-primary">Control</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl">
              Real-time telemetry and AI analytics for your urban ecosystem.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="lg" onClick={triggerSync} disabled={isSyncing}>
              <RefreshCcw className={cn("mr-2 h-4 w-4", isSyncing && "animate-spin")} />
              {isSyncing ? "Syncing..." : "Sync Logs"}
            </Button>
            <Button variant="primary" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              New Specimen
            </Button>
          </div>
        </div>

        {/* Top Level Telemetry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <TelemetryCard 
            title="System Health" 
            value="98.4%" 
            trend="+1.2%" 
            icon={<Activity className="text-emerald-400" />} 
          />
          <TelemetryCard 
            title="Active Flora" 
            value={specimens.length.toString()} 
            trend="2 new" 
            icon={<Sprout className="text-green-400" />} 
          />
          <TelemetryCard 
            title="Avg. Moisture" 
            value="64%" 
            trend="-2.1%" 
            icon={<Droplets className="text-blue-400" />} 
          />
          <TelemetryCard 
            title="Uptime" 
            value="14d 6h" 
            trend="Stable" 
            icon={<Zap className="text-yellow-400" />} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-medium">Active Specimens</h3>
              <Button variant="ghost" size="sm">
                View Detailed Archives
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {specimens.map(specimen => (
                <SpecimenRow key={specimen.id} {...specimen} />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <GlassCard className="p-6 space-y-6" glow intensity="high">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                  <Cpu className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-white text-glow">AI Copilot</h3>
                  <div className="flex items-center text-xs text-slate-400 mt-0.5">
                    <span className="h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                    Monitoring Ecosystem
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-slate-300 leading-relaxed">
                <p>
                  <span className="text-primary font-medium uppercase text-[10px] tracking-wider block mb-1">Observation</span>
                  Tomato moisture in Sector B has dropped to <span className="text-primary">28%</span>. Local automation will initiate irrigation in 5 minutes if no intervention is detected.
                </p>
              </div>
              
              <Button className="w-full" variant="secondary">
                Initiate Consultation
              </Button>
            </GlassCard>

            <GlassCard className="p-6 border-accent/20" intensity="low">
              <h4 className="text-xs font-mono uppercase tracking-widest text-accent mb-4">System Alerts</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 text-xs">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shadow-[0_0_5px_rgba(0,170,255,0.8)]" />
                  <p className="text-slate-400">Nutrient levels in Basil reservoir reaching lower threshold.</p>
                </div>
                <div className="flex items-start space-x-3 text-xs">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-700 mt-1.5" />
                  <p className="text-slate-500">Scheduled maintenance for Sensor Node 04 in 12 hours.</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
