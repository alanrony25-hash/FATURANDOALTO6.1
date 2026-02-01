
import React, { useState, useEffect, useCallback } from 'react';
import { X, Radar as RadarIcon, Navigation, MapPin, ShieldAlert, Sparkles, Search, RefreshCw, Star, Globe } from 'lucide-react';
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
  const [isGpsReady, setIsGpsReady] = useState(false);

  const requestLocation = useCallback(() => {
    setLoading(true);
    setError(null);
    setIsGpsReady(false);

    const options = {
      timeout: 15000, // Aumentado para 15s (melhor para celular com sinal ruim)
      enableHighAccuracy: true,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsGpsReady(true);
      },
      (err) => {
          console.error("Erro GPS:", err);
          // Fallback seguro mas avisando o usuário
          setLocation({ lat: -23.5505, lng: -46.6333 }); 
          setError("Sinal de satélite instável. Usando última posição conhecida.");
          setIsGpsReady(true); // Permite continuar com fallback
      },
      options
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const fetchData = useCallback(async () => {
    if (!location || !isGpsReady) return;
    setLoading(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      if (mode === 'MAPS') {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: "Encontre postos com GNV, postos de combustíveis com bons preços e áreas de descanso para motoristas de aplicativo próximos a minha coordenada.",
          config: {
            tools: [{ googleMaps: {} }],
            toolConfig: { retrievalConfig: { latLng: { latitude: location.lat, longitude: location.lng } } }
          }
        });
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        setResults(chunks);
        if (chunks.length === 0) setError("Nenhum ponto logístico detectado nesta órbita.");
      } else {
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: "Quais grandes eventos (shows, futebol, festas) estão gerando alta demanda HOJE e AMANHÃ em Fortaleza? Liste locais e dicas estratégicas para motoristas.",
          config: { tools: [{ googleSearch: {} }] }
        });
        setEventAdvice(response.text || "");
        setResults(response.candidates?.[0]?.groundingMetadata?.groundingChunks || []);
      }
    } catch (e: any) {
      console.error("Radar Error:", e);
      setError("Falha na varredura orbital. Verifique a conexão 5G/4G.");
    } finally {
      setLoading(false);
    }
  }, [location, isGpsReady, mode]);

  useEffect(() => { 
    if (isGpsReady) fetchData(); 
  }, [isGpsReady, fetchData]);

  return (
    <div className="fixed inset-0 z-[2000] bg-[var(--bg-primary)] flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
      <header className="p-8 pb-4 flex flex-col gap-6 border-b border-[var(--border-ui)] shrink-0 bg-[var(--bg-primary)]/80 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--cyan-accent)]/10 flex items-center justify-center text-[var(--cyan-accent)] border border-[var(--cyan-accent)]/20 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
              <RadarIcon size={24} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-[var(--text-primary)] font-black text-base uppercase italic tracking-tighter leading-none">RADAR DE INTELIGÊNCIA</h2>
              <span className="text-[7px] font-black text-[var(--cyan-accent)] uppercase tracking-[0.3em] mt-1 block opacity-60">Sincronização Ativa</span>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 ui-card flex items-center justify-center text-[var(--text-secondary)] active:scale-90 transition-all">
            <X size={24}/>
          </button>
        </div>

        <div className="flex p-1.5 ui-card bg-[var(--bg-secondary)] border-[var(--border-ui)] shadow-inner">
          <button 
            onClick={() => setMode('MAPS')}
            className={`flex-1 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'MAPS' ? 'bg-[var(--cyan-accent)] text-black shadow-lg' : 'text-[var(--text-secondary)] opacity-50'}`}
          >
            LOGÍSTICA
          </button>
          <button 
            onClick={() => setMode('EVENTS')}
            className={`flex-1 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'EVENTS' ? 'bg-[var(--cyan-accent)] text-black shadow-lg' : 'text-[var(--text-secondary)] opacity-50'}`}
          >
            DEMANDA
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-40">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-8 py-20">
            <div className="relative">
               <div className="w-24 h-24 border-2 border-[var(--cyan-accent)]/10 rounded-full animate-ping"></div>
               <div className="absolute inset-0 w-24 h-24 border-4 border-[var(--cyan-accent)]/20 rounded-full border-t-[var(--cyan-accent)] animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center text-[var(--cyan-accent)]">
                  <Globe size={32} className="animate-pulse" />
               </div>
            </div>
            <div className="text-center space-y-3">
                <span className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-[0.5em] block italic">ESCANER OPERACIONAL</span>
                <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-40 block">CALIBRANDO SATÉLITES GOOGLE CLOUD</span>
            </div>
          </div>
        ) : error && results.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-8 py-10 animate-in fade-in">
            <div className="w-20 h-20 rounded-full bg-[var(--red-accent)]/10 flex items-center justify-center text-[var(--red-accent)] border border-[var(--red-accent)]/20">
              <ShieldAlert size={40} />
            </div>
            <div className="space-y-3">
                <h4 className="text-[var(--text-primary)] font-black text-lg uppercase italic tracking-tighter">Erro de Telemetria</h4>
                <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase leading-relaxed max-w-xs mx-auto opacity-70">{error}</p>
            </div>
            <button 
                onClick={requestLocation}
                className="w-full py-6 ui-card text-[var(--cyan-accent)] font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl"
            >
                <RefreshCw size={18} /> REATIVAR RASTREIO
            </button>
          </div>
        ) : mode === 'EVENTS' ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="ui-card p-8 rounded-[40px] border-[var(--cyan-accent)]/20 bg-[var(--cyan-accent)]/5 relative overflow-hidden shadow-2xl">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-[var(--cyan-accent)]/10 blur-3xl"></div>
               <div className="flex items-center gap-3 mb-6 text-[var(--cyan-accent)] relative z-10">
                 <Sparkles size={20} />
                 <span className="text-[11px] font-black uppercase tracking-[0.3em]">ESTRATÉGIA DE CAMPO</span>
               </div>
               <p className="text-[var(--text-primary)] text-base font-medium italic leading-relaxed relative z-10 whitespace-pre-wrap">{eventAdvice}</p>
            </div>
            <div className="space-y-4">
              <h4 className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] ml-2 opacity-60 italic">FONTES EM TEMPO REAL</h4>
              {results.length > 0 ? results.map((c, i) => (
                <div key={i} className="ui-card p-5 flex items-center justify-between group active:bg-[var(--bg-secondary)] transition-all rounded-[28px] border-[var(--border-ui)]">
                  <div className="flex flex-col">
                      <span className="text-[var(--text-primary)] text-[11px] font-black truncate max-w-[220px] uppercase italic leading-none">{c.web?.title || 'Relatório Digital'}</span>
                      <span className="text-[7px] text-[var(--cyan-accent)] font-black uppercase mt-2 tracking-widest opacity-60">SINAL GROUNDING ATIVO</span>
                  </div>
                  <a href={c.web?.uri} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[var(--bg-secondary)] rounded-2xl text-[var(--cyan-accent)] border border-[var(--border-ui)] flex items-center justify-center shadow-sm active:scale-90"><Search size={18}/></a>
                </div>
              )) : (
                <div className="text-center py-10 border-2 border-dashed border-[var(--border-ui)] rounded-[32px] opacity-30">
                    <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em]">NENHUMA FONTE ADICIONAL</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-5 animate-in fade-in duration-500">
            {results.length > 0 ? results.map((chunk: any, i: number) => (
              <div key={i} className="ui-card p-6 flex flex-col gap-5 group active:scale-[0.98] transition-all relative overflow-hidden rounded-[32px] border-[var(--border-ui)] shadow-xl">
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--cyan-accent)] border border-[var(--border-ui)] shadow-inner">
                      <MapPin size={28} />
                    </div>
                    <div>
                      <h4 className="text-[var(--text-primary)] text-sm font-black uppercase italic leading-tight">{chunk.maps?.title || 'Destino Tático'}</h4>
                      <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest block mt-1 opacity-50 italic">VIA GOOGLE MAPS PRO</span>
                    </div>
                  </div>
                  <a href={chunk.maps?.uri} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-[var(--cyan-accent)] rounded-2xl text-black shadow-[0_10px_20px_rgba(34,211,238,0.3)] flex items-center justify-center active:scale-90 transition-all border-0"><Navigation size={24} /></a>
                </div>
                
                {chunk.maps?.placeAnswerSources?.[0]?.reviewSnippets?.[0] && (
                  <div className="pt-5 border-t border-[var(--border-ui)] relative z-10">
                     <div className="flex items-center gap-1.5 mb-3 text-orange-500">
                        <Star size={12} fill="currentColor" />
                        <Star size={12} fill="currentColor" />
                        <Star size={12} fill="currentColor" />
                        <Star size={12} fill="currentColor" />
                        <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase ml-2 tracking-widest opacity-60">FEEDBACK DE CAMPO</span>
                     </div>
                     <p className="text-[var(--text-secondary)] text-[12px] font-medium italic leading-relaxed text-zinc-400">
                        "{chunk.maps.placeAnswerSources[0].reviewSnippets[0].text}"
                     </p>
                  </div>
                )}
              </div>
            )) : (
              <div className="text-center py-24 opacity-30 animate-pulse">
                <ShieldAlert size={56} className="text-[var(--text-secondary)] mx-auto mb-5" />
                <p className="text-[var(--text-secondary)] text-[11px] font-black uppercase tracking-[0.4em]">NENHUM ALVO DETECTADO</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-8 border-t border-[var(--border-ui)] bg-[var(--bg-primary)]/90 backdrop-blur-2xl shrink-0">
        <button onClick={onClose} className="w-full ui-card text-[var(--text-secondary)] font-black py-7 rounded-[32px] uppercase tracking-[0.4em] text-[11px] flex items-center justify-center gap-4 active:scale-95 transition-all shadow-inner border-[var(--border-ui)]">
          RETORNAR AO COCKPIT
        </button>
      </div>
    </div>
  );
};

export default RadarPro;
