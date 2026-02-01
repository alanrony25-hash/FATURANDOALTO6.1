
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
    <div className="h-screen flex flex-col overflow-hidden bg-black relative">
      <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none"></div>
      
      {/* HEADER FIXO */}
      <div className="p-8 pt-12 flex justify-between items-center shrink-0 relative z-10">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Target size={24} className="animate-pulse" />
           </div>
           <div>
              <h2 className="text-sm font-black text-white uppercase italic tracking-tighter">EM OPERAÇÃO</h2>
              <span className="text-[8px] text-zinc-500 uppercase tracking-[0.4em] block mt-1">PROTOCOLO V6.0 ACTV</span>
           </div>
        </div>
        <button onClick={onMinimize} className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-zinc-500 active:scale-90 transition-all">
          <Minimize2 size={20}/>
        </button>
      </div>

      {/* HUD CENTRAL */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12 relative z-10">
         <div className="relative group">
            <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-[60px] animate-pulse"></div>
            <div className="w-64 h-64 rounded-full border-2 border-zinc-900 glass flex flex-col items-center justify-center relative z-10 shadow-[inset_0_0_30px_rgba(255,255,255,0.02)]">
               <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-2 italic">TEMPO LOGADO</span>
               <div className="text-6xl font-black mono italic text-white tracking-tighter">{shiftTime}</div>
            </div>
         </div>

         {/* MÉTRICAS DE SUPORTE */}
         <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
            <div className="glass p-5 rounded-[32px] border-white/5 flex flex-col items-center text-center">
               <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">DEDUTÍVEIS</span>
               <div className="text-xl font-black text-white mono italic">R$ 0,00</div>
            </div>
            <div className="glass p-5 rounded-[32px] border-white/5 flex flex-col items-center text-center">
               <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">DISTÂNCIA</span>
               <div className="text-xl font-black text-white mono italic">CALC...</div>
            </div>
         </div>
      </div>

      {/* RODAPÉ DE AÇÃO */}
      <div className="p-8 pb-12 flex gap-4 shrink-0 relative z-10">
         <button className="w-16 h-16 rounded-3xl glass text-zinc-500 flex items-center justify-center active:bg-white/10 transition-all border-white/10 shadow-lg">
           <Pause size={24} fill="currentColor" />
         </button>
         <button 
           onClick={() => setShowEndConfirm(true)} 
           className="flex-1 bg-white text-black py-6 rounded-3xl font-black text-xs uppercase tracking-[0.4em] shadow-[0_20px_40px_rgba(255,255,255,0.2)] active:scale-95 transition-all"
         >
           CONCLUIR MISSÃO
         </button>
      </div>

      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[500] p-6 flex flex-col animate-in slide-in-from-bottom duration-300">
           <div className="flex-1 flex flex-col pt-8 space-y-8 overflow-y-auto no-scrollbar pb-10">
              <div className="flex justify-between px-4">
                 {[1,2,3].map(s => <div key={s} className={`h-1.5 flex-1 rounded-full mx-1.5 transition-all duration-500 ${step >= s ? 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]' : 'bg-zinc-900'}`}></div>)}
              </div>

              {step === 2 ? (
                <div className="space-y-6 animate-in fade-in">
                   <div className="text-center">
                      <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Debriefing Bruto</h3>
                      <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em] mt-2 italic opacity-60">LANCAMENTO POR PLATAFORMA</p>
                   </div>
                   
                   <div className="grid grid-cols-1 gap-3">
                      {['Uber', '99', 'InDrive', 'Particular'].map(platform => (
                        <div key={platform} className="glass p-5 rounded-[32px] border-white/5 space-y-4">
                           <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 italic">{platform}</span>
                              <div className="flex gap-2">
                                 <button onClick={() => quickAddValue(platform, 15)} className="px-3 py-1.5 rounded-lg bg-zinc-900 text-[8px] font-black text-emerald-500 border border-white/5">+15</button>
                                 <button onClick={() => quickAddValue(platform, 25)} className="px-3 py-1.5 rounded-lg bg-zinc-900 text-[8px] font-black text-emerald-500 border border-white/5">+25</button>
                              </div>
                           </div>
                           <div className="flex items-center gap-3 bg-black/60 px-5 py-4 rounded-2xl border border-white/10 group focus-within:border-cyan-500/50 transition-all">
                              <span className="text-emerald-500 text-sm font-black italic">R$</span>
                              <input 
                                type="number" placeholder="0.00"
                                value={platformGross[platform]}
                                onChange={e => setPlatformGross({...platformGross, [platform]: e.target.value})}
                                className="bg-transparent text-white text-xl font-black w-full mono outline-none italic placeholder:text-zinc-800"
                              />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              ) : step === 3 ? (
                <div className="space-y-8 animate-in fade-in py-10">
                   <div className="text-center">
                      <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Finalizar Odômetro</h3>
                      <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em] mt-2 italic">VALOR DE CHEGADA</p>
                   </div>
                   <div className="glass p-10 rounded-[40px] text-center border-white/10 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/30"></div>
                      <input 
                        type="number" value={finalKm} 
                        onChange={e => setFinalKm(Number(e.target.value))} 
                        className="bg-transparent text-white text-center text-7xl font-black w-full mono outline-none italic tracking-tighter" 
                        autoFocus 
                      />
                   </div>
                </div>
              ) : (
                <div className="text-center py-20 space-y-8 flex flex-col items-center">
                   <div className="w-24 h-24 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500 border border-cyan-500/20 shadow-2xl">
                      <Activity size={40} className="animate-pulse" />
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Encerrar Missão?</h3>
                      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] max-w-xs mx-auto leading-relaxed">O SISTEMA IRÁ PROCESSAR TODOS OS GANHOS E ATUALIZAR SUAS RESERVAS DE CAIXA.</p>
                   </div>
                </div>
              )}
           </div>

           <div className="p-8 grid grid-cols-2 gap-4 border-t border-white/5 shrink-0">
              <button onClick={() => step === 1 ? setShowEndConfirm(false) : setStep((step - 1) as any)} className="py-6 rounded-3xl glass text-zinc-500 font-black uppercase text-[10px] tracking-[0.3em] active:bg-white/5 transition-all">VOLTAR</button>
              <button 
                onClick={() => step < 3 ? setStep((step + 1) as any) : onEndJourney(finalKm, Object.fromEntries(Object.entries(platformGross).map(([k,v]) => [k, Number(v)])), [])} 
                className="py-6 rounded-3xl bg-cyan-500 text-black font-black uppercase text-[10px] tracking-[0.3em] shadow-[0_15px_30px_rgba(6,182,212,0.3)] active:scale-95 transition-all"
              >
                {step === 3 ? 'FINALIZAR' : 'PRÓXIMO'} <ChevronRight size={16} className="inline ml-1" />
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default ActiveJourney;
