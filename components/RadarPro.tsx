
import React, { useState, useEffect } from 'react';
import { X, Radar as RadarIcon, Navigation, MapPin, ShieldAlert, Sparkles, Search, RefreshCw, Star } from 'lucide-react';
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

  const requestLocation = () => {
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
          console.error("Erro GPS:", err);
          setLocation({ lat: -23.5505, lng: -46.6333 }); // Fallback SP
          setError("Sinal de GPS fraco. Usando localização aproximada para varredura.");
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  const fetchData = async () => {
    if (!location) return;
    setLoading(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      if (mode === 'MAPS') {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: "Encontre postos com GNV, postos de combustíveis com bons preços e áreas de descanso para motoristas de aplicativo nesta região.",
          config: {
            tools: [{ googleMaps: {} }],
            toolConfig: { retrievalConfig: { latLng: { latitude: location.lat, longitude: location.lng } } }
          }
        });
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        setResults(chunks);
        if (chunks.length === 0) setError("Nenhuma unidade logística detectada nesta coordenada.");
      } else {
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: "Quais grandes eventos (shows, futebol, festas) estão gerando alta demanda de passageiros HOJE e AMANHÃ em Fortaleza? Liste locais e dicas estratégicas.",
          config: { tools: [{ googleSearch: {} }] }
        });
        setEventAdvice(response.text || "");
        setResults(response.candidates?.[0]?.groundingMetadata?.groundingChunks || []);
      }
    } catch (e: any) {
      console.error("Radar Error:", e);
      setError("Falha na sincronização orbital. Verifique o sinal e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [location, mode]);

  return (
    <div className="fixed inset-0 z-[1000] bg-[var(--bg-primary)] flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
      <header className="p-8 pb-4 flex flex-col gap-6 border-b border-[var(--border-ui)] shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--cyan-accent)]/10 flex items-center justify-center text-[var(--cyan-accent)] border border-[var(--cyan-accent)]/20 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <RadarIcon size={20} className="animate-pulse" />
            </div>
            <h2 className="text-[var(--text-primary)] font-black text-sm uppercase italic tracking-widest leading-none">Radar de Inteligência</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 ui-card flex items-center justify-center text-[var(--text-secondary)]"><X size={20}/></button>
        </div>

        <div className="flex p-1 ui-card bg-[var(--bg-secondary)] border-[var(--border-ui)]">
          <button 
            onClick={() => setMode('MAPS')}
            className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${mode === 'MAPS' ? 'bg-[var(--cyan-accent)] text-black shadow-lg shadow-[var(--cyan-accent)]/20' : 'text-[var(--text-secondary)] opacity-50'}`}
          >
            Logística (Postos)
          </button>
          <button 
            onClick={() => setMode('EVENTS')}
            className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${mode === 'EVENTS' ? 'bg-[var(--cyan-accent)] text-black shadow-lg shadow-[var(--cyan-accent)]/20' : 'text-[var(--text-secondary)] opacity-50'}`}
          >
            Demanda (Eventos)
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-32">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-6 py-20">
            <div className="relative">
               <div className="w-20 h-20 border-2 border-[var(--cyan-accent)]/10 rounded-full animate-ping"></div>
               <div className="absolute inset-0 w-20 h-20 border-2 border-[var(--cyan-accent)]/40 rounded-full border-t-[var(--cyan-accent)] animate-spin"></div>
            </div>
            <div className="text-center space-y-2">
                <span className="text-[10px] font-black text-[var(--cyan-accent)] uppercase tracking-[0.4em] block">Escaneando Satélites...</span>
                <span className="text-[7px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-40 italic">Aguarde a telemetria Google Cloud</span>
            </div>
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6 py-10">
            <ShieldAlert size={48} className="text-[var(--red-accent)]/50" />
            <div className="space-y-2">
                <h4 className="text-[var(--text-primary)] font-black text-sm uppercase italic">Alerta de Conexão</h4>
                <p className="text-[var(--text-secondary)] text-[9px] font-bold uppercase leading-relaxed max-w-xs">{error}</p>
            </div>
            <button 
                onClick={requestLocation}
                className="w-full py-4 ui-card text-[var(--cyan-accent)] font-black text-[9px] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
                <RefreshCw size={14} /> REFRESH RADAR
            </button>
          </div>
        ) : mode === 'EVENTS' ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="ui-card p-6 rounded-[32px] border-[var(--cyan-accent)]/20 bg-[var(--cyan-accent)]/5 relative overflow-hidden">
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--cyan-accent)]/5 blur-3xl"></div>
               <div className="flex items-center gap-2 mb-4 text-[var(--cyan-accent)] relative z-10">
                 <Sparkles size={16} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Estratégia Operacional</span>
               </div>
               <p className="text-[var(--text-primary)] text-sm font-medium italic leading-relaxed relative z-10 whitespace-pre-wrap">{eventAdvice}</p>
            </div>
            <div className="space-y-3">
              <h4 className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-2">Fontes Verificadas</h4>
              {results.length > 0 ? results.map((c, i) => (
                <div key={i} className="ui-card p-4 flex items-center justify-between group active:bg-[var(--bg-secondary)] transition-all">
                  <div className="flex flex-col">
                      <span className="text-[var(--text-primary)] text-[9px] font-black truncate max-w-[200px] uppercase italic leading-none">{c.web?.title || 'Relatório Digital'}</span>
                      <span className="text-[6px] text-[var(--text-secondary)] font-black uppercase mt-1 opacity-40">Grounding Ativo</span>
                  </div>
                  <a href={c.web?.uri} target="_blank" className="p-2.5 bg-[var(--bg-secondary)] rounded-lg text-[var(--cyan-accent)] border border-[var(--border-ui)]"><Search size={14}/></a>
                </div>
              )) : (
                <div className="text-center py-6 border border-dashed border-[var(--border-ui)] rounded-2xl">
                    <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase opacity-30">Nenhuma fonte adicional vinculada</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-500">
            {results.length > 0 ? results.map((chunk: any, i: number) => (
              <div key={i} className="ui-card p-5 flex flex-col gap-4 group active:scale-[0.98] transition-all relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--cyan-accent)] border border-[var(--border-ui)] shadow-inner">
                      <MapPin size={22} />
                    </div>
                    <div>
                      <h4 className="text-[var(--text-primary)] text-xs font-black uppercase italic leading-tight">{chunk.maps?.title || 'Destino Tático'}</h4>
                      <span className="text-[7px] font-black text-[var(--text-secondary)] uppercase tracking-widest block mt-0.5 opacity-50 italic">VIA GOOGLE MAPS PRO</span>
                    </div>
                  </div>
                  <a href={chunk.maps?.uri} target="_blank" className="p-3.5 bg-[var(--cyan-accent)] rounded-xl text-black shadow-lg shadow-[var(--cyan-accent)]/20 active:scale-90 transition-transform"><Navigation size={18} /></a>
                </div>
                
                {/* Seção de Snippets de Review do Maps */}
                {chunk.maps?.placeAnswerSources?.[0]?.reviewSnippets?.[0] && (
                  <div className="pt-4 border-t border-[var(--border-ui)]">
                     <div className="flex items-center gap-1 mb-2 text-orange-500">
                        <Star size={10} fill="currentColor" />
                        <Star size={10} fill="currentColor" />
                        <Star size={10} fill="currentColor" />
                        <Star size={10} fill="currentColor" />
                        <span className="text-[7px] font-black text-[var(--text-secondary)] uppercase ml-1">Feedback de Clientes</span>
                     </div>
                     <p className="text-[var(--text-secondary)] text-[10px] font-medium italic leading-relaxed">
                        "{chunk.maps.placeAnswerSources[0].reviewSnippets[0].text}"
                     </p>
                  </div>
                )}
              </div>
            )) : (
              <div className="text-center py-20 opacity-40">
                <ShieldAlert size={48} className="text-[var(--text-secondary)] mx-auto mb-4" />
                <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.3em]">Varredura sem resultados na área</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-8 border-t border-[var(--border-ui)] bg-[var(--bg-primary)]/80 backdrop-blur-xl shrink-0">
        <button onClick={onClose} className="w-full ui-card text-[var(--text-secondary)] font-black py-6 rounded-3xl uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 active:scale-95 transition-all">
          RETORNAR AO COCKPIT
        </button>
      </div>
    </div>
  );
};

export default RadarPro;
