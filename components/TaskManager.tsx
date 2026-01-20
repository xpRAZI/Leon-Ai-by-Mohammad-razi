
import React, { useState } from 'react';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { PermissionsState } from '../types';

interface TaskManagerProps {
  permissions: PermissionsState;
  onTaskComplete: (key: keyof PermissionsState) => void;
}

const TaskManager: React.FC<TaskManagerProps> = ({ permissions, onTaskComplete }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const tasks = [
    { id: '1', title: 'Review Project Phoenix Documents', category: 'work', time: '10:00 AM', status: 'completed' },
    { id: '2', title: 'Email Q3 Report to Stakeholders', category: 'work', time: '12:30 PM', status: 'pending' },
    { id: '3', title: 'Prepare for Evening Presentation', category: 'work', time: '02:00 PM', status: 'pending' },
  ];

  const handleAction = (label: string) => {
    if (permissions.appAccess === 'off') {
       setErrorMsg("PERMISSION DENIED: App access is disabled. Go to Settings.");
       return;
    }
    setErrorMsg(null);
    alert(`Triggering: ${label}`);
    onTaskComplete('appAccess');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 flex flex-col animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Workspace</h1>
      </header>

      {errorMsg && (
        <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-3xl flex items-center gap-4 text-red-400 text-xs font-black uppercase tracking-widest">
           <ShieldAlert size={20} /> {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-8 rounded-3xl space-y-6 border border-white/10">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Neural Actions</h3>
            <div className="space-y-2">
              <button onClick={() => handleAction('DRAFT REPORT')} className="w-full text-left px-5 py-4 rounded-xl text-[10px] font-black uppercase bg-white/5 border border-white/5 hover:bg-white hover:text-black transition-all">
                DRAFT REPORT
              </button>
              <button onClick={() => handleAction('SYNC DATA')} className="w-full text-left px-5 py-4 rounded-xl text-[10px] font-black uppercase bg-white/5 border border-white/5 hover:bg-white hover:text-black transition-all">
                SYNC DATA
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="glass p-6 rounded-3xl flex items-center gap-8 border border-white/10">
              <CheckCircle2 size={24} className={task.status === 'completed' ? 'text-blue-500' : 'text-zinc-800'} />
              <div className="flex-1">
                <h4 className={`font-black text-sm uppercase ${task.status === 'completed' ? 'text-zinc-600 line-through' : ''}`}>{task.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskManager;
