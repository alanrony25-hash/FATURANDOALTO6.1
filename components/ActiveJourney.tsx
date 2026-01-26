
import React, { useState, useMemo, useEffect } from 'react';
import { Journey, Ride, Expense, ExpenseType } from '../types';
import { 
  Pause, Minimize2, Zap, Fuel, Plus, Utensils, MapPin, 
  CreditCard, Wifi, Wrench, Coins, X, TrendingUp,
  ArrowRightLeft, Home, Target, TrendingDown, Navigation, CheckCircle2,
  User as UserIcon, Shield
} from 'lucide-react';

interface ActiveJourneyProps {
  journey: Journey;
  onEndJourney: (km: number) => void;
  onAddRide: (ride: Ride) => void;
  onUpdateRide: (id: string, val: number) => void;
  onDeleteRide: (id: string) => void;
  onAddExpense: (expense: Expense) => void;
  onUpdateExpense: (id: string, val: number) => void;
  onDeleteExpense: (id: string) => void;
  dailyGoal: number;
  onMinimize: () => void;
}

const EXPENSE_CATEGORIES: Record<ExpenseType, { label: string; icon: React.ReactNode; color: string }> = {
  Fuel: { label: 'GAS', icon: <Fuel size={14} />, color: 'text-orange-500' },
  Food: { label: 'ALIM', icon: <Utensils size={14} />, color: 'text-emerald-500' },
  Maintenance: { label: 'MEC', icon: <Wrench size={14} />, color: 'text-red-500' },
  Cleaning: { label: 'LAV', icon: <Coins size={14} />, color: 'text-blue-400' },
  Parking: { label: 'EST', icon: <MapPin size={14} />, color: 'text-zinc-400' },
  Toll: { label: 'PED', icon: <Coins size={14} />, color: 'text-yellow-500' },
  Internet: { label: 'NET', icon: <Wifi size={14} />, color: 'text-cyan-500' },
  Insurance: { label: 'SEG', icon: <CreditCard size={14} />, color: 'text-blue-600' },
  Rent: { label: 'CARRO', icon: <CreditCard size={14} />, color: 'text-purple-500' },
  PIX_Transfer: { label: 'PIX', icon: <ArrowRightLeft size={14} />, color: 'text-cyan-400' },
  Credit_Card: { label: 'CARTÃO', icon: <CreditCard size={14} />, color: 'text-red-400' },
  House_Bill: { label: 'CASA', icon: <Home size={14} />, color: 'text-emerald-400' },
  Other: { label: 'DIV', icon: <Plus size={14} />, color: 'text-zinc-600' },
};

const ActiveJourney: React.FC<ActiveJourneyProps> = ({ 
  journey, onEndJourney, onAddRide, onUpdateRide, onDeleteRide, 
  onAddExpense, onUpdateExpense, onDeleteExpense, dailyGoal, onMinimize 
}) => {
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showBrutoModal, setShowBrutoModal] = useState<{show: boolean, platform: 'Uber' | '99' | 'InDrive' | 'Particular' | null}>({show: false, platform: null});
  const [showChecklist, setShowChecklist] = useState(true);
  const [checklist, setChecklist] = useState({ fuel: false, clean: false, water: false });
  const [tempValue, setTempValue] = useState('');
  const [selectedCat, setSelectedCat] = useState<ExpenseType | null>(null);
  const [finalKm, setFinalKm] = useState(journey.startKm);

  const totals = useMemo(() => {
    const grossUber = journey.rides.find(r => r.platform === 'Uber')?.value || 0;
    const gross99 = journey.rides.find(r => r.platform === '99')?.value || 0;
    const grossInDrive = journey.rides.find(r => r.platform === 'InDrive')?.value || 0;
    const grossParticular = journey.rides.find(r => r.platform === 'Particular')?.value || 0;
    
    const gross = grossUber + gross99 + grossInDrive + grossParticular;
    const exp = journey.expenses.reduce((acc, e) => acc + e.value, 0);
    return { grossUber, gross99, grossInDrive, grossParticular, gross, exp, net: gross - exp };
  }, [journey.rides, journey.expenses]);

  const progressDaily = Math.min((totals.gross / dailyGoal) * 100, 100);

  if (showChecklist) {
    return (
      <div className="fixed inset-0 z-[500] bg-black p-8 flex flex-col justify-center animate-in fade-in duration-500">
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-white font-black text-3xl uppercase italic tracking-tighter">CHECKLIST DE VÔO</h2>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">Prepare sua nave antes de decolar</p>
          </div>

          <div className="space-y-4">
            <CheckItem active={checklist.fuel} label="Combustível Verificado" onClick={() => setChecklist({...checklist, fuel: !checklist.fuel})} icon={<Fuel size={20}/>}/>
            <CheckItem active={checklist.clean} label="Carro Higienizado" onClick={() => setChecklist({...checklist, clean: !checklist.clean})} icon={<Zap size={20}/>}/>
            <CheckItem active={checklist.water} label="Água e Suprimentos" onClick={() => setChecklist({...checklist, water: !checklist.water})} icon={<Utensils size={20}/>}/>
          </div>

          <button 
            disabled={!checklist.fuel || !checklist.clean || !checklist.water}
            onClick={() => setShowChecklist(false)}
            className={`w-full py-7 rounded-[32px] font-black uppercase tracking-widest transition-all ${checklist.fuel && checklist.clean && checklist.water ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'bg-zinc-900 text-zinc-700 opacity-50'}`}
          >
            INICIAR OPERAÇÃO
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden animate-in fade-in duration-300">
      {/* Meta Diária HUD */}
      <div className="p-6 pt-12 glass border-b border-white/5 shrink-0 space-y-4">
        <div className="flex justify-between items-center">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 border border-cyan-500/20">
                <Target size={20} />
              </div>
              <div>
                <h2 className="text-white font-black text-xs uppercase italic">MISSÃO DIÁRIA</h2>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] text-zinc-600 font-bold uppercase mono">ATIVO</span>
                   <span className="text-[10px] text-cyan-500/50 font-black mono">• KM INICIAL: {journey.startKm}</span>
                </div>
              </div>
           </div>
           <button onClick={onMinimize} className="w-10 h-10 rounded-xl glass flex items-center justify-center text-zinc-500">
             <Minimize2 size={18} />
           </button>
        </div>
        
        <div className="space-y-2">
           <div className="flex justify-between text-[9px] font-black uppercase tracking-widest italic">
              <span className="text-cyan-500">Ganhos Brutos Totais</span>
              <span className="text-white">R$ {totals.gross.toFixed(2)} / {dailyGoal.toFixed(0)}</span>
           </div>
           <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4] transition-all duration-1000" style={{ width: `${progressDaily}%` }}></div>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
         <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-2">Lançamento por Plataforma</h3>
         
         <div className="grid grid-cols-2 gap-3">
            <PlatformButton 
              label="UBER" 
              value={totals.grossUber} 
              color="text-cyan-500" 
              onClick={() => {setTempValue(totals.grossUber > 0 ? totals.grossUber.toString() : ''); setShowBrutoModal({show: true, platform: 'Uber'});}}
            />
            <PlatformButton 
              label="99" 
              value={totals.gross99} 
              color="text-orange-500" 
              onClick={() => {setTempValue(totals.gross99 > 0 ? totals.gross99.toString() : ''); setShowBrutoModal({show: true, platform: '99'});}}
            />
            <PlatformButton 
              label="INDRIVE" 
              value={totals.grossInDrive} 
              color="text-lime-400" 
              onClick={() => {setTempValue(totals.grossInDrive > 0 ? totals.grossInDrive.toString() : ''); setShowBrutoModal({show: true, platform: 'InDrive'});}}
            />
            <PlatformButton 
              label="PARTICULAR" 
              value={totals.grossParticular} 
              color="text-indigo-400" 
              icon={<UserIcon size={20} />}
              onClick={() => {setTempValue(totals.grossParticular > 0 ? totals.grossParticular.toString() : ''); setShowBrutoModal({show: true, platform: 'Particular'});}}
            />
         </div>

         <div className="h-px bg-zinc-900 mx-4 my-2"></div>

         <div className="flex justify-between items-center ml-2 mb-2">
            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Deduções Diárias</h3>
            {totals.exp > 0 && <span className="text-[10px] font-black text-red-500 mono">- R$ {totals.exp.toFixed(2)}</span>}
         </div>
         
         <div className="space-y-2 pb-10">
            {journey.expenses.length > 0 ? journey.expenses.map(exp => (
              <div key={exp.id} className="glass p-4 rounded-2xl border-white/5 flex justify-between items-center animate-in slide-in-from-right duration-200">
                 <div className="flex items-center gap-3">
                    <div className={EXPENSE_CATEGORIES[exp.type].color}>{EXPENSE_CATEGORIES[exp.type].icon}</div>
                    <span className="text-[10px] font-black text-zinc-400 uppercase">{EXPENSE_CATEGORIES[exp.type].label}</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <span className="text-red-500 font-black mono text-xs">R$ {exp.value.toFixed(2)}</span>
                    <button onClick={() => onDeleteExpense(exp.id)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-700 active:text-red-500"><X size={14}/></button>
                 </div>
              </div>
            )) : (
              <div className="text-center py-6 opacity-20 italic text-[10px] font-black uppercase tracking-widest">Nenhuma dedução registrada</div>
            )}
            
            <button 
              onClick={() => setShowExpenseModal(true)}
              className="w-full border-2 border-dashed border-zinc-900 p-5 rounded-2xl text-[9px] font-black text-zinc-600 uppercase tracking-widest hover:text-white hover:border-zinc-700 transition-all flex items-center justify-center gap-2"
            >
               <Plus size={14} /> REGISTRAR CUSTO / PIX
            </button>
         </div>
      </div>

      <div className="bg-zinc-900 p-8 border-t border-white/10 shrink-0 space-y-4 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] z-50">
         <div className="flex justify-between items-end">
            <div className="flex flex-col gap-3">
               <div>
                  <span className="text-[8px] font-black text-zinc-600 uppercase block mb-1">SALDO LÍQUIDO DISPONÍVEL</span>
                  <div className="text-3xl font-black text-cyan-500 mono italic flex items-baseline gap-1">
                    <span className="text-sm">R$</span> {totals.net.toFixed(2)}
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-red-500/10 text-red-500">
                    <TrendingDown size={10} />
                  </div>
                  <div>
                    <span className="text-[7px] font-black text-zinc-700 uppercase block leading-none">Total Deduções</span>
                    <span className="text-xs font-black text-red-500/80 mono">R$ {totals.exp.toFixed(2)}</span>
                  </div>
               </div>
            </div>
            <button 
              onClick={() => setShowEndConfirm(true)}
              className="bg-white text-black px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"
            >
               ENCERRAR DIA
            </button>
         </div>
      </div>

      {showBrutoModal.show && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[300] p-10 flex flex-col animate-in slide-in-from-bottom duration-300">
           <div className="flex justify-between mb-12">
              <h3 className="text-white font-black uppercase italic tracking-widest">Bruto {showBrutoModal.platform}</h3>
              <button onClick={() => setShowBrutoModal({show: false, platform: null})}><X size={24} className="text-zinc-500"/></button>
           </div>
           <div className="flex-1 flex flex-col justify-center text-center">
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] block mb-4">Valor total no {showBrutoModal.platform}</span>
              <div className="relative">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-cyan-500/30 text-4xl font-black mono italic">R$</span>
                <input 
                  type="number" value={tempValue} onChange={(e) => setTempValue(e.target.value)} 
                  placeholder="0.00" className="bg-transparent text-white text-8xl font-black text-center w-full mono outline-none border-b border-white/5 pb-4 pl-12" autoFocus
                />
              </div>
           </div>
           <button 
            onClick={() => {
              if (showBrutoModal.platform) {
                onAddRide({ 
                  id: showBrutoModal.platform, 
                  platform: showBrutoModal.platform, 
                  value: parseFloat(tempValue) || 0, 
                  timestamp: Date.now() 
                });
                setShowBrutoModal({show: false, platform: null});
                setTempValue('');
              }
            }} 
            className="w-full bg-cyan-500 text-black py-7 rounded-[32px] font-black uppercase tracking-widest shadow-2xl active:scale-95"
           >
             CONFIRMAR LANÇAMENTO
           </button>
        </div>
      )}

      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[300] p-8 flex flex-col animate-in slide-in-from-bottom duration-300">
           <div className="flex justify-between mb-8 items-center">
              <h3 className="text-white font-black uppercase italic">Dedução de Caixa</h3>
              <button onClick={() => {setShowExpenseModal(false); setSelectedCat(null); setTempValue('');}}><X size={24} className="text-zinc-500"/></button>
           </div>
           
           <div className="grid grid-cols-3 gap-2 mb-10 overflow-y-auto no-scrollbar max-h-[40%]">
              {(Object.keys(EXPENSE_CATEGORIES) as ExpenseType[]).map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setSelectedCat(cat)}
                  className={`h-24 glass rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all ${selectedCat === cat ? 'border-red-500 bg-red-500/10' : 'border-white/5'}`}
                >
                  <div className={selectedCat === cat ? 'text-red-500' : EXPENSE_CATEGORIES[cat].color}>{EXPENSE_CATEGORIES[cat].icon}</div>
                  <span className="text-[8px] font-black uppercase text-center leading-tight">{EXPENSE_CATEGORIES[cat].label}</span>
                </button>
              ))}
           </div>

           {selectedCat && (
             <div className="animate-in fade-in slide-in-from-top duration-300">
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest text-center block mb-2">Valor do Gasto</span>
                <input 
                  type="number" value={tempValue} onChange={(e) => setTempValue(e.target.value)} 
                  placeholder="0.00" className="bg-transparent text-red-500 text-7xl font-black text-center w-full mono outline-none" autoFocus
                />
                <button 
                  onClick={() => {
                    if (tempValue && selectedCat) {
                      onAddExpense({ id: Date.now().toString(), type: selectedCat, value: parseFloat(tempValue), timestamp: Date.now() });
                      setTempValue('');
                      setSelectedCat(null);
                      setShowExpenseModal(false);
                    }
                  }} 
                  className="mt-10 w-full bg-white text-black py-7 rounded-[32px] font-black uppercase tracking-widest active:scale-95"
                >
                  REGISTRAR DEDUÇÃO
                </button>
             </div>
           )}
        </div>
      )}

      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-xl z-[400] p-10 flex flex-col animate-in slide-in-from-bottom">
           <div className="flex-1 flex flex-col justify-center items-center text-center space-y-12">
              <div className="space-y-2">
                 <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">FECHAMENTO</h3>
                 <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest italic">KM de hoje conforme o painel</p>
              </div>
              <div className="relative w-full">
                <input 
                  type="number" 
                  value={finalKm} 
                  onChange={e => setFinalKm(Number(e.target.value))} 
                  className="bg-transparent text-white text-center text-8xl font-black w-full mono outline-none" 
                  autoFocus 
                />
                <div className="flex flex-col items-center gap-2 mt-4">
                  <div className="flex items-center gap-2 text-cyan-500/50">
                    <Navigation size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em]">HODÔMETRO FINAL</span>
                  </div>
                  <div className="mt-4 glass px-6 py-2 rounded-full border-white/5">
                    <span className="text-[10px] font-black text-zinc-600 uppercase">PERCURSO TOTAL: </span>
                    <span className="text-white font-black mono text-sm">{Math.max(0, finalKm - journey.startKm)} KM</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                 <button onClick={() => setShowEndConfirm(false)} className="py-6 rounded-3xl glass text-zinc-500 font-black uppercase text-[10px] tracking-widest">VOLTAR</button>
                 <button onClick={() => onEndJourney(finalKm)} className="py-6 rounded-3xl bg-cyan-500 text-black font-black uppercase text-[10px] tracking-widest shadow-xl">FINALIZAR DIA</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const PlatformButton = ({ label, value, color, onClick, icon }: { label: string, value: number, color: string, onClick: () => void, icon?: React.ReactNode }) => (
  <button 
    onClick={onClick}
    className="glass p-5 rounded-[28px] border-white/5 flex flex-col items-center gap-3 group active:scale-[0.95] transition-all"
  >
     <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white border border-white/5 shadow-inner">
        {icon || <Zap size={18} className={color} />}
     </div>
     <div className="text-center">
        <span className="text-[8px] font-black text-zinc-600 uppercase block mb-1">{label}</span>
        <span className="text-lg font-black text-white mono italic">R$ {value.toFixed(0)}</span>
     </div>
  </button>
);

const CheckItem = ({ active, label, icon, onClick }: { active: boolean, label: string, icon: React.ReactNode, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full glass p-6 rounded-[24px] flex items-center justify-between border transition-all ${active ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-white/5'}`}
  >
    <div className="flex items-center gap-4">
      <div className={active ? 'text-cyan-500' : 'text-zinc-700'}>{icon}</div>
      <span className={`text-[11px] font-black uppercase italic ${active ? 'text-white' : 'text-zinc-600'}`}>{label}</span>
    </div>
    {active ? <CheckCircle2 size={20} className="text-cyan-500" /> : <div className="w-5 h-5 rounded-full border-2 border-zinc-900" />}
  </button>
);

export default ActiveJourney;
