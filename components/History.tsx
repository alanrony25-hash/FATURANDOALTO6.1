
import React, { useState } from 'react';
import { Journey, ExpenseType } from '../types';
import { 
  ArrowLeft, 
  Calendar, 
  Trash2, 
  ChevronRight, 
  ChevronDown,
  TrendingUp, 
  TrendingDown,
  Zap,
  Fuel,
  Utensils,
  MapPin,
  CreditCard,
  Wifi,
  Wrench,
  Coins,
  Home,
  Plus,
  ArrowRightLeft,
  User as UserIcon
} from 'lucide-react';

interface HistoryProps {
  history: Journey[];
  onDeleteJourney: (id: string) => void;
  onBack: () => void;
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

const History: React.FC<HistoryProps> = ({ history, onDeleteJourney, onBack }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="p-8 pb-32 h-full flex flex-col bg-black">
      <header className="flex items-center justify-between mb-12 shrink-0">
        <button onClick={onBack} className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-zinc-500">
          <ArrowLeft size={24} />
        </button>
        <div className="text-right">
          <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest block">Consolidado</span>
          <h1 className="text-white font-black text-lg uppercase tracking-tighter italic">HISTÓRICO DE GESTÃO</h1>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar">
        {history.length > 0 ? history.map((j) => {
          const uberGross = j.rides.find(r => r.platform === 'Uber')?.value || 0;
          const gross99 = j.rides.find(r => r.platform === '99')?.value || 0;
          const grossInDrive = j.rides.find(r => r.platform === 'InDrive')?.value || 0;
          const grossParticular = j.rides.find(r => r.platform === 'Particular')?.value || 0;
          
          const grossTotal = uberGross + gross99 + grossInDrive + grossParticular;
          const expTotal = j.expenses.reduce((acc, e) => acc + e.value, 0);
          const net = grossTotal - expTotal;
          const date = new Date(j.startTime);
          const isExpanded = expandedId === j.id;

          return (
            <div 
              key={j.id} 
              className={`glass rounded-[32px] overflow-hidden transition-all duration-300 border-white/5 ${isExpanded ? 'ring-1 ring-cyan-500/30 shadow-[0_20px_40px_-20px_rgba(6,182,212,0.2)]' : ''}`}
            >
              {/* Card Header */}
              <button 
                onClick={() => toggleExpand(j.id)}
                className="w-full p-6 flex flex-col gap-4 active:bg-zinc-900/50 transition-colors text-left"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-500 border border-white/5">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <span className="text-white text-xs font-black uppercase tracking-tighter">
                        {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase()}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-zinc-600 text-[8px] font-black uppercase mono tracking-widest">ID {j.id.slice(-4)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-cyan-500 font-black text-xl mono italic leading-none">
                      <span className="text-[10px] mr-0.5">R$</span>{net.toFixed(2)}
                    </div>
                    <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest block mt-1">LUCRO LÍQUIDO</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5 items-center">
                  <div className="flex flex-col">
                    <span className="text-[7px] text-zinc-700 font-black uppercase mb-0.5">BRUTO</span>
                    <div className="text-white text-[11px] font-black mono italic">R$ {grossTotal.toFixed(0)}</div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7px] text-zinc-700 font-black uppercase mb-0.5">CUSTOS</span>
                    <div className="text-red-500 text-[11px] font-black mono italic">R$ {expTotal.toFixed(0)}</div>
                  </div>
                  <div className="flex justify-end">
                    <div className={`w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-600 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-cyan-500' : ''}`}>
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>
              </button>

              {/* Detalhamento */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-2 space-y-6 animate-in slide-in-from-top duration-300">
                  <div className="space-y-3">
                    <h4 className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] flex items-center gap-2">
                      <TrendingUp size={12} className="text-cyan-500" /> Detalhado por App
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                       <PlatformMini label="Uber" value={uberGross} />
                       <PlatformMini label="99" value={gross99} />
                       <PlatformMini label="InDrive" value={grossInDrive} />
                       <PlatformMini label="Particular" value={grossParticular} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] flex items-center gap-2">
                      <TrendingDown size={12} className="text-red-500" /> Lista de Despesas
                    </h4>
                    <div className="space-y-2">
                      {j.expenses.length > 0 ? j.expenses.map((exp) => (
                        <div key={exp.id} className="flex justify-between items-center bg-zinc-900/30 p-3 rounded-xl border border-white/5">
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg bg-black ${EXPENSE_CATEGORIES[exp.type]?.color || 'text-zinc-500'}`}>
                              {EXPENSE_CATEGORIES[exp.type]?.icon || <Plus size={12} />}
                            </div>
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">
                              {EXPENSE_CATEGORIES[exp.type]?.label || 'OUTRO'}
                            </span>
                          </div>
                          <span className="text-[10px] font-black text-red-500 mono italic">- R$ {exp.value.toFixed(2)}</span>
                        </div>
                      )) : (
                        <div className="text-[8px] font-black text-zinc-800 uppercase text-center py-4 border border-dashed border-zinc-900 rounded-xl">
                          Nenhum gasto registrado
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                    <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                      Distância: <span className="text-white mono">{Math.max(0, (j.endKm || 0) - j.startKm)} KM</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); if(confirm('Apagar permanentemente?')) onDeleteJourney(j.id); }}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-xl text-red-500 active:bg-red-500/20 transition-all"
                    >
                      <Trash2 size={12} />
                      <span className="text-[8px] font-black uppercase tracking-widest">Apagar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        }) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-40 py-20">
            <Zap size={48} className="text-zinc-800" />
            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]">Histórico Vazio</p>
          </div>
        )}
      </div>
    </div>
  );
};

const PlatformMini = ({ label, value }: { label: string, value: number }) => (
  <div className="bg-zinc-900/50 rounded-2xl p-4 border border-white/5">
    <span className="text-[7px] font-black text-zinc-500 uppercase block mb-1">{label}</span>
    <span className="text-xs font-black text-white mono italic">R$ {value.toFixed(2)}</span>
  </div>
);

export default History;
