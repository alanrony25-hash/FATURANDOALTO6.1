
import React from 'react';
import { BudgetBucket, DashboardConfig } from '../types';
import { 
  ArrowLeft, Target, LogOut, ChevronRight, PieChart, 
  Smartphone, Layout, CheckCircle2,
  Sun, Moon, Palette, Gauge
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
  return (
    <div className="p-8 h-full flex flex-col pb-40 dynamic-bg overflow-y-auto no-scrollbar">
      <header className="flex items-center justify-between mb-12">
        <button onClick={onBack} className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-zinc-500">
          <ArrowLeft size={24} />
        </button>
        <div className="text-right">
          <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest block">Core System</span>
          <h1 className="dynamic-text font-black text-lg uppercase tracking-tighter italic">CONFIGURAÇÕES</h1>
        </div>
      </header>

      <div className="space-y-12">
        
        {/* CONFIGURAÇÃO DE CUSTO REAL */}
        <section className="space-y-4">
          <h3 className="dynamic-text-secondary text-[10px] font-black uppercase tracking-[0.4em] ml-2 flex items-center gap-2">
            <Gauge size={14} className="text-cyan-500" /> CÁLCULO DE LUCRO REAL
          </h3>
          <div className="glass p-8 rounded-[40px] border-white/10 space-y-4">
            <div className="flex justify-between items-center">
               <span className="dynamic-text text-xs font-black uppercase italic">Custo por KM (R$)</span>
               <input 
                  type="number" step="0.01"
                  value={dashboardConfig.costPerKm || 0.45}
                  onChange={(e) => onUpdateDashboardConfig({...dashboardConfig, costPerKm: Number(e.target.value)})}
                  className="bg-zinc-900 dynamic-text text-xl font-black w-20 text-center py-3 rounded-2xl outline-none border border-white/10 mono"
               />
            </div>
            <p className="text-[8px] font-black text-zinc-500 uppercase leading-relaxed">
              * Considere desvalorização, pneus, óleo e seguro para cada km rodado. Recomendado: R$ 0,40 a R$ 0,60.
            </p>
          </div>
        </section>

        {/* INTERFACE E APARÊNCIA */}
        <section className="space-y-4">
          <h3 className="dynamic-text-secondary text-[10px] font-black uppercase tracking-[0.4em] ml-2 flex items-center gap-2">
            <Palette size={14} className="text-cyan-500" /> INTERFACE & APARÊNCIA
          </h3>
          <div className="glass p-6 rounded-[32px] border-white/5 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${theme === 'dark' ? 'bg-zinc-900 text-cyan-500' : 'bg-white text-orange-500 shadow-sm'}`}>
                {theme === 'dark' ? <Moon size={22} /> : <Sun size={22} />}
              </div>
              <div>
                <span className="dynamic-text text-xs font-black uppercase italic">Modo {theme === 'dark' ? 'Noturno' : 'Diurno'}</span>
                <p className="dynamic-text-secondary text-[8px] font-black uppercase tracking-widest mt-0.5">Visibilidade Otimizada</p>
              </div>
            </div>
            <button 
              onClick={onToggleTheme}
              className={`w-16 h-8 rounded-full p-1 transition-all duration-500 flex items-center ${theme === 'dark' ? 'bg-zinc-800' : 'bg-cyan-500'}`}
            >
              <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-500 ${theme === 'dark' ? 'translate-x-0' : 'translate-x-8'}`}></div>
            </button>
          </div>
        </section>

        {/* METAS FINANCEIRAS */}
        <section className="space-y-4">
          <h3 className="dynamic-text-secondary text-[10px] font-black uppercase tracking-[0.4em] ml-2">META MENSAL (BRUTO)</h3>
          <div className="glass p-8 rounded-[40px] flex items-center justify-between border-white/5">
            <Target className="text-cyan-500" size={32} />
            <div className="flex flex-col items-end">
              <input 
                type="number" 
                value={dailyGoal} 
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="bg-transparent dynamic-text text-3xl font-black text-right w-32 focus:outline-none mono italic"
              />
              <span className="text-[9px] text-zinc-600 font-black uppercase">R$ BRUTO/MÊS</span>
            </div>
          </div>
        </section>

        {/* LOGOUT */}
        <button 
          onClick={onLogout}
          className="w-full bg-red-500/10 text-red-500 border border-red-500/20 py-6 rounded-[32px] font-black uppercase tracking-[0.4em] text-[10px] flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          LOGOUT DO SISTEMA <LogOut size={16} />
        </button>
      </div>
    </div>
  );
};

export default Settings;
