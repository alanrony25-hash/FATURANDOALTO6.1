
import React from 'react';
import { Shield } from 'lucide-react';

const Splash: React.FC = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-black p-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 blur-[100px] animate-pulse"></div>
      
      <div className="relative group">
        <div className="absolute inset-0 bg-cyan-500 blur-2xl opacity-20 animate-pulse"></div>
        <div className="w-24 h-24 rounded-[32px] glass flex items-center justify-center text-cyan-500 relative z-10 border border-cyan-500/30">
          <Shield size={48} />
        </div>
      </div>
      
      <div className="mt-8 text-center relative z-10">
        <h1 className="text-3xl font-black text-white tracking-tighter italic">
          FATURANDO<span className="text-cyan-500">ALTO</span>PRO
        </h1>
        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Versão 12.0 • Sistema Operacional</p>
      </div>
      
      <div className="absolute bottom-24 w-48 h-[2px] bg-zinc-900 rounded-full overflow-hidden">
        <div className="h-full bg-cyan-500 animate-[loading_2s_ease-in-out_infinite] shadow-[0_0_10px_#06b6d4]"></div>
      </div>

      <style>{`
        @keyframes loading {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 60%; margin-left: 20%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Splash;
