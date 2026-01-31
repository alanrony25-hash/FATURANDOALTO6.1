
import React, { useState, useMemo, useEffect } from 'react';
import { Journey, Ride, Expense, ExpenseType } from '../types';
import { 
  Target, Minimize2, X, Timer, Activity, 
  ChevronRight, ArrowRight, DollarSign, Gauge,
  Plus, Trash2, Fuel, Utensils, Wrench, Coins, MapPin, 
  CreditCard, Wifi, ArrowRightLeft, Home, Play, Pause, Coffee, Layers
} from 'lucide-react';

interface ActiveJourneyProps {
  journey: Journey;
  onEndJourney: (finalKm: number, platformGross: Record<string, number>, finalExpenses: Expense[]) => void;
  dailyGoal: number;
  onMinimize: () => void;
}

const EXPENSE_CATEGORIES: Record<ExpenseType, { label: string; icon: React.ReactNode; color: string }> = {
  Fuel: { label: 'GAS', icon: <Fuel size={12} />, color: 'text-orange-500' },
  Food: { label: 'ALIM', icon: <Utensils size={12} />, color: 'text-emerald-500' },
  Maintenance: { label: 'MEC', icon: <Wrench size={12} />, color: 'text-red-500' },
  Cleaning: { label: 'LAV', icon: <Coins size={12} />, color: 'text-blue-400' },
  Parking: { label: 'EST', icon: <MapPin size={12} />, color: 'text-zinc-400' },
  Toll: { label: 'PED', icon: <Coins size={12} />, color: 'text-yellow-500' },
  Internet: { label: 'NET', icon: <Wifi size={12} />, color: 'text-cyan-500' },
  Insurance: { label: 'SEG', icon: <CreditCard size={12} />, color: 'text-blue-600' },
  Rent: { label: 'CARRO', icon: <CreditCard size={12} />, color: 'text-purple-500' },
  PIX_Transfer: { label: 'PIX', icon: <ArrowRightLeft size={12} />, color: 'text-cyan-400' },
  Credit_Card: { label: 'CARTÃO', icon: <CreditCard size={12} />, color: 'text-red-400' },
  House_Bill: { label: 'CASA', icon: <Home size={12} />, color: 'text-emerald-400' },
  Other: { label: 'DIV', icon: <Plus size={12} />, color: 'text-zinc-600' },
};

const SHIFTS = [
  { name: 'Manhã', target: 152, hours: [5, 12] },
  { name: 'Tarde', target: 95, hours: [12, 18] },
  { name: 'Noite', target: 133, hours: [18, 5] },
];

const ActiveJourney: React.FC<ActiveJourneyProps> = ({ 
  journey, onEndJourney, dailyGoal, onMinimize 
}) => {
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isPaused, setIsPaused] = useState(journey.isPaused || false);
  
  // States para o fluxo de encerramento
  const [currentExpenses, setCurrentExpenses] = useState<Expense[]>(journey.expenses);
  const [platformGross, setPlatformGross] = useState<Record<string, string>>({
    Uber: '',
    '99': '',
    InDrive: '',
    Particular: ''
  });
  const [finalKm, setFinalKm] = useState(journey.startKm);
  const [shiftTime, setShiftTime] = useState('00:00:00');
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);

  // Detecção de Turno Atual
  const currentShift = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return SHIFTS[0];
    if (hour >= 12 && hour < 18) return SHIFTS[1];
    return SHIFTS[2];
  }, []);

  useEffect(() => {
    let interval: any;
    if (!isPaused) {
      interval = setInterval(() => {
        const now = Date.now();
        const diff = now - journey.startTime - (journey.totalPausedTime || 0);
        setTotalElapsedTime(diff);
        
        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        setShiftTime(`${h}:${m}:${s}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [journey.startTime, journey.totalPausedTime, isPaused]);

  useEffect(() => {
    setIsPaused(journey.isPaused || false);
  }, [journey.isPaused]);

  const togglePause = () => {
    setIsPaused(!isPaused);
    journey.isPaused = !isPaused; 
  };

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpVal, setNewExpVal] = useState('');
  const [newExpType, setNewExpType] = useState<ExpenseType>('Fuel');

  const handleAddExpense = () => {
    if (!newExpVal) return;
    const exp: Expense = {
      id: Date.now().toString(),
      type: newExpType,
      value: Number(newExpVal),
      timestamp: Date.now()
    };
    setCurrentExpenses([...currentExpenses, exp]);
    setNewExpVal('');
    setShowAddExpense(false);
  };

  const removeExpense = (id: string) => {
    setCurrentExpenses(currentExpenses.filter(e => e.id !== id));
  };

  const finishJourney = () => {
    const finalPlatformValues = Object.entries(platformGross).reduce((acc, [key, val]) => {
      acc[key] = Number(val) || 0;
      return acc;
    }, {} as Record<string, number>);
    
    onEndJourney(finalKm, finalPlatformValues, currentExpenses);
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden animate-in fade-in duration-300 transition-colors duration-700 ${isPaused ? 'bg-zinc-950 grayscale-[0.6]' : 'dynamic-bg'}`}>
      
      {/* HUD Superior */}
      <div className="p-4 pt-12 glass border-b border-white/5 space-y-4 relative overflow-hidden shrink-0">
        {isPaused && (
           <div className="absolute inset-0 bg-amber-500/5 animate-pulse pointer-events-none"></div>
        )}
        <div className="flex justify-between items-center px-2">
           <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${isPaused ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'}`}>
                {isPaused ? <Coffee size={20} /> : <Target size={20} />}
              </div>
              <div>
                <h2 className="dynamic-text font-black text-[10px] uppercase italic tracking-tighter">
                   {isPaused ? 'STANDBY' : 'EM MISSÃO'}
                </h2>
                <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest mono block">TURNO {currentShift.name.toUpperCase()}</span>
              </div>
           </div>
           <div className="flex gap-1.5">
             <button onClick={onMinimize} className="w-10 h-10 rounded-xl glass flex items-center justify-center text-zinc-500">
               <Minimize2 size={18} />
             </button>
           </div>
        </div>
      </div>

      {/* Área Central */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
         <div className="relative">
            <div className={`w-56 h-56 rounded-full border flex flex-col items-center justify-center glass relative z-10 ${isPaused ? 'border-amber-500/10' : 'border-zinc-900'}`}>
               <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Tempo Líquido</span>
               <div className={`text-5xl font-black mono italic tracking-tighter ${isPaused ? 'text-zinc-600' : 'text-white'}`}>{shiftTime}</div>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-3 w-full">
            <div className="glass p-4 rounded-2xl border-white/5 flex flex-col items-center">
               <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">ODÔMETRO INI</span>
               <span className="text-md font-black text-white mono">{journey.startKm}</span>
            </div>
            <div className="glass p-4 rounded-2xl border-white/5 flex flex-col items-center">
               <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">META DIA</span>
               <span className="text-md font-black text-emerald-500 mono">R$ 380</span>
            </div>
         </div>
      </div>

      {/* Footer Fixo */}
      <div className="p-4 pb-10 glass border-t border-white/5 shrink-0 flex gap-3">
         <button onClick={togglePause} className={`flex-1 py-5 rounded-2xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 ${isPaused ? 'bg-emerald-500 text-black' : 'glass text-zinc-500'}`}>
            {isPaused ? <Play size={14} fill="black" /> : <Pause size={14} fill="currentColor" />} {isPaused ? 'RETOMAR' : 'PAUSAR'}
         </button>
         <button onClick={() => setShowEndConfirm(true)} className="flex-[1.5] bg-white text-black py-5 rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-xl">
            CONCLUIR MISSÃO
         </button>
      </div>

      {/* MODAL DE ENCERRAMENTO */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[500] p-4 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-y-auto no-scrollbar">
           <div className="flex-1 flex flex-col pt-6 pb-24 space-y-6 max-w-sm mx-auto w-full">
              
              <div className="flex justify-between items-center px-4 mb-2">
                 {[1,2,3].map(s => (
                   <div key={s} className={`h-1 flex-1 rounded-full mx-1 transition-all ${step >= s ? 'bg-cyan-500 shadow-[0_0_5px_#06b6d4]' : 'bg-zinc-900'}`}></div>
                 ))}
              </div>

              {step === 1 ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                   <div className="text-center space-y-1 mb-4">
                      <h3 className="text-lg font-black text-white italic uppercase tracking-tighter leading-none">Deduções Hoje</h3>
                      <p className="text-zinc-600 text-[7px] font-black uppercase tracking-widest italic">Confirme seus gastos</p>
                   </div>

                   <div className="space-y-2 max-h-[50vh] overflow-y-auto no-scrollbar pr-1">
                      {currentExpenses.map(exp => (
                        <div key={exp.id} className="glass p-3 rounded-xl border-white/5 flex justify-between items-center">
                           <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded-lg bg-black ${EXPENSE_CATEGORIES[exp.type]?.color}`}>{EXPENSE_CATEGORIES[exp.type]?.icon}</div>
                              <span className="text-[8px] font-black text-zinc-400 uppercase">{EXPENSE_CATEGORIES[exp.type]?.label}</span>
                           </div>
                           <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-red-500 mono">R$ {exp.value.toFixed(2)}</span>
                              <button onClick={() => removeExpense(exp.id)} className="text-zinc-700"><Trash2 size={12} /></button>
                           </div>
                        </div>
                      ))}
                      {currentExpenses.length === 0 && <div className="text-center py-6 border border-dashed border-zinc-900 rounded-xl text-[7px] font-black text-zinc-800 uppercase tracking-widest">Sem despesas</div>}
                   </div>

                   <button onClick={() => setShowAddExpense(true)} className="w-full py-3 rounded-xl border border-dashed border-zinc-800 text-zinc-700 font-black text-[8px] uppercase tracking-widest flex items-center justify-center gap-2">
                     <Plus size={12} /> NOVO GASTO
                   </button>
                </div>
              ) : step === 2 ? (
                <div className="space-y-4 animate-in slide-in-from-right duration-300">
                   <div className="text-center space-y-1 mb-4">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 mx-auto border border-emerald-500/10 mb-2"><DollarSign size={20} /></div>
                      <h3 className="text-lg font-black text-white italic uppercase tracking-tighter leading-none">Fechamento Bruto</h3>
                      <p className="text-zinc-600 text-[7px] font-black uppercase tracking-widest">FATURAMENTO POR PLATAFORMA</p>
                   </div>

                   {/* GRID COMPACTO DE FATURAMENTO */}
                   <div className="grid grid-cols-2 gap-2">
                      {['Uber', '99', 'InDrive', 'Particular'].map(platform => (
                        <div key={platform} className="glass p-3 rounded-2xl border-white/5 space-y-1 focus-within:border-cyan-500/20 transition-all">
                           <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest block ml-1">{platform}</span>
                           <div className="flex items-center gap-1 bg-black/40 px-2 py-2 rounded-lg border border-white/5">
                              <span className="text-emerald-500 text-[10px] font-black italic">R$</span>
                              <input 
                                type="number" placeholder="0.00"
                                value={platformGross[platform]}
                                onChange={e => setPlatformGross({...platformGross, [platform]: e.target.value})}
                                className="bg-transparent text-white text-md font-black w-full mono outline-none"
                              />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in slide-in-from-right duration-300">
                   <div className="text-center space-y-1 mb-4">
                      <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-500 mx-auto border border-cyan-500/10 mb-2"><Gauge size={20} /></div>
                      <h3 className="text-lg font-black text-white italic uppercase tracking-tighter leading-none">Telemetria Final</h3>
                      <p className="text-zinc-600 text-[7px] font-black uppercase tracking-widest">KILOMETRAGEM DE CHEGADA</p>
                   </div>

                   <div className="glass p-6 rounded-3xl border-white/5 text-center">
                      <input 
                        type="number" value={finalKm} 
                        onChange={e => setFinalKm(Number(e.target.value))} 
                        className="bg-transparent text-white text-center text-5xl font-black w-full mono outline-none italic" 
                        autoFocus 
                      />
                      <span className="text-[7px] font-black text-zinc-700 uppercase tracking-[0.4em] mt-2 block italic">KM ATUAL</span>
                   </div>

                   <div className="p-4 glass rounded-2xl border-emerald-500/10 bg-emerald-500/5 space-y-1">
                      <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-widest">
                         <span className="text-zinc-500">Total Bruto</span>
                         <span className="text-white mono">R$ {Object.values(platformGross).reduce<number>((a, b) => a + (Number(b) || 0), 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-widest">
                         <span className="text-zinc-500">Gastos</span>
                         <span className="text-red-500 mono">-R$ {currentExpenses.reduce<number>((acc: number, exp) => acc + exp.value, 0).toFixed(2)}</span>
                      </div>
                   </div>
                </div>
              )}
           </div>

           <div className="fixed bottom-0 left-0 right-0 p-4 pb-10 glass border-t border-white/5 z-[600] grid grid-cols-2 gap-3">
              <button onClick={() => step === 1 ? setShowEndConfirm(false) : setStep((step - 1) as any)} className="py-5 rounded-2xl glass text-zinc-600 font-black uppercase text-[9px] tracking-widest">
                 {step === 1 ? 'CANCELAR' : 'VOLTAR'}
              </button>
              <button onClick={() => step < 3 ? setStep((step + 1) as any) : finishJourney()} className="py-5 rounded-2xl bg-cyan-500 text-black font-black uppercase text-[9px] tracking-widest shadow-xl">
                 {step < 3 ? 'PRÓXIMO' : 'FECHAR'}
              </button>
           </div>
        </div>
      )}

      {showAddExpense && (
        <div className="fixed inset-0 bg-black/95 z-[700] p-6 flex flex-col justify-center animate-in zoom-in duration-300">
           <div className="glass p-6 rounded-3xl border-white/10 space-y-6">
              <div className="grid grid-cols-4 gap-2">
                 {Object.entries(EXPENSE_CATEGORIES).map(([type, cat]) => (
                   <button key={type} onClick={() => setNewExpType(type as ExpenseType)} className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${newExpType === type ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-zinc-900 border-white/5 text-zinc-600'}`}>
                      {cat.icon}
                      <span className="text-[5px] font-black uppercase tracking-tighter truncate w-full text-center">{cat.label}</span>
                   </button>
                 ))}
              </div>
              <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-black italic text-lg">R$</span>
                 <input type="number" placeholder="0.00" value={newExpVal} onChange={e => setNewExpVal(e.target.value)} className="w-full bg-zinc-900 p-4 pl-10 rounded-2xl text-white font-black text-2xl text-center mono outline-none border border-white/5" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => setShowAddExpense(false)} className="py-4 rounded-xl glass text-zinc-600 font-black uppercase text-[8px] tracking-widest">FECHAR</button>
                 <button onClick={handleAddExpense} className="py-4 rounded-xl bg-white text-black font-black uppercase text-[8px] tracking-widest">ADD</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ActiveJourney;
