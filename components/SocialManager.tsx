
import React, { useState, useEffect } from 'react';
import { Instagram, Facebook, MessageCircle, Twitter, ShieldCheck, Zap, Bell, Clock, Save, ShieldAlert } from 'lucide-react';
import { SocialAccount, AutoReplyConfig, PermissionsState, User } from '../types';

// Fix: Added user to SocialManagerProps to resolve App.tsx type error
interface SocialManagerProps {
  user: User;
  permissions: PermissionsState;
  onTaskComplete: (key: keyof PermissionsState) => void;
}

const SocialManager: React.FC<SocialManagerProps> = ({ user, permissions, onTaskComplete }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Fix: Scoped account storage to user ID
  const [accounts, setAccounts] = useState<SocialAccount[]>(() => {
    const key = `leon_social_accounts_${user.id}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [
      { platform: 'Instagram', connected: false, username: '', lastSync: 0 },
      { platform: 'Facebook', connected: false, username: '', lastSync: 0 },
      { platform: 'WhatsApp', connected: false, username: '', lastSync: 0 },
      { platform: 'X', connected: false, username: '', lastSync: 0 },
    ];
  });

  const [autoReply, setAutoReply] = useState<AutoReplyConfig>(() => {
    const key = `leon_auto_reply_${user.id}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : {
      enabled: true,
      delayMinutes: 30,
      message: "I am busy right now, I will reply to you as soon as I am free."
    };
  });

  useEffect(() => {
    const key = `leon_social_accounts_${user.id}`;
    localStorage.setItem(key, JSON.stringify(accounts));
  }, [accounts, user.id]);

  const toggleConnection = (platform: string) => {
    if (permissions.appAccess === 'off') {
       setErrorMsg("PERMISSION DENIED: App access disabled. Check Settings.");
       return;
    }
    setErrorMsg(null);
    setAccounts(prev => prev.map(acc => 
      acc.platform === platform 
        ? { ...acc, connected: !acc.connected, lastSync: Date.now() } 
        : acc
    ));
    onTaskComplete('appAccess');
  };

  const getPlatformIcon = (platform: string) => {
    const iconClass = "text-white opacity-80";
    switch(platform) {
      case 'Instagram': return <Instagram className={iconClass} />;
      case 'Facebook': return <Facebook className={iconClass} />;
      case 'WhatsApp': return <MessageCircle className={iconClass} />;
      case 'X': return <Twitter className={iconClass} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-black uppercase tracking-tighter">Social Hub</h1>
      </header>

      {errorMsg && (
        <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-3xl flex items-center gap-4 text-red-400 text-xs font-black uppercase tracking-widest">
           <ShieldAlert size={20} /> {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.map(acc => (
          <div key={acc.platform} className={`glass p-8 rounded-[2rem] border transition-all ${acc.connected ? 'bg-white text-black' : 'border-white/10'}`}>
            <div className="flex items-center justify-between">
              <div className={`p-4 rounded-2xl ${acc.connected ? 'bg-black text-white' : 'bg-white/5 text-zinc-600'}`}>
                {getPlatformIcon(acc.platform)}
              </div>
              <button onClick={() => toggleConnection(acc.platform)} className="text-[10px] font-black uppercase tracking-widest px-6 py-2 border border-zinc-700 rounded-full">
                {acc.connected ? 'Unlink' : 'Link'}
              </button>
            </div>
            <h3 className="font-black text-lg mt-6 uppercase tracking-tight">{acc.platform}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialManager;
