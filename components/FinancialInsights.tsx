
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

    const daily = WEEK_DAYS.map((day, index) => {
      const d = new Date(now);
      const dayOffset = (now.getDay() === 0 ? 6 : now.getDay() - 1);
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

    const weekly = Array.from({ length: 4 }).map((_, i) => {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - (i * 7));
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7 + 6));
      const weekJourneys = history.filter(j => j.startTime >= weekStart.getTime() && j.startTime <= weekEnd.getTime());
      return {
        label: `SEM ${4-i}`,
        fullName: `Semana ${4-i}`,
        net: weekJourneys.reduce((acc, j) => acc + getNet(j), 0),
        gross: weekJourneys.reduce((acc, j) => acc + getGross(j), 0),
        exp: weekJourneys.reduce((acc, j) => acc + getExp(j), 0),
        journeys: weekJourneys
      };
    }).reverse();

    const monthly = MONTH_NAMES.map((month, index) => {
      const monthJourneys = history.filter(j => {
        const jd = new Date(j.startTime);
        return jd.getMonth() === index && jd.getFullYear() === currentYear;
      });
      return {
        label: month.slice(0, 3).toUpperCase(),
        fullName: `Mês de ${month}`,
        net: monthJourneys.reduce((acc, j) => acc + getNet(j), 0),
        gross: monthJourneys.reduce((acc, j) => acc + getGross(j), 0),
        exp: monthJourneys.reduce((acc, j) => acc + getExp(j), 0),
        journeys: monthJourneys
      };
    });

    const yearly = [2024, 2025, 2026].map(year => {
      const yearJourneys = history.filter(j => new Date(j.startTime).getFullYear() === year);
      return {
        label: year.toString(),
        fullName: `Ano ${year}`,
        net: yearJourneys.reduce((acc, j) => acc + getNet(j), 0),
        gross: yearJourneys.reduce((acc, j) => acc + getGross(j), 0),
        exp: yearJourneys.reduce((acc, j) => acc + getExp(j), 0),
        journeys: yearJourneys
      };
    });

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
    <div className="h-full bg-[var(--bg-primary)] flex flex-col animate-in fade-in duration-500 overflow-y-auto no-scrollbar">
      <header className="p-8 pb-4 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="w-12 h-12 rounded-2xl ui-card flex items-center justify-center text-[var(--text-secondary)]">
          <ArrowLeft size={24} />
        </button>
        <div className="text-right">
          <span className="text-[9px] font-black text-[var(--cyan-accent)] uppercase tracking-widest block">Telemetria Avançada</span>
          <h1 className="text-[var(--text-primary)] font-black text-lg uppercase tracking-tighter italic">FINANCEIRO PRO</h1>
        </div>
      </header>

      <div className="px-8 mb-6 sticky top-0 z-40 bg-[var(--bg-primary)]/80 backdrop-blur-md py-2">
        <div className="ui-card p-1.5 rounded-2xl flex justify-between gap-1">
          {(['DIÁRIO', 'SEMANAL', 'MENSAL', 'ANUAL'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-[var(--cyan-accent)] text-black shadow-lg shadow-[var(--cyan-accent)]/20' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-8 pb-32 space-y-6">
        <div className="ui-card rounded-[40px] p-8 space-y-6 relative overflow-hidden group">
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-[var(--cyan-accent)]/5 rounded-full blur-3xl"></div>
           
           <div className="flex justify-between items-start relative z-10">
              <div className="space-y-1">
                 <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em]">Lucro no Período ({activeTab})</span>
                 <div className="flex items-baseline gap-1">
                    <span className="text-[var(--cyan-accent)] text-3xl font-black italic">R$</span>
                    <span className="text-6xl font-black text-[var(--text-primary)] tracking-tighter mono tabular-nums">{mainTotal.toFixed(0)}</span>
                 </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[var(--cyan-accent)]/10 flex items-center justify-center text-[var(--cyan-accent)]">
                 <BarChart3 size={24} />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[var(--border-ui)] relative z-10">
              <div className="space-y-1">
                 <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={10} className="text-[var(--cyan-accent)]" /> FATURAMENTO BRUTO
                 </span>
                 <div className="text-xl font-black text-[var(--text-primary)] mono italic">R$ {mainGross.toFixed(0)}</div>
              </div>
              <div className="space-y-1 text-right">
                 <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center justify-end gap-2">
                    DEDUÇÕES TOTAIS <TrendingDown size={10} className="text-[var(--red-accent)]" />
                 </span>
                 <div className="text-xl font-black text-[var(--red-accent)] mono italic">R$ {mainExp.toFixed(0)}</div>
              </div>
           </div>
        </div>

        <div className="space-y-4">
           <h3 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] ml-2">Progressão Visual</h3>
           <div className="ui-card rounded-[40px] p-8 flex items-end justify-between h-40 overflow-x-auto no-scrollbar gap-2">
              {currentData.map((d, i) => {
                const maxNet = Math.max(...currentData.map(cd => cd.net), 1);
                const barHeight = (d.net / maxNet) * 100;
                return (
                  <div key={i} className="flex flex-col items-center gap-3 h-full justify-end group min-w-[32px]">
                    <div className="relative w-full bg-[var(--bg-secondary)] rounded-t-lg overflow-hidden flex flex-col justify-end h-full border border-[var(--border-ui)]">
                       <div 
                         className="w-full bg-gradient-to-t from-[var(--cyan-accent)] to-[var(--cyan-accent)]/60 group-hover:opacity-80 transition-all duration-500 shadow-[0_0_15px_rgba(34,211,238,0.2)]" 
                         style={{ height: `${Math.max(barHeight, 2)}%` }}
                       ></div>
                    </div>
                    <span className="text-[6px] font-black text-[var(--text-secondary)] uppercase tracking-tighter">{d.label}</span>
                  </div>
                );
              })}
           </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialInsights;
