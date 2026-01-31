
import React, { useState, useMemo, useEffect } from 'react';
import { Journey, Ride, Expense, ExpenseType } from '../types';
import { 
  Target, Minimize2, Timer, Activity, DollarSign, Gauge, Plus, Trash2, Fuel, Utensils, Wrench, 
  Coins, MapPin, CreditCard, Wifi, ArrowRightLeft, Home, Play, Pause, Coffee, X
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

  return (
    <div className="h-screen flex flex-col overflow-hidden dynamic-bg">
      <div className="p-4 pt-12 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
           <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center border border-cyan-500/20">
              <Target size={18} />
           </div>
           <div>
              <h2 className="text-[10px] font-black text-white uppercase italic tracking-tighter">EM OPERAÇÃO</h2>
              <span className="text-[7px] text-zinc-500 uppercase tracking-widest block">PROTOCOLO V15.0</span>
           </div>
        </div>
        <button onClick={onMinimize} className="w-9 h-9 rounded-xl glass flex items-center justify-center text-zinc-500"><Minimize2 size={16}/></button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
         <div className="w-48 h-48 rounded-full border border-zinc-900 glass flex flex-col items-center justify-center">
            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">CRONÔMETRO</span>
            <div className="text-4xl font-black mono italic text-white">{shiftTime}</div>
         </div>
      </div>

      <div className="p-4 pb-10 flex gap-3">
         <button className="flex-1 py-4 rounded-xl glass text-zinc-500 font-black text-[9px] uppercase"><Pause size={14}/></button>
         <button onClick={() => setShowEndConfirm(true)} className="flex-[3] bg-white text-black py-4 rounded-xl font-black text-[9px] uppercase shadow-xl">CONCLUIR MISSÃO</button>
      </div>

      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[500] p-4 flex flex-col animate-in slide-in-from-bottom duration-300">
           <div className="flex-1 flex flex-col pt-4 space-y-4">
              <div className="flex justify-between px-4">
                 {[1,2,3].map(s => <div key={s} className={`h-1 flex-1 rounded-full mx-1 ${step >= s ? 'bg-cyan-500' : 'bg-zinc-900'}`}></div>)}
              </div>

              {step === 2 ? (
                <div className="space-y-4 animate-in fade-in">
                   <div className="text-center">
                      <h3 className="text-lg font-black text-white italic uppercase">Fechamento Bruto</h3>
                      <p className="text-zinc-600 text-[7px] font-black uppercase tracking-widest">REVISÃO POR APP</p>
                   </div>
                   {/* GRADE 2X2 PARA TODOS OS APPS */}
                   <div className="grid grid-cols-2 gap-2">
                      {['Uber', '99', 'InDrive', 'Particular'].map(platform => (
                        <div key={platform} className="glass p-3 rounded-xl border-white/5 space-y-1">
                           <span className="text-[7px] font-black text-zinc-600 uppercase block ml-1">{platform}</span>
                           <div className="flex items-center gap-1 bg-black/40 px-2 py-1.5 rounded-lg border border-white/5">
                              <span className="text-emerald-500 text-[10px] font-black italic">R$</span>
                              <input 
                                type="number" placeholder="0"
                                value={platformGross[platform]}
                                onChange={e => setPlatformGross({...platformGross, [platform]: e.target.value})}
                                className="bg-transparent text-white text-sm font-black w-full mono outline-none"
                              />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              ) : step === 3 ? (
                <div className="space-y-4 animate-in fade-in">
                   <div className="text-center">
                      <h3 className="text-lg font-black text-white italic uppercase">Check-out Final</h3>
                      <p className="text-zinc-600 text-[7px] font-black uppercase tracking-widest">KM DE CHEGADA</p>
                   </div>
                   <div className="glass p-6 rounded-2xl text-center">
                      <input type="number" value={finalKm} onChange={e => setFinalKm(Number(e.target.value))} className="bg-transparent text-white text-center text-5xl font-black w-full mono outline-none italic" autoFocus />
                   </div>
                </div>
              ) : (
                <div className="text-center py-10 space-y-4">
                   <h3 className="text-lg font-black text-white italic uppercase">Confirmar Deduções?</h3>
                   <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">Você registrou R$ 0,00 em despesas hoje.</p>
                </div>
              )}
           </div>

           <div className="p-4 pb-10 grid grid-cols-2 gap-3 border-t border-white/5">
              <button onClick={() => step === 1 ? setShowEndConfirm(false) : setStep((step - 1) as any)} className="py-4 rounded-xl glass text-zinc-600 font-black uppercase text-[9px]">VOLTAR</button>
              <button onClick={() => step < 3 ? setStep((step + 1) as any) : onEndJourney(finalKm, Object.fromEntries(Object.entries(platformGross).map(([k,v]) => [k, Number(v)])), [])} className="py-4 rounded-xl bg-cyan-500 text-black font-black uppercase text-[9px]">PRÓXIMO</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default ActiveJourney;
