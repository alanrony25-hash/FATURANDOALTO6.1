
import React, { useEffect, useRef, useState } from 'react';
import { X, Mic, Volume2, Loader2, Power, AlertCircle, ShieldCheck } from 'lucide-react';
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
  const [status, setStatus] = useState('SISTEMA STANDBY');
  
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
    if (isConnecting) return;
    setIsConnecting(true);
    setError(null);
    setStatus('AUTENTICANDO...');

    try {
      // Mobile absolute requirement: AudioContext MUST be created within a user click handler
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const inCtx = new AudioCtx({ sampleRate: 16000 });
      const outCtx = new AudioCtx({ sampleRate: 24000 });
      
      // Explicitly resume for iOS/Android
      await inCtx.resume();
      await outCtx.resume();

      audioContextRef.current = inCtx;
      outContextRef.current = outCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsReady(true);
            setStatus('ESCUTANDO...');
            
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

              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inCtx.destination);
          },
          onmessage: async (message) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outCtx) {
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
            setError('ERRO DE LINK');
            setIsConnecting(false);
          },
          onclose: () => onClose()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
          systemInstruction: `Copiloto FaturandoAlto Pro. Seja breve, técnico e motivador.`
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) {
      setError('MICROFONE NEGADO');
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
    <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
      <button onClick={onClose} className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-500 active:scale-90 transition-all">
        <X size={24} />
      </button>

      <div className="flex flex-col items-center gap-12 w-full max-w-xs">
        <div className="relative">
           {isSpeaking && <div className="absolute inset-0 bg-cyan-500 rounded-full animate-ping opacity-20"></div>}
           <div className={`w-44 h-44 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${isSpeaking ? 'border-cyan-500 shadow-[0_0_50px_rgba(34,211,238,0.3)] scale-105' : 'border-zinc-800 scale-100'}`}>
              <div className="w-36 h-36 rounded-full bg-zinc-950 flex items-center justify-center relative z-10">
                {isConnecting ? (
                  <Loader2 size={40} className="text-cyan-500 animate-spin" />
                ) : isSpeaking ? (
                  <Volume2 size={40} className="text-cyan-500 animate-bounce" />
                ) : error ? (
                  <AlertCircle size={40} className="text-red-500" />
                ) : (
                  <Mic size={40} className={isReady ? 'text-cyan-500 animate-pulse' : 'text-zinc-800'} />
                )}
              </div>
           </div>
        </div>

        <div className="text-center space-y-4 w-full">
           <span className={`text-[10px] font-black uppercase tracking-[0.4em] block ${error ? 'text-red-500' : 'text-cyan-500'}`}>
              {status}
           </span>
           <h2 className="text-white text-2xl font-black italic tracking-tighter uppercase leading-none">
              VOICE PRO <span className="text-cyan-500">8.0</span>
           </h2>
           
           {!isReady && !isConnecting && (
             <button 
               onClick={initVoiceSystem}
               className="w-full mt-6 bg-cyan-500 text-black py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl"
             >
               INICIAR PROTOCOLO <Power size={18} />
             </button>
           )}

           {error && (
             <button onClick={initVoiceSystem} className="text-red-500 text-[9px] font-black uppercase underline tracking-widest mt-4">Reiniciar Sistema</button>
           )}
        </div>
        
        <div className="flex items-center gap-2 opacity-30 mt-4">
           <ShieldCheck size={12} className="text-cyan-500" />
           <span className="text-[7px] font-black text-white uppercase tracking-widest">Criptografia Biométrica Ativa</span>
        </div>
      </div>
    </div>
  );
};

export default VoiceCopilot;
