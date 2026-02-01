
import React, { useState, useEffect, useCallback } from 'react';
import { X, Radar as RadarIcon, Navigation, MapPin, ShieldAlert, Sparkles, Search, Key, AlertCircle, ExternalLink, Globe, ChevronRight } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface RadarProProps {
  onClose: () => void;
}

const BRAZIL_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const RadarPro: React.FC<RadarProProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'MAPS' | 'EVENTS'>('EVENTS');
  const [results, setResults] = useState<any[]>([]);
  const [eventAdvice, setEventAdvice] = useState<string>("");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [manualState, setManualState] = useState<string | null>(null);
  const [showStateSelector, setShowStateSelector] = useState(false);
  const [needsKey, setNeedsKey] = useState(false);

  const checkAndRequestKey = async () => {
    try {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        setNeedsKey(true);
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleOpenKeyDialog = async () => {
    await (window as any).aistudio.openSelectKey();
    setNeedsKey(false);
    fetchIntel();
  };

  const startRadarScanner = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("HARDWARE GPS AUSENTE");
      setShowStateSelector(true);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setManualState(null);
      },
      (err) => {
        console.warn("Erro GPS:", err);
        setError("SINAL GPS BLOQUEADO OU FRACO");
        setShowStateSelector(true);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  const fetchIntel = useCallback(async () => {
    if (!location && !manualState) return;
    setLoading(true);
    setError(null);
    
    if (mode === 'EVENTS') {
        const hasKey = await checkAndRequestKey();
        if (!hasKey) {
            setLoading(false);
            return;
        }
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const regionQuery = manualState ? `Estado: ${manualState}, Brasil` : `Coordenadas [${location?.lat}, ${location?.lng}]`;

      if (mode === 'MAPS') {
        const res = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Atue como radar logístico. Região: ${regionQuery}. Liste postos GNV, pontos de apoio e áreas seguras para motoristas nesta localidade.`,
          config: {
            tools: [{ googleMaps: {} }],
            toolConfig: location ? { retrievalConfig: { latLng: { latitude: location.lat, longitude: location.lng } } } : undefined
          }
        });
        setResults(res.candidates?.[0]?.groundingMetadata?.groundingChunks || []);
      } else {
        const res = await ai.models.generateContent({
          model: 'gemini-3-pro-image-preview',
          contents: `VARREDURA DE EVENTOS: ${regionQuery}. 
          Liste TODOS os grandes eventos (shows, futebol, congressos) que acontecem HOJE e AMANHÃ especificamente nesta região. 
          Forneça o nome do evento, local exato e horário se disponível. 
          Dê uma recomendação tática de onde se posicionar para faturar mais.`,
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
        setError("FALHA NA VARREDURA DE DADOS");
      }
    } finally {
      setLoading(false);
    }
  }, [location, manualState, mode]);

  useEffect(() => {
    startRadarScanner();
  }, [startRadarScanner]);

  useEffect(() => {
    if (location || manualState) fetchIntel();
  }, [location, manualState, mode, fetchIntel]);

  if (needsKey) {
    return (
      <div className="fixed inset-0 z-[3000] bg-black flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 border border-cyan-500/20 mb-8 shadow-2xl">
          <Key size={40} className="animate-bounce" />
        </div>
        <h2 className="text-white font-black text-2xl uppercase italic tracking-tighter mb-4">CHAVE DE RADAR</h2>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed mb-8 max-w-xs">
          O modo de eventos em tempo real requer vinculação de uma chave de API paga do Google Cloud.
        </p>
        <div className="w-full space-y-4">
          <button onClick={handleOpenKeyDialog} className="w-full bg-cyan-500 text-black py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl active:scale-95 transition-all">VINCULAR MINHA CHAVE</button>
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest py-4">FALTA SALDO? CHECAR DOCS <ExternalLink size={12} /></a>
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
                <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest mt-1 block">
                  {manualState ? `ESTADO: ${manualState}` : (location ? "GPS ATIVO" : "AGUARDANDO SINAL")}
                </span>
             </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-500"><X size={20}/></button>
        </div>

        <div className="flex p-1 bg-zinc-900/50 rounded-2xl border border-zinc-800">
           <button onClick={() => setMode('EVENTS')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${mode === 'EVENTS' ? 'bg-cyan-500 text-black' : 'text-zinc-600'}`}>DEMANDA (IA)</button>
           <button onClick={() => setMode('MAPS')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${mode === 'MAPS' ? 'bg-cyan-500 text-black' : 'text-zinc-600'}`}>MAPAS (GPS)</button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar pb-32">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-4 py-20">
             <div className="w-16 h-16 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin"></div>
             <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">INTERCEPTANDO DADOS...</span>
          </div>
        ) : error && !showStateSelector ? (
          <div className="bg-red-500/10 p-6 rounded-[28px] border border-red-500/20 text-center space-y-4">
             <AlertCircle className="mx-auto text-red-500" size={32} />
             <p className="text-[10px] text-white font-black uppercase">{error}</p>
             <button onClick={() => setShowStateSelector(true)} className="w-full py-4 bg-zinc-900 text-cyan-500 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-cyan-500/20">SELECIONAR ESTADO MANUALMENTE</button>
          </div>
        ) : showStateSelector ? (
          <div className="space-y-4 animate-in fade-in">
             <div className="flex items-center gap-2 mb-4">
                <Globe size={16} className="text-cyan-500" />
                <h3 className="text-white font-black text-[10px] uppercase tracking-widest italic">SELECIONE SEU ESTADO</h3>
             </div>
             <div className="grid grid-cols-4 gap-2">
                {BRAZIL_STATES.map(st => (
                  <button 
                    key={st}
                    onClick={() => { setManualState(st); setLocation(null); setShowStateSelector(false); setError(null); }}
                    className={`py-4 rounded-xl text-[10px] font-black border transition-all ${manualState === st ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-zinc-900 text-zinc-500 border-zinc-800 active:bg-zinc-800'}`}
                  >
                    {st}
                  </button>
                ))}
             </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in">
             {mode === 'EVENTS' && (
                <div className="bg-cyan-500/5 p-6 rounded-[32px] border border-cyan-500/20">
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-cyan-500" />
                        <span className="text-[8px] font-black text-white uppercase tracking-widest">RELATÓRIO DE INTELIGÊNCIA</span>
                      </div>
                      <button onClick={() => setShowStateSelector(true)} className="text-[7px] text-cyan-500 underline font-black uppercase">ALTERAR ESTADO</button>
                   </div>
                   <div className="text-white text-[11px] font-medium italic leading-relaxed whitespace-pre-wrap">
                      {eventAdvice || "Nenhum dado capturado ainda. Tente atualizar."}
                   </div>
                </div>
             )}
             
             <div className="space-y-3">
                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-4">FONTES Grounding</span>
                {results.length > 0 ? results.map((c, i) => (
                    <div key={i} className="bg-zinc-900/30 p-5 rounded-[28px] border border-zinc-800 flex items-center justify-between group active:bg-zinc-800 transition-all">
                      <div className="flex flex-col">
                          <span className="text-white text-[11px] font-black uppercase italic truncate max-w-[180px]">{c.maps?.title || c.web?.title || 'FONTE EXTERNA'}</span>
                          <span className="text-[7px] text-zinc-500 font-bold uppercase mt-1 tracking-widest">LINK DE REFERÊNCIA</span>
                      </div>
                      <a href={c.maps?.uri || c.web?.uri} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-cyan-500 border border-cyan-500/20 shadow-lg active:scale-90 transition-all">
                          <ChevronRight size={20}/>
                      </a>
                    </div>
                )) : (
                  <div className="text-center py-10 opacity-20 bg-zinc-900/10 rounded-[28px] border border-dashed border-zinc-800">
                    <MapPin size={24} className="mx-auto mb-2 text-zinc-500" />
                    <p className="text-[8px] font-black uppercase tracking-widest">Sem links diretos detectados</p>
                  </div>
                )}
             </div>
          </div>
        )}
      </div>

      <div className="p-8 border-t border-zinc-900 bg-black/90 shrink-0 flex gap-4">
         <button onClick={startRadarScanner} className="w-16 h-16 rounded-2xl bg-zinc-900 text-cyan-500 flex items-center justify-center border border-cyan-500/10 active:scale-90 transition-all"><Globe size={20}/></button>
         <button onClick={onClose} className="flex-1 bg-zinc-900 text-zinc-500 py-6 rounded-3xl font-black text-[10px] uppercase tracking-[0.4em] active:bg-zinc-800 transition-all">FECHAR HUD</button>
      </div>
    </div>
  );
};

export default RadarPro;
