
import React, { useState, useMemo, useEffect } from 'react';
import { Journey, BudgetBucket, DashboardConfig } from '../types';
import { 
  Zap, Mic, Radar as RadarIcon, Timer, Activity, Box, Compass, 
  Home, CreditCard, Car, PiggyBank, Power, XCircle, Pencil, Plus
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
  '1': <Car size={14} className="text-[var(--cyan-accent)]" />,
  '2': <CreditCard size={14} className="text-purple-500" />,
  '3': <Home size={14} className="text-[var(--emerald-accent)]" />,
  '4': <PiggyBank size={14} className="text-orange-500" />,
};

const Dashboard: React.FC<DashboardProps> = ({ 
  history, buckets, onUpdateBuckets, onResetBuckets, onResetSingleBucket, onStartJourney, 
  activeJourney, currentKm, onStartVoice, onOpenRadar, dashboardConfig, onGoToSettings
}) => {
  const [showStartKmModal, setShowStartKmModal] = useState(false);
  const [startKm, setStartKm] = useState(currentKm);
  const [shiftTime, setShiftTime] = useState('00:00:00');

  const todayStats = useMemo(() => {
    const now = new Date();
    const isToday = (t: number) => {
      const d = new Date(t);
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    };
    let gross = 0, kmTravelled = 0;
    history.forEach(j => { 
      if (isToday(j.startTime)) { 
        gross += j.rides.reduce((a, r) => a + r.value, 0); 
        kmTravelled += Math.max(0, (j.endKm || j.startKm) - j.startKm);
      } 
    });
    if (activeJourney) {
        gross += activeJourney.rides.reduce((a, r) => a + r.value, 0);
        kmTravelled += Math.max(0, currentKm - activeJourney.startKm);
    }
    const realNet = gross - (kmTravelled * (dashboardConfig.costPerKm || 0.45));
    return { realNet, kmTravelled, progress: Math.min(100, (realNet / 380) * 100) };
  }, [history, activeJourney, currentKm, dashboardConfig.costPerKm]);

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

  const handleManualAddValue = (id: string, currentAmount: number, label: string) => {
    const valStr = prompt(`Quanto deseja adicionar a "${label}"? (R$)`);
    const val = parseFloat(valStr || "0");
    if (!isNaN(val) && val > 0) {
      const newBuckets = buckets.map(b => b.id === id ? { ...b, currentAmount: b.currentAmount + val } : b);
      onUpdateBuckets(newBuckets);
    }
  };

  return (
    <div className="p-4 pb-48 space-y-4 overflow-y-auto no-scrollbar h-full relative z-10">
      
      {/* HEADER TÁTICO COMPACTO */}
      <div className="flex justify-between items-center py-1">
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-[var(--cyan-accent)] animate-pulse"></div>
           <h1 className="text-[11px] font-extrabold uppercase tracking-tighter">FaturandoAlto <span className="text-[var(--cyan-accent)]">PRO 16.2</span></h1>
        </div>
        <div className="flex gap-2">
           <button onClick={onOpenRadar} className="w-9 h-9 ui-card flex items-center justify-center text-[var(--cyan-accent)] btn-active"><RadarIcon size={16}/></button>
           <button onClick={onStartVoice} className="w-9 h-9 ui-card flex items-center justify-center text-[var(--red-accent)] btn-active"><Mic size={16}/></button>
        </div>
      </div>

      {/* PERFORMANCE HUD */}
      <div className="grid grid-cols-12 gap-2">
         <div onClick={onGoToSettings} className="col-span-12 ui-card p-4 flex flex-col justify-center h-24 btn-active">
            <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">LUCRO REAL HOJE</span>
            <div className="flex items-baseline gap-1">
               <span className="text-[var(--cyan-accent)] text-xs font-black italic">R$</span>
               <span className="text-3xl font-black mono italic tracking-tighter">{todayStats.realNet.toFixed(0)}</span>
            </div>
            <div className="mt-2 w-full h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-ui)]">
               <div className="h-full bg-[var(--cyan-accent)]" style={{ width: `${todayStats.progress}%` }}></div>
            </div>
         </div>

         <div className="col-span-6 ui-card p-3 flex flex-col justify-center h-16">
            <span className="text-[7px] font-black text-[var(--text-secondary)] uppercase flex items-center gap-1"><Compass size={10}/> DISTÂNCIA</span>
            <div className="text-lg font-black italic mono leading-none">{todayStats.kmTravelled} <span className="text-[8px]">KM</span></div>
         </div>
         <div className="col-span-6 ui-card p-3 flex flex-col justify-center h-16">
            <span className="text-[7px] font-black text-[var(--text-secondary)] uppercase flex items-center gap-1"><Zap size={10}/> PROGRESSO</span>
            <div className="text-lg font-black italic mono text-[var(--emerald-accent)] leading-none">{todayStats.progress.toFixed(0)}%</div>
         </div>
      </div>

      {/* RESERVAS - COM ÁREA DE ROLAGEM INTERNA */}
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
           <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
              <Box size={12} className="text-[var(--cyan-accent)]" /> RESERVAS ATIVAS
           </span>
           <button onClick={onResetBuckets} className="text-[7px] font-black text-[var(--red-accent)] uppercase bg-[var(--red-accent)]/10 px-2 py-1 rounded-md border border-[var(--red-accent)]/20 active:scale-95">ZERAR TODOS</button>
        </div>
        
        {/* CONTAINER COM ROLAGEM INTERNA - Padding ajustado */}
        <div className="max-h-[260px] overflow-y-auto pr-1 no-scrollbar space-y-2 pb-4">
            <div className="grid grid-cols-2 gap-2 pb-2">
            {buckets.map(bucket => (
                <div key={bucket.id} className="ui-card p-3 flex flex-col justify-between h-28 shrink-0">
                    <div className="flex justify-between items-start">
                        <div className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center border border-[var(--border-ui)] shrink-0">
                            {BUCKET_ICONS[bucket.id] || <Zap size={12}/>}
                        </div>
                        <div className="flex gap-0.5">
                            <button onClick={() => handleManualAddValue(bucket.id, bucket.currentAmount, bucket.label)} className="p-1.5 text-[var(--emerald-accent)] active:scale-125 transition-transform"><Plus size={14}/></button>
                            <button onClick={() => handleEditBucketLabel(bucket.id, bucket.label)} className="p-1.5 text-[var(--text-secondary)] active:text-[var(--cyan-accent)]"><Pencil size={12}/></button>
                            <button onClick={() => { if(confirm(`Zerar ${bucket.label}?`)) onResetSingleBucket(bucket.id); }} className="p-1.5 text-[var(--red-accent)]/40 active:text-[var(--red-accent)]"><XCircle size={12}/></button>
                        </div>
                    </div>
                    <div className="mt-1">
                        <span className="text-[8px] font-black text-[var(--text-primary)] uppercase block truncate">{bucket.label}</span>
                        <div className="flex justify-between items-end mt-1">
                            <div className="text-lg font-black italic mono leading-none">R${bucket.currentAmount.toFixed(0)}</div>
                            <div className="w-10 h-1 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-ui)] mb-1">
                                <div className="h-full bg-[var(--cyan-accent)]" style={{ width: `${Math.min(100, (bucket.currentAmount/bucket.goalAmount)*100)}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            </div>
        </div>
      </div>

      {/* BOTÃO OPERACIONAL FIXO - Elevado para evitar colisão com o menu inferior */}
      <div className="fixed bottom-28 left-4 right-4 z-[60]">
        {!activeJourney ? (
           <button 
             onClick={() => setShowStartKmModal(true)}
             className="w-full bg-[var(--text-primary)] text-[var(--bg-primary)] p-4 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl border-2 border-transparent"
           >
              <div className="w-9 h-9 rounded-full bg-[var(--bg-primary)] flex items-center justify-center text-[var(--cyan-accent)] shadow-lg">
                <Power size={18} />
              </div>
              <div className="text-left">
                <span className="font-black uppercase tracking-widest text-[11px] block leading-none">ATIVAR PROTOCOLO</span>
                <span className="text-[7px] font-bold uppercase opacity-60">SISTEMA V16.2 READY</span>
              </div>
           </button>
        ) : (
           <div className="ui-card p-4 flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-3">
                 <div className="w-9 h-9 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--cyan-accent)] border border-[var(--border-ui)]">
                    <Timer size={18} />
                 </div>
                 <div>
                    <span className="text-[7px] font-black text-[var(--text-secondary)] uppercase block">MISSÃO EM CURSO</span>
                    <div className="text-xl font-black italic mono leading-none">{shiftTime}</div>
                 </div>
              </div>
              <div className="text-[8px] font-black text-[var(--emerald-accent)] uppercase flex items-center gap-1.5 bg-[var(--emerald-accent)]/10 px-2 py-1.5 rounded-full border border-[var(--emerald-accent)]/20">
                 <div className="w-1.5 h-1.5 bg-[var(--emerald-accent)] rounded-full animate-pulse"></div> ATIVO
              </div>
           </div>
        )}
      </div>

      {showStartKmModal && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[600] p-8 flex flex-col justify-center animate-in zoom-in duration-200">
           <div className="text-center space-y-6">
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Sincronizar Odômetro</h3>
              <input 
                type="number" value={startKm} 
                onChange={e => setStartKm(Number(e.target.value))} 
                className="bg-transparent text-white text-center text-6xl font-black w-full mono outline-none border-b-2 border-zinc-800 focus:border-[var(--cyan-accent)] pb-2" 
                autoFocus 
              />
              <div className="grid grid-cols-2 gap-3 mt-8">
                 <button onClick={() => setShowStartKmModal(false)} className="py-4 rounded-xl ui-card text-zinc-500 font-black uppercase text-[10px]">CANCELAR</button>
                 <button onClick={() => { onStartJourney(startKm); setShowStartKmModal(false); }} className="py-4 rounded-xl bg-[var(--cyan-accent)] text-black font-black uppercase text-[10px]">INICIAR</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
