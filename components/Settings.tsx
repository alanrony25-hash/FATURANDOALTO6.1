
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
    <div className="p-3 h-full flex flex-col pb-32 dynamic-bg overflow-y-auto no-scrollbar">
      <header className="flex items-center justify-between mb-3 shrink-0">
        <button onClick={onBack} className="w-9 h-9 rounded-lg glass flex items-center justify-center text-zinc-500">
          <ArrowLeft size={18} />
        </button>
        <div className="text-right">
          <span className="text-[7px] font-black text-cyan-500 uppercase tracking-widest block">SISTEMA ATIVO</span>
          <h1 className="dynamic-text font-black text-sm uppercase tracking-tighter italic leading-none">faturandoaltor15.0</h1>
        </div>
      </header>

      <div className="space-y-3">
        {/* FILA SUPERIOR: LUCRO E TEMA LADO A LADO */}
        <div className="grid grid-cols-2 gap-2">
          <section className="space-y-1.5">
            <h3 className="text-[7px] font-black text-zinc-600 uppercase tracking-widest ml-1 flex items-center gap-1">
              <Gauge size={10} className="text-cyan-500" /> LUCRO REAL
            </h3>
            <div className="bg-black p-3 rounded-2xl border border-cyan-500/20 flex flex-col items-center">
              <span className="text-zinc-600 text-[6px] font-black uppercase mb-1">CUSTO / KM</span>
              <div className="flex items-center gap-1">
                <span className="text-cyan-500 font-black mono text-xs italic">R$</span>
                <input 
                  type="number" step="0.01"
                  value={dashboardConfig.costPerKm || 0.45}
                  onChange={(e) => onUpdateDashboardConfig({...dashboardConfig, costPerKm: Number(e.target.value)})}
                  className="bg-zinc-900 text-cyan-400 text-sm font-black w-14 text-center py-1 rounded-lg outline-none border border-cyan-500/20 mono"
                />
              </div>
            </div>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-[7px] font-black text-zinc-600 uppercase tracking-widest ml-1 flex items-center gap-1">
              <Palette size={10} className="text-cyan-500" /> AMBIENTE
            </h3>
            <button 
              onClick={onToggleTheme}
              className="w-full glass p-3 rounded-2xl border-white/5 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all"
            >
              <div className={`text-xs ${theme === 'dark' ? 'text-cyan-500' : 'text-orange-500'}`}>
                {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              </div>
              <span className="text-[7px] font-black uppercase text-zinc-400">{theme === 'dark' ? 'NOTURNO' : 'DIURNO'}</span>
            </button>
          </section>
        </div>

        {/* PLANEJAMENTO DE METAS */}
        <section className="space-y-1.5">
          <h3 className="text-[7px] font-black text-zinc-600 uppercase tracking-widest ml-1 flex items-center gap-1">
            <Target size={10} className="text-cyan-500" /> PLANEJAMENTO MENSAL
          </h3>
          <div className="glass p-4 rounded-3xl border-white/10 space-y-3 bg-zinc-950/20">
            <div className="flex items-center justify-between">
              <span className="text-[7px] text-zinc-500 font-black uppercase">META BRUTA</span>
              <div className="flex items-center gap-2 bg-black px-3 py-2 rounded-xl border border-white/5">
                <span className="text-cyan-500 text-xs font-black italic">R$</span>
                <input 
                  type="number" 
                  value={dailyGoal} 
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  className="bg-transparent text-white text-lg font-black w-24 focus:outline-none mono italic"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/5">
                <div className="text-center">
                    <span className="text-[6px] font-black text-zinc-600 uppercase block">MANHÃ</span>
                    <div className="text-[9px] font-black text-white mono italic">R${(dailyGoal / 30 * 0.4).toFixed(0)}</div>
                </div>
                <div className="text-center">
                    <span className="text-[6px] font-black text-zinc-600 uppercase block">TARDE</span>
                    <div className="text-[9px] font-black text-white mono italic">R${(dailyGoal / 30 * 0.25).toFixed(0)}</div>
                </div>
                <div className="text-center">
                    <span className="text-[6px] font-black text-zinc-600 uppercase block">NOITE</span>
                    <div className="text-[9px] font-black text-white mono italic">R${(dailyGoal / 30 * 0.35).toFixed(0)}</div>
                </div>
            </div>
          </div>
        </section>

        {/* ACORDOS E LOGOUT */}
        <button 
          onClick={onLogout}
          className="w-full bg-red-500/10 text-red-500 border border-red-500/20 py-4 rounded-2xl font-black uppercase tracking-[0.3em] text-[7px] flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          ENCERRAR PROTOCOLO <LogOut size={12} />
        </button>
      </div>
    </div>
  );
};

export default Settings;
