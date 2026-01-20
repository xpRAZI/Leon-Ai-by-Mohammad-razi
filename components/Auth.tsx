
import React, { useState } from 'react';
import { Mail, Lock, User, LogIn, UserPlus, ShieldCheck, Globe, Chrome } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthProps {
  onLogin: (user: UserType) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulated network delay
    setTimeout(() => {
      const userData: UserType = {
        id: `user_${Date.now()}`,
        username: username || 'User',
        email: email || `${username}@razi.ai`,
        isLoggedIn: true
      };
      onLogin(userData);
      setLoading(false);
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const userData: UserType = {
        id: 'google_user_123',
        username: 'Razi Global',
        email: 'mohammad.razi@gmail.com',
        isLoggedIn: true
      };
      onLogin(userData);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#020202] flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(37,99,235,0.3)] animate-pulse">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Leon Matrix</h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">Neural Access Authorization</p>
        </div>

        <div className="glass p-8 rounded-[3rem] border border-white/10 shadow-2xl space-y-8 bg-black/40">
          <div className="flex p-1.5 bg-white/5 rounded-2xl border border-white/5">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-4 top-4 text-zinc-600" size={18} />
                <input 
                  type="text" 
                  placeholder="USERNAME" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:border-blue-500 transition-all text-xs font-black uppercase tracking-widest text-white"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-zinc-600" size={18} />
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:border-blue-500 transition-all text-xs font-black uppercase tracking-widest text-white"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-zinc-600" size={18} />
              <input 
                type="password" 
                placeholder="ACCESS KEY" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:border-blue-500 transition-all text-xs font-black uppercase tracking-widest text-white"
              />
            </div>
            <button 
              disabled={loading}
              className="w-full bg-white text-black font-black py-5 rounded-3xl transition-all flex items-center justify-center gap-3 shadow-xl hover:bg-zinc-200 active:scale-95 disabled:opacity-50 text-xs uppercase tracking-[0.2em]"
            >
              {loading ? (
                <LogIn size={20} className="animate-spin" />
              ) : (
                isLogin ? <LogIn size={20} /> : <UserPlus size={20} />
              )}
              {isLogin ? 'Initialize Session' : 'Create Profile'}
            </button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center"><span className="bg-[#0b0b0b] px-4 text-[8px] font-black uppercase tracking-[0.3em] text-zinc-700">OAuth Gate</span></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full glass border-white/10 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-4 hover:bg-white/5 active:scale-95 disabled:opacity-50 text-[10px] uppercase tracking-widest"
          >
            <Chrome size={18} className="text-blue-400" />
            Continue with Google
          </button>
        </div>

        <div className="mt-10 flex items-center justify-center gap-4 opacity-30 grayscale pointer-events-none">
          <ShieldCheck size={16} />
          <span className="text-[8px] font-black uppercase tracking-[0.4em]">AES-256 Neural Encryption Layer</span>
          <Globe size={16} />
        </div>
      </div>
    </div>
  );
};

export default Auth;
