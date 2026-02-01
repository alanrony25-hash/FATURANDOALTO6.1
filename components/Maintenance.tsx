
import React, { useState } from 'react';
import { MaintenanceItem } from '../types';
import { 
  ArrowLeft, Wrench, AlertTriangle, ChevronRight, Droplets, 
  Disc, CircleDot, Edit2, X, Check, Trash2, Plus, 
  Fuel, Utensils, Coins, CreditCard, Shield, FileText, Zap, Home, DollarSign
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
    if (t.includes('óleo') || t.includes('oleo') || t.includes('combustível')) return <Fuel size={18} />;
    if (t.includes('alimentação') || t.includes('comida')) return <Utensils size={18} />;
    if (t.includes('lavagem') || t.includes('limpeza')) return <Coins size={18} />;
    if (t.includes('freio') || t.includes('pastilha')) return <Disc size={18} />;
    if (t.includes('seguro')) return <Shield size={18} />;
    if (t.includes('ipva') || t.includes('licenciamento')) return <FileText size={18} />;
    if (t.includes('aluguel') || t.includes('parcela')) return <CreditCard size={18} />;
    if (t.includes('salário') || t.includes('pro-labore')) return <DollarSign size={18} />;
    return <CircleDot size={18} />;
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
    if (confirm('Apagar este item do checklist?')) {
      onUpdateItems(items.filter(i => i.id !== id));
      setEditingItem(null);
    }
  };

  const handleAdd = () => {
    const newItem: MaintenanceItem = {
      id: Date.now().toString(),
      title: 'Novo Item de Gasto',
      lastKm: currentKm,
      nextKm: currentKm + 5000,
      priority: 'medium'
    };
    onUpdateItems([...items, newItem]);
    handleEdit(newItem);
  };

  return (
    <div className="h-full flex flex-col bg-[var(--bg-primary)] overflow-hidden">
      {/* HEADER FIXO TÁTICO */}
      <header className="p-8 pb-6 flex items-center justify-between shrink-0 bg-[var(--bg-primary)] z-50">
        <button onClick={onBack} className="w-12 h-12 rounded-2xl ui-card flex items-center justify-center text-[var(--text-secondary)]">
          <ArrowLeft size={24} />
        </button>
        <div className="text-right">
          <span className="text-[9px] font-black text-[var(--cyan-accent)] uppercase tracking-widest block">Gestão de Ativos</span>
          <h1 className="text-[var(--text-primary)] font-black text-lg uppercase tracking-tighter italic leading-none">MANUTENÇÃO</h1>
        </div>
      </header>

      {/* STATUS DO HODÔMETRO COMPACTO */}
      <div className="px-8 shrink-0 mb-4">
        <div className="ui-card p-5 flex items-center justify-between border-[var(--cyan-accent)]/10 bg-[var(--bg-secondary)] rounded-[28px]">
            <div>
                <span className="text-[7px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] block mb-1 opacity-50">HODÔMETRO DE REFERÊNCIA</span>
                <span className="text-3xl font-black text-[var(--text-primary)] tracking-tighter mono italic">
                    {currentKm.toLocaleString()} <span className="text-[var(--cyan-accent)] text-[10px] ml-1">KM</span>
                </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-black border border-[var(--border-ui)] flex items-center justify-center text-[var(--cyan-accent)]">
                <Wrench size={18} />
            </div>
        </div>
      </div>

      {/* LISTA DE ROLAGEM INFINITA (IGUAL AO VÍDEO) */}
      <div className="flex-1 overflow-y-auto px-6 space-y-3 no-scrollbar pb-44 animate-in fade-in slide-in-from-bottom duration-500">
        <div className="flex items-center justify-between px-3 mb-2">
          <h3 className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] italic">CHECKLIST OPERACIONAL</h3>
          <span className="text-[8px] font-bold text-[var(--cyan-accent)] uppercase">{items.length} ITENS</span>
        </div>
        
        {items.length > 0 ? items.map((item) => {
          const range = Math.max(1, item.nextKm - item.lastKm);
          const progress = ((currentKm - item.lastKm) / range) * 100;
          const isCritical = progress > 90;

          return (
            <div 
              key={item.id} 
              onClick={() => handleEdit(item)}
              className="ui-card p-4 flex items-center gap-4 group active:bg-[var(--bg-secondary)] transition-all rounded-[24px] border-[var(--border-ui)] hover:border-[var(--cyan-accent)]/30"
            >
              {/* ÍCONE ESTILO VÍDEO */}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-all ${isCritical ? 'bg-red-500/10 border-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-black border-[var(--border-ui)] text-[var(--text-secondary)]'}`}>
                {getIcon(item.title)}
              </div>

              {/* INFO DO ITEM */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[var(--text-primary)] text-[10px] font-black uppercase tracking-tight truncate pr-2 italic">{item.title}</span>
                  <ChevronRight size={14} className="text-[var(--text-secondary)] opacity-30" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[7px] font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-40">
                    {isCritical ? 'MANUTENÇÃO IMINENTE' : 'CUSTO EM MONITORAMENTO'}
                  </span>
                  <span className={`text-[7px] font-black mono ${isCritical ? 'text-red-500' : 'text-[var(--cyan-accent)]'}`}>
                    {Math.max(0, item.nextKm - currentKm)} KM
                  </span>
                </div>
                {/* BARRA DE PROGRESSO SLIM */}
                <div className="h-1 bg-black rounded-full overflow-hidden mt-2 border border-white/5">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${isCritical ? 'bg-red-500 animate-pulse' : 'bg-[var(--cyan-accent)]'}`} 
                    style={{ width: `${Math.min(100, Math.max(2, progress))}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="text-center py-20 opacity-20 flex flex-col items-center">
              <Zap size={48} />
              <p className="text-[9px] font-black uppercase tracking-widest mt-4">Nenhum balde de manutenção configurado</p>
          </div>
        )}

        {/* BOTÃO FINAL DE ADIÇÃO */}
        <button 
          onClick={handleAdd}
          className="w-full mt-4 bg-[var(--bg-secondary)] border border-dashed border-[var(--border-ui)] text-[var(--text-secondary)] font-black py-6 rounded-[28px] uppercase tracking-[0.3em] text-[9px] flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
            <Plus size={16} /> ADICIONAR BALDE / GASTO
        </button>
      </div>

      {/* MODAL DE EDIÇÃO (LADO A LADO COM O VÍDEO) */}
      {editingItem && tempData && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[600] p-8 flex flex-col justify-center animate-in zoom-in duration-200">
           <div className="ui-card p-8 rounded-[40px] space-y-8 bg-black border-[var(--cyan-accent)]/20 shadow-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-black uppercase italic tracking-widest text-sm">Configurar Custo</h3>
                <button onClick={() => setEditingItem(null)} className="p-2 text-zinc-500"><X size={28} /></button>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-2">NOME DO GASTO / COMPONENTE</label>
                  <input 
                    type="text"
                    value={tempData.title}
                    onChange={(e) => setTempData({...tempData, title: e.target.value})}
                    className="w-full bg-zinc-900 border border-white/5 p-5 rounded-2xl text-white font-black uppercase italic outline-none focus:border-[var(--cyan-accent)]/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-2">ÚLTIMO CHECK (KM)</label>
                    <input 
                      type="number"
                      value={tempData.lastKm}
                      onChange={(e) => setTempData({...tempData, lastKm: Number(e.target.value)})}
                      className="w-full bg-zinc-900 border border-white/5 p-5 rounded-2xl text-[var(--cyan-accent)] font-black mono outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-2">PRÓXIMO CHECK (KM)</label>
                    <input 
                      type="number"
                      value={tempData.nextKm}
                      onChange={(e) => setTempData({...tempData, nextKm: Number(e.target.value)})}
                      className="w-full bg-zinc-900 border border-white/5 p-5 rounded-2xl text-white font-black mono outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-2">PRIORIDADE OPERACIONAL</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['high', 'medium', 'low'] as const).map(p => (
                      <button 
                        key={p}
                        onClick={() => setTempData({...tempData, priority: p})}
                        className={`py-4 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all ${tempData.priority === p ? 'bg-[var(--cyan-accent)] text-black border-[var(--cyan-accent)] shadow-lg' : 'bg-zinc-900 text-zinc-500 border-white/5'}`}
                      >
                        {p === 'high' ? 'CRÍTICA' : p === 'medium' ? 'ALERTA' : 'IDEAL'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                 <button 
                  onClick={() => handleDelete(tempData.id)}
                  className="bg-red-500/10 border border-red-500/20 text-red-500 py-6 rounded-3xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2"
                 >
                   <Trash2 size={16}/> EXCLUIR
                 </button>
                 <button 
                  onClick={handleSave}
                  className="bg-[var(--cyan-accent)] text-black py-6 rounded-3xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 shadow-xl border-0"
                 >
                   <Check size={16}/> SALVAR MUDANÇAS
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
