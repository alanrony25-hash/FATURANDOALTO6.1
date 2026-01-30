
import React, { useState, useEffect } from 'react';
import { Journey, ExpenseType } from '../types';
import { Maximize2, Pause, Play, Plus, DollarSign, Timer, Move } from 'lucide-react';

interface PopUpWindowProps {
  journey: Journey;
  onExpand: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onQuickExpense: () => void;
}

const PopUpWindow: React.FC<PopUpWindowProps> = ({ 
  journey, onExpand, isPaused, onTogglePause, onQuickExpense 
}) => {
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const gross = journey.rides.reduce((acc, r) => acc + r.value, 0);
  const exp = journey.expenses.reduce((acc, e) => acc + e.value, 0);
  const net = gross - exp;

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  return (
    <div 
      className="fixed z-[9999] select-none touch-none"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className={`glass rounded-[32px] p-1 pr-4 flex items-center gap-3 border-2 transition-all duration-500 shadow-2xl ${isPaused ? 'border-amber-500/50' : 'border-cyan-500/50 shadow-cyan-500/20'}`}>
        
        {/* Handle de Arrasto */}
        <div className="w-10 h-10 rounded-full bg-zinc-950 flex items-center justify-center text-zinc-700">
          <Move size={14} />
        </div>

        {/* Info de Lucro */}
        <div className="flex flex-col">
          <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-0.5">Lucro Líquido</span>
          <div className={`text-lg font-black mono italic leading-none flex items-center gap-0.5 ${net >= 0 ? 'text-white' : 'text-red-500'}`}>
            <span className="text-[10px] text-cyan-500">R$</span>
            {net.toFixed(0)}
          </div>
        </div>

        <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

        {/* Botões de Ação Rápida */}
        <div className="flex items-center gap-2">
          <button 
            onClick={onTogglePause}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isPaused ? 'bg-amber-500 text-black' : 'bg-zinc-900 text-zinc-400'}`}
          >
            {isPaused ? <Play size={14} fill="black" /> : <Pause size={14} fill="currentColor" />}
          </button>
          
          <button 
            onClick={onQuickExpense}
            className="w-8 h-8 rounded-full bg-zinc-900 text-red-500 flex items-center justify-center"
          >
            <Plus size={16} />
          </button>

          <button 
            onClick={onExpand}
            className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Indicador de Status (Pequeno ponto pulsante embaixo) */}
      {!isPaused && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_#06b6d4]"></div>
      )}
    </div>
  );
};

export default PopUpWindow;
