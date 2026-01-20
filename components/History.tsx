
import React, { useState, useEffect } from 'react';
import { Clock, MessageCircle, Trash2, Calendar } from 'lucide-react';
import { ChatSession } from '../types';

const History: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('leon_history_global') || '[]');
    setSessions(history);
  }, []);

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem('leon_history_global', JSON.stringify(updated));
    if (selectedSession?.id === id) setSelectedSession(null);
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-100px)] flex flex-col gap-6 animate-in fade-in duration-700">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Neural Archive</h1>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-2">Historical transcriptions.</p>
        </div>
        <div className="bg-white/5 px-6 py-2.5 rounded-full border border-white/10 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
           <Calendar size={14} className="text-white" /> 
           {new Date().toLocaleDateString()}
        </div>
      </header>

      <div className="flex-1 flex gap-6 overflow-hidden">
        <div className="w-1/3 glass rounded-3xl flex flex-col border border-white/10 overflow-hidden bg-[#050505]">
          <div className="p-6 border-b border-white/5 font-black text-[10px] flex items-center gap-3 text-zinc-500 uppercase tracking-[0.3em]">
            <Clock size={16} /> Session Buffer
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {sessions.length === 0 ? (
              <p className="text-center mt-20 text-zinc-700 text-xs font-black uppercase tracking-widest">No Transcripts Found</p>
            ) : sessions.map(session => (
              <button
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className={`w-full text-left p-5 rounded-2xl transition-all group border border-transparent ${selectedSession?.id === session.id ? 'bg-white text-black shadow-2xl border-white' : 'hover:bg-white/5 hover:border-white/10'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-black block truncate text-xs uppercase tracking-tight w-4/5">{session.title}</span>
                  <button onClick={(e) => deleteSession(session.id, e)} className={`opacity-0 group-hover:opacity-100 p-1.5 rounded transition-all ${selectedSession?.id === session.id ? 'hover:bg-black/10' : 'hover:bg-white/10'}`}><Trash2 size={14} /></button>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${selectedSession?.id === session.id ? 'text-black/50' : 'text-zinc-700'}`}>
                  {new Date(session.timestamp).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 glass rounded-3xl border border-white/10 flex flex-col overflow-hidden relative shadow-2xl bg-[#020202]">
          {selectedSession ? (
            <>
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/2">
                 <h2 className="font-black text-xs uppercase tracking-[0.4em] flex items-center gap-3 text-zinc-400">
                   <MessageCircle size={18} /> Neural transcript
                 </h2>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-8">
                {selectedSession.messages.map((m, idx) => (
                  <div key={idx} className={`flex flex-col ${m.role === 'User' ? 'items-end' : 'items-start'}`}>
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] mb-2 opacity-30 px-2">{m.role}</span>
                    <div className={`p-6 rounded-2xl max-w-[85%] text-sm leading-relaxed font-medium ${m.role === 'User' ? 'bg-white/10 border-r-2 border-white rounded-tr-none text-white' : 'bg-white text-black font-black rounded-tl-none shadow-xl'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-10 grayscale">
               <MessageCircle size={100} className="mb-6" />
               <p className="text-xs font-black uppercase tracking-[0.5em]">Awaiting Selection</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
