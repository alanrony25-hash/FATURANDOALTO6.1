
import React, { useState, useMemo } from 'react';
import { Journey, BudgetBucket } from '../types';
import { 
  Zap, 
  Target, 
  TrendingUp,
  CreditCard,
  Home,
  PiggyBank,
  Car,
  Calendar,
  Clock,
  Edit2,
  Check,
  X,
  Plus,
  Navigation,
  TrendingDown,
  Coins,
  RefreshCcw,
  Trash2
} from 'lucide-react';

interface DashboardProps {
  history: Journey[];
  monthlyGoal: number;
  onUpdateGoal: (val: number) => void;
  buckets: BudgetBucket[];
  onUpdateBuckets: (buckets: BudgetBucket[]) => void;
  onResetBuckets: () => void;
  onResetSingleBucket: (id: string) => void;
  onStartJourney: (km: number) => void;
  activeJourney: Journey | null;
  onViewHistory: () => void;
  currentKm: number;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  history, 
  monthlyGoal, 
  onUpdateGoal,
  buckets, 
  onUpdateBuckets,
  onResetBuckets,
  onResetSingleBucket,
  onStartJourney, 
  activeJourney, 
  onViewHistory,
  currentKm
}) => {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(monthlyGoal.toString());
  
  const [showStartKmModal, setShowStartKmModal] = useState(false);
  const [startKm, setStartKm] = useState(currentKm);

  const [editingBucket, setEditingBucket] = useState<BudgetBucket | null>(null);
  const [bucketEditData, setBucketEditData] = useState({ label: '', percentage: 0, goalAmount: 0 });

  const todayStats = useMemo(() => {
    const now = new Date();
    const isToday = (timestamp: number) => {
      const d = new Date(timestamp);
      return d.getDate() === now.getDate() && 
             d.getMonth() === now.getMonth() && 
             d.getFullYear() === now.getFullYear();
    };

    let gross = 0;
    let expenses = 0;

    history.forEach(j => {
      if (isToday(j.startTime)) {
        gross += j.rides.reduce((acc, r) => acc + r.value, 0);
        expenses += j.expenses.reduce((acc, e) => acc + e.value, 0);
      }
    });

    if (activeJourney && isToday(activeJourney.startTime)) {
      gross += activeJourney.rides.reduce((acc, r) => acc + r.value, 0);
      expenses += activeJourney.expenses.reduce((acc, e) => acc + e.value, 0);
    }

    return { gross, expenses, net: gross - expenses };
  }, [history, activeJourney]);

  const totalEarnedThisMonth = history.reduce((acc, j) => {
    const gross = j.rides.reduce((rAcc, r) => rAcc + r.value, 0);
    const exp = j.expenses.reduce((eAcc, e) => eAcc + e.value, 0);
    return acc + (gross - exp);
  }, 0);

  const weeklyGoal = monthlyGoal / 4;
  const dailyGoal = monthlyGoal / 30;
  const progressPercent = Math.min((totalEarnedThisMonth / monthlyGoal) * 100, 100);

  const getIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('carro')) return <Car size={16}/>;
    if (l.includes('cartão') || l.includes('cartao')) return <CreditCard size={16}/>;
    if (l.includes('casa')) return <Home size={16}/>;
    return <PiggyBank size={16}/>;
  };

  const handleSaveGoal = () => {
    const newGoal = parseFloat(tempGoal);
    if (!isNaN(newGoal) && newGoal > 0) {
      onUpdateGoal(newGoal);
      setIsEditingGoal(false);
    }
  };

  const openBucketEdit = (bucket: BudgetBucket) => {
    setEditingBucket(bucket);
    setBucketEditData({
      label: bucket.label,
      percentage: bucket.percentage,
      goalAmount: bucket.goalAmount
    });
  };

  const saveBucketEdit = () => {
    if (editingBucket) {
      const updatedBuckets = buckets.map(b => 
        b.id === editingBucket.id 
        ? { ...b, label: bucketEditData.label, percentage: bucketEditData.percentage, goalAmount: bucketEditData.goalAmount } 
        : b
      );
      onUpdateBuckets(updatedBuckets);
      setEditingBucket(null);
    }
  };

  const resetBucketValue = (e: React.MouseEvent, id: string, label: string) => {
    e.stopPropagation();
    if (confirm(`Deseja ZERAR o valor acumulado de "${label}"?`)) {
      onResetSingleBucket(id);
    }
  };

  return (
    <div className="p-6 pb-40 space-y-6 animate-in fade-in duration-500 overflow-y-auto no-scrollbar h-full">
      <div className="flex justify-between items-center pt-4">
        <div>
          <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest block mb-1">
            Missão {(monthlyGoal / 1000).toFixed(1)}K
          </span>
          <h1 className="text-2xl font-black text-white italic">PROJETO <span className="text-zinc-600">FATURAR ALTO</span></h1>
        </div>
        <button 
          onClick={() => { setIsEditingGoal(true); setTempGoal(monthlyGoal.toString()); }}
          className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-cyan-500 border border-cyan-500/20 active:scale-90 transition-all"
        >
          <Edit2 size={20} />
        </button>
      </div>

      <div className="glass rounded-[32px] p-6 border-cyan-500/10 space-y-4">
        <div className="flex justify-between items-center">
           <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
             <Clock size={12} className="text-cyan-500" /> OPERAÇÃO HOJE
           </h3>
           <span className="text-[8px] font-black text-zinc-700 mono">{new Date().toLocaleDateString('pt-BR')}</span>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
           <div className="bg-zinc-900/50 rounded-2xl p-3 border border-white/5">
              <span className="text-[7px] font-black text-zinc-600 uppercase block mb-1">Bruto</span>
              <div className="text-sm font-black text-white mono">R$ {todayStats.gross.toFixed(0)}</div>
           </div>
           <div className="bg-red-500/5 rounded-2xl p-3 border border-red-500/10">
              <span className="text-[7px] font-black text-red-500/50 uppercase block mb-1">Gastos</span>
              <div className="text-sm font-black text-red-500 mono">R$ {todayStats.expenses.toFixed(0)}</div>
           </div>
           <div className="bg-cyan-500/5 rounded-2xl p-3 border border-cyan-500/10">
              <span className="text-[7px] font-black text-cyan-500 uppercase block mb-1">Líquido</span>
              <div className="text-sm font-black text-cyan-500 mono">R$ {todayStats.net.toFixed(0)}</div>
           </div>
        </div>
      </div>

      <div className="glass rounded-[40px] p-8 space-y-6 relative overflow-hidden group border-cyan-500/20">
        <div className="absolute top-0 left-0 w-full h-1 bg-zinc-900">
          <div className="h-full bg-cyan-500 transition-all duration-1000 shadow-[0_0_10px_#06b6d4]" style={{ width: `${progressPercent}%` }}></div>
        </div>
        
        {isEditingGoal ? (
          <div className="flex flex-col gap-4 animate-in zoom-in duration-200">
            <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest">Nova Meta Mensal (R$)</span>
            <div className="flex items-center gap-2">
              <input 
                type="number"
                value={tempGoal}
                onChange={(e) => setTempGoal(e.target.value)}
                className="bg-zinc-900 text-white text-4xl font-black italic mono w-full p-4 rounded-2xl border border-cyan-500/50 outline-none"
                autoFocus
              />
              <div className="flex flex-col gap-2">
                <button onClick={handleSaveGoal} className="p-3 bg-cyan-500 text-black rounded-xl"><Check size={20}/></button>
                <button onClick={() => setIsEditingGoal(false)} className="p-3 bg-zinc-800 text-zinc-500 rounded-xl"><X size={20}/></button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Acumulado Mensal</span>
              <div className="flex items-baseline gap-1">
                <span className="text-white text-5xl font-black italic mono tracking-tighter">R$ {totalEarnedThisMonth.toFixed(0)}</span>
                <span className="text-zinc-600 font-black text-lg">/ {(monthlyGoal/1000).toFixed(1)}K</span>
              </div>
            </div>
            <div className="text-right">
               <span className="text-cyan-500 font-black text-xl italic">{progressPercent.toFixed(1)}%</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-[32px] p-6 space-y-2 border-white/5">
           <div className="flex items-center gap-2 text-zinc-600 mb-1">
              <Calendar size={14} className="text-cyan-500" />
              <span className="text-[8px] font-black uppercase tracking-widest">Meta Semanal</span>
           </div>
           <div className="text-xl font-black text-white mono italic">R$ {weeklyGoal.toFixed(0)}</div>
        </div>
        <div className="glass rounded-[32px] p-6 space-y-2 border-white/5">
           <div className="flex items-center gap-2 text-zinc-600 mb-1">
              <Target size={14} className="text-cyan-500" />
              <span className="text-[8px] font-black uppercase tracking-widest">Meta Diária</span>
           </div>
           <div className="text-xl font-black text-white mono italic">R$ {dailyGoal.toFixed(2)}</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
           <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Divisão de Ganhos (Alvos)</h3>
           <button 
            onClick={onResetBuckets}
            className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:bg-white/10 transition-all text-zinc-600 hover:text-cyan-500"
           >
              <RefreshCcw size={10} />
              <span className="text-[7px] font-black uppercase tracking-widest">Zerar Geral</span>
           </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {buckets.map(bucket => (
            <div 
              key={bucket.id} 
              className="glass rounded-[32px] p-5 space-y-3 border-white/5 text-left relative group overflow-hidden"
            >
              {/* Overlay de Ações Rápidas */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button 
                  onClick={(e) => resetBucketValue(e, bucket.id, bucket.label)}
                  className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 transition-all hover:text-white"
                  title="Zerar este balde"
                >
                  <RefreshCcw size={12} />
                </button>
                <button 
                  onClick={() => openBucketEdit(bucket)}
                  className="p-2 rounded-lg bg-zinc-900 text-cyan-500/50 hover:text-cyan-500 transition-all border border-white/5"
                >
                  <Edit2 size={12} />
                </button>
              </div>

              <div className="flex justify-between items-center pr-16">
                <div className="p-2 rounded-xl bg-zinc-900 text-cyan-500 border border-white/5">
                  {getIcon(bucket.label)}
                </div>
                <span className="text-[10px] font-black text-zinc-600">{bucket.percentage}%</span>
              </div>
              
              <div onClick={() => openBucketEdit(bucket)} className="cursor-pointer">
                <span className="text-[9px] font-bold text-zinc-500 uppercase block mb-1 truncate">{bucket.label}</span>
                <span className="text-white font-black text-xl mono italic block">R$ {bucket.currentAmount.toFixed(0)}</span>
                <div className="flex items-center gap-1 mt-1 opacity-40">
                  <Target size={8} />
                  <span className="text-[7px] text-zinc-400 uppercase font-bold tracking-tighter">Meta: R$ {bucket.goalAmount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingBucket && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-2xl z-[600] p-8 flex flex-col justify-center animate-in zoom-in duration-300">
           <div className="glass p-8 rounded-[40px] border-white/10 space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-black uppercase italic tracking-widest">Configurar Alvo</h3>
                <button onClick={() => setEditingBucket(null)} className="text-zinc-500"><X size={24} /></button>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-2">Identificação</label>
                  <input 
                    type="text"
                    value={bucketEditData.label}
                    onChange={(e) => setBucketEditData({...bucketEditData, label: e.target.value})}
                    className="w-full bg-zinc-900 border border-white/5 p-4 rounded-2xl text-white font-black uppercase italic outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-2">Porcentagem (%)</label>
                    <input 
                      type="number"
                      value={bucketEditData.percentage}
                      onChange={(e) => setBucketEditData({...bucketEditData, percentage: Number(e.target.value)})}
                      className="w-full bg-zinc-900 border border-white/5 p-4 rounded-2xl text-cyan-500 font-black mono outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-2">Meta (R$)</label>
                    <input 
                      type="number"
                      value={bucketEditData.goalAmount}
                      onChange={(e) => setBucketEditData({...bucketEditData, goalAmount: Number(e.target.value)})}
                      className="w-full bg-zinc-900 border border-white/5 p-4 rounded-2xl text-white font-black mono outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <button 
                  onClick={(e) => { resetBucketValue(e, editingBucket.id, editingBucket.label); setEditingBucket(null); }}
                  className="bg-red-500/10 text-red-500 py-6 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-2"
                 >
                   <RefreshCcw size={16}/> ZERAR
                 </button>
                 <button 
                  onClick={saveBucketEdit}
                  className="bg-cyan-500 text-black py-6 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                 >
                   <Check size={16}/> SALVAR
                 </button>
              </div>
           </div>
        </div>
      )}

      {showStartKmModal && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[600] p-10 flex flex-col justify-center animate-in slide-in-from-bottom">
           <div className="space-y-12 text-center">
              <div className="space-y-2">
                 <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">INICIAR MISSÃO</h3>
                 <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest italic">Confirme o KM atual do painel</p>
              </div>
              <div className="relative">
                <input 
                  type="number" 
                  value={startKm} 
                  onChange={e => setStartKm(Number(e.target.value))} 
                  className="bg-transparent text-white text-center text-8xl font-black w-full mono outline-none border-b border-white/5 pb-4" 
                  autoFocus 
                />
                <div className="flex items-center justify-center gap-2 mt-4 text-cyan-500">
                  <Navigation size={14} />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em]">HODÔMETRO INICIAL</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setShowStartKmModal(false)} className="py-6 rounded-3xl glass text-zinc-500 font-black uppercase text-[10px] tracking-widest">CANCELAR</button>
                 <button onClick={() => { onStartJourney(startKm); setShowStartKmModal(false); }} className="py-6 rounded-3xl bg-cyan-500 text-black font-black uppercase text-[10px] tracking-widest shadow-xl">PARTIR AGORA</button>
              </div>
           </div>
        </div>
      )}

      <div className="fixed bottom-32 left-8 right-8 z-50">
        <button 
          onClick={() => setShowStartKmModal(true)}
          className="w-full bg-cyan-500 text-black py-7 rounded-[32px] flex items-center justify-center gap-4 shadow-[0_20px_40px_-10px_rgba(6,182,212,0.4)] active:scale-95 transition-all"
        >
          <Zap fill="black" size={20} />
          <span className="text-lg font-black uppercase tracking-[0.4em]">RODAR AGORA</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
