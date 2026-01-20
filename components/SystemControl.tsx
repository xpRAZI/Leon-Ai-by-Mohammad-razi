
import React, { useState } from 'react';
import { Smartphone, Monitor, Watch, Power, Lock, Volume2, ShieldCheck, Activity, Terminal, ShieldAlert } from 'lucide-react';
import { PermissionsState } from '../types';

interface SystemControlProps {
  permissions: PermissionsState;
  onTaskComplete: (key: keyof PermissionsState) => void;
}

const SystemControl: React.FC<SystemControlProps> = ({ permissions, onTaskComplete }) => {
  const [activeDevice, setActiveDevice] = useState<'pc' | 'phone' | 'watch'>('pc');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAction = (label: string) => {
    if (permissions.systemControl === 'off') {
       setErrorMsg("PERMISSION DENIED: [systemControl] is disabled. Check Settings.");
       return;
    }
    setErrorMsg(null);
    alert(`System Protocol: ${label} executed on ${activeDevice}.`);
    onTaskComplete('systemControl');
  };

  const devices = [
    { id: 'pc', name: 'Workstation', icon: Monitor, status: 'Online', battery: 'Connected' },
    { id: 'phone', name: 'Mobile Core', icon: Smartphone, status: 'Active', battery: '84%' },
    { id: 'watch', name: 'Wearable', icon: Watch, status: 'Sleep', battery: '92%' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-black uppercase tracking-tighter">Command Center</h1>
        <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-2">Neural infrastructure management.</p>
      </header>

      {errorMsg && (
        <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-3xl flex items-center gap-4 text-red-400 text-xs font-black uppercase tracking-widest">
           <ShieldAlert size={20} /> {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {devices.map((device) => (
          <button
            key={device.id}
            onClick={() => setActiveDevice(device.id as any)}
            className={`glass p-8 rounded-3xl text-left transition-all border border-white/10 ${activeDevice === device.id ? 'bg-white text-black shadow-2xl scale-105' : 'hover:bg-white/5'}`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`p-4 rounded-2xl ${activeDevice === device.id ? 'bg-black text-white' : 'bg-white/5 text-zinc-600'}`}>
                <device.icon size={24} />
              </div>
              <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${device.status === 'Online' || device.status === 'Active' ? (activeDevice === device.id ? 'bg-black/10' : 'bg-white/10 text-white') : 'bg-zinc-800 text-zinc-500'}`}>
                {device.status}
              </span>
            </div>
            <h3 className="font-black text-lg tracking-tight uppercase">{device.name}</h3>
          </button>
        ))}
      </div>

      <div className="lg:col-span-2 glass p-10 rounded-[3rem] space-y-8 border border-white/10 bg-[#050505] shadow-2xl">
        <h2 className="text-xs font-black uppercase tracking-[0.4em] flex items-center gap-3 text-zinc-400">
          <Terminal size={18} /> Neural Command Matrix
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Lock Hub', icon: Lock },
            { label: 'Wipe RAM', icon: Activity },
            { label: 'Neural Gain', icon: Volume2 },
            { label: 'Virus Purge', icon: ShieldCheck },
            { label: 'Reboot Core', icon: Power },
            { label: 'Log Dump', icon: Terminal }
          ].map((action, idx) => (
            <button key={idx} onClick={() => handleAction(action.label)} className="glass p-8 rounded-3xl flex flex-col items-center justify-center gap-4 border border-white/5 hover:bg-white hover:text-black transition-all group">
              <action.icon size={32} />
              <span className="text-[10px] font-black uppercase tracking-widest">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemControl;
