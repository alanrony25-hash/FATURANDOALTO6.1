
import React, { useState, useEffect } from 'react';
import { X, Radar as RadarIcon, Navigation, MapPin, ShieldAlert, Sparkles, Search } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface RadarProProps {
  onClose: () => void;
}

const RadarPro: React.FC<RadarProProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'MAPS' | 'EVENTS'>('MAPS');
  const [results, setResults] = useState<any[]>([]);
  const [eventAdvice, setEventAdvice] = useState<string>("");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocation({ lat: -23.5505, lng: -46.6333 })
    );
  }, []);

  const fetchData = async () => {
    if (!location) return;
    setLoading(true);
    // Initializing Gemini API client with named parameter apiKey as per @google/genai guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      if (mode === 'MAPS') {
        const response = await ai.models.generateContent({
          // Maps grounding is only supported in Gemini 2.5 series models.
          model: 'gemini-2.5-flash',
          contents: "Postos com GNV e combustíveis baratos próximos a mim agora.",
          config: {
            tools: [{ googleMaps: {} }],
            toolConfig: { retrievalConfig: { latLng: { latitude: location.lat, longitude: location.lng } } }
          }
        });
        setResults(response.candidates?.[0]?.groundingMetadata?.groundingChunks || []);
      } else {
        const response = await ai.models.generateContent({
          // Complex reasoning and grounding tasks use gemini-3-pro-preview
          model: 'gemini-3-pro-preview',
          contents: "Quais shows, jogos de futebol ou grandes eventos estão acontecendo HOJE nesta cidade? Liste locais e horários para motorista de Uber.",
          config: { tools: [{ googleSearch: {} }] }
        });
        setEventAdvice(response.text || "");
        setResults(response.candidates?.[0]?.groundingMetadata?.groundingChunks || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [location, mode]);

  return (
    <div className="fixed inset-0 z-[1000] bg-black/98 backdrop-blur-3xl flex flex-col animate-in slide-in-from-bottom duration-500">
      <header className="p-8 pb-4 flex flex-col gap-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
              <RadarIcon size={20} />
            </div>
            <h2 className="text-white font-black text-sm uppercase italic tracking-widest">Radar de Inteligência</h2>
          </div>
          <button onClick={onClose} className="p-3 glass rounded-xl text-zinc-500"><X size={20}/></button>
        </div>

        <div className="flex p-1 glass rounded-2xl">
          <button 
            onClick={() => setMode('MAPS')}
            className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${mode === 'MAPS' ? 'bg-cyan-500 text-black' : 'text-zinc-500'}`}
          >
            Logística (Postos)
          </button>
          <button 
            onClick={() => setMode('EVENTS')}
            className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${mode === 'EVENTS' ? 'bg-cyan-500 text-black' : 'text-zinc-500'}`}
          >
            Eventos (Demanda)
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 border-2 border-cyan-500/20 rounded-full border-t-cyan-500 animate-spin"></div>
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Sincronizando Satélites...</span>
          </div>
        ) : mode === 'EVENTS' ? (
          <div className="space-y-6">
            <div className="glass p-6 rounded-[32px] border-cyan-500/20 bg-cyan-500/5">
               <div className="flex items-center gap-2 mb-4 text-cyan-400">
                 <Sparkles size={16} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Estratégia do Dia</span>
               </div>
               <p className="text-zinc-300 text-sm font-medium italic leading-relaxed">{eventAdvice}</p>
            </div>
            <div className="space-y-3">
              <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-2">Fontes de Grounding</h4>
              {results.map((c, i) => (
                <div key={i} className="glass p-4 rounded-2xl flex items-center justify-between border-white/5">
                  <span className="text-white text-[9px] font-black truncate max-w-[200px] uppercase italic">{c.web?.title || 'Relatório Web'}</span>
                  <a href={c.web?.uri} target="_blank" className="p-2 bg-zinc-900 rounded-lg text-cyan-500"><Search size={12}/></a>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {results.length > 0 ? results.map((chunk: any, i: number) => (
              <div key={i} className="glass p-5 rounded-[28px] border-white/5 flex justify-between items-center group active:scale-[0.98] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-cyan-500 border border-white/5">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h4 className="text-white text-xs font-black uppercase italic">{chunk.maps?.title || 'Local Estratégico'}</h4>
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Via Google Maps</span>
                  </div>
                </div>
                <a href={chunk.maps?.uri} target="_blank" className="p-3 bg-cyan-500 rounded-xl text-black"><Navigation size={16} /></a>
              </div>
            )) : (
              <div className="text-center py-20">
                <ShieldAlert size={48} className="text-zinc-900 mx-auto mb-4" />
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]">Sem sinal na área</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-8 border-t border-white/5">
        <button onClick={onClose} className="w-full py-6 rounded-3xl bg-zinc-900 text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px]">
          RETORNAR AO FATURANDOALTO
        </button>
      </div>
    </div>
  );
};

export default RadarPro;
