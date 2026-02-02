
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  
  const lastSearchRef = useRef<string>("");

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

  const fetchIntel = useCallback(async (forcedState?: string) => {
    const currentState = forcedState || manualState;
    if (!location && !currentState) return;
    
    const searchId = `${mode}-${currentState || location?.lat}-${location?.lng}`;
    if (searchId === lastSearchRef.current && !forcedState) return;
    lastSearchRef.current = searchId;

    setLoading(true);
    setError(null);
    setResults([]);
    setEventAdvice("");
    
    if (mode === 'EVENTS') {
        const hasKey = await checkAndRequestKey();
        if (!hasKey) {
            setLoading(false);
            return;
        }
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const regionQuery = currentState ? `Estado de ${currentState}, Brasil` : `Coordenadas [${location?.lat}, ${location?.lng}]`;

      if (mode === 'MAPS') {
        const res = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `VARREDURA LOGÍSTICA: Região: ${regionQuery}. Liste postos GNV ativos, áreas de repouso 24h e pontos de apoio seguros para motoristas de app. Retorne o máximo de detalhes possível.`,
          config: {
            tools: [{ googleMaps: {} }],
            toolConfig: location ? { retrievalConfig: { latLng: { latitude: location.lat, longitude: location.lng } } } : undefined
          }
        });
        setResults(res.candidates?.[0]?.groundingMetadata?.groundingChunks || []);
      } else {
        const res = await ai.models.generateContent({
          model: 'gemini-3-pro-image-preview',
          contents: `INTELIGÊNCIA DE DEMANDA: ${regionQuery}. 
          Liste TODOS os grandes eventos (shows, jogos, convenções, festas regionais) que ocorrem HOJE e AMANHÃ. 
          Inclua: Nome do Evento, Local Exato e Horário Estimado.
          Finalize com uma 'Diretriz Tática' de 1 frase para o motorista faturar mais.`,
          config: { tools: [{ googleSearch: {} }] }
        });
        setEventAdvice(res.text || "Nenhuma demanda atípica detectada no radar para este período.");
        setResults(res.candidates?.[0]?.groundingMetadata?.groundingChunks || []);
      }
    } catch (e: any) {
      console.error("Erro no Radar:", e);
      if (e.message?.includes("not found") || e.message?.includes("404") || e.message?.includes("API key")) {
        setNeedsKey(true);
      } else {
        setError("SINAL DE SATÉLITE INSTÁVEL. TENTE NOVAMENTE.");
      }
    } finally {
      setLoading(false);
    }
  }, [location, manualState, mode]);

  const startRadarScanner = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("GPS NÃO SUPORTADO");
      setShowStateSelector(true);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setManualState(null);
        setShowStateSelector(false);
      },
      (err) => {
        setError("SINAL GPS BLOQUEADO");
        setShowStateSelector(true);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  const handleOpenKeyDialog = async () => {
    await (window as any).aistudio.openSelectKey();
    setNeedsKey(false);
    setTimeout(() => fetchIntel(), 500); 
  };

  const handleStateSelect = (st: string) => {
    setManualState(st);
    setLocation(null);
    setShowStateSelector(false);
    setError(null);
    fetchIntel(st);
  };

  useEffect(() => {
    startRadarScanner();
  }, [startRadarScanner]);

  useEffect(() => {
    if ((location || manualState) && !loading && !showStateSelector) {
        fetchIntel();
    }
  }, [mode]);

  if (needsKey) {
    return (
      <div className="fixed inset-0 z-[3000] bg-[#020617] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
        <div className="w-24 h-24 rounded-[32px] bg-violet-500/10 flex items-center justify-center text-violet-500 border border-violet-500/20 mb-10 shadow-2xl">
          <Key size={48} className="animate-bounce" />
        </div>
        <h2 className="text-white font-black text-3xl uppercase italic tracking-tighter mb-5">Vínculo de Radar</h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed mb-10 max-w-xs">
          A varredura de eventos táticos requer uma chave de API autenticada no Google AI Studio.
        </p>
        <div className="w-full space-y-5">
          <button onClick={handleOpenKeyDialog} className="w-full bg-violet-500 text-black py-7 rounded-[32px] font-black uppercase tracking-[0.4em] text-[11px] shadow-xl active:scale-95 transition-all">AUTENTICAR CHAVE</button>
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest py-4 italic">DOCUMENTAÇÃO DO CORE <ExternalLink size={12} /></a>
        </div>
        <button onClick={onClose} className="mt-10 text-slate-800 text-[10px] font-black uppercase underline tracking-[0.3em]">VOLTAR AO COCKPIT</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[2000] bg-[#020617] flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
      <header className="p-8 pb-4 border-b border-slate-900 bg-[#020617]/80 backdrop-blur-xl shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-500 border border-violet-500/20 shadow-lg">
                <RadarIcon size={24} className={loading ? "animate-spin" : "animate-pulse"} />
             </div>
             <div>
                <h2 className="text-white font-black text-lg uppercase italic tracking-tighter leading-none">RADAR <span className="text-violet-500">PRO</span></h2>
                <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest mt-2 block font-bold">
                  {manualState ? `ESTADO: ${manualState}` : (location ? "GPS: ONLINE" : "WARMING UP...")}
                </span>
             </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-500 active:scale-90 transition-all border border-white/5"><X size={24}/></button>
        </div>

        <div className="flex p-1.5 bg-slate-950 rounded-2xl border border-slate-900">
           <button onClick={() => setMode('EVENTS')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest ${mode === 'EVENTS' ? 'bg-violet-500 text-black shadow-lg shadow-violet-500/20' : 'text-slate-600'}`}>TÁTICO (IA)</button>
           <button onClick={() => setMode('MAPS')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest ${mode === 'MAPS' ? 'bg-violet-500 text-black shadow-lg shadow-violet-500/20' : 'text-slate-600'}`}>MAPAS (GPS)</button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar pb-32">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-6 py-20">
             <div className="w-20 h-20 border-4 border-violet-500/10 border-t-violet-500 rounded-full animate-spin"></div>
             <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] italic animate-pulse">VARRENDO FREQUÊNCIAS...</span>
          </div>
        ) : error && !showStateSelector ? (
          <div className="bg-red-500/5 p-10 rounded-[40px] border border-red-500/10 text-center space-y-6 animate-in fade-in">
             <AlertCircle className="mx-auto text-red-500" size={40} />
             <p className="text-[11px] text-white font-black uppercase tracking-widest leading-relaxed">{error}</p>
             <button onClick={() => setShowStateSelector(true)} className="w-full py-5 bg-slate-900 text-violet-500 rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] border border-violet-500/20">MANUAL OVERDRIVE</button>
          </div>
        ) : showStateSelector ? (
          <div className="space-y-6 animate-in fade-in">
             <div className="flex items-center gap-3 mb-6">
                <Globe size={20} className="text-violet-500" />
                <h3 className="text-white font-black text-[12px] uppercase tracking-[0.3em] italic">GEOLOCALIZAÇÃO MANUAL</h3>
             </div>
             <div className="grid grid-cols-4 gap-3">
                {BRAZIL_STATES.map(st => (
                  <button 
                    key={st}
                    onClick={() => handleStateSelect(st)}
                    className={`py-5 rounded-2xl text-[11px] font-black border transition-all ${manualState === st ? 'bg-violet-500 text-black border-violet-500 shadow-xl' : 'bg-slate-900 text-slate-600 border-white/5 active:bg-slate-800'}`}
                  >
                    {st}
                  </button>
                ))}
             </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in">
             {mode === 'EVENTS' && (
                <div className="bg-violet-600/5 p-8 rounded-[40px] border border-violet-500/20 shadow-[inset_0_0_30px_rgba(139,92,246,0.05)]">
                   <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Sparkles size={18} className="text-violet-500" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic">BRAIN LOGIC</span>
                      </div>
                      <button onClick={() => setShowStateSelector(true)} className="text-[8px] text-violet-500 underline font-black uppercase tracking-widest">RESET ÁREA</button>
                   </div>
                   <div className="text-white text-[13px] font-medium italic leading-relaxed whitespace-pre-wrap font-serif">
                      {eventAdvice || "Inicie a varredura para interceptar eventos."}
                   </div>
                </div>
             )}
             
             <div className="space-y-4">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] ml-4">CANAL DE DADOS</span>
                {results.length > 0 ? results.map((c, i) => (
                    <div key={i} className="bg-slate-900/30 p-6 rounded-[32px] border border-white/5 flex items-center justify-between group active:bg-slate-800 transition-all">
                      <div className="flex flex-col">
                          <span className="text-white text-[12px] font-black uppercase italic truncate max-w-[200px] tracking-tight">{c.maps?.title || c.web?.title || 'RELATÓRIO EXT'}</span>
                          <span className="text-[8px] text-slate-500 font-bold uppercase mt-2 tracking-widest opacity-60">PONTO DE INTERESSE</span>
                      </div>
                      <a href={c.maps?.uri || c.web?.uri} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-violet-500 rounded-2xl flex items-center justify-center text-black shadow-lg shadow-violet-500/30 active:scale-90 transition-all">
                          <ChevronRight size={24}/>
                      </a>
                    </div>
                )) : !loading && (
                  <div className="text-center py-20 opacity-30 bg-slate-900/10 rounded-[40px] border border-dashed border-slate-800">
                    <MapPin size={32} className="mx-auto mb-4 text-slate-600" />
                    <p className="text-[9px] font-black uppercase tracking-[0.4em]">Sintonizando coordenadas...</p>
                  </div>
                )}
             </div>
          </div>
        )}
      </div>

      <div className="p-8 pb-14 border-t border-slate-900 bg-[#020617]/90 backdrop-blur-md shrink-0 flex gap-4">
         <button onClick={startRadarScanner} className="w-20 h-20 rounded-[32px] bg-slate-900 text-violet-500 flex items-center justify-center border border-violet-500/10 active:scale-90 transition-all shadow-inner"><Globe size={28}/></button>
         <button onClick={() => { setResults([]); setEventAdvice(""); fetchIntel(); }} className="flex-1 bg-violet-500 text-black py-7 rounded-[32px] font-black text-[12px] uppercase tracking-[0.5em] active:scale-95 transition-all shadow-xl shadow-violet-500/30">ATUALIZAR VARREDURA</button>
      </div>
    </div>
  );
};

export default RadarPro;
