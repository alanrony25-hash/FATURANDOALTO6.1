
import React, { useState } from 'react';
import { Journey } from '../types';
import { ArrowLeft, Calendar, Trash2, ChevronDown, TrendingUp, Zap } from 'lucide-react';

interface HistoryProps {
  history: Journey[];
  onDeleteJourney: (id: string) => void;
  onBack: () => void;
}

const History: React.FC<HistoryProps> = ({ history, onDeleteJourney, onBack }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="p-4 pb-32 h-full flex flex-col bg-[var(--bg-primary)]">
      <header className="flex items-center justify-between mb-6 shrink-0">
        <button onClick={onBack} className="w-9 h-9 rounded-xl ui-card flex items-center justify-center text-[var(--text-secondary)]">
          <ArrowLeft size={20} />
        </button>
        <div className="text-right">
          <span className="text-[8px] font-black text-[var(--accent-main)] uppercase tracking-widest block">CONSOLIDADO</span>
          <h1 className="text-[var(--text-primary)] font-black text-md uppercase tracking-tighter italic">HISTÓRICO OPERACIONAL</h1>
        </div>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
        {history.length > 0 ? history.map((j) => {
          const gross = j.rides.reduce((a, r) => a + r.value, 0);
          const exp = j.expenses.reduce((a, e) => a + e.value, 0);
          const net = gross - exp;
          const isExpanded = expandedId === j.id;

          return (
            <div key={j.id} className="ui-card overflow-hidden">
              <button onClick={() => setExpandedId(isExpanded ? null : j.id)} className="w-full p-4 flex flex-col gap-2 active:bg-[var(--bg-secondary)] text-left">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)]">
                      <Calendar size={14} />
                    </div>
                    <div>
                      <span className="text-[var(--text-primary)] text-[10px] font-black uppercase italic">
                        {new Date(j.startTime).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[var(--accent-main)] font-black text-lg mono italic leading-none">
                      <span className="text-[9px] mr-0.5">R$</span>{net.toFixed(0)}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-[var(--border-ui)]">
                  <span className="text-[7px] text-[var(--text-secondary)] font-black uppercase opacity-60">BRUTO: R$ {gross.toFixed(0)}</span>
                  <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[var(--accent-main)]' : 'text-[var(--text-secondary)]'}`}>
                    <ChevronDown size={14} />
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-1 space-y-4 animate-in slide-in-from-top duration-200">
                  <div className="grid grid-cols-2 gap-2">
                    {j.rides.map(r => (
                       <div key={r.id} className="bg-[var(--bg-tertiary)] p-2 rounded-lg border border-[var(--border-ui)]">
                          <span className="text-[6px] font-black text-[var(--text-secondary)] uppercase block">{r.platform}</span>
                          <span className="text-[10px] font-black text-[var(--text-primary)] mono italic">R$ {r.value.toFixed(2)}</span>
                       </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[7px] font-black text-[var(--text-secondary)] uppercase">ODÔMETRO: {Math.max(0, (j.endKm || 0) - j.startKm)} KM</span>
                    <button onClick={() => { if(confirm('Apagar permanentemente?')) onDeleteJourney(j.id); }} className="p-2 text-[var(--danger)]">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        }) : (
          <div className="text-center py-10 opacity-30 flex flex-col items-center">
            <Zap size={32} />
            <p className="text-[8px] font-black uppercase tracking-widest mt-2">Histórico Vazio</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
