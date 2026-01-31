
import React, { useState, useEffect } from 'react';
import { Share, MoreVertical, Download, Smartphone, Apple, Chrome, X, ShieldCheck, Zap } from 'lucide-react';

const InstallOverlay: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile && !isStandalone) {
      setIsVisible(true);
      setIsIOS(/iPhone|iPad|iPod/i.test(navigator.userAgent));
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/98 backdrop-blur-2xl flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-500">
      <div className="w-full max-w-sm ui-card border-[var(--cyan-accent)]/30 p-8 space-y-8 relative overflow-hidden bg-zinc-950">
        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--cyan-accent)]/20 overflow-hidden">
          <div className="h-full bg-[var(--cyan-accent)] animate-[loading_2s_linear_infinite] w-1/2 shadow-[0_0_15px_#22d3ee]"></div>
        </div>

        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-zinc-500"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center space-y-5">
          <div className="relative">
             <div className="absolute inset-0 bg-[var(--cyan-accent)] blur-2xl opacity-20 animate-pulse"></div>
             <div className="w-20 h-20 rounded-[28px] bg-black border-2 border-[var(--cyan-accent)] flex items-center justify-center text-[var(--cyan-accent)] shadow-[0_0_30px_rgba(34,211,238,0.3)] relative z-10">
                <img src="https://cdn-icons-png.flaticon.com/512/11554/11554754.png" className="w-12 h-12" alt="FA Pro Icon" />
             </div>
          </div>
          <div>
            <h2 className="text-white font-black text-2xl uppercase italic tracking-tighter leading-none">
              INSTALAR <span className="text-[var(--cyan-accent)] text-lg block mt-1">PROTOCOLO FA PRO</span>
            </h2>
            <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em] mt-3 italic">
              Fixar Cockpit na Tela de Início
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-black/50 border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              {isIOS ? (
                <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white"><Apple size={16} /></div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white"><Chrome size={16} /></div>
              )}
              <span className="text-white text-[10px] font-black uppercase tracking-widest">Procedimento de Ativação</span>
            </div>
            
            <div className="space-y-3 text-[9px] font-bold text-zinc-500 leading-relaxed uppercase">
              {isIOS ? (
                <>
                  <p className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-zinc-900 flex items-center justify-center text-[8px] text-white">1</div> Toque no ícone de <Share size={12} className="text-[var(--cyan-accent)] inline" /> Compartilhar</p>
                  <p className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-zinc-900 flex items-center justify-center text-[8px] text-white">2</div> Role e selecione <span className="text-white">"Adicionar à Tela de Início"</span></p>
                  <p className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-zinc-900 flex items-center justify-center text-[8px] text-white">3</div> Confirme em <span className="text-[var(--cyan-accent)] font-black">"Adicionar"</span></p>
                </>
              ) : (
                <>
                  <p className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-zinc-900 flex items-center justify-center text-[8px] text-white">1</div> Toque nos <MoreVertical size={12} className="text-[var(--cyan-accent)] inline" /> 3 pontos do menu</p>
                  <p className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-zinc-900 flex items-center justify-center text-[8px] text-white">2</div> Selecione <span className="text-white">"Instalar Aplicativo"</span></p>
                  <p className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-zinc-900 flex items-center justify-center text-[8px] text-white">3</div> Pressione <span className="text-[var(--cyan-accent)] font-black">"Instalar"</span> no popup</p>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 bg-[var(--cyan-accent)]/5 rounded-xl border border-[var(--cyan-accent)]/10">
            <ShieldCheck size={14} className="text-[var(--cyan-accent)]" />
            <span className="text-[8px] text-[var(--cyan-accent)] font-black uppercase tracking-widest">Sincronização Segura v16.1</span>
          </div>
        </div>

        <button 
          onClick={() => setIsVisible(false)}
          className="w-full text-zinc-700 py-3 rounded-xl font-black uppercase text-[9px] tracking-[0.3em] active:text-zinc-500 transition-all"
        >
          IGNORAR POR ENQUANTO
        </button>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default InstallOverlay;
