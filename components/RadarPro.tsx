
import React, { useState, useEffect, useCallback } from 'react';
import { X, Radar as RadarIcon, Navigation, MapPin, ShieldAlert, Sparkles, Search, Key, AlertCircle, ExternalLink } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface RadarProProps {
  onClose: () => void;
}

const RadarPro: React.FC<RadarProProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'MAPS' | 'EVENTS'>('MAPS');
  const [results, setResults] = useState<any[]>([]);
  const [eventAdvice, setEventAdvice] = useState<string>("");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [needsKey, setNeedsKey] = useState(false);

  // Requisito obrigatório para modelos Pro e Veo: Seleção de Chave
  const checkAndRequestKey = async () => {
    try {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        setNeedsKey(true);
        return false;
      }
      return true;
    } catch (e) {
      console.error("Erro ao verificar chave:", e);
      return false;
    }
  };

  const handleOpenKeyDialog = async () => {
    await (window as any).aistudio.openSelectKey();
    setNeedsKey(false);
    startRadarScanner(); // Tenta novamente após o diálogo
  };

  const startRadarScanner = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Verificação de Segurança HTTPS
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      setError("ERRO: GPS REQUER CONEXÃO SEGURA (HTTPS)");
      setLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setError("HARDWARE GPS NÃO DETECTADO");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        console.warn("GPS Mobile falhou, usando posição aproximada...", err);
        // Fallback para SP caso o usuário negue, mas avisando
        setLocation({ lat: -23.55, lng: -46.63 });
        setError("SINAL GPS NEGADO OU FRACO. USANDO CAPITAL.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }, []);

  const fetchIntel = useCallback(async () => {
    if (!location) return;
    setLoading(true);
    
    // Verifica se temos chave para o modo de busca Pro
    if (mode === 'EVENTS') {
        const hasKey = await checkAndRequestKey();
        if (!hasKey) {
            setLoading(false);
            return;
        }
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      if (mode === 'MAPS') {
        const res = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Localização [${location.lat}, ${location.lng}]. Liste postos GNV e áreas de descanso para motoristas nesta região brasileira.`,
          config: {
            tools: [{ googleMaps: {} }],
            toolConfig: { retrievalConfig: { latLng: { latitude: location.lat, longitude: location.lng } } }
          }
        });
        setResults(res.candidates?.[0]?.groundingMetadata?.groundingChunks || []);
      } else {
        // Upgrade para Gemini 3 Pro para Google Search conforme diretrizes
        const res = await ai.models.generateContent({
          model: 'gemini-3-pro-image-preview',
          contents: `Eventos, jogos e shows HOJE nas coordenadas [${location.lat}, ${location.lng}]. Filtre apenas pelo estado local.`,
          config: { tools: [{ googleSearch: {} }] }
        });
        setEventAdvice(res.text || "");
        setResults(res.candidates?.[0]?.groundingMetadata?.groundingChunks || []);
      }
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes("not found") || e.message?.includes("404")) {
        setNeedsKey(true);
      } else {
        setError("FALHA NA CONEXÃO COM O SATÉLITE");
      }
    } finally {
      setLoading(false);
    }
  }, [location, mode]);

  useEffect(() => {
    startRadarScanner();
  }, [startRadarScanner]);

  useEffect(() => {
    if (location) fetchIntel();
  }, [location, mode, fetchIntel]);

  if (needsKey) {
    return (
      <div className="fixed inset-0 z-[3000] bg-black flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 border border-cyan-500/20 mb-8 shadow-2xl">
          <Key size={40} className="animate-bounce" />
        </div>
        <h2 className="text-white font-black text-2xl uppercase italic tracking-tighter mb-4">ATIVAÇÃO NECESSÁRIA</h2>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed mb-8 max-w-xs">
          O Radar Pro utiliza inteligência em tempo real. Para continuar, você deve vincular uma chave de API de um projeto com faturamento ativo.
        </p>
        
        <div className="w-full space-y-4">
          <button 
            onClick={handleOpenKeyDialog}
            className="w-full bg-cyan-500 text-black py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl active:scale-95 transition-all"
          >
            VINCULAR MINHA CHAVE
          </button>
          
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest py-4"
          >
            DOCUMENTAÇÃO DE FATURAMENTO <ExternalLink size={12} />
          </a>
        </div>
        
        <button onClick={onClose} className="mt-8 text-zinc-800 text-[10px] font-black uppercase underline">CANCELAR</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[2000] bg-black flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
      <header className="p-8 pb-4 border-b border-zinc-900 bg-black/80 backdrop-blur-xl shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 border border-cyan-500/20 shadow-lg">
                <RadarIcon size={20} className="animate-pulse" />
             </div>
             <div>
                <h2 className="text-white font-black text-sm uppercase italic tracking-tighter leading-none">RADAR <span className="text-cyan-500">PRO</span></h2>
                <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest mt-1 block">INTELIGÊNCIA EM TEMPO REAL</span>
             </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-500"><X size={20}/></button>
        </div>

        <div className="flex p-1 bg-zinc-900/50 rounded-2xl border border-zinc-800">
           <button onClick={() => setMode('MAPS')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${mode === 'MAPS' ? 'bg-cyan-500 text-black' : 'text-zinc-600'}`}>MAPAS</button>
           <button onClick={() => setMode('EVENTS')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${mode === 'EVENTS' ? 'bg-cyan-500 text-black' : 'text-zinc-600'}`}>EVENTOS</button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar pb-32">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-4 py-20">
             <div className="w-16 h-16 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin"></div>
             <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">VARRENDO ÁREA...</span>
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
             <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20"><AlertCircle size={32}/></div>
             <div className="space-y-2">
                <h4 className="text-white font-black text-base uppercase italic">SINAL INTERROMPIDO</h4>
                <p className="text-zinc-600 text-[9px] font-bold uppercase max-w-xs mx-auto leading-relaxed">{error}</p>
             </div>
             <button onClick={startRadarScanner} className="w-full py-5 bg-zinc-900 text-cyan-500 rounded-3xl font-black text-[10px] uppercase tracking-widest border border-cyan-500/20">RECONECTAR GPS</button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in">
             {mode === 'EVENTS' && eventAdvice && (
                <div className="bg-cyan-500/5 p-6 rounded-[32px] border border-cyan-500/20 mb-6">
                   <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={14} className="text-cyan-500" />
                      <span className="text-[8px] font-black text-white uppercase tracking-widest">INTELIGÊNCIA LOCAL</span>
                   </div>
                   <p className="text-white text-xs font-medium italic leading-relaxed">{eventAdvice}</p>
                </div>
             )}
             
             {results.map((c, i) => (
                <div key={i} className="bg-zinc-900/30 p-5 rounded-[28px] border border-zinc-800 flex items-center justify-between group active:bg-zinc-800 transition-all">
                   <div className="flex flex-col">
                      <span className="text-white text-[11px] font-black uppercase italic truncate max-w-[180px]">{c.maps?.title || c.web?.title || 'RELATÓRIO'}</span>
                      <span className="text-[7px] text-zinc-500 font-bold uppercase mt-1 tracking-widest">LOCALIZAÇÃO DETECTADA</span>
                   </div>
                   <a href={c.maps?.uri || c.web?.uri} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-cyan-500 rounded-2xl flex items-center justify-center text-black shadow-lg shadow-cyan-500/20 active:scale-90 transition-all">
                      {mode === 'MAPS' ? <Navigation size={20}/> : <Search size={20}/>}
                   </a>
                </div>
             ))}
          </div>
        )}
      </div>

      <div className="p-8 border-t border-zinc-900 bg-black/90 shrink-0">
         <button onClick={onClose} className="w-full bg-zinc-900 text-zinc-500 py-6 rounded-3xl font-black text-[10px] uppercase tracking-[0.4em] active:bg-zinc-800 transition-all">DESLIGAR RADAR</button>
      </div>
    </div>
  );
};

export default RadarPro;
