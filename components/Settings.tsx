
import React from 'react';
import { BudgetBucket, DashboardConfig } from '../types';
import { 
  ArrowLeft, Target, LogOut, Sun, Moon, Palette, Gauge, Box, Percent
} from 'lucide-react';

interface SettingsProps {
  dailyGoal: number; 
  setDailyGoal: (val: number) => void;
  buckets: BudgetBucket[];
  setBuckets: (buckets: BudgetBucket[]) => void;
  onBack: () => void;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  dashboardConfig: DashboardConfig;
  onUpdateDashboardConfig: (config: DashboardConfig) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  dailyGoal, 
  setDailyGoal, 
  buckets,
  setBuckets,
  onBack, 
  onLogout,
  theme,
  onToggleTheme,
  dashboardConfig,
  onUpdateDashboardConfig
}) => {

  const updateBucketGoal = (id: string, goal: number) => {
    setBuckets(buckets.map(b => b.id === id ? { ...b, goalAmount: goal } : b));
  };

  const updateBucketPercent = (id: string, percent: number) => {
    setBuckets(buckets.map(b => b.id === id ? { ...b, percentage: percent } : b));
  };

  return (
    <div className="p-4 h-full flex flex-col pb-32 overflow-y-auto no-scrollbar bg-[var(--bg-primary)]">
      <header className="flex items-center justify-between mb-6 shrink-0 pt-4 px-2">
        <button onClick={onBack} className="w-11 h-11 ui-card flex items-center justify-center text-[var(--text-secondary)]">
          <ArrowLeft size={22} />
        </button>
        <div className="text-right">
          <span className="text-[8px] font-black text-[var(--cyan-accent)] uppercase tracking-widest block opacity-60">SISTEMA ATIVO</span>
          <h1 className="font-black text-xl uppercase tracking-tighter italic leading-none text-white">CENTRAL <span className="text-[var(--cyan-accent)]">CORE</span></h1>
        </div>
      </header>

      <div className="space-y-6 px-2">
        {/* CUSTO E TEMA */}
        <div className="grid grid-cols-2 gap-4">
          <section className="space-y-2">
            <h3 className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
              <Gauge size={12} className="text-[var(--cyan-accent)]" /> KM CUSTO
            </h3>
            <div className="ui-card p-4 flex flex-col items-center gap-2">
              <span className="text-[7px] font-black text-zinc-500 uppercase">R$ / KM</span>
              <input 
                type="number" step="0.01"
                value={dashboardConfig.costPerKm || 0.45}
                onChange={(e) => onUpdateDashboardConfig({...dashboardConfig, costPerKm: Number(e.target.value)})}
                className="bg-zinc-900 text-[var(--text-primary)] text-xl font-black w-full text-center py-3 rounded-2xl outline-none border border-white/5 mono"
              />
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
              <Palette size={12} className="text-[var(--cyan-accent)]" /> VISUAL
            </h3>
            <button 
              onClick={onToggleTheme}
              className={`w-full ui-card p-4 flex flex-col items-center justify-center gap-2 h-full ${theme === 'light' ? 'bg-zinc-100' : 'bg-zinc-900'}`}
            >
              <div className={theme === 'dark' ? 'text-[var(--cyan-accent)]' : 'text-orange-500'}>
                {theme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest">{theme === 'dark' ? 'DARK OLED' : 'LIGHT CONTRAST'}</span>
            </button>
          </section>
        </div>

        {/* METAS DOS BALDES */}
        <section className="space-y-3">
          <h3 className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
            <Box size={12} className="text-[var(--cyan-accent)]" /> GESTÃO DE BALDES (METAS)
          </h3>
          <div className="space-y-3">
            {buckets.map(bucket => (
              <div key={bucket.id} className="ui-card p-5 space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-white uppercase italic tracking-tight">{bucket.label}</span>
                    <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-lg border border-white/5">
                       <Percent size={10} className="text-[var(--cyan-accent)]" />
                       <input 
                         type="number"
                         value={bucket.percentage}
                         onChange={(e) => updateBucketPercent(bucket.id, Number(e.target.value))}
                         className="bg-transparent text-[var(--text-primary)] text-xs font-black w-8 outline-none mono"
                       />
                       <span className="text-[8px] font-black text-zinc-600">%</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">META FINAL:</span>
                    <div className="flex-1 flex items-center gap-2 bg-black/40 px-4 py-3 rounded-xl border border-white/5">
                        <span className="text-[var(--cyan-accent)] text-xs font-black italic">R$</span>
                        <input 
                          type="number"
                          value={bucket.goalAmount}
                          onChange={(e) => updateBucketGoal(bucket.id, Number(e.target.value))}
                          className="bg-transparent text-white font-black mono text-base outline-none w-full"
                        />
                    </div>
                 </div>
              </div>
            ))}
          </div>
        </section>

        {/* BOTÃO LOGOUT */}
        <button 
          onClick={onLogout}
          className="w-full bg-[var(--red-accent)]/10 text-[var(--red-accent)] border border-[var(--red-accent)]/20 py-6 rounded-[28px] font-black uppercase tracking-[0.4em] text-[10px] flex items-center justify-center gap-3 active:scale-95 transition-all mt-4"
        >
          ENCERRAR PROTOCOLO <LogOut size={18} />
        </button>
      </div>
    </div>
  );
};

export default Settings;
