
import React, { useEffect, useRef, useState } from 'react';
import { X, Mic, Volume2, Loader2, Power, AlertCircle } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Journey } from '../types';

interface VoiceCopilotProps {
  onClose: () => void;
  history: Journey[];
}

const VoiceCopilot: React.FC<VoiceCopilotProps> = ({ onClose, history }) => {
  const [isReady, setIsReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Sistema de Voz Offline');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const initVoiceSystem = async () => {
    setIsConnecting(true);
    setError(null);
    setStatus('Iniciando Protocolo de Voz...');

    try {
      // Mobile browsers: AudioContext must be created or resumed within a user gesture
      const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      // Force resume for mobile Safari compatibility
      if (inCtx.state === 'suspended') await inCtx.resume();
      if (outCtx.state === 'suspended') await outCtx.resume();

      audioContextRef.current = inCtx;
      outContextRef.current = outCtx;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsReady(true);
            setStatus('Pode Falar, Piloto');
            
            const source = inCtx.createMediaStreamSource(stream);
            const scriptProcessor = inCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };

              sessionPromise.then(s => {
                s.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inCtx.destination);
          },
          onmessage: async (message) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outCtx) {
              // Ensure audio output context is still active (mobile energy saving might suspend it)
              if (outCtx.state === 'suspended') await outCtx.resume();
              
              setIsSpeaking(true);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(base64Audio), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outCtx.destination);
              
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsSpeaking(false);
              };
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Erro Live:", e);
            setError('Falha na Conexão Live');
            setStatus('Erro de Sincronização');
            setIsConnecting(false);
          },
          onclose: () => {
            console.log("Conexão Voz Encerrada");
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
          systemInstruction: `Você é o Voice Pro 8.0 do FaturandoAlto. Atue como um co-piloto de elite. Seja extremamente breve e tático. Use tom encorajador e profissional.`
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) {
      console.error("Erro ao iniciar sistema de voz:", e);
      setError('Permissão ou API Negada');
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (sessionRef.current) sessionRef.current.close();
      if (audioContextRef.current) audioContextRef.current.close();
      if (outContextRef.current) outContextRef.current.close();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[1000] bg-[var(--bg-primary)] flex flex-col items-center justify-center p-10 animate-in fade-in duration-500">
      <button onClick={onClose} className="absolute top-10 right-10 w-12 h-12 ui-card flex items-center justify-center text-[var(--text-secondary)] active:scale-90 transition-all">
        <X size={24} />
      </button>

      {!isReady && !isConnecting && !error ? (
        <div className="text-center space-y-8 animate-in zoom-in duration-500">
          <div className="w-32 h-32 rounded-full ui-card flex items-center justify-center text-[var(--cyan-accent)] mx-auto shadow-[0_0_30px_rgba(34,211,238,0.2)]">
            <Mic size={48} />
          </div>
          <div className="space-y-4">
            <h2 className="text-[var(--text-primary)] text-2xl font-black uppercase italic tracking-tighter">Voice Pro 8.0</h2>
            <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.3em] max-w-xs mx-auto">
              SISTEMA DE VOZ BIOMÉTRICO AGUARDANDO ATIVAÇÃO DO PILOTO
            </p>
          </div>
          <button 
            onClick={initVoiceSystem}
            className="w-full bg-[var(--cyan-accent)] text-black py-6 rounded-[32px] font-black uppercase tracking-[0.3em] text-[11px] shadow-xl active:scale-95 transition-all"
          >
            ATIVAR SISTEMA <Power size={16} className="inline ml-2" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-12 text-center">
          <div className="relative">
            {isSpeaking && (
              <div className="absolute inset-0 bg-[var(--cyan-accent)] rounded-full animate-ping opacity-20"></div>
            )}
            <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-700 ${isSpeaking ? 'scale-110 shadow-[0_0_80px_rgba(6,182,212,0.4)]' : 'scale-100 shadow-[0_0_20px_rgba(0,0,0,0.5)]'}`}>
              <div className={`w-40 h-40 rounded-full ui-card flex items-center justify-center relative z-10 ${isSpeaking ? 'border-[var(--cyan-accent)] shadow-[0_0_20px_var(--cyan-accent)]' : 'border-[var(--border-ui)]'}`}>
                {isConnecting ? (
                  <Loader2 size={48} className="text-[var(--cyan-accent)] animate-spin" />
                ) : isSpeaking ? (
                  <Volume2 size={48} className="text-[var(--cyan-accent)] animate-bounce" />
                ) : error ? (
                  <AlertCircle size={48} className="text-[var(--red-accent)]" />
                ) : (
                  <div className="relative">
                     <Mic size={48} className="text-[var(--cyan-accent)]" />
                     <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[var(--emerald-accent)] rounded-full border-2 border-black animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <span className={`text-[10px] font-black uppercase tracking-[0.5em] block ${error ? 'text-[var(--red-accent)]' : 'text-[var(--cyan-accent)]'}`}>
              {status}
            </span>
            <h2 className="text-[var(--text-primary)] text-3xl font-black italic tracking-tighter uppercase leading-none">
              faturandoalto <br/><span className="text-[var(--cyan-accent)]">Voice Pro 8.0</span>
            </h2>
            {error && (
              <button 
                onClick={initVoiceSystem}
                className="mt-4 text-[var(--red-accent)] text-[9px] font-black uppercase underline tracking-widest"
              >
                Tentar Reinicializar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceCopilot;
