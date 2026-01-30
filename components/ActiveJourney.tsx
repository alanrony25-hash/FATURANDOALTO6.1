
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
    journey.isPaused = !isPaused; // Sincroniza com ref se necessário ou App cuida
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
      
      {/* HUD Superior - Status de Voo com Info de Turno */}
      <div className="p-8 pt-16 glass border-b border-white/5 space-y-6 relative overflow-hidden">
        {isPaused && (
           <div className="absolute inset-0 bg-amber-500/5 animate-pulse pointer-events-none"></div>
        )}
        <div className="flex justify-between items-center">
           <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${isPaused ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20 hud-pulse'}`}>
                {isPaused ? <Coffee size={24} /> : <Target size={24} />}
              </div>
              <div>
                <h2 className="dynamic-text font-black text-xs uppercase italic tracking-tighter">
                   {isPaused ? 'SISTEMAS EM STANDBY' : 'PROTOCOLO ATIVO'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                   <div className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-amber-500 pulse' : 'bg-emerald-500 animate-pulse'}`}></div>
                   <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mono">Turno: {currentShift.name}</span>
                </div>
              </div>
           </div>
           <div className="flex gap-2">
             <button onClick={onMinimize} className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-cyan-500 border-cyan-500/20">
               <Layers size={20} />
             </button>
             <button onClick={onMinimize} className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-zinc-500">
               <Minimize2 size={20} />
             </button>
           </div>
        </div>

        {/* Barra de Meta do Turno */}
        <div className="space-y-2">
           <div className="flex justify-between items-center px-1">
              <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">OBJETIVO {currentShift.name.toUpperCase()}</span>
              <span className="text-[10px] font-black text-white mono">R$ {currentShift.target.toFixed(0)}</span>
           </div>
           <div className="h-1 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000" style={{ width: '0%' }}></div>
           </div>
        </div>
      </div>

      {/* Área Central - Telemetria de Tempo */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12">
         <div className="relative group">
            <div className={`absolute inset-0 rounded-full blur-3xl animate-pulse transition-colors ${isPaused ? 'bg-amber-500/5' : 'bg-cyan-500/10'}`}></div>
            <div className={`w-64 h-64 rounded-full border-2 flex flex-col items-center justify-center glass relative z-10 transition-colors ${isPaused ? 'border-amber-500/20' : 'border-zinc-900'}`}>
               <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-2">Trabalho Líquido</span>
               <div className={`text-5xl font-black mono italic tracking-tighter transition-colors ${isPaused ? 'text-zinc-500' : 'text-white'}`}>{shiftTime}</div>
               <div className="mt-4 flex items-center gap-2">
                  {isPaused ? <Coffee size={12} className="text-amber-500" /> : <Activity size={12} className="text-cyan-500" />}
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{isPaused ? 'Piloto em Descanso' : 'Gravando Percurso'}</span>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4 w-full">
            <div className="glass p-6 rounded-[32px] border-white/5 flex flex-col items-center gap-2">
               <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">HODÔMETRO INI</span>
               <span className="text-xl font-black text-white mono">{journey.startKm} <span className="text-[10px] text-zinc-700">KM</span></span>
            </div>
            <div className="glass p-6 rounded-[32px] border-white/5 flex flex-col items-center gap-2">
               <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">META DO DIA</span>
               <span className="text-xl font-black text-emerald-500 mono">R$ 380</span>
            </div>
         </div>
      </div>

      {/* Footer Fixo de Ação */}
      <div className="p-8 pb-12 glass border-t border-white/5 shrink-0 flex gap-4">
         <button 
            onClick={togglePause} 
            className={`flex-1 py-7 rounded-[32px] font-black text-[10px] uppercase tracking-[0.3em] italic flex items-center justify-center gap-3 transition-all ${isPaused ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'glass text-zinc-500 border-white/10'}`}
         >
            {isPaused ? <><Play size={16} fill="black" /> Retomar</> : <><Pause size={16} fill="currentColor" /> Pausar</>}
         </button>
         <button 
            onClick={() => setShowEndConfirm(true)} 
            className="flex-[1.5] bg-white text-black py-7 rounded-[32px] font-black text-[10px] uppercase tracking-[0.3em] italic shadow-[0_20px_60px_-15px_rgba(255,255,255,0.3)] btn-active"
         >
            CONCLUIR MISSÃO
         </button>
      </div>

      {/* MODAL DE ENCERRAMENTO (Protocolo Multi-Etapas) */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[500] p-6 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-y-auto no-scrollbar">
           <div className="flex-1 flex flex-col pt-10 pb-20 space-y-8 max-w-sm mx-auto w-full">
              
              <div className="flex justify-between items-center px-4 mb-4">
                 {[1,2,3].map(s => (
                   <div key={s} className={`h-1.5 flex-1 rounded-full mx-1 transition-all duration-500 ${step >= s ? 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]' : 'bg-zinc-900'}`}></div>
                 ))}
              </div>

              {step === 1 ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                   <div className="text-center space-y-2 mb-8">
                      <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto border border-red-500/20 mb-4">
                        <Coins size={32} />
                      </div>
                      <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">Protocolo de Despesas</h3>
                      <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">Registre seus gastos antes do fechamento</p>
                   </div>

                   <div className="space-y-3 max-h-[40vh] overflow-y-auto no-scrollbar pr-1">
                      {currentExpenses.map(exp => (
                        <div key={exp.id} className="glass p-4 rounded-2xl border-white/5 flex justify-between items-center group">
                           <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg bg-black ${EXPENSE_CATEGORIES[exp.type]?.color}`}>
                                {EXPENSE_CATEGORIES[exp.type]?.icon}
                              </div>
                              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">{EXPENSE_CATEGORIES[exp.type]?.label}</span>
                           </div>
                           <div className="flex items-center gap-4">
                              <span className="text-xs font-black text-red-500 mono">R$ {exp.value.toFixed(2)}</span>
                              <button onClick={() => removeExpense(exp.id)} className="text-zinc-700 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                           </div>
                        </div>
                      ))}

                      {currentExpenses.length === 0 && (
                        <div className="text-center py-8 border border-dashed border-zinc-900 rounded-2xl">
                          <span className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.3em]">Nenhuma despesa hoje</span>
                        </div>
                      )}
                   </div>

                   <button 
                    onClick={() => setShowAddExpense(true)}
                    className="w-full py-4 rounded-2xl border border-dashed border-zinc-800 text-zinc-600 font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 active:bg-zinc-950 transition-colors"
                   >
                     <Plus size={14} /> LANÇAR NOVA DESPESA
                   </button>
                </div>
              ) : step === 2 ? (
                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                   <div className="text-center space-y-2 mb-8">
                      <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto border border-emerald-500/20 mb-4">
                        <DollarSign size={32} />
                      </div>
                      <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">Consolidado Bruto</h3>
                      <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">Quanto você faturou hoje?</p>
                   </div>

                   <div className="space-y-4">
                      {['Uber', '99', 'InDrive', 'Particular'].map(platform => (
                        <div key={platform} className="glass p-5 rounded-3xl border-white/5 flex flex-col gap-2 focus-within:border-cyan-500/30 transition-all">
                           <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">{platform}</span>
                           <div className="flex items-center gap-2">
                              <span className="text-emerald-500 text-sm font-black italic">R$</span>
                              <input 
                                type="number" 
                                placeholder="0.00"
                                value={platformGross[platform]}
                                onChange={e => setPlatformGross({...platformGross, [platform]: e.target.value})}
                                className="bg-transparent text-white text-xl font-black w-full mono outline-none"
                              />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                   <div className="text-center space-y-2 mb-8">
                      <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-500 mx-auto border border-cyan-500/20 mb-4">
                        <Gauge size={32} />
                      </div>
                      <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">Telemetria Final</h3>
                      <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">Confirme o KM atual para fechar o lucro</p>
                   </div>

                   <div className="glass p-8 rounded-[40px] border-white/5 text-center">
                      <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-4 block">KM ATUAL NO PAINEL</span>
                      <input 
                        type="number" 
                        value={finalKm} 
                        onChange={e => setFinalKm(Number(e.target.value))} 
                        className="bg-transparent text-white text-center text-7xl font-black w-full mono outline-none italic" 
                        autoFocus 
                      />
                   </div>

                   <div className="p-6 glass rounded-3xl border-emerald-500/10 bg-emerald-500/5 space-y-2">
                      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                         <span className="text-zinc-500">Total Bruto</span>
                         <span className="text-white mono">R$ {Object.values(platformGross).reduce<number>((a, b) => a + (Number(b) || 0), 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                         <span className="text-zinc-500">Deduções Hoje</span>
                         <span className="text-red-500 mono">-R$ {currentExpenses.reduce<number>((acc: number, exp) => acc + exp.value, 0).toFixed(2)}</span>
                      </div>
                   </div>
                </div>
              )}
           </div>

           <div className="fixed bottom-0 left-0 right-0 p-8 pt-4 pb-12 glass border-t border-white/5 z-[600] grid grid-cols-2 gap-4">
              <button 
                 onClick={() => {
                   if (step === 1) setShowEndConfirm(false);
                   else setStep((step - 1) as any);
                 }} 
                 className="py-6 rounded-3xl glass text-zinc-600 font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all"
              >
                 {step === 1 ? 'CANCELAR' : 'VOLTAR'}
              </button>
              <button 
                 onClick={() => {
                   if (step < 3) setStep((step + 1) as any);
                   else finishJourney();
                 }} 
                 className="py-6 rounded-3xl bg-cyan-500 text-black font-black uppercase text-[10px] tracking-widest shadow-xl shadow-cyan-500/20 active:scale-95 transition-all"
              >
                 {step < 3 ? 'PRÓXIMO' : 'CONCLUIR'}
              </button>
           </div>
        </div>
      )}

      {showAddExpense && (
        <div className="fixed inset-0 bg-black/95 z-[700] p-8 flex flex-col justify-center animate-in zoom-in duration-300">
           <div className="glass p-8 rounded-[40px] border-white/10 space-y-8">
              <div className="text-center">
                 <h3 className="text-xl font-black text-white italic uppercase">Novo Gasto</h3>
                 <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Operação de saída de caixa</span>
              </div>
              
              <div className="space-y-4">
                 <div className="grid grid-cols-4 gap-2">
                    {Object.entries(EXPENSE_CATEGORIES).map(([type, cat]) => (
                      <button 
                        key={type}
                        onClick={() => setNewExpType(type as ExpenseType)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${newExpType === type ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-zinc-900 border-white/5 text-zinc-600'}`}
                      >
                         {cat.icon}
                         <span className="text-[6px] font-black uppercase tracking-tighter truncate w-full text-center">{cat.label}</span>
                      </button>
                    ))}
                 </div>

                 <div className="relative pt-4">
                    <span className="absolute left-6 top-[60%] -translate-y-1/2 text-emerald-500 font-black italic">R$</span>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={newExpVal}
                      onChange={e => setNewExpVal(e.target.value)}
                      className="w-full bg-zinc-900 p-6 pt-10 rounded-[32px] text-white font-black text-4xl text-center mono outline-none border border-white/5"
                    />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setShowAddExpense(false)} className="py-6 rounded-3xl glass text-zinc-500 font-black uppercase text-[10px] tracking-widest">FECHAR</button>
                 <button onClick={handleAddExpense} className="py-6 rounded-3xl bg-white text-black font-black uppercase text-[10px] tracking-widest">ADICIONAR</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ActiveJourney;
