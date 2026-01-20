
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Image as ImageIcon, Video, Sparkles, Download, Loader2, Heart, ShieldAlert, Zap } from 'lucide-react';
import { LibraryItem, PermissionsState } from '../types';

interface CreatorHubProps {
  permissions: PermissionsState;
  onTaskComplete: (key: keyof PermissionsState) => void;
}

const CreatorHub: React.FC<CreatorHubProps> = ({ permissions, onTaskComplete }) => {
  const [imagePrompt, setImagePrompt] = useState('');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [imageResult, setImageResult] = useState<LibraryItem | null>(null);
  const [videoResult, setVideoResult] = useState<LibraryItem | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const saveToLibrary = (item: LibraryItem) => {
    const key = `leon_library_global`;
    const library: LibraryItem[] = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify([item, ...library]));
  };

  const updateLikedStatus = (id: string, liked: boolean) => {
    const key = `leon_library_global`;
    const library: LibraryItem[] = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = library.map(item => item.id === id ? { ...item, liked } : item);
    localStorage.setItem(key, JSON.stringify(updated));
    
    if (imageResult?.id === id) setImageResult(prev => prev ? { ...prev, liked } : null);
    if (videoResult?.id === id) setVideoResult(prev => prev ? { ...prev, liked } : null);
  };

  const generateImage = async () => {
    if (permissions.imageGen === 'off') {
       setErrorMsg("PERMISSION DENIED: Image generation is disabled in Settings.");
       return;
    }

    setErrorMsg(null);
    setImageLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: imagePrompt }] },
        config: { imageConfig: { aspectRatio: "16:9" } }
      });
      const part = response.candidates?.[0]?.content.parts.find(p => p.inlineData);
      if (part?.inlineData) {
        const url = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        const newItem: LibraryItem = {
          id: `img_${Date.now()}`,
          type: 'image',
          url,
          prompt: imagePrompt,
          timestamp: Date.now(),
          liked: false
        };
        setImageResult(newItem);
        saveToLibrary(newItem);
        onTaskComplete('imageGen');
      }
    } catch (err) {
      setErrorMsg("Image generation interrupted.");
    } finally {
      setImageLoading(false);
    }
  };

  const generateVideo = async () => {
    if (permissions.videoGen === 'off') {
       setErrorMsg("PERMISSION DENIED: Video generation is disabled in Settings.");
       return;
    }

    setErrorMsg(null);
    setVideoLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
         await window.aistudio.openSelectKey();
      }
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: videoPrompt,
        config: { resolution: '720p', aspectRatio: '16:9', numberOfVideos: 1 }
      });
      while (!operation.done) {
        await new Promise(r => setTimeout(r, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      const resp = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const newItem: LibraryItem = {
        id: `vid_${Date.now()}`,
        type: 'video',
        url,
        prompt: videoPrompt,
        timestamp: Date.now(),
        liked: false
      };
      setVideoResult(newItem);
      saveToLibrary(newItem);
      onTaskComplete('videoGen');
    } catch (err) {
      setErrorMsg("Video generation interrupted.");
    } finally {
      setVideoLoading(false);
    }
  };

  const ResultCard = ({ item }: { item: LibraryItem }) => (
    <div className="w-full space-y-4 animate-in zoom-in-95 duration-500">
      <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black relative aspect-video flex items-center justify-center">
        {item.type === 'image' ? (
          <img src={item.url} className="w-full h-full object-cover" alt={item.prompt} />
        ) : (
          <video src={item.url} controls className="w-full h-full object-cover" />
        )}
      </div>
      <div className="flex items-center justify-between p-2">
        <div className="flex gap-2">
          <button 
            onClick={() => updateLikedStatus(item.id, !item.liked)}
            className={`p-3 rounded-2xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${item.liked ? 'bg-red-600 text-white shadow-lg' : 'glass text-zinc-500 hover:text-white'}`}
          >
            <Heart className={item.liked ? "fill-current" : ""} size={16} />
            {item.liked ? 'Liked' : 'Like'}
          </button>
          <a 
            href={item.url} 
            download={`leon-${item.type}-${item.id}`} 
            className="p-3 glass text-zinc-500 hover:text-white rounded-2xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
          >
            <Download size={16} /> Download
          </a>
        </div>
        <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
          {new Date(item.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4">
          <Zap className="text-blue-500" /> Creator Hub
        </h1>
        <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
          Leon's Visual & Motion Synthesis Engine.
        </p>
      </header>

      {errorMsg && (
        <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-3xl flex items-center gap-4 text-red-400 text-xs font-black uppercase tracking-widest">
           <ShieldAlert size={20} /> {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="glass p-8 rounded-[3rem] border border-white/10 space-y-6 shadow-2xl bg-black/40">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] flex items-center gap-3 text-zinc-400">
              <ImageIcon size={18} /> Image Synthesis
            </h2>
            <div className="space-y-4">
              <textarea 
                value={imagePrompt} 
                onChange={(e) => setImagePrompt(e.target.value)} 
                placeholder="Describe the image you want to create..." 
                className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-blue-500 transition-all font-bold text-xs tracking-widest min-h-[100px] text-white" 
              />
              <button 
                disabled={imageLoading || !imagePrompt} 
                onClick={generateImage} 
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-20 text-white py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest shadow-xl"
              >
                {imageLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                Synthesize Image
              </button>
            </div>
          </div>
          {imageResult ? <ResultCard item={imageResult} /> : null}
        </div>

        <div className="space-y-6">
          <div className="glass p-8 rounded-[3rem] border border-white/10 space-y-6 shadow-2xl bg-black/40">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] flex items-center gap-3 text-zinc-400">
              <Video size={18} /> Motion Synthesis
            </h2>
            <div className="space-y-4">
              <textarea 
                value={videoPrompt} 
                onChange={(e) => setVideoPrompt(e.target.value)} 
                placeholder="Describe the motion sequence..." 
                className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-blue-500 transition-all font-bold text-xs tracking-widest min-h-[100px] text-white" 
              />
              <button 
                disabled={videoLoading || !videoPrompt} 
                onClick={generateVideo} 
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-20 text-white py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest shadow-xl"
              >
                {videoLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                Synthesize Motion
              </button>
            </div>
          </div>
          {videoResult ? <ResultCard item={videoResult} /> : null}
        </div>
      </div>
    </div>
  );
};

export default CreatorHub;
