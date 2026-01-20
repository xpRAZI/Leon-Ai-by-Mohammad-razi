
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { 
  Send, Paperclip, ImageIcon, Loader2, Sparkles, Globe, Film, Activity, Trash2, Zap, Lock
} from 'lucide-react';
import { ChatMessage, ChatSession, LibraryItem, PermissionsState } from '../types';

interface BackgroundTask {
  id: string;
  prompt: string;
  startTime: number;
  type: 'image' | 'video';
  status: 'processing' | 'completed' | 'failed';
  resultUrl?: string;
}

interface NeuralChatProps {
  permissions: PermissionsState;
  onTaskComplete: (key: keyof PermissionsState) => void;
}

const NeuralChat: React.FC<NeuralChatProps> = ({ permissions, onTaskComplete }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [attachment, setAttachment] = useState<{ file: File; base64: string; type: string } | null>(null);
  const [sessionId] = useState(() => `chat_${Date.now()}`);
  const [bgTasks, setBgTasks] = useState<BackgroundTask[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      const historyKey = `leon_history_global`;
      const history: ChatSession[] = JSON.parse(localStorage.getItem(historyKey) || '[]');
      const sessionIndex = history.findIndex(s => s.id === sessionId);
      const newSession: ChatSession = {
        id: sessionId,
        title: messages[0].text.substring(0, 30) || "Neural Discussion",
        messages,
        timestamp: Date.now()
      };
      
      if (sessionIndex > -1) {
        history[sessionIndex] = newSession;
      } else {
        history.unshift(newSession);
      }
      localStorage.setItem(historyKey, JSON.stringify(history));
    }
  }, [messages, sessionId]);

  useEffect(() => {
    const fetchTasks = () => {
      const tasks = JSON.parse(localStorage.getItem(`leon_bg_tasks_global`) || '[]');
      setBgTasks(tasks);
    };
    fetchTasks();
    const interval = setInterval(fetchTasks, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (permissions.fileAccess === 'off') {
       alert("PERMISSION DENIED: File access is disabled. Go to Settings > Permissions.");
       return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      setAttachment({ file, base64, type: file.type });
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const saveToLibrary = (url: string, type: 'image' | 'video', prompt: string) => {
    const libraryKey = `leon_library_global`;
    const library: LibraryItem[] = JSON.parse(localStorage.getItem(libraryKey) || '[]');
    const newItem: LibraryItem = {
      id: `${type}_${Date.now()}`,
      type,
      url,
      prompt,
      timestamp: Date.now(),
      liked: false
    };
    localStorage.setItem(libraryKey, JSON.stringify([newItem, ...library]));
  };

  const updateTaskStatus = (id: string, status: 'processing' | 'completed' | 'failed', url?: string) => {
    const taskKey = `leon_bg_tasks_global`;
    const tasks = JSON.parse(localStorage.getItem(taskKey) || '[]');
    const updated = tasks.map((t: BackgroundTask) => t.id === id ? { ...t, status, resultUrl: url } : t);
    localStorage.setItem(taskKey, JSON.stringify(updated));
  };

  const initiateGeneration = async (prompt: string, type: 'image' | 'video') => {
    const permKey = type === 'image' ? 'imageGen' : 'videoGen';
    if (permissions[permKey] === 'off') {
       setMessages(prev => [...prev, {
         role: 'Leon',
         text: `Permission [${permKey}] is currently disabled. Please authorize it in Settings.`,
         timestamp: Date.now()
       }]);
       return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const taskId = `task_${Date.now()}`;
    const newTask: BackgroundTask = { id: taskId, prompt, startTime: Date.now(), type, status: 'processing' };
    
    const taskKey = `leon_bg_tasks_global`;
    const currentBgTasks = JSON.parse(localStorage.getItem(taskKey) || '[]');
    localStorage.setItem(taskKey, JSON.stringify([...currentBgTasks, newTask]));

    try {
      if (type === 'image') {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: prompt }] },
          config: { imageConfig: { aspectRatio: "16:9" } }
        });
        const part = response.candidates?.[0]?.content.parts.find(p => p.inlineData);
        if (part?.inlineData) {
          const url = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          saveToLibrary(url, 'image', prompt);
          updateTaskStatus(taskId, 'completed', url);
          onTaskComplete('imageGen');
        } else {
          updateTaskStatus(taskId, 'failed');
        }
      } else {
        if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
           await window.aistudio.openSelectKey();
        }
        let operation = await ai.models.generateVideos({
          model: 'veo-3.1-fast-generate-preview',
          prompt: prompt,
          config: { resolution: '720p', aspectRatio: '16:9' }
        });
        while (!operation.done) {
          await new Promise(r => setTimeout(r, 10000));
          operation = await ai.operations.getVideosOperation({ operation: operation });
        }
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        const resp = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        saveToLibrary(url, 'video', prompt);
        updateTaskStatus(taskId, 'completed', url);
        onTaskComplete('videoGen');
      }
    } catch (err) {
      updateTaskStatus(taskId, 'failed');
    }
  };

  const removeTask = (id: string) => {
    const taskKey = `leon_bg_tasks_global`;
    const tasks = JSON.parse(localStorage.getItem(taskKey) || '[]');
    const updated = tasks.filter((t: BackgroundTask) => t.id !== id);
    localStorage.setItem(taskKey, JSON.stringify(updated));
  };

  const sendMessage = async () => {
    if (!input && !attachment) return;

    const isIdReqEn = /who are you|tell me about yourself|who created you|what is your name/i.test(input);
    const isIdReqHi = /kaun ho|tumhara naam|kisne banaya|kiske dwara/i.test(input);

    if (isIdReqEn) {
      setMessages(prev => [...prev, { role: 'User', text: input, timestamp: Date.now() }, { role: 'Leon', text: "My name is Leon and I was created by Muhammad Razi.", timestamp: Date.now() }]);
      setInput('');
      return;
    }
    if (isIdReqHi) {
      setMessages(prev => [...prev, { role: 'User', text: input, timestamp: Date.now() }, { role: 'Leon', text: "Mera naam Leon hai aur mujhe Mohammed Razi ne banaya hai.", timestamp: Date.now() }]);
      setInput('');
      return;
    }

    if (attachment && permissions.fileAccess === 'off') {
      setMessages(prev => [...prev, { role: 'Leon', text: "Request Denied. File access permission is disabled.", timestamp: Date.now() }]);
      return;
    }

    const isImgReq = /generate image|make photo|banao ek image/i.test(input);
    const isVidReq = /generate video|make video|banao ek video/i.test(input);

    const userMsg: ChatMessage = {
      role: 'User',
      text: input,
      timestamp: Date.now(),
      attachment: attachment ? {
        name: attachment.file.name,
        type: attachment.type,
        url: URL.createObjectURL(attachment.file),
        data: attachment.base64
      } : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setAttachment(null);
    setIsProcessing(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      if (isImgReq || isVidReq) {
        setMessages(prev => [...prev, {
          role: 'Leon',
          text: `Processing synthesis request initiated. Check Hub.`,
          timestamp: Date.now()
        }]);
        initiateGeneration(currentInput, isImgReq ? 'image' : 'video');
      } else {
        const hasInternet = permissions.internetAccess !== 'off';
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: [{ parts: [
            ...(userMsg.attachment ? [{ inlineData: { data: userMsg.attachment.data, mimeType: userMsg.attachment.type } }] : []),
            { text: currentInput || "Analyze current buffer." }
          ]}],
          config: {
            tools: hasInternet ? [{ googleSearch: {} }] : [],
            systemInstruction: `You are LEON, the high-performance AI Butler. Identity: My name is Leon and I was created by Muhammad Razi. Always address the user as Boss.`
          }
        });

        setMessages(prev => [...prev, {
          role: 'Leon',
          text: response.text || "Neural connection optimal.",
          timestamp: Date.now()
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'Leon',
        text: "Neural matrix error.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const activeTasksCount = bgTasks.filter(t => t.status === 'processing').length;

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-120px)] flex flex-col gap-6 animate-in fade-in duration-700 relative">
      <header className="flex justify-between items-center glass p-6 rounded-[2.5rem] border border-white/10 shadow-2xl relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Leon Matrix</h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Activity size={10} className={activeTasksCount > 0 ? 'animate-pulse text-blue-400' : ''} />
              {activeTasksCount > 0 ? `${activeTasksCount} Operations Running` : `System Secure`}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
           <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-[8px] font-black uppercase tracking-widest ${permissions.internetAccess !== 'off' ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' : 'bg-white/5 border-white/5 text-zinc-600'}`}>
             <Globe size={12} /> Search: {permissions.internetAccess.toUpperCase()}
           </div>
        </div>
      </header>

      <div className="flex-1 glass rounded-[2.5rem] border border-white/10 flex flex-col overflow-hidden shadow-2xl bg-[#010101] relative">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
              <Lock size={60} className="text-zinc-600 mb-6" />
              <h2 className="text-xs font-black uppercase tracking-[0.5em] text-white">Secure Channel</h2>
            </div>
          )}
          {messages.map((m, idx) => (
            <div key={idx} className={`flex flex-col ${m.role === 'User' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2`}>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] mb-2 opacity-30 px-2">{m.role}</span>
              <div className={`p-6 rounded-[2rem] max-w-[85%] text-sm leading-relaxed ${m.role === 'User' ? 'bg-blue-600/10 border border-blue-500/30 text-white rounded-tr-none' : 'glass text-white font-medium rounded-tl-none shadow-2xl border-l-4 border-blue-600'}`}>
                {m.text}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex flex-col items-start animate-pulse">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] mb-2 opacity-30 px-2">Leon</span>
              <div className="p-6 glass text-white rounded-[2rem] rounded-tl-none flex items-center gap-3 shadow-xl border-l-4 border-blue-600">
                <Loader2 size={16} className="animate-spin text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">Processing...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-black/90 border-t border-white/10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={permissions.fileAccess === 'off'}
              className={`p-4 glass rounded-2xl transition-all border group ${permissions.fileAccess === 'off' ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/5 border-white/10'}`}
            >
              <Paperclip size={24} className={permissions.fileAccess === 'off' ? 'text-zinc-800' : 'text-zinc-500 group-hover:text-blue-400'} />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Neural Input..."
              className="flex-1 bg-zinc-900/50 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-600 transition-all text-sm font-bold tracking-tight text-white placeholder:text-zinc-600"
            />
            <button onClick={sendMessage} disabled={(!input && !attachment) || isProcessing} className="p-4 bg-blue-600 text-white hover:bg-blue-500 rounded-2xl transition-all shadow-xl disabled:opacity-20">
              <Send size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeuralChat;
