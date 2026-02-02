
import React, { useState, useMemo, useEffect } from 'react';
import { Journey, BudgetBucket, DashboardConfig } from '../types';
import { 
  Zap, Mic, Radar as RadarIcon, Timer, Box, 
  Car, CreditCard, Home, PiggyBank, Power, 
  Plus, Rocket, Clock, ChevronRight, Play, RefreshCw
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
  '1': <Car size={14} />,
  '2': <CreditCard size={14} />,
  '3': <Home size={14} />,
  '4': <PiggyBank size={14} />,
};

const Dashboard: React.FC<DashboardProps> = ({ 
  history, buckets, onUpdateBuckets, onResetBuckets, onResetSingleBucket, onStartJourney, 
  activeJourney, currentKm, onStartVoice, onOpenRadar, dashboardConfig, onGoToSettings
}) => {
  const [showStartKmModal, setShowStartKmModal] = useState(false);
  const [startKmInput, setStartKmInput] = useState(currentKm.toString());
  const [shiftTime, setShiftTime] = useState('00:00:00');

  const stats = useMemo(() => {
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
    const dailyTarget = 400;
    const progress = Math.min(100, (realNet / dailyTarget) * 100);
    
    return { realNet, progress, status: progress >= 100 ? 'CONCLUÍDO' : 'EM MISSÃO' };
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

  return (
    <div className="flex flex-col min-h-full">
      {/* HEADER COMPACTO */}
      <div className="sticky top-0 z-[100] px-4 py-3 flex justify-between items-center border-b border-[var(--border-ui)] backdrop-blur-2xl bg-[var(--bg-primary)]/80">
        <div className="flex flex-col">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--accent-main)] pulse-active"></div>
              <h1 className="text-[10px] font-black uppercase tracking-tighter text-[var(--text-primary)]">FATURANDOALTO <span className="text-[var(--accent-main)]">6.5</span></h1>
           </div>
           <span className="text-[6px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-0.5 italic">COCKPIT ATIVO</span>
        </div>
        <div className="flex gap-2">
           <button onClick={onOpenRadar} className="w-9 h-9 ui-card flex items-center justify-center text-[var(--accent-sec)] btn-active"><RadarIcon size={16}/></button>
           <button onClick={onStartVoice} className="w-9 h-9 ui-card flex items-center justify-center text-[var(--danger)] btn-active"><Mic size={16}/></button>
        </div>
      </div>

      <div className="p-4 space-y-3 pb-32 no-scrollbar">
        {/* TELEMETRIA ULTRA-COMPACTA */}
        <div onClick={onGoToSettings} className="ui-card p-4 flex flex-col justify-center min-h-[110px] relative overflow-hidden group active:scale-[0.98] transition-all">
           <div className="absolute -right-2 -top-2 opacity-[0.05]">
              <Rocket size={80} className="rotate-45 text-[var(--accent-main)]" />
           </div>
           
           <div className="flex justify-between items-start mb-2">
             <div>
               <span className="text-[7px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1 block italic">LUCRO LÍQUIDO HOJE</span>
               <div className="flex items-baseline gap-1">
                  <span className="text-[var(--accent-main)] text-xs font-black italic">R$</span>
                  <span className="text-4xl font-black mono italic tracking-tighter text-[var(--text-primary)]">{stats.realNet.toFixed(0)}</span>
               </div>
             </div>
             <div className="text-right">
                <span className="text-[7px] font-black text-[var(--success)] uppercase tracking-widest mb-1 block italic">STATUS</span>
                <div className="text-[10px] font-black text-[var(--text-primary)] italic mono flex items-center gap-1 justify-end uppercase">
                   <Clock size={10} className="text-[var(--accent-main)]" /> {stats.status}
                </div>
             </div>
           </div>

           <div className="space-y-1">
             <div className="flex justify-between text-[6px] font-black uppercase tracking-widest">
                <span className="text-[var(--text-secondary)]">PERFORMANCE GERAL</span>
                <span className="text-[var(--accent-main)]">{stats.progress.toFixed(0)}%</span>
             </div>
             <div className="w-full h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[var(--accent-main)] to-[var(--accent-sec)] transition-all duration-1000" style={{ width: `${stats.progress}%` }}></div>
             </div>
           </div>
        </div>

        {/* CONTROLES DE MISSÃO */}
        {!activeJourney ? (
           <button 
             onClick={() => { setStartKmInput(currentKm.toString()); setShowStartKmModal(true); }}
             className="w-full bg-[var(--accent-main)] py-4 px-5 rounded-[20px] flex items-center justify-between btn-active shadow-lg"
           >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center text-white"><Power size={18} /></div>
                <div className="text-left">
                  <span className="font-black uppercase tracking-[0.1em] text-[11px] block text-white italic">INICIAR CÂMBIO</span>
                  <span className="text-[6px] font-bold uppercase text-white/70 tracking-widest block">TELEMETRIA PRONTA</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-white" />
           </button>
        ) : (
           <div className="ui-card p-4 flex items-center justify-between bg-[var(--bg-secondary)] border-[var(--success)]/20">
              <div className="flex items-center gap-3">
                 <div className="w-9 h-9 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--accent-main)] border border-[var(--border-ui)]">
                    <Timer size={18} className="animate-pulse" />
                 </div>
                 <div>
                    <span className="text-[6px] font-black text-[var(--text-secondary)] uppercase block italic tracking-widest">DURAÇÃO ATUAL</span>
                    <div className="text-xl font-black italic mono leading-none text-[var(--text-primary)] tracking-tighter">{shiftTime}</div>
                 </div>
              </div>
              <div className="text-[6px] font-black text-[var(--success)] uppercase flex items-center gap-1 bg-[var(--success)]/10 px-2 py-1.5 rounded-full border border-[var(--success)]/20">
                 <div className="w-1 h-1 bg-[var(--success)] rounded-full animate-ping"></div> ATIVO
              </div>
           </div>
        )}

        {/* BUCKETS ULTRA-COMPACTOS */}
        <div className="space-y-2 pt-1">
          <div className="flex justify-between items-center px-1">
             <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] flex items-center gap-2 italic">
                <Box size={12} className="text-[var(--accent-main)]" /> CÉLULAS FINANCEIRAS
             </span>
             <button onClick={onResetBuckets} className="text-[6px] font-black text-[var(--danger)] uppercase">ZERAR TUDO</button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {buckets.map(bucket => {
                const percentage = Math.min(100, Math.floor((bucket.currentAmount / bucket.goalAmount) * 100));
                const isComplete = percentage >= 100;
                const remaining = Math.max(0, bucket.goalAmount - bucket.currentAmount);
                
                return (
                    <div key={bucket.id} className="ui-card p-3 flex flex-col justify-between h-[130px] relative overflow-hidden bg-[var(--bg-secondary)] active:scale-[0.97] transition-all">
                        <div className="flex justify-between items-start">
                            <div className="w-7 h-7 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--accent-main)] border border-[var(--border-ui)]">
                                {BUCKET_ICONS[bucket.id] || <Zap size={12}/>}
                            </div>
                            <div className="flex gap-1">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); if(confirm(`Zerar ${bucket.label}?`)) onResetSingleBucket(bucket.id); }}
                                  className="w-7 h-7 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--danger)] transition-all border border-[var(--border-ui)]"
                                >
                                  <RefreshCw size={10} />
                                </button>
                                <div className="text-[7px] font-black mono italic text-[var(--accent-main)] bg-[var(--accent-main)]/5 px-1.5 py-1 rounded-md border border-[var(--accent-main)]/20">
                                    {percentage}%
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-1">
                            <span className="text-[7px] font-black text-[var(--text-secondary)] uppercase truncate block mb-1 italic">{bucket.label}</span>
                            
                            <div className="flex justify-between items-end mb-1">
                                <div className="text-sm font-black italic mono leading-none text-[var(--text-primary)] tracking-tighter">
                                  <span className="text-[8px] text-[var(--accent-main)] mr-0.5">R$</span>{bucket.currentAmount.toFixed(0)}
                                </div>
                                <span className={`text-[6px] font-black mono italic ${isComplete ? 'text-[var(--success)]' : 'text-[var(--text-secondary)]'}`}>
                                  {isComplete ? 'FULL' : `-${remaining.toFixed(0)}`}
                                </span>
                            </div>
                            
                            <div className="w-full h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden mb-2">
                                <div className={`h-full transition-all duration-700 ${isComplete ? 'bg-[var(--success)]' : 'bg-[var(--accent-main)]'}`} style={{ width: `${percentage}%` }}></div>
                            </div>

                            <button 
                                onClick={(e) => { 
                                  e.stopPropagation();
                                  const val = prompt(`Aporte p/ ${bucket.label}:`);
                                  if(val && !isNaN(Number(val))) {
                                    onUpdateBuckets(buckets.map(b => b.id === bucket.id ? {...b, currentAmount: b.currentAmount + Number(val)} : b));
                                  }
                                }} 
                                className="w-full py-1.5 rounded-lg bg-[var(--accent-main)]/10 text-[var(--accent-main)] text-[7px] font-black uppercase tracking-widest border border-[var(--accent-main)]/20 active:bg-[var(--accent-main)]/20 transition-all flex items-center justify-center gap-1"
                            >
                                <Plus size={9}/> APORTE
                            </button>
                        </div>
                    </div>
                );
            })}
          </div>
        </div>
      </div>

      {/* MODAL START KM */}
      {showStartKmModal && (
          <div className="fixed inset-0 z-[1000] bg-[var(--bg-primary)]/98 backdrop-blur-3xl flex flex-col items-center justify-center p-6 animate-in zoom-in duration-300">
             <div className="w-full max-w-sm space-y-8 text-center">
                <div className="w-16 h-16 rounded-[20px] bg-[var(--accent-main)]/10 border border-[var(--accent-main)]/20 flex items-center justify-center text-[var(--accent-main)] mx-auto">
                   <Car size={28} />
                </div>
                <div>
                   <h3 className="text-[var(--text-primary)] font-black text-2xl uppercase italic tracking-tighter">Telemetria</h3>
                   <p className="text-[var(--text-secondary)] text-[8px] font-black uppercase tracking-[0.4em] mt-2 italic">VALIDAR ODÔMETRO DE SAÍDA</p>
                </div>
                
                <div className="bg-[var(--bg-secondary)] p-6 rounded-[32px] border border-[var(--border-ui)]">
                   <input 
                     type="number" value={startKmInput}
                     onChange={(e) => setStartKmInput(e.target.value)}
                     className="bg-transparent text-[var(--text-primary)] text-6xl font-black w-full text-center outline-none mono italic tracking-tighter"
                     autoFocus
                   />
                </div>

                <div className="flex gap-3">
                   <button onClick={() => setShowStartKmModal(false)} className="flex-1 py-5 rounded-2xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] font-black uppercase text-[10px] tracking-widest">CANCELAR</button>
                   <button 
                     onClick={() => { onStartJourney(Number(startKmInput)); setShowStartKmModal(false); }}
                     className="flex-1 py-5 rounded-2xl bg-[var(--accent-main)] text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-[var(--accent-main)]/30"
                   >
                     INICIAR <Play size={14} className="inline ml-1" />
                   </button>
                </div>
             </div>
          </div>
        )}
    </div>
  );
};

export default Dashboard;
