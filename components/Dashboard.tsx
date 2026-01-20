
import React from 'react';
import { Sun, MessageCircle, Briefcase, Zap, Star, Globe, ShieldCheck, Mail, Laptop } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: 'Mon', tasks: 12 },
  { name: 'Tue', tasks: 19 },
  { name: 'Wed', tasks: 15 },
  { name: 'Thu', tasks: 22 },
  { name: 'Fri', tasks: 30 },
  { name: 'Sat', tasks: 10 },
  { name: 'Sun', tasks: 8 },
];

const COLORS = ['#ffffff', '#e4e4e7', '#a1a1aa', '#71717a', '#3f3f46'];

const Dashboard: React.FC = () => {
  const greeting = new Date().getHours() < 12 ? 'Good Morning' : 'Welcome back';

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">
            {greeting.toUpperCase()}
          </h1>
          <p className="text-zinc-500 mt-2 font-medium uppercase text-[10px] tracking-widest">
            Leon is managing neural infrastructure. Core nominal.
          </p>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 glass px-6 py-2 rounded-full border border-white/10">
              <Globe size={16} className="text-white" />
              <span className="text-[10px] font-black uppercase tracking-widest">Global Link: ACTIVE</span>
           </div>
           <div className="flex items-center gap-4 glass p-3 rounded-2xl px-6">
              <div className="text-right">
                <p className="text-sm font-bold">24°C</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Sunny</p>
              </div>
              <div className="bg-white text-black p-2 rounded-lg">
                <Sun size={24} />
              </div>
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Cards */}
        <div className="glass p-8 rounded-3xl space-y-4 border border-white/10 hover:border-white/30 transition-all">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-white text-black rounded-2xl">
              <Briefcase size={24} />
            </div>
            <span className="text-white text-[10px] font-black tracking-widest">+12%</span>
          </div>
          <div>
            <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">System Output</h3>
            <p className="text-2xl font-black mt-1">EFFICIENT</p>
          </div>
        </div>

        <div className="glass p-8 rounded-3xl space-y-4 border border-white/10 hover:border-white/30 transition-all">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-white text-black rounded-2xl">
              <Star size={24} />
            </div>
            <span className="text-white text-[10px] font-black tracking-widest">OPTIMAL</span>
          </div>
          <div>
            <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Readiness</h3>
            <p className="text-2xl font-black mt-1">NOMINAL</p>
          </div>
        </div>

        <div className="glass p-8 rounded-3xl space-y-4 border border-white/10 hover:border-white/30 transition-all">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-white text-black rounded-2xl">
              <ShieldCheck size={24} />
            </div>
            <span className="text-white text-[10px] font-black tracking-widest">SECURE</span>
          </div>
          <div>
            <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Leon Security</h3>
            <p className="text-2xl font-black mt-1">SHIELDED</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Chart */}
        <div className="glass p-8 rounded-3xl border border-white/10">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-zinc-400">Workflow Optimization</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{background: '#000000', border: '1px solid #333333', borderRadius: '12px'}}
                />
                <Bar dataKey="tasks" radius={[2, 2, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Suggestions */}
        <div className="glass p-8 rounded-3xl flex flex-col border border-white/10">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-zinc-400">Leon Neural Feed</h2>
          <div className="space-y-4 flex-1">
            {[
              { text: `Hinglish Mode: Enabled. Main aapse Hinglish mein baat karne ke liye taiyaar hoon.`, icon: MessageCircle },
              { text: `Automation: Project milestones are drafted. Delivery pending.`, icon: Laptop },
              { text: `Mail: You have unread work emails. Leon can summarize them for you.`, icon: Mail },
              { text: `Wake word 'Hey Leon' is active. Listening to authorized user.`, icon: Zap }
            ].map((msg, idx) => (
              <div key={idx} className="flex gap-4 p-5 rounded-2xl border border-white/5 hover:border-white/20 transition-all group">
                <div className="text-white mt-1 opacity-50 group-hover:opacity-100"><msg.icon size={20} /></div>
                <p className="text-zinc-400 group-hover:text-white transition-colors text-sm font-medium leading-relaxed">{msg.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
