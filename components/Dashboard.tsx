
import React, { useState, useMemo, useEffect } from 'react';
import { Journey, BudgetBucket, DashboardConfig } from '../types';
import { 
  Zap, Mic, Radar as RadarIcon, Timer, Edit3, Activity, Gauge, Box, Compass, ShieldCheck, 
  Home, CreditCard, Car, PiggyBank, Power, RotateCcw, XCircle, Pencil
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
  onGoToSettings: () => void;
}

const BUCKET_ICONS: Record<string, React.ReactNode> = {
  '1': <Car size={14} className="text-cyan-400" />,
  '2': <CreditCard size={14} className="text-purple-400" />,
  '3': <Home size={14} className="text-emerald-400" />,
  '4': <PiggyBank size={14} className="text-orange-400" />,
};

const Dashboard: React.FC<DashboardProps> = ({ 
  history, buckets, onUpdateBuckets, onResetBuckets, onResetSingleBucket, onStartJourney, 
  activeJourney, currentKm, onStartVoice, onOpenRadar, dashboardConfig, onGoToSettings
}) => {
  const [showStartKmModal, setShowStartKmModal] = useState(false);
  const [startKm, setStartKm] = useState(currentKm);
  const [shiftTime, setShiftTime] = useState('00:00:00');

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
    const dailyGoalAmount = 380; 
    const progressToDailyGoal = (realNet / dailyGoalAmount) * 100;
    
    return { gross, expenses, kmTravelled, depreciation, realNet, progress: Math.min(100, progressToDailyGoal) };
  }, [history, activeJourney, currentKm, costPerKm]);

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

  const handleEditBucketLabel = (id: string, currentLabel: string) => {
    const newLabel = prompt("Editar nome da reserva:", currentLabel);
    if (newLabel && newLabel.trim() !== "") {
      const newBuckets = buckets.map(b => b.id === id ? { ...b, label: newLabel } : b);
      onUpdateBuckets(newBuckets);
    }
  };

  const confirmResetBucket = (id: string, label: string) => {
    if (confirm(`Deseja zerar o valor acumulado de "${label}"?`)) onResetSingleBucket(id);
  };

  return (
    <div className="p-4 pb-48 space-y-4 animate-in fade-in duration-700 overflow-y-auto no-scrollbar h-full relative z-10">
      
      {/* HEADER HUD CONSOLIDADO */}
      <div className="flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
           <h1 className="text-sm font-black text-white italic uppercase tracking-tighter">faturandoaltor15.0</h1>
        </div>
        <div className="flex gap-1.5">
           <button onClick={onOpenRadar} className="w-8 h-8 glass rounded-lg flex items-center justify-center text-cyan-500 border-cyan-500/10"><RadarIcon size={14}/></button>
           <button onClick={onStartVoice} className="w-8 h-8 glass rounded-lg flex items-center justify-center text-red-500 border-red-500/10"><Mic size={14}/></button>
        </div>
      </div>

      {/* PAINEL DE PERFORMANCE COMPACTO */}
      <div className="grid grid-cols-5 gap-2">
         <button 
           onClick={onGoToSettings} 
           className="col-span-3 glass rounded-3xl p-4 border-white/5 flex flex-col items-center justify-center relative active:scale-95 transition-all h-32"
         >
            <span className="text-[6px] font-black text-zinc-600 uppercase tracking-widest mb-1">LUCRO REAL HOJE</span>
            <div className="flex items-baseline gap-0.5">
               <span className="text-cyan-500 text-xs font-black italic">R$</span>
               <span className="text-3xl font-black text-white mono italic tracking-tighter">{todayStats.realNet.toFixed(0)}</span>
            </div>
            <div className="mt-2 w-full h-1 bg-zinc-950 rounded-full overflow-hidden">
               <div className="h-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]" style={{ width: `${todayStats.progress}%` }}></div>
            </div>
            <Edit3 size={8} className="absolute bottom-3 right-3 text-zinc-700" />
         </button>

         <div className="col-span-2 grid grid-rows-2 gap-2 h-32">
            <div className="glass rounded-2xl p-3 border-white/5 flex flex-col justify-center">
               <span className="text-[6px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-1"><Compass size={8}/> {todayStats.kmTravelled} KM</span>
            </div>
            <div className="glass rounded-2xl p-3 border-emerald-500/10 flex flex-col justify-center bg-emerald-500/5">
               <span className="text-[6px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-1"><Gauge size={8}/> R$ {(todayStats.gross / Math.max(1, todayStats.kmTravelled)).toFixed(2)}</span>
            </div>
         </div>
      </div>

      {/* RESERVAS ATIVAS COMPACTAS */}
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
           <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
              <Box size={10} className="text-cyan-500" /> RESERVAS ATIVAS
           </span>
           <button onClick={onResetBuckets} className="text-[6px] font-black text-red-500 uppercase tracking-widest">Zerar Tudo</button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
           {buckets.map(bucket => {
              const progress = (bucket.currentAmount / bucket.goalAmount) * 100;
              return (
                <div key={bucket.id} className="glass rounded-2xl p-3 border-white/5 flex flex-col justify-between h-24 relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div className="w-6 h-6 rounded-lg bg-black/40 flex items-center justify-center border border-white/5">
                       {BUCKET_ICONS[bucket.id] || <Zap size={10}/>}
                    </div>
                    <div className="flex gap-1">
                       <button onClick={() => handleEditBucketLabel(bucket.id, bucket.label)} className="text-zinc-700 hover:text-cyan-500"><Pencil size={8} /></button>
                       <button onClick={() => confirmResetBucket(bucket.id, bucket.label)} className="text-zinc-700 hover:text-red-500"><XCircle size={8} /></button>
                    </div>
                  </div>
                  
                  <div className="space-y-0.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[6px] font-black text-zinc-500 uppercase block truncate max-w-[60%]">{bucket.label}</span>
                      <span className="text-[7px] font-black text-white mono">R${bucket.currentAmount.toFixed(0)}</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-950 rounded-full mt-1 overflow-hidden border border-white/5">
                       <div className="h-full bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.4)]" style={{ width: `${Math.min(100, progress)}%` }}></div>
                    </div>
                  </div>
                </div>
              );
           })}
        </div>
      </div>

      {/* BOTÃO DE IGNIÇÃO - REPOSICIONADO PARA BAIXO */}
      {!activeJourney ? (
        <div className="fixed bottom-22 left-6 right-6 z-50 transition-all duration-300">
           <div className="p-0.5 bg-zinc-900 rounded-3xl border border-white/10 shadow-2xl">
             <button 
                onClick={() => setShowStartKmModal(true)}
                className="w-full bg-gradient-to-b from-zinc-800 to-zinc-950 p-4 rounded-[22px] flex flex-col items-center gap-2 active:scale-95 transition-all group overflow-hidden relative"
              >
                <div className="absolute top-0 left-0 w-full h-0.5 bg-cyan-500/30"></div>
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-zinc-950 border border-cyan-500/30 flex items-center justify-center text-cyan-500">
                      <Power size={16} />
                   </div>
                   <div className="text-left">
                      <span className="font-black uppercase tracking-[0.3em] text-[9px] italic text-white block">ATIVAR PROTOCOLO</span>
                      <span className="text-[6px] font-black text-cyan-500/50 uppercase tracking-widest">SISTEMA V15.0</span>
                   </div>
                </div>
              </button>
           </div>
        </div>
      ) : (
        <div className="fixed bottom-22 left-6 right-6 z-50">
           <div className="glass neon-border-cyan rounded-3xl p-4 flex items-center justify-between border-cyan-500/20">
              <div className="flex items-center gap-3">
                 <div className="w-9 h-9 rounded-xl bg-zinc-950 flex items-center justify-center text-cyan-500 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                    <Timer size={18} />
                 </div>
                 <div>
                    <span className="text-[6px] font-black text-zinc-500 uppercase tracking-widest block">EM OPERAÇÃO</span>
                    <div className="text-lg font-black text-white mono italic leading-none">{shiftTime}</div>
                 </div>
              </div>
              <div className="text-[7px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                 <Activity size={8} className="animate-pulse" /> MOTOR OK
              </div>
           </div>
        </div>
      )}

      {showStartKmModal && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[600] p-8 flex flex-col justify-center animate-in zoom-in duration-300">
           <div className="space-y-10 text-center">
              <div className="space-y-2">
                 <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-cyan-500 mx-auto border border-white/5 mb-4 shadow-2xl">
                    <ShieldCheck size={32} />
                 </div>
                 <h3 className="text-xl font-black text-white italic uppercase tracking-tighter leading-tight">Sync do Veículo</h3>
                 <p className="text-zinc-600 text-[8px] font-black uppercase tracking-widest">AJUSTE O ODÔMETRO INICIAL</p>
              </div>
              <div className="relative">
                <input 
                  type="number" value={startKm} 
                  onChange={e => setStartKm(Number(e.target.value))} 
                  className="bg-transparent text-white text-center text-6xl font-black w-full mono outline-none border-b border-zinc-800 focus:border-cyan-500/50 pb-2 transition-colors" 
                  autoFocus 
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                 <button onClick={() => setShowStartKmModal(false)} className="py-5 rounded-2xl glass text-zinc-600 font-black uppercase text-[9px] tracking-widest">CANCELAR</button>
                 <button onClick={() => { onStartJourney(startKm); setShowStartKmModal(false); }} className="py-5 rounded-2xl bg-cyan-500 text-black font-black uppercase text-[9px] tracking-widest shadow-xl shadow-cyan-500/30">INICIAR</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
