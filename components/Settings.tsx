
import React from 'react';
import { BudgetBucket, DashboardConfig } from '../types';
import { 
  ArrowLeft, Target, LogOut, Sun, Moon, Palette, Gauge, Box, Percent, Trash2, RefreshCw, ChevronRight
} from 'lucide-react';

interface SettingsProps {
  dailyGoal: number; 
  setDailyGoal: (val: number) => void;
  buckets: BudgetBucket[];
  setBuckets: (buckets: BudgetBucket[]) => void;
  onResetSingleBucket: (id: string) => void;
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
  onResetSingleBucket,
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
    <div className="flex flex-col bg-[var(--bg-primary)] min-h-full">
      <header className="flex items-center justify-between p-6 pb-2 sticky top-0 bg-[var(--bg-primary)]/90 backdrop-blur-xl z-[100]">
        <button onClick={onBack} className="w-10 h-10 rounded-xl ui-card flex items-center justify-center text-[var(--text-secondary)] active:scale-90 transition-all">
          <ArrowLeft size={20} />
        </button>
        <div className="text-right">
          <span className="text-[7px] font-black text-[var(--cyan-accent)] uppercase tracking-widest block opacity-60 italic">SISTEMA ATIVO</span>
          <h1 className="font-black text-lg uppercase tracking-tighter italic leading-none text-white">CENTRAL <span className="text-[var(--cyan-accent)]">CORE</span></h1>
        </div>
      </header>

      <div className="px-5 space-y-6 pb-40 pt-4">
        {/* DASHBOARD CONFIGS COMPACTAS */}
        <div className="grid grid-cols-2 gap-3">
          <div className="ui-card p-4 bg-zinc-950/50 border-white/5 space-y-2">
            <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest block italic">KM CUSTO</span>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-black text-[var(--cyan-accent)] mono italic">R$</span>
               <input 
                 type="number" step="0.01"
                 value={dashboardConfig.costPerKm || 0.45}
                 onChange={(e) => onUpdateDashboardConfig({...dashboardConfig, costPerKm: Number(e.target.value)})}
                 className="bg-transparent text-white text-lg font-black w-full outline-none mono italic"
               />
            </div>
          </div>

          <button 
            onClick={onToggleTheme}
            className="ui-card p-4 bg-zinc-950/50 border-white/5 flex flex-col justify-between active:scale-95 transition-all text-left"
          >
            <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest block italic">TEMA VISUAL</span>
            <div className="flex items-center gap-2 mt-1">
               {theme === 'dark' ? <Moon size={14} className="text-[var(--cyan-accent)]" /> : <Sun size={14} className="text-orange-500" />}
               <span className="text-[10px] font-black text-white uppercase italic">{theme === 'dark' ? 'OLED' : 'LIGHT'}</span>
            </div>
          </button>
        </div>

        {/* GESTÃO DE BALDES ULTRA COMPACTA */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
             <Box size={12} className="text-[var(--cyan-accent)]" />
             <h3 className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] italic">BALDES E METAS</h3>
          </div>
          
          <div className="space-y-2">
            {buckets.map(bucket => (
              <div key={bucket.id} className="ui-card p-4 bg-zinc-900/30 border-white/5 hover:border-[var(--cyan-accent)]/20 transition-all group">
                 <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                       <div className="w-1 h-3 bg-[var(--cyan-accent)] rounded-full"></div>
                       <span className="text-[11px] font-black text-white uppercase italic tracking-tight">{bucket.label}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                       {/* PORCENTAGEM COMPACTA */}
                       <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg border border-white/5">
                          <input 
                            type="number"
                            value={bucket.percentage}
                            onChange={(e) => updateBucketPercent(bucket.id, Number(e.target.value))}
                            className="bg-transparent text-[var(--cyan-accent)] text-[10px] font-black w-4 text-center outline-none mono"
                          />
                          <span className="text-[8px] font-black text-zinc-600">%</span>
                       </div>
                       
                       {/* RESET DISCRETO */}
                       <button 
                         onClick={() => { if(confirm(`Zerar saldo de ${bucket.label}?`)) onResetSingleBucket(bucket.id); }}
                         className="p-1.5 rounded-lg bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all"
                       >
                         <RefreshCw size={12} />
                       </button>
                    </div>
                 </div>

                 <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5 group-focus-within:border-[var(--cyan-accent)]/30 transition-all">
                    <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest italic">META FINAL</span>
                    <div className="flex items-center gap-2">
                       <span className="text-[var(--cyan-accent)] text-xs font-black italic">R$</span>
                       <input 
                         type="number"
                         value={bucket.goalAmount}
                         onChange={(e) => updateBucketGoal(bucket.id, Number(e.target.value))}
                         className="bg-transparent text-white font-black mono text-base outline-none w-20 text-right italic"
                       />
                    </div>
                 </div>
              </div>
            ))}
          </div>
        </section>

        {/* LOGOUT FINAL */}
        <div className="pt-2">
          <button 
            onClick={onLogout}
            className="w-full bg-red-500/5 text-red-500/60 border border-red-500/10 py-5 rounded-[24px] font-black uppercase tracking-[0.3em] text-[9px] flex items-center justify-center gap-3 active:bg-red-500/10 active:text-red-500 transition-all"
          >
            ENCERRAR PROTOCOLO <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
