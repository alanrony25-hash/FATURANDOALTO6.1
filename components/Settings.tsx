
import React from 'react';
import { BudgetBucket, DashboardConfig } from '../types';
import { 
  ArrowLeft, LogOut, Sun, Moon, Box, RefreshCw, DollarSign
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
  dailyGoal, setDailyGoal, buckets, setBuckets, onResetSingleBucket, onBack, onLogout,
  theme, onToggleTheme, dashboardConfig, onUpdateDashboardConfig
}) => {

  const updateBucketGoal = (id: string, goal: number) => {
    setBuckets(buckets.map(b => b.id === id ? { ...b, goalAmount: goal } : b));
  };

  const updateBucketPercent = (id: string, percent: number) => {
    setBuckets(buckets.map(b => b.id === id ? { ...b, percentage: percent } : b));
  };

  return (
    <div className="flex flex-col min-h-full">
      <header className="flex items-center justify-between p-4 sticky top-0 bg-[var(--bg-primary)]/90 backdrop-blur-xl z-[100] border-b border-[var(--border-ui)]">
        <button onClick={onBack} className="w-9 h-9 ui-card flex items-center justify-center text-[var(--text-secondary)] btn-active">
          <ArrowLeft size={18} />
        </button>
        <div className="text-right">
          <span className="text-[7px] font-black text-[var(--accent-main)] uppercase tracking-widest block italic opacity-60">SISTEMA CORE</span>
          <h1 className="font-black text-md uppercase tracking-tighter italic leading-none text-[var(--text-primary)]">AJUSTES TÁTICOS</h1>
        </div>
      </header>

      <div className="px-4 space-y-4 pb-40 pt-4 overflow-y-auto no-scrollbar">
        <div className="grid grid-cols-2 gap-2">
          <div className="ui-card p-4 bg-[var(--bg-secondary)] space-y-2">
            <span className="text-[7px] font-black text-[var(--text-secondary)] uppercase tracking-widest block italic">CUSTO POR KM</span>
            <div className="flex items-center gap-1">
               <span className="text-[10px] font-black text-[var(--accent-main)] mono italic">R$</span>
               <input 
                 type="number" step="0.01"
                 value={dashboardConfig.costPerKm || 0.45}
                 onChange={(e) => onUpdateDashboardConfig({...dashboardConfig, costPerKm: Number(e.target.value)})}
                 className="bg-transparent text-[var(--text-primary)] text-lg font-black w-full outline-none mono italic"
               />
            </div>
          </div>

          <button 
            onClick={onToggleTheme}
            className="ui-card p-4 bg-[var(--bg-secondary)] flex flex-col justify-between active:scale-95 transition-all text-left"
          >
            <span className="text-[7px] font-black text-[var(--text-secondary)] uppercase tracking-widest block italic">MODO VISUAL</span>
            <div className="flex items-center gap-2 mt-1">
               {theme === 'dark' ? <Moon size={14} className="text-[var(--accent-main)]" /> : <Sun size={14} className="text-amber-500" />}
               <span className="text-[9px] font-black text-[var(--text-primary)] uppercase italic">{theme === 'dark' ? 'STEALTH' : 'ULTRA'}</span>
            </div>
          </button>
        </div>

        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
             <Box size={12} className="text-[var(--accent-main)]" />
             <h3 className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] italic">GESTOR DE RESERVAS</h3>
          </div>
          
          <div className="space-y-2">
            {buckets.map(bucket => (
              <div key={bucket.id} className="ui-card p-4 bg-[var(--bg-secondary)] group transition-all">
                 <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                       <div className="w-1 h-3 bg-[var(--accent-main)] rounded-full"></div>
                       <span className="text-[11px] font-black text-[var(--text-primary)] uppercase italic tracking-tight">{bucket.label}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                       <div className="flex items-center gap-1 bg-[var(--bg-tertiary)] px-2 py-1 rounded-lg border border-[var(--border-ui)]">
                          <input 
                            type="number" value={bucket.percentage}
                            onChange={(e) => updateBucketPercent(bucket.id, Number(e.target.value))}
                            className="bg-transparent text-[var(--accent-main)] text-[10px] font-black w-4 text-center outline-none mono"
                          />
                          <span className="text-[8px] font-black text-[var(--text-secondary)]">%</span>
                       </div>
                       <button onClick={() => { if(confirm(`Zerar ${bucket.label}?`)) onResetSingleBucket(bucket.id); }} className="p-1.5 text-[var(--danger)]/50 hover:text-[var(--danger)] transition-all">
                         <RefreshCw size={12} />
                       </button>
                    </div>
                 </div>

                 <div className="flex items-center justify-between bg-[var(--bg-tertiary)] px-4 py-3 rounded-xl border border-[var(--border-ui)]">
                    <span className="text-[7px] font-black text-[var(--text-secondary)] uppercase tracking-widest italic">OBJETIVO</span>
                    <div className="flex items-center gap-1">
                       <span className="text-[var(--accent-main)] text-xs font-black italic">R$</span>
                       <input 
                         type="number" value={bucket.goalAmount}
                         onChange={(e) => updateBucketGoal(bucket.id, Number(e.target.value))}
                         className="bg-transparent text-[var(--text-primary)] font-black mono text-md outline-none w-20 text-right italic"
                       />
                    </div>
                 </div>
              </div>
            ))}
          </div>
        </section>

        <button onClick={onLogout} className="w-full bg-[var(--danger)]/5 text-[var(--danger)] border border-[var(--danger)]/10 py-4 rounded-[20px] font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-2 active:bg-[var(--danger)]/10 transition-all">
          DESCONECTAR <LogOut size={16} />
        </button>
      </div>
    </div>
  );
};

export default Settings;
