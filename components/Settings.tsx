
import React from 'react';
import { BudgetBucket } from '../types';
import { 
  ArrowLeft, Target, LogOut, ChevronRight, PieChart, 
  Smartphone, Apple, Chrome, Download, Globe, Rocket, 
  ExternalLink, MousePointer2, Layout, CheckCircle2 
} from 'lucide-react';

interface SettingsProps {
  dailyGoal: number;
  setDailyGoal: (val: number) => void;
  buckets: BudgetBucket[];
  setBuckets: (buckets: BudgetBucket[]) => void;
  onBack: () => void;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ dailyGoal, setDailyGoal, buckets, setBuckets, onBack, onLogout }) => {
  const updateBucketPercentage = (id: string, newPercent: number) => {
    setBuckets(buckets.map(b => b.id === id ? { ...b, percentage: newPercent } : b));
  };

  const updateBucketLabel = (id: string, newLabel: string) => {
    setBuckets(buckets.map(b => b.id === id ? { ...b, label: newLabel } : b));
  };

  const updateBucketGoal = (id: string, newGoal: number) => {
    setBuckets(buckets.map(b => b.id === id ? { ...b, goalAmount: newGoal } : b));
  };

  return (
    <div className="p-8 h-full flex flex-col pb-40 bg-black overflow-y-auto no-scrollbar">
      <header className="flex items-center justify-between mb-12">
        <button onClick={onBack} className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-zinc-500">
          <ArrowLeft size={24} />
        </button>
        <div className="text-right">
          <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest block">Infraestrutura</span>
          <h1 className="text-white font-black text-lg uppercase tracking-tighter italic">CONFIGURAÇÕES</h1>
        </div>
      </header>

      <div className="space-y-12">
        
        {/* GUIA VISUAL PWABUILDER (FOTO SIMULADA) */}
        <section className="space-y-4">
          <h3 className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.4em] ml-2 flex items-center gap-2">
            <Layout size={14} className="text-cyan-500" /> GUIA VISUAL DE GERAÇÃO APK
          </h3>
          
          <div className="glass rounded-[40px] border-white/5 overflow-hidden">
            <div className="p-6 bg-zinc-900/50 border-b border-white/5 flex items-center justify-between">
              <span className="text-white text-[10px] font-black uppercase italic tracking-widest">Tutorial PWABuilder</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500/40"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500/40"></div>
                <div className="w-2 h-2 rounded-full bg-green-500/40"></div>
              </div>
            </div>

            <div className="p-8 space-y-10">
              {/* Passo 1 - Mockup da Busca */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-500 text-black text-[10px] font-black flex items-center justify-center">1</span>
                  <span className="text-white text-[10px] font-black uppercase">Cole sua URL no site</span>
                </div>
                <div className="bg-black border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Globe size={14} className="text-zinc-700" />
                    <span className="text-[10px] text-zinc-500 truncate italic">https://seu-app-faturar.vercel.app</span>
                  </div>
                  <div className="bg-cyan-500 px-3 py-1.5 rounded-lg text-black font-black text-[8px] uppercase">START</div>
                </div>
              </div>

              {/* Passo 2 - Mockup do Resultado */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-500 text-black text-[10px] font-black flex items-center justify-center">2</span>
                  <span className="text-white text-[10px] font-black uppercase">Confira se está tudo VERDE</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl flex flex-col items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span className="text-[7px] font-black text-emerald-500 uppercase">Manifest</span>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl flex flex-col items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span className="text-[7px] font-black text-emerald-500 uppercase">Worker</span>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl flex flex-col items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span className="text-[7px] font-black text-emerald-500 uppercase">HTTPS</span>
                  </div>
                </div>
              </div>

              {/* Passo 3 - Mockup do Download */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-500 text-black text-[10px] font-black flex items-center justify-center">3</span>
                  <span className="text-white text-[10px] font-black uppercase">Clique em Package for Store</span>
                </div>
                <div className="bg-zinc-900 border border-cyan-500/20 rounded-2xl p-6 flex flex-col items-center gap-4">
                   <div className="w-full flex justify-between items-center opacity-50">
                      <Smartphone size={24} className="text-white" />
                      <div className="h-[2px] flex-1 bg-zinc-800 mx-4"></div>
                      <Download size={24} className="text-cyan-500" />
                   </div>
                   <div className="bg-cyan-500 w-full py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(6,182,212,0.3)]">
                      <span className="text-black font-black text-[10px] uppercase tracking-widest">Generate Android APK</span>
                      <MousePointer2 size={14} className="text-black animate-bounce" />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* METAS FINANCEIRAS */}
        <section className="space-y-4">
          <h3 className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.4em] ml-2">OBJETIVO FINANCEIRO (MÊS)</h3>
          <div className="glass p-8 rounded-[40px] flex items-center justify-between border-white/5">
            <Target className="text-cyan-500" size={32} />
            <div className="flex flex-col items-end">
              <input 
                type="number" 
                value={dailyGoal} 
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="bg-transparent text-white text-3xl font-black text-right w-32 focus:outline-none mono italic"
              />
              <span className="text-[9px] text-zinc-600 font-black uppercase">Meta Bruta (R$)</span>
            </div>
          </div>
        </section>

        {/* DIVISÃO DE LUCROS */}
        <section className="space-y-6">
          <h3 className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.4em] ml-2 flex items-center gap-2">
            <PieChart size={14} /> REPARTIÇÃO DE LUCRO (%)
          </h3>
          <div className="space-y-3">
            {buckets.map(bucket => (
              <div key={bucket.id} className="glass p-6 rounded-[32px] border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <input 
                    type="text" 
                    value={bucket.label}
                    onChange={(e) => updateBucketLabel(bucket.id, e.target.value)}
                    className="bg-transparent text-white text-xs font-black uppercase italic focus:outline-none w-1/2"
                  />
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={bucket.percentage}
                      onChange={(e) => updateBucketPercentage(bucket.id, Number(e.target.value))}
                      className="bg-zinc-900 text-cyan-500 text-sm font-black w-14 text-center py-2 rounded-xl focus:outline-none border border-white/5"
                    />
                    <span className="text-zinc-600 text-[10px] font-black">%</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[8px] font-black text-zinc-600 uppercase">Teto de Gastos/Meta:</span>
                  <input 
                    type="number" 
                    value={bucket.goalAmount}
                    onChange={(e) => updateBucketGoal(bucket.id, Number(e.target.value))}
                    className="bg-transparent text-zinc-400 text-[10px] font-black focus:outline-none w-20 mono"
                  />
                </div>
              </div>
            ))}
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
