
import React, { useState, useMemo, useEffect } from 'react';
import { Journey, BudgetBucket, DashboardConfig } from '../types';
import { 
  Zap, 
  TrendingUp,
  TrendingDown,
  Mic,
  Radar as RadarIcon,
  Navigation,
  Timer,
  Settings2,
  Check,
  Edit3,
  Plus,
  ArrowDownCircle,
  Activity,
  Cpu,
  BarChart3,
  Gauge,
  Box,
  Compass,
  ArrowUpRight
} from 'lucide-react';

interface DashboardProps {
  history: Journey[];
  monthlyGoal: number;
  onUpdateGoal: (val: number) => void;
  buckets: BudgetBucket[];
  onUpdateBuckets: (buckets: BudgetBucket[]) => void;
  onResetBuckets: () => void;
  onResetSingleBucket: (id: string) => void;
  onStartJourney: (km: number) => void;
  activeJourney: Journey | null;
  onViewHistory: () => void;
  currentKm: number;
  onStartVoice: () => void;
  onOpenRadar: () => void;
  dashboardConfig: DashboardConfig;
  onUpdateDashboardConfig: (config: DashboardConfig) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  history, 
  monthlyGoal, 
  onUpdateGoal,
  buckets, 
  onUpdateBuckets,
  onStartJourney, 
  activeJourney, 
  currentKm,
  onStartVoice,
  onOpenRadar,
  dashboardConfig,
  onUpdateDashboardConfig
}) => {
  const [showStartKmModal, setShowStartKmModal] = useState(false);
  const [startKm, setStartKm] = useState(currentKm);
  const [shiftTime, setShiftTime] = useState('00:00:00');
  const [isEditMode, setIsEditMode] = useState(false);

  const costPerKm = dashboardConfig.costPerKm || 0.45;

  const todayStats = useMemo(() => {
    const now = new Date();
    const isToday = (t: number) => {
      const d = new Date(t);
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    };
    let gross = 0, expenses = 0, kmTravelled = 0;
    
    history.forEach(j => { 
      if (isToday(j.startTime)) { 
        gross += j.rides.reduce((a, r) => a + r.value, 0); 
        expenses += j.expenses.reduce((a, e) => a + e.value, 0);
        kmTravelled += Math.max(0, (j.endKm || j.startKm) - j.startKm);
      } 
    });

    if (activeJourney) {
      gross += activeJourney.rides.reduce((a, r) => a + r.value, 0);
      expenses += activeJourney.expenses.reduce((a, e) => a + e.value, 0);
      kmTravelled += Math.max(0, currentKm - activeJourney.startKm);
    }

    const depreciation = kmTravelled * costPerKm;
    const realNet = gross - expenses - depreciation;
    const progressToDailyGoal = (realNet / (monthlyGoal / 25)) * 100;
    
    return { gross, expenses, kmTravelled, depreciation, realNet, progress: Math.min(100, progressToDailyGoal) };
  }, [history, activeJourney, currentKm, costPerKm, monthlyGoal]);

  useEffect(() => {
    if (activeJourney) {
      const interval = setInterval(() => {
        const diff = Date.now() - activeJourney.startTime;
        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        setShiftTime(`${h}:${m}:${s}`);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeJourney]);

  return (
    <div className="p-6 pb-40 space-y-8 animate-in fade-in duration-1000 overflow-y-auto no-scrollbar h-full relative z-10">
      
      {/* Header Estilo Avionics */}
      <div className="flex justify-between items-center pt-2">
        <div className="flex flex-col">
           <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-cyan-500/80 uppercase tracking-[0.4em] mono">System Online</span>
           </div>
           <h1 className="text-2xl font-black dynamic-text italic uppercase tracking-tighter leading-none">
              {dashboardConfig.cockpitTitle}
           </h1>
        </div>
        <div className="flex gap-2">
           <button onClick={onOpenRadar} className="w-10 h-10 glass rounded-xl flex items-center justify-center text-cyan-500 border-cyan-500/20"><RadarIcon size={18}/></button>
           <button onClick={onStartVoice} className="w-10 h-10 glass rounded-xl flex items-center justify-center text-red-500 border-red-500/20"><Mic size={18}/></button>
        </div>
      </div>

      {/* CORE CENTRAL DE PERFORMANCE */}
      <div className="relative flex justify-center py-4">
         <div className="w-64 h-64 rounded-full border-[10px] border-zinc-900 flex flex-col items-center justify-center relative">
            {/* Anel de Progresso Neon */}
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
               <circle 
                  cx="50" cy="50" r="45" fill="none" 
                  stroke="rgba(6, 182, 212, 0.1)" strokeWidth="6" 
               />
               <circle 
                  cx="50" cy="50" r="45" fill="none" 
                  stroke="var(--cyan-glow)" strokeWidth="6" 
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - todayStats.progress / 100)}`}
                  className="transition-all duration-1000 ease-out"
                  strokeLinecap="round"
               />
            </svg>
            
            <div className="flex flex-col items-center text-center z-10">
               <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Lucro Real Líquido</span>
               <div className="flex items-baseline gap-1">
                  <span className="text-cyan-500 text-xl font-black italic">R$</span>
                  <span className="text-5xl font-black text-white mono tracking-tighter tabular-nums">{todayStats.realNet.toFixed(0)}</span>
               </div>
               <div className="mt-2 px-3 py-1 bg-cyan-500/10 rounded-full border border-cyan-500/20">
                  <span className="text-[10px] font-black text-cyan-500 mono">{todayStats.progress.toFixed(0)}% DA META</span>
               </div>
            </div>

            {/* Marcadores de Bússola Decorativos */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1"><div className="w-1 h-3 bg-cyan-500/50"></div></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -mb-1"><div className="w-1 h-3 bg-zinc-800"></div></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-1"><div className="w-3 h-1 bg-zinc-800"></div></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-1"><div className="w-3 h-1 bg-zinc-800"></div></div>
         </div>
      </div>

      {/* MÓDULOS DE TELEMETRIA BENTO GRID 14.0 */}
      <div className="grid grid-cols-2 gap-4">
         
         {/* Telemetria Operacional */}
         <div className="glass rounded-[32px] p-6 border-white/5 space-y-4">
            <div className="flex items-center gap-2">
               <Compass size={12} className="text-zinc-500" />
               <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Movimentação</span>
            </div>
            <div className="space-y-1">
               <div className="text-2xl font-black text-white mono italic leading-none">{todayStats.kmTravelled} <span className="text-[10px] text-zinc-600">KM</span></div>
               <div className="flex items-center gap-1">
                  <TrendingDown size={10} className="text-red-500" />
                  <span className="text-[8px] font-black text-zinc-600 mono">-R$ {todayStats.depreciation.toFixed(0)} DESG.</span>
               </div>
            </div>
         </div>

         {/* Eficiência Financeira */}
         <div className="glass rounded-[32px] p-6 border-white/5 space-y-4">
            <div className="flex items-center gap-2">
               <Gauge size={12} className="text-zinc-500" />
               <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Eficiência</span>
            </div>
            <div className="space-y-1">
               <div className="text-2xl font-black text-emerald-500 mono italic leading-none">R$ {(todayStats.gross / Math.max(1, todayStats.kmTravelled)).toFixed(2)}</div>
               <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">POR KM RODADO</span>
            </div>
         </div>

         {/* TERMINAL DE DIRETRIZES DA IA */}
         <div className="col-span-2 glass rounded-[32px] p-6 border-white/5 relative overflow-hidden bg-zinc-950/40">
            <div className="flex items-center justify-between mb-3">
               <div className="flex items-center gap-2">
                  <Cpu size={14} className="text-emerald-500" />
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em]">IA Advisory Terminal</span>
               </div>
               <div className="flex gap-1">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                  <div className="w-1 h-1 rounded-full bg-emerald-500/50"></div>
               </div>
            </div>
            <p className="terminal-text text-[11px] font-bold leading-relaxed uppercase tracking-tight italic">
               {dashboardConfig.customMissionText || "ANÁLISE: FLUXO DE PASSAGEIROS ELEVADO EM ÁREAS COMERCIAIS. PRIORIZE CORRIDAS ACIMA DE R$ 15,00."}
            </p>
         </div>

         {/* RESERVAS DE CAIXA (BALDES) */}
         <div className="col-span-2 space-y-3">
            <div className="flex justify-between items-center px-2">
               <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] flex items-center gap-2"><Box size={12}/> Reservas de Caixa</span>
               <ArrowUpRight size={14} className="text-zinc-800" />
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
               {buckets.map(bucket => (
                  <div key={bucket.id} className="glass min-w-[140px] rounded-3xl p-5 border-white/5 space-y-2">
                     <span className="text-[8px] font-black text-zinc-500 uppercase block truncate">{bucket.label}</span>
                     <div className="text-lg font-black text-white mono italic">R$ {bucket.currentAmount.toFixed(0)}</div>
                     <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500" style={{ width: `${Math.min(100, (bucket.currentAmount / bucket.goalAmount) * 100)}%` }}></div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* BOTÃO DE IGNIÇÃO / STATUS JORNADA */}
      {!activeJourney ? (
        <div className="fixed bottom-32 left-8 right-8 z-50">
           <button 
              onClick={() => setShowStartKmModal(true)}
              className="w-full bg-white text-black py-8 rounded-[32px] flex items-center justify-center gap-5 shadow-[0_30px_60px_-15px_rgba(255,255,255,0.2)] btn-active font-black uppercase tracking-[0.6em] text-xs italic group"
            >
              <Zap fill="black" size={18} className="group-hover:animate-bounce" /> ATIVAR PROTOCOLO
            </button>
        </div>
      ) : (
        <div className="fixed bottom-32 left-8 right-8 z-50">
           <div className="glass neon-border-cyan rounded-[32px] p-6 flex items-center justify-between border-white/10 group overflow-hidden">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-zinc-950 flex items-center justify-center text-cyan-500 border border-cyan-500/20 hud-pulse shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]">
                    <Timer size={24} />
                 </div>
                 <div>
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-1">EM OPERAÇÃO</span>
                    <div className="text-2xl font-black text-white mono italic leading-none">{shiftTime}</div>
                 </div>
              </div>
              <div className="text-right">
                 <div className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1">STATUS: OK</div>
                 <div className="w-12 h-1 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"></div>
              </div>
           </div>
        </div>
      )}

      {/* Modal Sincronização */}
      {showStartKmModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[600] p-10 flex flex-col justify-center animate-in zoom-in duration-300">
           <div className="space-y-12 text-center">
              <div className="space-y-3">
                 <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">Sincronizar Hodômetro</h3>
                 <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em] italic">Calibração para cálculo de Lucro Real</p>
              </div>
              <input 
                type="number" value={startKm} 
                onChange={e => setStartKm(Number(e.target.value))} 
                className="bg-transparent text-white text-center text-8xl font-black w-full mono outline-none border-b border-white/5 pb-4" autoFocus 
              />
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setShowStartKmModal(false)} className="py-7 rounded-[28px] glass text-zinc-600 font-black uppercase text-[10px] tracking-widest">CANCELAR</button>
                 <button onClick={() => { onStartJourney(startKm); setShowStartKmModal(false); }} className="py-7 rounded-[28px] bg-cyan-500 text-black font-black uppercase text-[10px] tracking-widest shadow-xl shadow-cyan-500/20">CONFIRMAR</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
