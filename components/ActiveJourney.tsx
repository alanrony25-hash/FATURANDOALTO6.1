
import React, { useState, useMemo, useEffect } from 'react';
import { Journey, Ride, Expense, ExpenseType } from '../types';
import { 
  Target, Minimize2, Timer, Activity, DollarSign, Gauge, Plus, Trash2, Fuel, Utensils, Wrench, 
  Coins, MapPin, CreditCard, Wifi, ArrowRightLeft, Home, Play, Pause, Coffee, X, ChevronRight
} from 'lucide-react';

interface ActiveJourneyProps {
  journey: Journey;
  onEndJourney: (finalKm: number, platformGross: Record<string, number>, finalExpenses: Expense[]) => void;
  dailyGoal: number;
  onMinimize: () => void;
}

const ActiveJourney: React.FC<ActiveJourneyProps> = ({ journey, onEndJourney, dailyGoal, onMinimize }) => {
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [platformGross, setPlatformGross] = useState<Record<string, string>>({ Uber: '', '99': '', InDrive: '', Particular: '' });
  const [finalKm, setFinalKm] = useState(journey.startKm);
  const [shiftTime, setShiftTime] = useState('00:00:00');

  useEffect(() => {
    const interval = setInterval(() => {
        const diff = Date.now() - journey.startTime;
        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        setShiftTime(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [journey.startTime]);

  const quickAddValue = (platform: string, amount: number) => {
    setPlatformGross(prev => ({
      ...prev,
      [platform]: (Number(prev[platform] || 0) + amount).toString()
    }));
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#020617] relative">
      {/* GRADIENTE DE FUNDO DINÂMICO */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-violet-900/10 to-transparent pointer-events-none"></div>
      
      {/* HEADER FIXO */}
      <div className="p-8 pt-14 flex justify-between items-center shrink-0 relative z-10">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center border border-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
              <Target size={28} className="animate-pulse" />
           </div>
           <div>
              <h2 className="text-base font-black text-white uppercase italic tracking-tighter leading-none">EM OPERAÇÃO</h2>
              <span className="text-[8px] text-slate-500 uppercase tracking-[0.5em] block mt-2 font-bold">STEALTH PROTOCOL ACTV</span>
           </div>
        </div>
        <button onClick={onMinimize} className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-400 active:scale-90 transition-all border border-white/5">
          <Minimize2 size={22}/>
        </button>
      </div>

      {/* HUD CENTRAL */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-14 relative z-10">
         <div className="relative group">
            <div className="absolute inset-0 bg-violet-600/10 rounded-full blur-[80px] animate-pulse"></div>
            <div className="w-72 h-72 rounded-full border-2 border-slate-900 bg-slate-950/50 flex flex-col items-center justify-center relative z-10 shadow-[inset_0_0_40px_rgba(255,255,255,0.01)] backdrop-blur-md">
               <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] mb-3 italic">SHIFT TIMER</span>
               <div className="text-7xl font-black mono italic text-white tracking-tighter leading-none">{shiftTime}</div>
            </div>
         </div>

         {/* MÉTRICAS DE SUPORTE */}
         <div className="grid grid-cols-2 gap-4 w-full max-w-sm px-4">
            <div className="bg-slate-900/50 border border-white/5 p-6 rounded-[32px] flex flex-col items-center text-center">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">CUSTOS</span>
               <div className="text-2xl font-black text-white mono italic">R$ 0,00</div>
            </div>
            <div className="bg-slate-900/50 border border-white/5 p-6 rounded-[32px] flex flex-col items-center text-center">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">ROTA</span>
               <div className="text-2xl font-black text-violet-500 mono italic tracking-tighter">DATA...</div>
            </div>
         </div>
      </div>

      {/* RODAPÉ DE AÇÃO */}
      <div className="p-8 pb-14 flex gap-4 shrink-0 relative z-10">
         <button className="w-20 h-20 rounded-3xl bg-slate-900 text-slate-500 flex items-center justify-center active:bg-slate-800 transition-all border border-white/5 shadow-xl">
           <Pause size={28} fill="currentColor" />
         </button>
         <button 
           onClick={() => setShowEndConfirm(true)} 
           className="flex-1 bg-violet-500 text-black py-7 rounded-[32px] font-black text-xs uppercase tracking-[0.5em] shadow-[0_20px_40px_rgba(139,92,246,0.3)] active:scale-95 transition-all"
         >
           FECHAR JORNADA
         </button>
      </div>

      {showEndConfirm && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-3xl z-[500] p-6 flex flex-col animate-in slide-in-from-bottom duration-400">
           <div className="flex-1 flex flex-col pt-10 space-y-10 overflow-y-auto no-scrollbar pb-10 px-4">
              <div className="flex justify-between">
                 {[1,2,3].map(s => <div key={s} className={`h-2 flex-1 rounded-full mx-2 transition-all duration-700 ${step >= s ? 'bg-violet-500 shadow-[0_0_15px_#8b5cf6]' : 'bg-slate-900'}`}></div>)}
              </div>

              {step === 2 ? (
                <div className="space-y-8 animate-in fade-in">
                   <div className="text-center">
                      <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Debriefing</h3>
                      <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em] mt-3 italic">CONSOLIDAÇÃO POR APP</p>
                   </div>
                   
                   <div className="grid grid-cols-1 gap-4">
                      {['Uber', '99', 'InDrive', 'Particular'].map(platform => (
                        <div key={platform} className="bg-slate-900/50 p-6 rounded-[32px] border border-white/5 space-y-5">
                           <div className="flex justify-between items-center px-1">
                              <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest italic">{platform}</span>
                              <div className="flex gap-3">
                                 <button onClick={() => quickAddValue(platform, 15)} className="px-4 py-2 rounded-xl bg-slate-950 text-[10px] font-black text-violet-400 border border-violet-500/20 active:bg-violet-500/10">+15</button>
                                 <button onClick={() => quickAddValue(platform, 25)} className="px-4 py-2 rounded-xl bg-slate-950 text-[10px] font-black text-violet-400 border border-violet-500/20 active:bg-violet-500/10">+25</button>
                              </div>
                           </div>
                           <div className="flex items-center gap-4 bg-black/40 px-6 py-5 rounded-2xl border border-white/5 focus-within:border-violet-500/50 transition-all">
                              <span className="text-violet-500 text-lg font-black italic">R$</span>
                              <input 
                                type="number" placeholder="0.00"
                                value={platformGross[platform]}
                                onChange={e => setPlatformGross({...platformGross, [platform]: e.target.value})}
                                className="bg-transparent text-white text-2xl font-black w-full mono outline-none italic placeholder:text-slate-800"
                              />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              ) : step === 3 ? (
                <div className="space-y-10 animate-in fade-in py-10">
                   <div className="text-center">
                      <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Chegada</h3>
                      <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em] mt-3 italic">ODÔMETRO FINAL</p>
                   </div>
                   <div className="bg-slate-900/40 p-12 rounded-[48px] text-center border border-white/5 shadow-inner relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-violet-500/40"></div>
                      <input 
                        type="number" value={finalKm} 
                        onChange={e => setFinalKm(Number(e.target.value))} 
                        className="bg-transparent text-white text-center text-8xl font-black w-full mono outline-none italic tracking-tighter" 
                        autoFocus 
                      />
                   </div>
                </div>
              ) : (
                <div className="text-center py-20 space-y-10 flex flex-col items-center">
                   <div className="w-28 h-28 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500 border border-violet-500/20 shadow-2xl">
                      <Activity size={48} className="animate-pulse" />
                   </div>
                   <div className="space-y-5">
                      <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Encerrar Câmbio?</h3>
                      <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.4em] max-w-xs mx-auto leading-relaxed">O SISTEMA PROCESSARÁ TODA A TELEMETRIA FINANCEIRA DA JORNADA ATUAL.</p>
                   </div>
                </div>
              )}
           </div>

           <div className="p-8 pb-12 grid grid-cols-2 gap-4 border-t border-white/5 shrink-0">
              <button onClick={() => step === 1 ? setShowEndConfirm(false) : setStep((step - 1) as any)} className="py-7 rounded-3xl bg-slate-900 text-slate-500 font-black uppercase text-[11px] tracking-[0.4em] active:bg-slate-800 transition-all">VOLTAR</button>
              <button 
                onClick={() => step < 3 ? setStep((step + 1) as any) : onEndJourney(finalKm, Object.fromEntries(Object.entries(platformGross).map(([k,v]) => [k, Number(v)])), [])} 
                className="py-7 rounded-3xl bg-violet-500 text-black font-black uppercase text-[11px] tracking-[0.4em] shadow-[0_15px_30px_rgba(139,92,246,0.4)] active:scale-95 transition-all"
              >
                {step === 3 ? 'CONCLUIR' : 'PRÓXIMO'} <ChevronRight size={18} className="inline ml-1" />
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default ActiveJourney;
