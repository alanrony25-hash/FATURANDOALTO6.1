
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
    <div className="p-8 pb-32 h-full flex flex-col bg-[var(--bg-primary)]">
      <header className="flex items-center justify-between mb-12 shrink-0">
        <button onClick={onBack} className="w-12 h-12 rounded-2xl ui-card flex items-center justify-center text-[var(--text-secondary)]">
          <ArrowLeft size={24} />
        </button>
        <div className="text-right">
          <span className="text-[9px] font-black text-[var(--cyan-accent)] uppercase tracking-widest block">Consolidado</span>
          <h1 className="text-[var(--text-primary)] font-black text-lg uppercase tracking-tighter italic">HISTÓRICO DE GESTÃO</h1>
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
              className={`ui-card rounded-[32px] overflow-hidden transition-all duration-300 ${isExpanded ? 'border-[var(--cyan-accent)]/30' : ''}`}
            >
              <button 
                onClick={() => toggleExpand(j.id)}
                className="w-full p-6 flex flex-col gap-4 active:bg-[var(--bg-secondary)] transition-colors text-left"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] border border-[var(--border-ui)]">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <span className="text-[var(--text-primary)] text-xs font-black uppercase tracking-tighter">
                        {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase()}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[var(--text-secondary)] text-[8px] font-black uppercase mono tracking-widest opacity-40">ID {j.id.slice(-4)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[var(--cyan-accent)] font-black text-xl mono italic leading-none">
                      <span className="text-[10px] mr-0.5">R$</span>{net.toFixed(0)}
                    </div>
                    <span className="text-[7px] font-black text-[var(--text-secondary)] uppercase tracking-widest block mt-1">LUCRO LÍQUIDO</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[var(--border-ui)] items-center">
                  <div className="flex flex-col">
                    <span className="text-[7px] text-[var(--text-secondary)] font-black uppercase mb-0.5 opacity-60">BRUTO</span>
                    <div className="text-[var(--text-primary)] text-[11px] font-black mono italic">R$ {grossTotal.toFixed(0)}</div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7px] text-[var(--text-secondary)] font-black uppercase mb-0.5 opacity-60">CUSTOS</span>
                    <div className="text-[var(--red-accent)] text-[11px] font-black mono italic">R$ {expTotal.toFixed(0)}</div>
                  </div>
                  <div className="flex justify-end">
                    <div className={`w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[var(--cyan-accent)]' : ''}`}>
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="px-6 pb-6 pt-2 space-y-6 animate-in slide-in-from-top duration-300">
                  <div className="space-y-3">
                    <h4 className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] flex items-center gap-2">
                      <TrendingUp size={12} className="text-[var(--cyan-accent)]" /> Detalhado por App
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                       <PlatformMini label="Uber" value={uberGross} />
                       <PlatformMini label="99" value={gross99} />
                       <PlatformMini label="InDrive" value={grossInDrive} />
                       <PlatformMini label="Particular" value={grossParticular} />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[var(--border-ui)] flex justify-between items-center">
                    <div className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                      Distância: <span className="text-[var(--text-primary)] mono">{Math.max(0, (j.endKm || 0) - j.startKm)} KM</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); if(confirm('Apagar permanentemente?')) onDeleteJourney(j.id); }}
                      className="flex items-center gap-2 px-4 py-2 bg-[var(--red-accent)]/10 rounded-xl text-[var(--red-accent)] active:bg-[var(--red-accent)]/20 transition-all border border-[var(--red-accent)]/20"
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
            <Zap size={48} className="text-[var(--text-secondary)]" />
            <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.3em]">Histórico Vazio</p>
          </div>
        )}
      </div>
    </div>
  );
};

const PlatformMini = ({ label, value }: { label: string, value: number }) => (
  <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 border border-[var(--border-ui)]">
    <span className="text-[7px] font-black text-[var(--text-secondary)] uppercase block mb-1">{label}</span>
    <span className="text-xs font-black text-[var(--text-primary)] mono italic">R$ {value.toFixed(0)}</span>
  </div>
);

export default History;
