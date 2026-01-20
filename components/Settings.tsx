
import React from 'react';
import { Lock, Camera, Mic, Image, Video, FileText, Share2, Cpu, Globe, ShieldAlert, ShieldCheck } from 'lucide-react';
import { PermissionsState, PermissionStatus } from '../types';

interface SettingsProps {
  permissions: PermissionsState;
  onUpdate: (key: keyof PermissionsState, status: PermissionStatus) => void;
}

const Settings: React.FC<SettingsProps> = ({ permissions, onUpdate }) => {
  const permissionList: { key: keyof PermissionsState; label: string; icon: any; description: string }[] = [
    { key: 'camera', label: 'Camera Access', icon: Camera, description: 'Enables Live Vision and environment analysis.' },
    { key: 'microphone', label: 'Microphone Access', icon: Mic, description: 'Required for voice interaction and recording.' },
    { key: 'imageGen', label: 'Image Generation', icon: Image, description: 'Leon creates visual assets on request.' },
    { key: 'videoGen', label: 'Video Generation', icon: Video, description: 'Leon renders high-fidelity motion sequences.' },
    { key: 'fileAccess', label: 'File & Photo Access', icon: FileText, description: 'Access to system files, documents, and local photos.' },
    { key: 'appAccess', label: 'App Access', icon: Share2, description: 'Allows Leon to interact with social and work apps.' },
    { key: 'systemControl', label: 'System Control', icon: Cpu, description: 'Permission to manage device settings and simulations.' },
    { key: 'internetAccess', label: 'Internet Access', icon: Globe, description: 'Enables real-time search and web data retrieval.' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4">
          <Lock className="text-blue-500" /> Security & Matrix
        </h1>
        <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
          Manage your neural authorization matrix.
        </p>
      </header>

      <div className="glass p-10 rounded-[3rem] border border-white/10 space-y-8 shadow-2xl bg-black/40">
        <div className="flex items-center gap-3 mb-4">
          <ShieldAlert className="text-amber-500" size={20} />
          <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Security Protocols</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {permissionList.map((p) => (
            <div key={p.key} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-white/20 transition-all group">
              <div className="flex items-center gap-6">
                <div className={`p-4 rounded-2xl bg-black text-blue-500 shadow-xl group-hover:scale-110 transition-transform ${permissions[p.key] === 'off' ? 'opacity-30' : 'opacity-100'}`}>
                  <p.icon size={24} />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-tight">{p.label}</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">{p.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex bg-black/50 p-1.5 rounded-2xl border border-white/5">
                  {(['off', 'temporary', 'permanent'] as PermissionStatus[]).map((state) => (
                    <button
                      key={state}
                      onClick={() => onUpdate(p.key, state)}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                        permissions[p.key] === state 
                          ? (state === 'off' ? 'bg-zinc-800 text-white' : (state === 'temporary' ? 'bg-amber-600 text-white shadow-lg' : 'bg-blue-600 text-white shadow-lg'))
                          : 'text-zinc-600 hover:text-white'
                      }`}
                    >
                      {state === 'off' ? 'Disabled' : state}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-8 glass rounded-[2.5rem] border border-white/10 flex items-center gap-6 text-zinc-500">
        <ShieldCheck className="text-blue-500 shrink-0" size={32} />
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest">Neural Link Encryption</p>
          <p className="text-[10px] font-medium leading-relaxed uppercase tracking-tighter">
            System data is scoped to the global neural cache.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
