
import React from 'react';
import { BudgetBucket, DashboardConfig } from '../types';
import { 
  ArrowLeft, Target, LogOut, Sun, Moon, Palette, Gauge
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
  onBack, 
  onLogout,
  theme,
  onToggleTheme,
  dashboardConfig,
  onUpdateDashboardConfig
}) => {
  return (
    <div className="p-4 h-full flex flex-col pb-32 overflow-y-auto no-scrollbar">
      <header className="flex items-center justify-between mb-6 shrink-0 pt-2">
        <button onClick={onBack} className="w-10 h-10 ui-card flex items-center justify-center text-[var(--text-secondary)]">
          <ArrowLeft size={20} />
        </button>
        <div className="text-right">
          <span className="text-[8px] font-black text-[var(--cyan-accent)] uppercase tracking-widest block">SISTEMA ATIVO</span>
          <h1 className="font-black text-lg uppercase tracking-tighter italic leading-none">CENTRAL <span className="text-[var(--cyan-accent)]">CORE</span></h1>
        </div>
      </header>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <section className="space-y-2">
            <h3 className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1 flex items-center gap-2">
              <Gauge size={12} className="text-[var(--cyan-accent)]" /> CUSTO OPERACIONAL
            </h3>
            <div className="ui-card p-4 flex flex-col items-center gap-2">
              <span className="text-[7px] font-black text-[var(--text-secondary)] uppercase">VALOR POR KM</span>
              <div className="flex items-center gap-2">
                <span className="text-[var(--cyan-accent)] font-black mono text-sm italic">R$</span>
                <input 
                  type="number" step="0.01"
                  value={dashboardConfig.costPerKm || 0.45}
                  onChange={(e) => onUpdateDashboardConfig({...dashboardConfig, costPerKm: Number(e.target.value)})}
                  className="bg-[var(--bg-secondary)] text-[var(--text-primary)] text-lg font-black w-16 text-center py-2 rounded-xl outline-none border border-[var(--border-ui)] mono"
                />
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1 flex items-center gap-2">
              <Palette size={12} className="text-[var(--cyan-accent)]" /> VISUAL HUD
            </h3>
            <button 
              onClick={onToggleTheme}
              className={`w-full ui-card p-4 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all ${theme === 'light' ? 'bg-zinc-100' : ''}`}
            >
              <div className={theme === 'dark' ? 'text-[var(--cyan-accent)]' : 'text-orange-500'}>
                {theme === 'dark' ? <Moon size={22} /> : <Sun size={22} />}
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-primary)]">{theme === 'dark' ? 'NOTURNO' : 'DIURNO'}</span>
            </button>
          </section>
        </div>

        <section className="space-y-2">
          <h3 className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1 flex items-center gap-2">
            <Target size={12} className="text-[var(--cyan-accent)]" /> PLANEJAMENTO MENSAL
          </h3>
          <div className="ui-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-[var(--text-secondary)] font-black uppercase">META BRUTA ALVO</span>
              <div className="flex items-center gap-2 bg-[var(--bg-secondary)] px-4 py-3 rounded-2xl border border-[var(--border-ui)]">
                <span className="text-[var(--cyan-accent)] text-sm font-black italic">R$</span>
                <input 
                  type="number" 
                  value={dailyGoal} 
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  className="bg-transparent text-[var(--text-primary)] text-xl font-black w-28 focus:outline-none mono italic"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[var(--border-ui)]">
                <div className="text-center p-2 bg-[var(--bg-secondary)] rounded-xl">
                    <span className="text-[7px] font-black text-[var(--text-secondary)] uppercase block">DIÁRIA</span>
                    <div className="text-[11px] font-black italic">R${(dailyGoal / 30).toFixed(0)}</div>
                </div>
                <div className="text-center p-2 bg-[var(--bg-secondary)] rounded-xl">
                    <span className="text-[7px] font-black text-[var(--text-secondary)] uppercase block">HORA (10H)</span>
                    <div className="text-[11px] font-black italic">R${(dailyGoal / 30 / 10).toFixed(0)}</div>
                </div>
                <div className="text-center p-2 bg-[var(--bg-secondary)] rounded-xl border border-[var(--emerald-accent)]/20">
                    <span className="text-[7px] font-black text-[var(--emerald-accent)] uppercase block">LUCRO EST.</span>
                    <div className="text-[11px] font-black italic text-[var(--emerald-accent)]">R${(dailyGoal * 0.6 / 30).toFixed(0)}</div>
                </div>
            </div>
          </div>
        </section>

        <button 
          onClick={onLogout}
          className="w-full bg-[var(--red-accent)]/10 text-[var(--red-accent)] border border-[var(--red-accent)]/20 py-5 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] flex items-center justify-center gap-3 active:scale-95 transition-all mt-6 shadow-sm"
        >
          ENCERRAR PROTOCOLO <LogOut size={16} />
        </button>
      </div>
    </div>
  );
};

export default Settings;
