
import React, { useState, useEffect } from 'react';
import { Share, MoreVertical, Download, Smartphone, Apple, Chrome, X, ShieldCheck, Zap } from 'lucide-react';

const InstallOverlay: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Verifica se já está instalado (standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    // Verifica se é mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile && !isStandalone) {
      setIsVisible(true);
      setIsIOS(/iPhone|iPad|iPod/i.test(navigator.userAgent));
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-end p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-sm glass rounded-[40px] border-cyan-500/30 p-8 space-y-8 relative overflow-hidden mb-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/20">
          <div className="h-full bg-cyan-500 animate-[loading_3s_linear_infinite] w-1/3"></div>
        </div>

        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-500"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-[30px] bg-cyan-500 flex items-center justify-center text-black shadow-[0_0_30px_rgba(6,182,212,0.4)]">
            <Download size={40} />
          </div>
          <div>
            <h2 className="text-white font-black text-2xl uppercase italic tracking-tighter leading-none">
              INSTALAR <span className="text-cyan-500">PRO 6.0</span>
            </h2>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">
              Ative a Interface de Piloto no Celular
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-white/5 border border-white/5 space-y-3">
            <div className="flex items-center gap-3">
              {isIOS ? (
                <div className="p-2 rounded-xl bg-zinc-900 text-white"><Apple size={18} /></div>
              ) : (
                <div className="p-2 rounded-xl bg-zinc-900 text-white"><Chrome size={18} /></div>
              )}
              <span className="text-white text-[11px] font-black uppercase italic">Instruções de Ativação</span>
            </div>
            
            <div className="space-y-3 text-[10px] font-bold text-zinc-400 leading-relaxed uppercase">
              {isIOS ? (
                <>
                  <p className="flex items-center gap-2">1. Toque no ícone <Share size={14} className="text-cyan-500" /> na barra inferior</p>
                  <p className="flex items-center gap-2">2. Role para baixo e selecione <span className="text-white">"Adicionar à Tela de Início"</span></p>
                  <p className="flex items-center gap-2">3. Toque em <span className="text-cyan-500">"Adicionar"</span> no topo da tela</p>
                </>
              ) : (
                <>
                  <p className="flex items-center gap-2">1. Toque nos <MoreVertical size={14} className="text-cyan-500" /> 3 pontos do Chrome</p>
                  <p className="flex items-center gap-2">2. Selecione a opção <span className="text-white">"Instalar Aplicativo"</span></p>
                  <p className="flex items-center gap-2">3. Confirme em <span className="text-cyan-500">"Instalar"</span></p>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
            <ShieldCheck size={16} className="text-cyan-500" />
            <span className="text-[9px] text-cyan-500 font-black uppercase">Segurança Criptografada Ativa</span>
          </div>
        </div>

        <button 
          onClick={() => setIsVisible(false)}
          className="w-full bg-zinc-900 text-zinc-500 py-6 rounded-3xl font-black uppercase text-[10px] tracking-[0.3em] active:scale-95 transition-all"
        >
          MAIS TARDE
        </button>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

export default InstallOverlay;
