
import React, { useState, useMemo } from 'react';
import { Journey, ExpenseType } from '../types';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar, 
  ChevronRight,
  X,
  Zap,
  Clock,
  History as HistoryIcon,
  LayoutGrid
} from 'lucide-react';

interface FinancialInsightsProps {
  history: Journey[];
  monthlyGoal: number;
  onBack: () => void;
}

type TabType = 'DIÁRIO' | 'SEMANAL' | 'MENSAL' | 'ANUAL';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEK_DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

const FinancialInsights: React.FC<FinancialInsightsProps> = ({ history, monthlyGoal, onBack }) => {
  const [activeTab, setActiveTab] = useState<TabType>('DIÁRIO');
  const [selectedPeriodDetail, setSelectedPeriodDetail] = useState<{ label: string, journeys: Journey[] } | null>(null);

  const stats = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();

    const getNet = (j: Journey) => {
      const gross = j.rides.reduce((acc, r) => acc + r.value, 0);
      const exp = j.expenses.reduce((acc, e) => acc + e.value, 0);
      return gross - exp;
    };

    const getGross = (j: Journey) => j.rides.reduce((acc, r) => acc + r.value, 0);
    const getExp = (j: Journey) => j.expenses.reduce((acc, e) => acc + e.value, 0);

    // DIÁRIO - Semana Atual fixada de Segunda a Domingo
    const daily = WEEK_DAYS.map((day, index) => {
      const d = new Date(now);
      const dayOffset = (now.getDay() === 0 ? 6 : now.getDay() - 1); // Ajuste para segunda ser o início (index 0)
      d.setDate(now.getDate() - dayOffset + index);
      
      const dayJourneys = history.filter(j => {
        const jd = new Date(j.startTime);
        return jd.getDate() === d.getDate() && jd.getMonth() === d.getMonth() && jd.getFullYear() === d.getFullYear();
      });

      return {
        label: day.slice(0, 3).toUpperCase(),
        fullName: `${day} (${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })})`,
        net: dayJourneys.reduce((acc, j) => acc + getNet(j), 0),
        gross: dayJourneys.reduce((acc, j) => acc + getGross(j), 0),
        exp: dayJourneys.reduce((acc, j) => acc + getExp(j), 0),
        journeys: dayJourneys
      };
    });

    // WEEKLY - Dividido em 4 Semanas (Ciclos de 7 dias retroativos)
    const weekly = Array.from({ length: 4 }).map((_, i) => {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - (i * 7));
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7 + 6));
      
      const weekJourneys = history.filter(j => j.startTime >= weekStart.getTime() && j.startTime <= weekEnd.getTime());
      
      return {
        label: `SEM ${4-i}`,
        fullName: `Semana ${4-i} (${weekStart.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})} - ${weekEnd.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})})`,
        net: weekJourneys.reduce((acc, j) => acc + getNet(j), 0),
        gross: weekJourneys.reduce((acc, j) => acc + getGross(j), 0),
        exp: weekJourneys.reduce((acc, j) => acc + getExp(j), 0),
        journeys: weekJourneys
      };
    }).reverse();

    // MONTHLY - Janeiro a Dezembro do ano atual
    const monthly = MONTH_NAMES.map((month, index) => {
      const monthJourneys = history.filter(j => {
        const jd = new Date(j.startTime);
        return jd.getMonth() === index && jd.getFullYear() === currentYear;
      });
      return {
        label: month.slice(0, 3).toUpperCase(),
        fullName: `Mês de ${month} ${currentYear}`,
        net: monthJourneys.reduce((acc, j) => acc + getNet(j), 0),
        gross: monthJourneys.reduce((acc, j) => acc + getGross(j), 0),
        exp: monthJourneys.reduce((acc, j) => acc + getExp(j), 0),
        journeys: monthJourneys
      };
    });

    // ANUAL - Começando em 2026, acrescentando automaticamente conforme o tempo passa
    const startYear = 2026;
    // O endYear será sempre o maior entre (ano atual + 1) e o ano de início (2026)
    const endYear = Math.max(currentYear + 1, startYear);
    
    const yearly = [];
    for (let year = startYear; year <= endYear; year++) {
      const yearJourneys = history.filter(j => new Date(j.startTime).getFullYear() === year);
      yearly.push({
        label: year.toString(),
        fullName: `Exercício Anual ${year}`,
        net: yearJourneys.reduce((acc, j) => acc + getNet(j), 0),
        gross: yearJourneys.reduce((acc, j) => acc + getGross(j), 0),
        exp: yearJourneys.reduce((acc, j) => acc + getExp(j), 0),
        journeys: yearJourneys
      });
    }

    return { daily, weekly, monthly, yearly };
  }, [history]);

  const currentData = useMemo(() => {
    switch(activeTab) {
      case 'DIÁRIO': return stats.daily;
      case 'SEMANAL': return stats.weekly;
      case 'MENSAL': return stats.monthly;
      case 'ANUAL': return stats.yearly;
    }
  }, [activeTab, stats]);

  const mainTotal = currentData.reduce((acc, d) => acc + d.net, 0);
  const mainGross = currentData.reduce((acc, d) => acc + d.gross, 0);
  const mainExp = currentData.reduce((acc, d) => acc + d.exp, 0);

  return (
    <div className="h-full bg-black flex flex-col animate-in fade-in duration-500 overflow-y-auto no-scrollbar">
      <header className="p-8 pb-4 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-zinc-500">
          <ArrowLeft size={24} />
        </button>
        <div className="text-right">
          <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest block">Telemetria Avançada</span>
          <h1 className="text-white font-black text-lg uppercase tracking-tighter italic">FINANCEIRO PRO</h1>
        </div>
      </header>

      {/* Tabs Custom */}
      <div className="px-8 mb-6 sticky top-0 z-40 bg-black/50 backdrop-blur-md py-2">
        <div className="glass p-1.5 rounded-2xl flex justify-between gap-1">
          {(['DIÁRIO', 'SEMANAL', 'MENSAL', 'ANUAL'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-zinc-600 hover:text-zinc-400'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-8 pb-32 space-y-6">
        {/* Main Card Bento */}
        <div className="glass rounded-[40px] p-8 space-y-6 relative overflow-hidden group border-white/5">
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-colors"></div>
           
           <div className="flex justify-between items-start relative z-10">
              <div className="space-y-1">
                 <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Lucro no Período ({activeTab})</span>
                 <div className="flex items-baseline gap-1">
                    <span className="text-cyan-500 text-3xl font-black italic">R$</span>
                    <span className="text-6xl font-black text-white tracking-tighter mono tabular-nums">{mainTotal.toFixed(0)}</span>
                    <span className="text-cyan-500 text-xl font-black">,{mainTotal.toFixed(2).split('.')[1]}</span>
                 </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                 <BarChart3 size={24} />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5 relative z-10">
              <div className="space-y-1">
                 <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={10} className="text-cyan-500" /> FATURAMENTO BRUTO
                 </span>
                 <div className="text-xl font-black text-white mono italic">R$ {mainGross.toFixed(0)}</div>
              </div>
              <div className="space-y-1 text-right">
                 <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest flex items-center justify-end gap-2">
                    DEDUÇÕES TOTAIS <TrendingDown size={10} className="text-red-500" />
                 </span>
                 <div className="text-xl font-black text-red-500 mono italic">R$ {mainExp.toFixed(0)}</div>
              </div>
           </div>
        </div>

        {/* Visual Chart Bars */}
        <div className="space-y-4">
           <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] ml-2">Progressão Visual</h3>
           <div className="glass rounded-[40px] p-8 flex items-end justify-between h-40 border-white/5 overflow-x-auto no-scrollbar gap-2">
              {currentData.map((d, i) => {
                const maxNet = Math.max(...currentData.map(cd => cd.net), 1);
                const barHeight = (d.net / maxNet) * 100;
                return (
                  <div key={i} className="flex flex-col items-center gap-3 h-full justify-end group min-w-[32px]">
                    <div className="relative w-full bg-zinc-900 rounded-t-lg overflow-hidden flex flex-col justify-end h-full border border-white/5">
                       <div 
                         className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 group-hover:from-cyan-400 group-hover:to-cyan-200 transition-all duration-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]" 
                         style={{ height: `${Math.max(barHeight, 2)}%` }}
                       ></div>
                    </div>
                    <span className="text-[6px] font-black text-zinc-600 uppercase tracking-tighter">{d.label}</span>
                  </div>
                );
              })}
           </div>
        </div>

        {/* Detailed Breakdown List */}
        <div className="space-y-4 pt-4">
           <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] ml-2">
              {activeTab === 'DIÁRIO' ? 'Visão da Semana (Seg-Dom)' : activeTab === 'SEMANAL' ? 'Ciclo de 4 Semanas' : activeTab === 'MENSAL' ? 'Calendário Anual' : 'Exercício Financeiro'}
           </h3>
           <div className="grid grid-cols-1 gap-3">
              {currentData.map((d, i) => (
                <button 
                  key={i} 
                  onClick={() => d.journeys.length > 0 && setSelectedPeriodDetail({ label: d.fullName || d.label, journeys: d.journeys })}
                  className={`glass p-5 rounded-[28px] border-white/5 flex justify-between items-center group transition-all ${d.journeys.length > 0 ? 'active:scale-[0.98]' : 'opacity-40 grayscale'}`}
                >
                   <div className="flex items-center gap-4 text-left">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-600 group-hover:text-cyan-500 border border-white/5 transition-colors">
                         {activeTab === 'ANUAL' ? <Target size={18} /> : activeTab === 'SEMANAL' ? <LayoutGrid size={18} /> : activeTab === 'DIÁRIO' ? <Clock size={18} /> : <Zap size={18} />}
                      </div>
                      <div>
                         <span className="text-white text-xs font-black uppercase italic">{d.fullName || d.label}</span>
                         <div className="flex items-center gap-2">
                            <span className="text-[8px] font-black text-zinc-600 uppercase mono">{d.journeys.length} Missões</span>
                         </div>
                      </div>
                   </div>
                   <div className="text-right flex items-center gap-3">
                      <div>
                        <div className="text-cyan-500 font-black text-lg mono italic">R$ {d.net.toFixed(0)}</div>
                        <span className="text-[7px] font-black text-zinc-700 uppercase tracking-widest block">Líquido</span>
                      </div>
                      {d.journeys.length > 0 && <ChevronRight size={16} className="text-zinc-800" />}
                   </div>
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* MODAL DE DETALHAMENTO DO PERÍODO */}
      {selectedPeriodDetail && (
        <div className="fixed inset-0 z-[100] bg-black animate-in fade-in duration-300 flex flex-col">
          <header className="p-8 pb-4 flex items-center justify-between shrink-0 bg-black/80 backdrop-blur-xl border-b border-white/5">
            <button onClick={() => setSelectedPeriodDetail(null)} className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-zinc-500">
              <X size={24} />
            </button>
            <div className="text-right">
              <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest block">Logs do Período</span>
              <h2 className="text-white font-black text-lg uppercase tracking-tighter italic">{selectedPeriodDetail.label}</h2>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 space-y-4 no-scrollbar">
            {selectedPeriodDetail.journeys.map((j) => {
              const gross = j.rides.reduce((acc, r) => acc + r.value, 0);
              const exp = j.expenses.reduce((acc, e) => acc + e.value, 0);
              const net = gross - exp;
              const date = new Date(j.startTime);

              return (
                <div key={j.id} className="glass p-6 rounded-[32px] border-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-700 border border-white/5">
                      <HistoryIcon size={18} />
                    </div>
                    <div>
                      <span className="text-white text-xs font-black uppercase italic">
                        {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' }).toUpperCase()}
                      </span>
                      <div className="text-[8px] font-black text-zinc-600 uppercase mono">
                         KM: {Math.max(0, (j.endKm || 0) - j.startKm)} • {j.rides.length} APPS
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-cyan-500 font-black text-xl mono italic">R$ {net.toFixed(2)}</div>
                    <span className="text-[7px] font-black text-zinc-700 uppercase tracking-widest block">Saldo do Dia</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-8 bg-black/80 backdrop-blur-xl border-t border-white/5 shrink-0">
             <button 
              onClick={() => setSelectedPeriodDetail(null)}
              className="w-full bg-cyan-500 text-black py-6 rounded-[28px] font-black uppercase tracking-[0.3em] text-xs shadow-xl shadow-cyan-500/20"
             >
               VOLTAR
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialInsights;
