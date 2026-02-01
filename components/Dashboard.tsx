
import React, { useState, useMemo, useEffect } from 'react';
import { Journey, BudgetBucket, DashboardConfig } from '../types';
import { 
  Zap, Mic, Radar as RadarIcon, Timer, Activity, Box, Compass, 
  Home, CreditCard, Car, PiggyBank, Power, XCircle, Pencil, Plus, Settings as SettingsIcon,
  TrendingUp, Clock, Target, Rocket, ChevronRight
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
      
      {/* HEADER TÁTICO FIXO */}
      <div className="sticky top-0 z-[100] p-4 flex justify-between items-center border-b border-[var(--border-ui)] backdrop-blur-xl bg-[var(--bg-primary)]/80">
        <div className="flex flex-col">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--cyan-accent)] animate-pulse shadow-[0_0_8px_var(--cyan-accent)]"></div>
              <h1 className="text-[10px] font-black uppercase tracking-tighter text-[var(--text-primary)]">FaturandoAlto <span className="text-[var(--cyan-accent)]">V6.4</span></h1>
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

      {/* ÁREA DE CONTEÚDO - SEM OVERFLOW-Y PARA FIXAR DOUBLE SCROLL */}
      <div className="p-4 space-y-6">
        
        {/* ORACLE PREDICTOR & MAIN HUD */}
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

           <div className="col-span-4 ui-card p-4 flex flex-col items-center justify-center h-20 border-l-4 border-l-[var(--cyan-accent)]/40">
              <span className="text-[6px] font-black text-[var(--text-secondary)] uppercase mb-1 opacity-50">R$ / HORA</span>
              <div className="text-lg font-black italic mono text-[var(--text-primary)] leading-none">{stats.rPerHour.toFixed(0)}</div>
           </div>
           
           <div className="col-span-4 ui-card p-4 flex flex-col items-center justify-center h-20">
              <span className="text-[6px] font-black text-[var(--text-secondary)] uppercase mb-1 opacity-50">KMs</span>
              <div className="text-lg font-black italic mono text-[var(--text-primary)] leading-none">{stats.kmTravelled}</div>
           </div>

           <div className="col-span-4 ui-card p-4 flex flex-col items-center justify-center h-20 border-r-4 border-r-[var(--emerald-accent)]/40">
              <span className="text-[6px] font-black text-[var(--text-secondary)] uppercase mb-1 opacity-50">META MÊS</span>
              <div className="text-lg font-black italic mono text-[var(--emerald-accent)] leading-none">R$ 11K</div>
           </div>
        </div>

        {/* BOTÃO OPERACIONAL INTEGRADO NO FLUXO (NÃO BLOQUEIA MAIS OS BALDES) */}
        <div className="animate-in fade-in slide-in-from-top duration-700">
          {!activeJourney ? (
             <button 
               onClick={() => setShowStartKmModal(true)}
               className="w-full bg-[var(--bg-secondary)] border border-[var(--cyan-accent)]/30 py-4 px-6 rounded-[28px] flex items-center justify-between active:scale-95 transition-all shadow-xl"
             >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-[var(--cyan-accent)] shadow-[0_0_15px_rgba(34,211,238,0.3)] border border-[var(--cyan-accent)]/20">
                    <Power size={18} />
                  </div>
                  <div className="text-left">
                    <span className="font-black uppercase tracking-[0.2em] text-[11px] block leading-none italic text-white">ATIVAR PROTOCOLO</span>
                    <span className="text-[7px] font-bold uppercase opacity-40 tracking-widest mt-1 block">SISTEMA V6.4 READY</span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[var(--cyan-accent)] opacity-50" />
             </button>
          ) : (
             <div className="ui-card p-4 flex items-center justify-between shadow-2xl bg-[#0a0a0b] border-[var(--emerald-accent)]/30 rounded-[28px]">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-[var(--cyan-accent)] border border-[var(--border-ui)]">
                      <Timer size={20} className="animate-pulse" />
                   </div>
                   <div>
                      <span className="text-[7px] font-black text-[var(--text-secondary)] uppercase block opacity-60 italic">EM MISSÃO</span>
                      <div className="text-2xl font-black italic mono leading-none text-white">{shiftTime}</div>
                   </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="text-[7px] font-black text-[var(--emerald-accent)] uppercase flex items-center gap-1.5 bg-[var(--emerald-accent)]/10 px-3 py-1.5 rounded-full border border-[var(--emerald-accent)]/20">
                     <div className="w-1.5 h-1.5 bg-[var(--emerald-accent)] rounded-full animate-ping"></div> ONLINE
                  </div>
                </div>
             </div>
          )}
        </div>

        {/* RESERVAS DINÂMICAS - TOTALMENTE VISÍVEIS AGORA */}
        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center px-1">
             <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] flex items-center gap-2 italic">
                <Box size={14} className="text-[var(--cyan-accent)]" /> RESERVAS ATIVAS
             </span>
             <button onClick={onResetBuckets} className="text-[7px] font-black text-[var(--red-accent)] uppercase bg-[var(--red-accent)]/10 px-3 py-1.5 rounded-lg border border-[var(--red-accent)]/20 active:scale-95">ZERAR</button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {buckets.map(bucket => (
                <div key={bucket.id} className="ui-card p-4 flex flex-col justify-between h-32 relative overflow-hidden active:scale-95 transition-all bg-[var(--card-bg)]">
                    <div className="flex justify-between items-start relative z-10">
                        <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center border border-[var(--border-ui)] shadow-sm">
                            {BUCKET_ICONS[bucket.id] || <Zap size={14}/>}
                        </div>
                        <button onClick={() => { 
                          const val = prompt(`Adicionar em ${bucket.label}:`);
                          if(val && !isNaN(Number(val))) {
                            const nb = buckets.map(b => b.id === bucket.id ? {...b, currentAmount: b.currentAmount + Number(val)} : b);
                            onUpdateBuckets(nb);
                          }
                        }} className="p-1.5 text-[var(--emerald-accent)] active:scale-125 transition-transform"><Plus size={16}/></button>
                    </div>
                    <div className="mt-1 relative z-10">
                        <span className="text-[7px] font-black text-[var(--text-primary)] uppercase block truncate opacity-70 italic mb-1">{bucket.label}</span>
                        <div className="flex justify-between items-end">
                            <div className="text-xl font-black italic mono leading-none text-white">
                              <span className="text-[10px] text-[var(--cyan-accent)] mr-0.5">R$</span>{bucket.currentAmount.toFixed(0)}
                            </div>
                            <div className="w-12 h-1 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-ui)] mb-1">
                                <div className="h-full bg-[var(--cyan-accent)] shadow-[0_0_8px_var(--cyan-accent)]" style={{ width: `${Math.min(100, (bucket.currentAmount/bucket.goalAmount)*100)}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
          </div>
        </div>

        {/* ESPAÇADOR FINAL PARA GARANTIR QUE O ÚLTIMO ITEM NÃO COLE NO MENU */}
        <div className="h-10" />
      </div>

      {showStartKmModal && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[1000] p-8 flex flex-col justify-center animate-in zoom-in duration-200">
           <div className="text-center space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Sincronizar Odômetro</h3>
                <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">Ajuste conforme o painel do carro</p>
              </div>
              <input 
                type="number" value={startKm} 
                onChange={e => setStartKm(Number(e.target.value))} 
                className="bg-transparent text-white text-center text-8xl font-black w-full mono outline-none border-b-2 border-zinc-900 focus:border-[var(--cyan-accent)] pb-4 transition-all" 
                autoFocus 
              />
              <div className="grid grid-cols-2 gap-4 mt-8">
                 <button onClick={() => setShowStartKmModal(false)} className="py-6 rounded-3xl ui-card text-zinc-500 font-black uppercase text-xs tracking-[0.3em]">VOLTAR</button>
                 <button onClick={() => { onStartJourney(startKm); setShowStartKmModal(false); }} className="py-6 rounded-3xl bg-[var(--cyan-accent)] text-black font-black uppercase text-xs tracking-[0.3em] shadow-xl">INICIAR</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
