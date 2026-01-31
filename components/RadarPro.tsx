
import React, { useState, useEffect } from 'react';
import { X, Radar as RadarIcon, Navigation, MapPin, ShieldAlert, Sparkles, Search, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface RadarProProps {
  onClose: () => void;
}

const RadarPro: React.FC<RadarProProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'MAPS' | 'EVENTS'>('MAPS');
  const [results, setResults] = useState<any[]>([]);
  const [eventAdvice, setEventAdvice] = useState<string>("");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
          console.error("Erro GPS:", err);
          setLocation({ lat: -23.5505, lng: -46.6333 }); // Fallback SP
          setError("Sinal de GPS fraco. Usando localização aproximada.");
      },
      { timeout: 10000 }
    );
  }, []);

  const fetchData = async () => {
    if (!location) return;
    setLoading(true);
    setError(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      if (mode === 'MAPS') {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: "Postos com GNV, postos com combustíveis baratos e áreas de descanso para motoristas de aplicativo próximas a mim agora.",
          config: {
            tools: [{ googleMaps: {} }],
            toolConfig: { retrievalConfig: { latLng: { latitude: location.lat, longitude: location.lng } } }
          }
        });
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        setResults(chunks);
        if (chunks.length === 0) setError("Nenhum posto encontrado nesta região.");
      } else {
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: "Quais shows, jogos de futebol, grandes festas ou eventos de alta demanda estão acontecendo HOJE e AMANHÃ em Fortaleza e Região Metropolitana? Liste locais, horários e dicas táticas para motoristas.",
          config: { tools: [{ googleSearch: {} }] }
        });
        setEventAdvice(response.text || "");
        setResults(response.candidates?.[0]?.groundingMetadata?.groundingChunks || []);
        if (!response.text) setError("Não consegui detectar eventos de grande porte hoje.");
      }
    } catch (e: any) {
      console.error("Radar Error:", e);
      setError("Falha na sincronização. Verifique sua conexão ou chave de acesso.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [location, mode]);

  return (
    <div className="fixed inset-0 z-[1000] bg-black/98 backdrop-blur-3xl flex flex-col animate-in slide-in-from-bottom duration-500">
      <header className="p-8 pb-4 flex flex-col gap-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 border border-cyan-500/20">
              <RadarIcon size={20} className="animate-pulse" />
            </div>
            <h2 className="text-white font-black text-sm uppercase italic tracking-widest leading-none">Radar de Inteligência</h2>
          </div>
          <button onClick={onClose} className="p-3 glass rounded-xl text-zinc-500 hover:text-white transition-colors"><X size={20}/></button>
        </div>

        <div className="flex p-1 glass rounded-2xl bg-zinc-950/50 border-white/5">
          <button 
            onClick={() => setMode('MAPS')}
            className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${mode === 'MAPS' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-zinc-600'}`}
          >
            Logística (Postos)
          </button>
          <button 
            onClick={() => setMode('EVENTS')}
            className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${mode === 'EVENTS' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-zinc-600'}`}
          >
            Demanda (Eventos)
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-6">
            <div className="relative">
               <div className="w-20 h-20 border-2 border-cyan-500/10 rounded-full animate-ping"></div>
               <div className="absolute inset-0 w-20 h-20 border-2 border-cyan-500/40 rounded-full border-t-cyan-500 animate-spin"></div>
            </div>
            <div className="text-center space-y-2">
                <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em] block">Escaneando Satélites...</span>
                <span className="text-[7px] font-black text-zinc-700 uppercase tracking-widest">Aguarde a telemetria do Google</span>
            </div>
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
            <ShieldAlert size={48} className="text-red-500/50" />
            <div className="space-y-2">
                <h4 className="text-white font-black text-sm uppercase italic">Alerta de Conexão</h4>
                <p className="text-zinc-600 text-[9px] font-bold uppercase leading-relaxed">{error}</p>
            </div>
            <button 
                onClick={fetchData}
                className="px-6 py-3 bg-zinc-900 border border-white/10 rounded-xl text-cyan-500 font-black text-[9px] uppercase flex items-center gap-2 active:scale-95"
            >
                <RefreshCw size={14} /> TENTAR NOVAMENTE
            </button>
          </div>
        ) : mode === 'EVENTS' ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="glass p-6 rounded-[32px] border-cyan-500/20 bg-cyan-500/5 relative overflow-hidden">
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/5 blur-3xl"></div>
               <div className="flex items-center gap-2 mb-4 text-cyan-400 relative z-10">
                 <Sparkles size={16} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Estratégia Operacional</span>
               </div>
               <p className="text-zinc-300 text-sm font-medium italic leading-relaxed relative z-10 whitespace-pre-wrap">{eventAdvice}</p>
            </div>
            <div className="space-y-3">
              <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-2">Fontes Verificadas</h4>
              {results.length > 0 ? results.map((c, i) => (
                <div key={i} className="glass p-4 rounded-2xl flex items-center justify-between border-white/5 active:bg-zinc-900 transition-all">
                  <div className="flex flex-col">
                      <span className="text-white text-[9px] font-black truncate max-w-[200px] uppercase italic leading-none">{c.web?.title || 'Relatório Digital'}</span>
                      <span className="text-[6px] text-zinc-600 font-black uppercase mt-1">Grounding Ativo</span>
                  </div>
                  <a href={c.web?.uri} target="_blank" className="p-2.5 bg-zinc-900 rounded-lg text-cyan-500 border border-white/10"><Search size={14}/></a>
                </div>
              )) : (
                <div className="text-center py-6 border border-dashed border-zinc-900 rounded-2xl">
                    <span className="text-[8px] font-black text-zinc-800 uppercase">Nenhuma fonte adicional vinculada</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-500">
            {results.length > 0 ? results.map((chunk: any, i: number) => (
              <div key={i} className="glass p-5 rounded-[28px] border-white/5 flex justify-between items-center group active:scale-[0.98] transition-all bg-zinc-900/10">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-cyan-500 border border-white/5 shadow-inner">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <h4 className="text-white text-xs font-black uppercase italic leading-tight">{chunk.maps?.title || 'Destino Tático'}</h4>
                    <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest block mt-0.5">VIA GOOGLE MAPS PRO</span>
                  </div>
                </div>
                <a href={chunk.maps?.uri} target="_blank" className="p-3.5 bg-cyan-500 rounded-xl text-black shadow-lg shadow-cyan-500/20 active:scale-90 transition-transform"><Navigation size={18} /></a>
              </div>
            )) : (
              <div className="text-center py-20 opacity-40">
                <ShieldAlert size={48} className="text-zinc-800 mx-auto mb-4" />
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]">Varredura sem resultados na área</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-8 border-t border-white/5 bg-black/50 backdrop-blur-xl">
        <button onClick={onClose} className="w-full py-6 rounded-3xl bg-zinc-900 text-zinc-600 font-black uppercase tracking-[0.3em] text-[10px] border border-white/5 active:bg-zinc-800 transition-colors">
          RETORNAR AO COCKPIT
        </button>
      </div>
    </div>
  );
};

export default RadarPro;
