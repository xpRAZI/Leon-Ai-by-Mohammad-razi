
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Mic, Image, CheckSquare, Settings as SettingsIcon, Cpu, Clock, Library, Share2, MessageSquareText } from 'lucide-react';
import Dashboard from './components/Dashboard';
import LiveAssistant from './components/LiveAssistant';
import CreatorHub from './components/CreatorHub';
import TaskManager from './components/TaskManager';
import SystemControl from './components/SystemControl';
import History from './components/History';
import LibraryPage from './components/Library';
import SocialManager from './components/SocialManager';
import NeuralChat from './components/NeuralChat';
import Settings from './components/Settings';
import Auth from './components/Auth';
import { PermissionsState, PermissionStatus, User } from './types';

const DEFAULT_PERMISSIONS: PermissionsState = {
  camera: 'off',
  microphone: 'off',
  imageGen: 'off',
  videoGen: 'off',
  fileAccess: 'off',
  appAccess: 'off',
  systemControl: 'off',
  internetAccess: 'off'
};

const LeonLogo = () => (
  <svg viewBox="0 0 100 100" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 35V65H45" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
    <path d="M35 50H55M35 35H60M35 65H60" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
    <circle cx="65" cy="50" r="15" stroke="currentColor" strokeWidth="6"/>
    <path d="M75 35V65L90 35V65" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
  </svg>
);

const App: React.FC = () => {
  // Fix: Added user state to track session
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('leon_user_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [permissions, setPermissions] = useState<PermissionsState>(() => {
    const saved = localStorage.getItem('leon_permissions_global');
    if (saved) {
      const parsed = JSON.parse(saved);
      const validated = { ...parsed };
      Object.keys(validated).forEach(key => {
        if (validated[key as keyof PermissionsState] === 'temporary') {
          validated[key as keyof PermissionsState] = 'off';
        }
      });
      return validated;
    }
    return DEFAULT_PERMISSIONS;
  });

  useEffect(() => {
    localStorage.setItem('leon_permissions_global', JSON.stringify(permissions));
  }, [permissions]);

  // Fix: Persist user session to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('leon_user_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('leon_user_session');
    }
  }, [user]);

  const updatePermission = (key: keyof PermissionsState, status: PermissionStatus) => {
    setPermissions(prev => ({ ...prev, [key]: status }));
  };

  const resetTemporaryPermission = (key: keyof PermissionsState) => {
    if (permissions[key] === 'temporary') {
      updatePermission(key, 'off');
    }
  };

  // Fix: Render Auth component if user is not authenticated
  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  return (
    <Router>
      <div className="flex min-h-screen bg-[#020202] text-white">
        <Sidebar />
        <main className="flex-1 ml-20 md:ml-64 p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chat" element={<NeuralChat permissions={permissions} onTaskComplete={resetTemporaryPermission} />} />
            <Route path="/live" element={<LiveAssistant permissions={permissions} onTaskComplete={resetTemporaryPermission} />} />
            <Route path="/history" element={<History />} />
            <Route path="/creator" element={<CreatorHub permissions={permissions} onTaskComplete={resetTemporaryPermission} />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/tasks" element={<TaskManager permissions={permissions} onTaskComplete={resetTemporaryPermission} />} />
            {/* Fix: Passed user prop to SocialManager */}
            <Route path="/social" element={<SocialManager user={user} permissions={permissions} onTaskComplete={resetTemporaryPermission} />} />
            <Route path="/system" element={<SystemControl permissions={permissions} onTaskComplete={resetTemporaryPermission} />} />
            <Route path="/settings" element={<Settings permissions={permissions} onUpdate={updatePermission} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/chat', icon: MessageSquareText, label: 'Neural Chat' },
    { path: '/live', icon: Mic, label: 'Leon Live' },
    { path: '/history', icon: Clock, label: 'History' },
    { path: '/creator', icon: Image, label: 'Creator Hub' },
    { path: '/library', icon: Library, label: 'Library' },
    { path: '/tasks', icon: CheckSquare, label: 'Work & Tasks' },
    { path: '/social', icon: Share2, label: 'Social Hub' },
    { path: '/system', icon: Cpu, label: 'System' },
  ];

  return (
    <nav className="fixed left-0 top-0 h-screen w-20 md:w-64 glass flex flex-col z-50 border-r border-white/10 shadow-2xl">
      <div className="p-6 flex items-center gap-3">
        <div className="flex items-center justify-center text-blue-500">
          <LeonLogo />
        </div>
        <span className="hidden md:block font-black text-2xl tracking-tighter text-white uppercase">LEON</span>
      </div>
      
      <div className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 relative group ${
              isActive(item.path) 
                ? 'bg-blue-600 text-white shadow-[0_0_25px_rgba(37,99,235,0.4)]' 
                : 'text-zinc-500 hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.icon size={22} />
            <span className="hidden md:block font-bold text-sm tracking-tight">{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="p-4 mt-auto border-t border-white/5 space-y-2">
        <Link 
          to="/settings"
          className={`flex items-center gap-4 p-4 w-full rounded-xl transition-all ${
            isActive('/settings') ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'
          }`}
        >
          <SettingsIcon size={22} />
          <span className="hidden md:block text-sm font-bold uppercase tracking-widest">Settings</span>
        </Link>
      </div>
    </nav>
  );
};

export default App;
