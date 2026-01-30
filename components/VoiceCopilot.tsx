
import React, { useEffect, useRef, useState } from 'react';
import { X, Mic, Volume2, Loader2 } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Journey } from '../types';

interface VoiceCopilotProps {
  onClose: () => void;
  history: Journey[];
}

const VoiceCopilot: React.FC<VoiceCopilotProps> = ({ onClose, history }) => {
  const [isConnecting, setIsConnecting] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState('Sincronizando Voz...');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Auxiliares de codificação/decodificação conforme as diretrizes
  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext) => {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    return buffer;
  };

  useEffect(() => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let inputAudioContext: AudioContext;
    let stream: MediaStream;

    const startSession = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        inputAudioContext = new AudioContext({ sampleRate: 16000 });
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        
        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-12-2025',
          callbacks: {
            onopen: () => {
              setIsConnecting(false);
              setStatus('Pode Falar, Piloto');
              
              const source = inputAudioContext.createMediaStreamSource(stream);
              const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
              
              scriptProcessor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const int16 = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
                const pcmBase64 = encode(new Uint8Array(int16.buffer));
                
                sessionPromise.then(s => {
                  s.sendRealtimeInput({ media: { data: pcmBase64, mimeType: 'audio/pcm;rate=16000' } });
                });
              };
              
              source.connect(scriptProcessor);
              scriptProcessor.connect(inputAudioContext.destination);
            },
            onmessage: async (message) => {
              const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (base64Audio && audioContextRef.current) {
                setIsSpeaking(true);
                const ctx = audioContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                
                const audioBuffer = await decodeAudioData(decode(base64Audio), ctx);
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
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
            onerror: () => setStatus('Erro de Conexão'),
            onclose: () => onClose()
          },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
            systemInstruction: `Você é o sistema faturandoalto Voice Pro 8.0. Seu tom é de um oficial técnico de elite. Ajude o piloto a bater a meta. Ganhos atuais: R$ ${history.reduce((a, j) => a + (j.rides.reduce((ra, r) => ra + r.value, 0)), 0).toFixed(2)}. Responda de forma curta e rápida.`
          }
        });
        sessionRef.current = await sessionPromise;
      } catch (e) {
        setStatus('Erro: Verifique Microfone');
      }
    };

    startSession();
    return () => {
      if (sessionRef.current) sessionRef.current.close();
      if (inputAudioContext) inputAudioContext.close();
      if (audioContextRef.current) audioContextRef.current.close();
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[1000] bg-black/98 backdrop-blur-3xl flex flex-col items-center justify-center p-10 animate-in fade-in duration-500">
      <button onClick={onClose} className="absolute top-10 right-10 p-4 glass rounded-full text-zinc-500 hover:text-white transition-colors">
        <X size={24} />
      </button>

      <div className="flex flex-col items-center gap-12 text-center">
        <div className="relative">
          <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-700 ${isSpeaking ? 'scale-110 shadow-[0_0_80px_rgba(6,182,212,0.4)]' : 'scale-100'}`}>
            <div className={`absolute inset-0 bg-cyan-500/10 rounded-full blur-3xl animate-pulse`}></div>
            <div className={`w-36 h-36 rounded-full glass border-2 flex items-center justify-center relative z-10 ${isSpeaking ? 'border-cyan-400' : 'border-zinc-800'}`}>
              {isConnecting ? <Loader2 size={48} className="text-cyan-500 animate-spin" /> : isSpeaking ? <Volume2 size={48} className="text-cyan-400 animate-bounce" /> : <Mic size={48} className="text-cyan-500" />}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.5em] block">{status}</span>
          <h2 className="text-white text-3xl font-black italic tracking-tighter uppercase leading-none">faturandoalto <br/><span className="text-cyan-600">Voice Pro 8.0</span></h2>
          <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest max-w-[250px]">Modo mãos livres ativado. Comande sua jornada por voz.</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceCopilot;
