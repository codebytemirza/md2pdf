import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { 
  FileText, 
  Settings, 
  Plus, 
  LogOut, 
  User, 
  Layers, 
  Download, 
  Upload, 
  History, 
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
  Eye,
  FileCode,
  Users,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Editor } from './components/Editor';
import { ProjectList } from './components/ProjectList';
import { AdminPanel } from './components/AdminPanel';
import { Notifications } from './components/Notifications';
import { BatchConverter } from './components/BatchConverter';
import { cn } from './lib/utils';
import { db } from './lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

type View = 'dashboard' | 'editor' | 'batch' | 'admin' | 'settings';

export default function App() {
  const { user, loading, isAdmin, login, logout } = useAuth();
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'notifications'), where('userId', '==', user.uid), where('read', '==', false));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setNotificationCount(snapshot.size);
      });
      return () => unsubscribe();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center p-6 bg-gradient-to-br from-blue-50 to-white">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 border border-blue-100"
        >
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-6">
              <FileText className="text-white w-10 h-10 -rotate-6" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-2">MD2PDF Pro</h1>
          <p className="text-center text-gray-500 mb-8">Elevate your markdown with production-grade PDF conversion and team collaboration.</p>
          <button 
            onClick={login}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center transition-all transform hover:scale-105 shadow-md active:scale-95"
          >
            <User className="mr-2" size={20} />
            Continue with Google
          </button>
          <p className="text-xs text-center text-gray-400 mt-6 font-mono">SECURE ACCESS VIA FIREBASE AUTH</p>
        </motion.div>
      </div>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <ProjectList onSelectProject={(id) => { setSelectedProjectId(id); setActiveView('editor'); }} />;
      case 'batch':
        return <BatchConverter />;
      case 'editor':
        return <Editor projectId={selectedProjectId} onBack={() => setActiveView('dashboard')} />;
      case 'admin':
        return isAdmin ? <AdminPanel /> : <div>Access Denied</div>;
      default:
        return <ProjectList onSelectProject={(id) => { setSelectedProjectId(id); setActiveView('editor'); }} />;
    }
  };

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-white border-r border-gray-200 flex flex-col relative z-20 shadow-sm"
      >
        <div className="p-6 flex items-center justify-between">
          <div className={cn("flex items-center gap-3", !isSidebarOpen && "hidden")}>
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <FileText className="text-white w-5 h-5" />
             </div>
             <span className="font-bold text-lg text-gray-900 tracking-tight">MD2PDF Pro</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            {isSidebarOpen ? <X size={18} className="text-gray-500" /> : <Menu size={18} className="text-gray-500" />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto overflow-x-hidden">
          <SidebarItem 
            icon={<Layers size={20}/>} 
            label="Dashboard" 
            active={activeView === 'dashboard'} 
            onClick={() => setActiveView('dashboard')} 
            collapsed={!isSidebarOpen} 
          />
          <SidebarItem 
            icon={<Upload size={20}/>} 
            label="Batch Convert" 
            active={activeView === 'batch'} 
            onClick={() => setActiveView('batch')} 
            collapsed={!isSidebarOpen} 
          />
          <SidebarItem 
            icon={<FileCode size={20}/>} 
            label="Editor" 
            active={activeView === 'editor'} 
            onClick={() => setActiveView('editor')} 
            collapsed={!isSidebarOpen} 
          />
          {isAdmin && (
            <SidebarItem 
              icon={<ShieldCheck size={20}/>} 
              label="Admin Panel" 
              active={activeView === 'admin'} 
              onClick={() => setActiveView('admin')} 
              collapsed={!isSidebarOpen} 
            />
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
           <div className="flex items-center gap-3 p-2 group cursor-pointer hover:bg-gray-50 rounded-xl transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-100 overflow-hidden border-2 border-transparent group-hover:border-blue-400">
                 <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="Avatar" referrerPolicy="no-referrer" />
              </div>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user.displayName || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              )}
           </div>
           <button 
             onClick={logout}
             className={cn(
               "w-full mt-4 flex items-center justify-center p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all",
               !isSidebarOpen && "px-0"
             )}
           >
             <LogOut size={20} />
             {isSidebarOpen && <span className="ml-3 font-medium">Logout</span>}
           </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden h-full">
         <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shadow-sm relative z-10">
            <div>
               <h2 className="text-xl font-bold text-gray-900">{activeView.charAt(0).toUpperCase() + activeView.slice(1)}</h2>
               <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-0.5">Workspace / {activeView}</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="relative">
                 <Bell className="text-gray-400 hover:text-blue-600 cursor-pointer transition-colors" size={22} />
                 {notificationCount > 0 && (
                   <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                     {notificationCount}
                   </span>
                 )}
               </div>
               <div className="h-8 w-[1px] bg-gray-100"></div>
               <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2">
                 <Plus size={18} /> New Project
               </button>
            </div>
         </header>

         <div className="flex-1 overflow-auto bg-gray-50">
            {renderView()}
         </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick, collapsed }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, collapsed: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center w-full p-3.5 rounded-xl transition-all relative group",
        active 
          ? "bg-blue-50 text-blue-700" 
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
        collapsed && "justify-center px-0"
      )}
    >
      <div className={cn("transition-transform group-active:scale-90", active && "text-blue-600")}>
        {icon}
      </div>
      {!collapsed && <span className="ml-4 font-semibold text-sm tracking-tight">{label}</span>}
      {active && !collapsed && (
        <motion.div 
          layoutId="sidebar-active"
          className="absolute right-3 w-1.5 h-1.5 bg-blue-600 rounded-full"
        />
      )}
      {collapsed && (
        <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
          {label}
        </div>
      )}
    </button>
  );
}
