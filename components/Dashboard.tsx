
import React, { useState, useMemo, useEffect } from 'react';
import { Journey, BudgetBucket, DashboardConfig } from '../types';
import { 
  Zap, Mic, Radar as RadarIcon, Timer, Box, 
  Car, CreditCard, Home, PiggyBank, Power, 
  Pencil, Plus, Trash2, Rocket, Clock, ChevronRight
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
  '1': <Car size={16} className="text-[var(--cyan-accent)]" />,
  '2': <CreditCard size={16} className="text-purple-500" />,
  '3': <Home size={16} className="text-[var(--emerald-accent)]" />,
  '4': <PiggyBank size={16} className="text-orange-500" />,
};

const Dashboard: React.FC<DashboardProps> = ({ 
  history, buckets, onUpdateBuckets, onResetBuckets, onResetSingleBucket, onStartJourney, 
  activeJourney, currentKm, onStartVoice, onOpenRadar, dashboardConfig, onGoToSettings
}) => {
  const [showStartKmModal, setShowStartKmModal] = useState(false);
  const [startKm, setStartKm] = useState(currentKm);
  const [shiftTime, setShiftTime] = useState('00:00:00');

  const stats = useMemo(() => {
    const now = new Date();
    const isToday = (t: number) => {
      const d = new Date(t);
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    };
    
    let gross = 0, kmTravelled = 0, durationMs = 0;
    
    history.forEach(j => { 
      if (isToday(j.startTime)) { 
        gross += j.rides.reduce((a, r) => a + r.value, 0); 
        kmTravelled += Math.max(0, (j.endKm || j.startKm) - j.startKm);
        if (j.endTime) durationMs += (j.endTime - j.startTime);
      } 
    });

    if (activeJourney) {
        gross += activeJourney.rides.reduce((a, r) => a + r.value, 0);
        kmTravelled += Math.max(0, currentKm - activeJourney.startKm);
        durationMs += (Date.now() - activeJourney.startTime);
    }

    const realNet = gross - (kmTravelled * (dashboardConfig.costPerKm || 0.45));
    const hours = durationMs / 3600000;
    const rPerHour = hours > 0.1 ? realNet / hours : 0;
    
    const dailyTarget = 380;
    const remaining = Math.max(0, dailyTarget - realNet);
    const hoursToTarget = rPerHour > 0 ? remaining / rPerHour : 0;
    const estimatedTime = new Date(Date.now() + hoursToTarget * 3600000);
    
    return { 
      realNet, 
      kmTravelled, 
      progress: Math.min(100, (realNet / dailyTarget) * 100),
      rPerHour,
      eta: hoursToTarget > 0 ? estimatedTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'BATIDA!'
    };
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
    <div className="flex flex-col bg-[var(--bg-primary)] min-h-full">
      
      {/* HEADER TÁTICO */}
      <div className="sticky top-0 z-[100] p-4 flex justify-between items-center border-b border-[var(--border-ui)] backdrop-blur-xl bg-[var(--bg-primary)]/80">
        <div className="flex flex-col">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--cyan-accent)] animate-pulse shadow-[0_0_8px_var(--cyan-accent)]"></div>
              <h1 className="text-[10px] font-black uppercase tracking-tighter text-[var(--text-primary)]">FaturandoAlto <span className="text-[var(--cyan-accent)]">Pro 16.4</span></h1>
           </div>
           <span className="text-[6px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.3em] mt-0.5 opacity-60">SISTEMA ATIVO</span>
        </div>
        <div className="flex gap-3">
           <button onClick={onOpenRadar} className="w-11 h-11 ui-card flex items-center justify-center text-[var(--cyan-accent)] btn-active shadow-lg border-[var(--cyan-accent)]/20 active:bg-[var(--cyan-accent)]/10 transition-all">
              <RadarIcon size={18}/>
           </button>
           <button onClick={onStartVoice} className="w-11 h-11 ui-card flex items-center justify-center text-[var(--red-accent)] btn-active shadow-lg border-[var(--red-accent)]/20 active:bg-[var(--red-accent)]/10 transition-all">
              <Mic size={18}/>
           </button>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-32">
        
        {/* HUD PRINCIPAL */}
        <div className="grid grid-cols-12 gap-3">
           <div onClick={onGoToSettings} className="col-span-12 ui-card p-6 flex flex-col justify-center min-h-[140px] btn-active relative overflow-hidden group border-[var(--cyan-accent)]/10">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Rocket size={80} className="text-[var(--cyan-accent)] rotate-45" />
              </div>
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1 block opacity-60">LUCRO REAL HOJE</span>
                  <div className="flex items-baseline gap-1">
                     <span className="text-[var(--cyan-accent)] text-xs font-black italic">R$</span>
                     <span className="text-5xl font-black mono italic tracking-tighter text-[var(--text-primary)]">{stats.realNet.toFixed(0)}</span>
                  </div>
                </div>
                <div className="text-right">
                   <span className="text-[8px] font-black text-[var(--emerald-accent)] uppercase tracking-widest mb-1 block">PREVISÃO META</span>
                   <div className="text-lg font-black text-white italic mono flex items-center gap-2 justify-end">
                      <Clock size={14} className="text-[var(--cyan-accent)]" /> {stats.eta}
                   </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[7px] font-black uppercase tracking-widest">
                   <span className="text-[var(--text-secondary)]">PROGRESSO DIÁRIO</span>
                   <span className="text-[var(--cyan-accent)]">{stats.progress.toFixed(0)}%</span>
                </div>
                <div className="w-full h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-ui)]">
                   <div className="h-full bg-gradient-to-r from-[var(--cyan-accent)] to-[#6366f1] shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all duration-1000" style={{ width: `${stats.progress}%` }}></div>
                </div>
              </div>
           </div>
        </div>

        {/* CONTROLES DE JORNADA */}
        {!activeJourney ? (
           <button 
             onClick={() => setShowStartKmModal(true)}
             className="w-full bg-[var(--bg-secondary)] border border-[var(--cyan-accent)]/30 py-5 px-6 rounded-[28px] flex items-center justify-between active:scale-95 transition-all shadow-xl"
           >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-black flex items-center justify-center text-[var(--cyan-accent)] shadow-[0_0_15px_rgba(34,211,238,0.3)] border border-[var(--cyan-accent)]/20">
                  <Power size={20} />
                </div>
                <div className="text-left">
                  <span className="font-black uppercase tracking-[0.2em] text-[12px] block leading-none italic text-white">INICIAR JORNADA</span>
                  <span className="text-[7px] font-bold uppercase opacity-40 tracking-widest mt-1 block">PROTOCOLO PRONTO</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-[var(--cyan-accent)] opacity-50" />
           </button>
        ) : (
           <div className="ui-card p-5 flex items-center justify-between shadow-2xl bg-[#0a0a0b] border-[var(--emerald-accent)]/30 rounded-[28px]">
              <div className="flex items-center gap-4">
                 <div className="w-11 h-11 rounded-xl bg-black flex items-center justify-center text-[var(--cyan-accent)] border border-[var(--border-ui)]">
                    <Timer size={22} className="animate-pulse" />
                 </div>
                 <div>
                    <span className="text-[7px] font-black text-[var(--text-secondary)] uppercase block opacity-60 italic">EM OPERAÇÃO</span>
                    <div className="text-2xl font-black italic mono leading-none text-white">{shiftTime}</div>
                 </div>
              </div>
              <div className="text-[7px] font-black text-[var(--emerald-accent)] uppercase flex items-center gap-1.5 bg-[var(--emerald-accent)]/10 px-3 py-1.5 rounded-full border border-[var(--emerald-accent)]/20">
                 <div className="w-1.5 h-1.5 bg-[var(--emerald-accent)] rounded-full animate-ping"></div> ONLINE
              </div>
           </div>
        )}

        {/* BALDES DE RESERVA FINANCEIRA */}
        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center px-1">
             <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] flex items-center gap-2 italic">
                <Box size={14} className="text-[var(--cyan-accent)]" /> GESTÃO DE BALDES
             </span>
             <button onClick={onResetBuckets} className="text-[7px] font-black text-[var(--red-accent)] uppercase bg-[var(--red-accent)]/10 px-3 py-1.5 rounded-lg border border-[var(--red-accent)]/20 active:scale-95 transition-all">LIMPAR TUDO</button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {buckets.map(bucket => {
                const percentage = Math.min(100, Math.floor((bucket.currentAmount / bucket.goalAmount) * 100));
                const isComplete = percentage >= 100;
                const remaining = Math.max(0, bucket.goalAmount - bucket.currentAmount);
                
                return (
                    <div key={bucket.id} className="ui-card p-5 flex flex-col justify-between h-44 relative overflow-hidden active:scale-[0.98] transition-all bg-[var(--card-bg)] border-[var(--border-ui)]">
                        <div className="flex justify-between items-start relative z-10">
                            <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center border border-[var(--border-ui)]">
                                {BUCKET_ICONS[bucket.id] || <Zap size={12}/>}
                            </div>
                            <div className="text-[8px] font-black mono italic text-[var(--cyan-accent)] bg-black/40 px-2 py-1 rounded-md">
                                {percentage}%
                            </div>
                        </div>
                        
                        <div className="mt-2 relative z-10">
                            <span className="text-[9px] font-black text-[var(--text-primary)] uppercase truncate opacity-70 italic block mb-2">{bucket.label}</span>
                            
                            <div className="flex justify-between items-end mb-2">
                                <div className="text-lg font-black italic mono leading-none text-white">
                                  <span className="text-[9px] text-[var(--cyan-accent)] mr-0.5">R$</span>{bucket.currentAmount.toFixed(0)}
                                </div>
                                <span className={`text-[6px] font-black mono italic ${isComplete ? 'text-[var(--emerald-accent)] animate-pulse' : 'text-zinc-500'}`}>
                                  {isComplete ? 'META OK' : `R$ -${remaining.toFixed(0)}`}
                                </span>
                            </div>
                            
                            <div className="w-full h-1 bg-black rounded-full overflow-hidden border border-white/5 relative">
                                <div 
                                    className={`h-full transition-all duration-700 ease-out ${isComplete ? 'bg-[var(--emerald-accent)]' : 'bg-[var(--cyan-accent)]'}`} 
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>

                            <button 
                                onClick={(e) => { 
                                  e.stopPropagation();
                                  const val = prompt(`Aporte em ${bucket.label}:`);
                                  if(val && !isNaN(Number(val))) {
                                    const nb = buckets.map(b => b.id === bucket.id ? {...b, currentAmount: b.currentAmount + Number(val)} : b);
                                    onUpdateBuckets(nb);
                                  }
                                }} 
                                className="w-full mt-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--emerald-accent)] text-[7px] font-black uppercase tracking-widest border border-white/5 active:bg-zinc-800 transition-all flex items-center justify-center gap-1"
                            >
                                <Plus size={8}/> APORTAR
                            </button>
                        </div>
                    </div>
                );
            })}
          </div>
        </div>
      </div>
      {/* RESTO DO COMPONENTE DASHBOARD MANTIDO... */}
    </div>
  );
};

export default Dashboard;
