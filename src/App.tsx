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
import { Settings as SettingsView } from './components/Settings';
import { Login } from './components/Login';
import { cn } from './lib/utils';
import { db } from './lib/firebase';
import { collection, query, where, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';

type View = 'dashboard' | 'editor' | 'batch' | 'admin' | 'settings';

export default function App() {
  const { user, loading, isAdmin, login, logout, getToken } = useAuth();
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);

  const handleCreateProject = async () => {
    if (!user) return;
    const name = window.confirm('Create a new project?') ? `Project ${Date.now().toString().slice(-4)}` : null;
    if (!name) return;

    try {
      const docRef = await addDoc(collection(db, 'projects'), {
        name,
        description: 'Collaborative markdown project',
        ownerId: user.uid,
        teamMembers: [],
        settings: {
          template: 'minimal',
          paperSize: 'A4',
          margins: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
          customCss: '',
          watermark: '',
          signature: ''
        },
        content: '# New Project\nStart writing...',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      setSelectedProjectId(docRef.id);
      setActiveView('editor');
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

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
    return <Login login={login} />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <ProjectList onSelectProject={(id) => { setSelectedProjectId(id); setActiveView('editor'); }} onCreateProject={handleCreateProject} />;
      case 'batch':
        return <BatchConverter />;
      case 'editor':
        return <Editor projectId={selectedProjectId} onBack={() => { setActiveView('dashboard'); setSelectedProjectId(null); }} />;
      case 'admin':
        return isAdmin ? <AdminPanel /> : <div>Access Denied</div>;
      case 'settings':
        return <SettingsView user={user} getToken={getToken} />;
      default:
        return <ProjectList onSelectProject={(id) => { setSelectedProjectId(id); setActiveView('editor'); }} onCreateProject={handleCreateProject} />;
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
            label="Single Convert" 
            active={activeView === 'editor' && !selectedProjectId} 
            onClick={() => { setSelectedProjectId(null); setActiveView('editor'); }} 
            collapsed={!isSidebarOpen} 
          />
          <SidebarItem 
            icon={<FileCode size={20}/>} 
            label="Editor" 
            active={activeView === 'editor' && !!selectedProjectId} 
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
          <SidebarItem 
            icon={<Settings size={20}/>} 
            label="Settings" 
            active={activeView === 'settings'} 
            onClick={() => setActiveView('settings')} 
            collapsed={!isSidebarOpen} 
          />
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
               <button 
                 onClick={handleCreateProject}
                 className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
               >
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
