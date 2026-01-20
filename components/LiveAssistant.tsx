
import React, { useState, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { Mic, Camera, VideoOff, Lock, ShieldAlert, Zap } from 'lucide-react';
import { PermissionsState } from '../types';

function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

interface LiveAssistantProps {
  permissions: PermissionsState;
  onTaskComplete: (key: keyof PermissionsState) => void;
}

const LiveAssistant: React.FC<LiveAssistantProps> = ({ permissions, onTaskComplete }) => {
  const [isActive, setIsActive] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [status, setStatus] = useState("Standby");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startSession = async () => {
    if (permissions.microphone === 'off') {
       setErrorMsg("MIC PERMISSION DISABLED. Navigate to Settings > Permissions.");
       return;
    }
    if (isCameraOn && permissions.camera === 'off') {
       setErrorMsg("CAMERA PERMISSION DISABLED. Navigate to Settings > Permissions.");
       return;
    }

    setErrorMsg(null);
    try {
      setStatus("Establishing Neural Link...");
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: isCameraOn ? { width: 1280, height: 720 } : false 
      });

      if (isCameraOn && videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus("Link Active");
            setIsActive(true);
            
            const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64EncodedAudioString && audioContextRef.current) {
              const ctx = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current = nextStartTimeRef.current + audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              for (const source of sourcesRef.current.values()) {
                source.stop();
                sourcesRef.current.delete(source);
              }
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
             onTaskComplete('microphone');
             if (isCameraOn) onTaskComplete('camera');
             setIsActive(false);
             setStatus("Standby");
          },
          onerror: (e) => {
            console.error("Live API Error:", e);
            setStatus("Link Failed");
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: "You are LEON, the high-performance AI Butler. Visual feed is for situational context only. Identity: My name is Leon and I was created by Muhammad Razi."
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) { 
      setStatus("Link Failed"); 
      setErrorMsg("Critical synchronization error.");
    }
  };

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    setIsActive(false);
    setStatus("Standby");
  };

  return (
    <div className="h-full flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between glass p-6 rounded-[2.5rem] border border-white/10 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
            <Mic className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Leon Live</h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{status}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsCameraOn(!isCameraOn)} 
            disabled={isActive}
            className={`p-3 rounded-xl transition-all ${isCameraOn ? 'bg-blue-600 text-white' : 'glass text-zinc-500'}`}
          >
            {isCameraOn ? <Camera size={24} /> : <VideoOff size={24} />}
          </button>
          <button 
            onClick={isActive ? stopSession : startSession} 
            className="px-8 py-3 rounded-xl font-black bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-xl uppercase text-xs tracking-widest"
          >
            {isActive ? 'Disconnect' : 'Initiate Sync'}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-3xl flex items-center gap-4 text-red-400 text-xs font-black uppercase tracking-widest">
           <ShieldAlert size={20} /> {errorMsg}
        </div>
      )}

      <div className="flex-1 glass rounded-[3rem] relative overflow-hidden flex flex-col items-center justify-center border border-white/10 bg-[#010101] shadow-2xl">
        {isActive && isCameraOn ? (
           <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center">
             <div className="w-44 h-44 rounded-full border-4 border-zinc-900 flex items-center justify-center">
                <Lock size={60} className="text-zinc-800" />
             </div>
             <p className="mt-8 text-[10px] font-black tracking-[0.4em] uppercase text-zinc-600">Secure Protocol Active</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveAssistant;
