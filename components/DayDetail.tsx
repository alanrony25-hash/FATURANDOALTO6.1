
import React, { useEffect, useState } from 'react';
import { Journey } from '../types';
import { 
  ArrowLeft, 
  Sparkles, 
  Share2, 
  TrendingUp, 
  Zap,
  ChevronRight,
  Clock,
  Target,
  ShieldCheck
} from 'lucide-react';
import { getJourneyInsight } from '../services/geminiService';

interface DayDetailProps {
  journey: Journey;
  onBack: () => void;
}

const DayDetail: React.FC<DayDetailProps> = ({ journey, onBack }) => {
  const [insight, setInsight] = useState<string>("Sintetizando dados da missão...");

  useEffect(() => {
    const fetchInsight = async () => {
      const text = await getJourneyInsight(journey);
      setInsight(text);
    };
    fetchInsight();
  }, [journey]);

  const gross = journey.rides.reduce((acc, r) => acc + r.value, 0);
  const exp = journey.expenses.reduce((acc, e) => acc + e.value, 0);
  const net = gross - exp;
  const durationHrs = journey.endTime ? (journey.endTime - journey.startTime) / (1000 * 60 * 60) : 1;
  const ganhoHora = net / Math.max(durationHrs, 0.1);

  const getPerformanceRank = () => {
    if (ganhoHora > 45) return { grade: 'EX+', label: 'Excepcional', color: 'text-cyan-400' };
    if (ganhoHora > 30) return { grade: 'PRO', label: 'Profissional', color: 'text-emerald-400' };
    return { grade: 'STD', label: 'Regular', color: 'text-zinc-500' };
  };

  const rank = getPerformanceRank();

  return (
    <div className="h-full bg-black flex flex-col p-8 space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-center pt-4">
        <button onClick={onBack} className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-zinc-500">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest block">Análise Concluída</span>
          <h1 className="text-white font-black text-lg uppercase tracking-tighter">Relatório do Dia</h1>
        </div>
        <button className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-cyan-500">
          <Share2 size={20} />
        </button>
      </header>

      {/* Rank Herói */}
      <div className="relative pt-12 pb-6 flex flex-col items-center">
        <div className="absolute inset-0 flex items-center justify-center opacity-10 blur-2xl">
          <Zap size={200} className="text-cyan-500" />
        </div>
        <div className={`text-9xl font-black italic tracking-tighter mono ${rank.color}`}>
          {rank.grade}
        </div>
        <div className="mt-4 flex items-center gap-2 bg-zinc-900 border border-white/5 px-6 py-2 rounded-full">
          <ShieldCheck size={14} className="text-cyan-500" />
          <span className="text-white text-[10px] font-black uppercase tracking-widest">Nível {rank.label}</span>
        </div>
      </div>

      {/* Números Principais Bento */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 glass rounded-[40px] p-8 space-y-2 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl"></div>
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] block">Ganhos Líquidos</span>
          <div className="flex items-baseline gap-2">
            <span className="text-cyan-500 text-3xl font-black italic">R$</span>
            <span className="text-7xl font-black text-white tracking-tighter mono tabular-nums">{net.toFixed(0)}</span>
            <span className="text-cyan-500 text-2xl font-black">,{net.toFixed(2).split('.')[1]}</span>
          </div>
        </div>

        <StatMini label="Bruto" value={`R$ ${gross.toFixed(2)}`} icon={<TrendingUp size={14}/>} />
        <StatMini label="Custos" value={`R$ ${exp.toFixed(2)}`} icon={<Zap size={14} className="text-red-500"/>} />
        <StatMini label="R$/Hora" value={`R$ ${ganhoHora.toFixed(2)}`} icon={<Clock size={14}/>} />
        <StatMini label="Meta" value={`+${((net/300)*100).toFixed(0)}%`} icon={<Target size={14}/>} />
      </div>

      {/* Insight Estratégico da IA */}
      <div className="bg-gradient-to-br from-zinc-900 to-black border border-cyan-500/30 rounded-[32px] p-8 space-y-4 relative overflow-hidden">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-cyan-500" />
          <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Dica Estratégica</h4>
        </div>
        <p className="text-zinc-300 text-sm font-medium leading-relaxed italic">
          "{insight}"
        </p>
      </div>

      <button 
        onClick={onBack}
        className="w-full bg-white text-black py-7 rounded-[32px] flex items-center justify-center gap-4 text-sm font-black uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all"
      >
        FECHAR ANÁLISE <ChevronRight size={20} />
      </button>
    </div>
  );
};

const StatMini = ({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) => (
  <div className="glass rounded-[32px] p-6 space-y-1">
    <div className="flex items-center gap-1 text-zinc-500 mb-1">
      {icon}
      <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <span className="text-lg font-black text-white tracking-tight mono italic">{value}</span>
  </div>
);

export default DayDetail;
