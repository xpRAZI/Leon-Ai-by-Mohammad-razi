
import React, { useState, useEffect } from 'react';
import { Library, Trash2, Download, Film, Image as ImageIcon, Heart } from 'lucide-react';
import { LibraryItem } from '../types';

const LibraryPage: React.FC = () => {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'liked'>('all');

  useEffect(() => {
    const library = JSON.parse(localStorage.getItem('leon_library_global') || '[]');
    setItems(library);
  }, []);

  const deleteItem = (id: string) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    localStorage.setItem('leon_library_global', JSON.stringify(updated));
  };

  const toggleLike = (id: string) => {
    const updated = items.map(item => item.id === id ? { ...item, liked: !item.liked } : item);
    setItems(updated);
    localStorage.setItem('leon_library_global', JSON.stringify(updated));
  };

  const filteredItems = items.filter(i => {
    if (filter === 'all') return true;
    if (filter === 'liked') return i.liked;
    return i.type === filter;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Leon Vault</h1>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-2">Personal neural assets.</p>
        </div>
        <div className="flex gap-2 glass p-2 rounded-2xl border border-white/10 overflow-x-auto max-w-full">
           {['all', 'image', 'video', 'liked'].map((f) => (
             <button 
                key={f}
                onClick={() => setFilter(f as any)} 
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === f ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-600 hover:text-white'}`}
             >
               {f}
             </button>
           ))}
        </div>
      </header>

      {items.length === 0 ? (
        <div className="glass h-[450px] rounded-[3rem] flex flex-col items-center justify-center opacity-10 border border-white/10">
           <Library size={80} className="mb-6" />
           <p className="text-xs font-black uppercase tracking-[0.5em]">Vault Is Empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredItems.map(item => (
            <div key={item.id} className="glass rounded-[2rem] overflow-hidden group border border-white/10 hover:border-blue-500 transition-all flex flex-col bg-[#050505] shadow-xl">
              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                {item.type === 'image' ? (
                  <img src={item.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.prompt} />
                ) : (
                  <video src={item.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                   <button 
                    onClick={() => toggleLike(item.id)}
                    className={`p-4 rounded-full transition-all border ${item.liked ? 'bg-red-600 border-red-500 text-white' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                   >
                    <Heart size={20} className={item.liked ? 'fill-current' : ''} />
                   </button>
                   <a href={item.url} download className="p-4 bg-blue-600 text-white hover:bg-blue-500 rounded-full transition-all shadow-2xl"><Download size={20} /></a>
                   <button onClick={() => deleteItem(item.id)} className="p-4 bg-white/10 hover:bg-red-600 hover:text-white rounded-full transition-all border border-white/20"><Trash2 size={20} /></button>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col space-y-4">
                 <p className="text-[11px] font-medium text-zinc-400 line-clamp-2 leading-relaxed">"{item.prompt}"</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
