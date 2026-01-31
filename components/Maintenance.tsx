
import React, { useState } from 'react';
import { MaintenanceItem } from '../types';
import { 
  ArrowLeft, Wrench, AlertTriangle, ChevronRight, Droplets, 
  Disc, CircleDot, Edit2, X, Check, Trash2, Plus 
} from 'lucide-react';

interface MaintenanceProps {
  currentKm: number;
  items: MaintenanceItem[];
  onUpdateItems: (items: MaintenanceItem[]) => void;
  onBack: () => void;
}

const Maintenance: React.FC<MaintenanceProps> = ({ currentKm, items, onUpdateItems, onBack }) => {
  const [editingItem, setEditingItem] = useState<MaintenanceItem | null>(null);
  const [tempData, setTempData] = useState<MaintenanceItem | null>(null);

  const getIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('óleo') || t.includes('oleo')) return <Droplets size={20} />;
    if (t.includes('freio') || t.includes('pastilha')) return <Disc size={20} />;
    return <CircleDot size={20} />;
  };

  const handleEdit = (item: MaintenanceItem) => {
    setEditingItem(item);
    setTempData({ ...item });
  };

  const handleSave = () => {
    if (tempData) {
      onUpdateItems(items.map(i => i.id === tempData.id ? tempData : i));
      setEditingItem(null);
      setTempData(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Apagar este lembrete de manutenção?')) {
      onUpdateItems(items.filter(i => i.id !== id));
      setEditingItem(null);
    }
  };

  const handleAdd = () => {
    const newItem: MaintenanceItem = {
      id: Date.now().toString(),
      title: 'Novo Item',
      lastKm: currentKm,
      nextKm: currentKm + 10000,
      priority: 'medium'
    };
    onUpdateItems([...items, newItem]);
    handleEdit(newItem);
  };

  return (
    <div className="h-full flex flex-col bg-black overflow-hidden">
      {/* HEADER FIXO */}
      <header className="p-8 pb-4 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-zinc-500">
          <ArrowLeft size={24} />
        </button>
        <div className="text-right">
          <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest block">Hardware Checkup</span>
          <h1 className="text-white font-black text-lg uppercase tracking-tighter italic leading-none">MANUTENÇÃO</h1>
        </div>
      </header>

      {/* ODÔMETRO FIXO */}
      <div className="px-8 shrink-0">
        <div className="glass p-6 rounded-[32px] mb-6 flex items-center justify-between relative overflow-hidden group border-white/5 bg-zinc-950/40">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Wrench size={60} />
            </div>
            <div className="relative z-10">
            <span className="text-zinc-600 text-[9px] font-black uppercase tracking-widest block mb-1">HODÔMETRO ATUAL</span>
            <span className="text-4xl font-black text-white tracking-tighter mono italic leading-none">{currentKm.toLocaleString()} <span className="text-cyan-500 text-xs ml-1">KM</span></span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 relative z-10 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Wrench size={20} />
            </div>
        </div>
      </div>

      {/* ÁREA ROLÁVEL DA FROTA - Ajustado padding inferior para visibilidade total */}
      <div className="flex-1 overflow-y-auto px-8 space-y-6 no-scrollbar pb-48">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
            <AlertTriangle size={14} className="text-orange-500" /> STATUS DA FROTA
          </h3>
          <button onClick={handleAdd} className="w-9 h-9 glass rounded-xl text-cyan-500 border border-cyan-500/20 flex items-center justify-center shadow-lg active:scale-90 transition-all">
            <Plus size={18}/>
          </button>
        </div>
        
        <div className="space-y-4">
          {items.length > 0 ? items.map((item) => {
            const range = Math.max(1, item.nextKm - item.lastKm);
            const progress = ((currentKm - item.lastKm) / range) * 100;
            const isCritical = progress > 90;
            const isWarning = progress > 70 && progress <= 90;

            return (
              <div key={item.id} className="glass rounded-[32px] p-6 flex items-center gap-5 group active:bg-zinc-900 transition-all relative border-white/5 bg-zinc-950/20">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${isCritical ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : isWarning ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' : 'bg-zinc-900 border-white/10 text-zinc-500'}`}>
                  {getIcon(item.title)}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-[11px] font-black uppercase tracking-tight italic">{item.title}</span>
                    <span className={`text-[8px] font-black uppercase tracking-widest mono ${isCritical ? 'text-red-500 animate-pulse' : 'text-zinc-600'}`}>
                      {Math.max(0, item.nextKm - currentKm)} KM RESTANTES
                    </span>
                  </div>
                  <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${isCritical ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : isWarning ? 'bg-orange-500' : 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]'}`} 
                      style={{ width: `${Math.min(100, Math.max(2, progress))}%` }}
                    ></div>
                  </div>
                </div>
                <button onClick={() => handleEdit(item)} className="p-3 text-zinc-800 hover:text-cyan-500 transition-colors">
                  <Edit2 size={18} />
                </button>
              </div>
            );
          }) : (
            <div className="text-center py-20 border-2 border-dashed border-zinc-900 rounded-[40px] space-y-4">
                <Wrench size={40} className="text-zinc-900 mx-auto" />
                <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.4em]">Nenhum item em monitoramento</p>
                <button onClick={handleAdd} className="text-cyan-500 text-[8px] font-black uppercase underline">Adicionar Primeiro Checkup</button>
            </div>
          )}
        </div>

        <button onClick={handleAdd} className="w-full bg-zinc-950 text-zinc-500 font-black py-6 rounded-[32px] border border-white/5 uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-inner">
            NOVO CHECKUP <ChevronRight size={16} />
        </button>
      </div>

      {editingItem && tempData && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-2xl z-[600] p-8 flex flex-col justify-center animate-in zoom-in duration-300">
           <div className="glass p-8 rounded-[40px] border-white/10 space-y-8 bg-black/60 shadow-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-black uppercase italic tracking-widest">Editar Checkup</h3>
                <button onClick={() => setEditingItem(null)} className="p-2 text-zinc-500"><X size={28} /></button>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-2">Componente</label>
                  <input 
                    type="text"
                    value={tempData.title}
                    onChange={(e) => setTempData({...tempData, title: e.target.value})}
                    className="w-full bg-zinc-900 border border-white/5 p-4 rounded-2xl text-white font-black uppercase italic outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-2">Última Rev. (KM)</label>
                    <input 
                      type="number"
                      value={tempData.lastKm}
                      onChange={(e) => setTempData({...tempData, lastKm: Number(e.target.value)})}
                      className="w-full bg-zinc-900 border border-white/5 p-4 rounded-2xl text-cyan-500 font-black mono outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-2">Próxima Rev. (KM)</label>
                    <input 
                      type="number"
                      value={tempData.nextKm}
                      onChange={(e) => setTempData({...tempData, nextKm: Number(e.target.value)})}
                      className="w-full bg-zinc-900 border border-white/5 p-4 rounded-2xl text-white font-black mono outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-2">Prioridade</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['high', 'medium', 'low'] as const).map(p => (
                      <button 
                        key={p}
                        onClick={() => setTempData({...tempData, priority: p})}
                        className={`py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${tempData.priority === p ? 'bg-cyan-500 text-black border-cyan-500 shadow-lg shadow-cyan-500/20' : 'bg-zinc-900/50 text-zinc-600 border-white/5'}`}
                      >
                        {p === 'high' ? 'Alta' : p === 'medium' ? 'Média' : 'Baixa'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <button 
                  onClick={() => handleDelete(tempData.id)}
                  className="bg-red-500/10 border border-red-500/20 text-red-500 py-6 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95"
                 >
                   <Trash2 size={18}/> APAGAR
                 </button>
                 <button 
                  onClick={handleSave}
                  className="bg-cyan-500 text-black py-6 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 active:scale-95"
                 >
                   <Check size={18}/> SALVAR
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
