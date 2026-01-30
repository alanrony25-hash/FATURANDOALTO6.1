
import React from 'react';
import { Journey } from '../types';
import { Maximize2 } from 'lucide-react';

interface FloatingWidgetProps {
  journey: Journey;
  onExpand: () => void;
}

const FloatingWidget: React.FC<FloatingWidgetProps> = ({ journey, onExpand }) => {
  const gross = journey.rides.reduce((acc, r) => acc + r.value, 0);
  const exp = journey.expenses.reduce((acc, e) => acc + e.value, 0);
  const net = gross - exp;

  return (
    <div className="fixed bottom-32 right-6 z-[999] animate-in fade-in zoom-in duration-500">
      <button 
        onClick={onExpand}
        className="bg-black/90 border-2 border-cyan-500/50 text-white p-5 rounded-[24px] shadow-[0_20px_40px_-10px_rgba(6,182,212,0.4)] flex flex-col items-center gap-2 active:scale-90 transition-all group backdrop-blur-xl"
      >
        <div className="flex flex-col items-center">
          <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">LUCRO</span>
          <div className="flex items-center gap-1 font-black text-sm mono italic text-cyan-500">
            <span className="text-[9px]">R$</span>
            {net.toFixed(0)}
          </div>
        </div>
        <div className="w-6 h-[1px] bg-white/10 group-hover:bg-cyan-500/50 transition-colors"></div>
        <Maximize2 size={16} className="text-zinc-500 group-hover:text-white transition-colors" />
      </button>
    </div>
  );
};

export default FloatingWidget;
