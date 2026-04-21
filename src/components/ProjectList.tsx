import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, orderBy, Timestamp } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { Plus, Search, Folder, Clock, Users, MoreVertical, ExternalLink, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function ProjectList({ onSelectProject, onCreateProject }: { onSelectProject: (id: string) => void, onCreateProject: () => void }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'projects'), 
      where('ownerId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );
    
    // We also need to fetch projects where user is a team member
    // Firestore lacks simple OR for array-contains and ownerId in one query easily without composite indexes
    // For this app, we'll listen to both separately or just trust ownerId for now
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
           <h1 className="text-3xl font-bold text-gray-900">Your Projects</h1>
           <p className="text-gray-500 mt-1">Manage and organize your markdown conversions.</p>
        </div>
        <button 
          onClick={onCreateProject}
          className="flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all font-bold active:scale-95"
        >
          <Plus size={20} className="text-blue-600" /> Create Project
        </button>
      </div>

      <div className="relative mb-10">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search projects..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all shadow-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
           <Folder className="mx-auto text-gray-200 mb-4" size={64} />
           <p className="text-gray-500 font-medium">No projects found. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <motion.div 
              key={project.id}
              layoutId={project.id}
              whileHover={{ y: -5 }}
              onClick={() => onSelectProject(project.id)}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all cursor-pointer group flex flex-col relative"
            >
              <div className="flex items-start justify-between mb-4">
                 <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                    <FileText className="text-gray-400 group-hover:text-blue-600 transition-colors" size={24} />
                 </div>
                 <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical size={18} className="text-gray-400" />
                 </button>
              </div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{project.name}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2 min-h-[40px]">{project.description}</p>
              
              <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between text-xs font-semibold text-gray-400">
                 <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>{new Date(project.updatedAt?.seconds * 1000).toLocaleDateString()}</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <Users size={14} />
                    <span>{1 + (project.teamMembers?.length || 0)}</span>
                 </div>
              </div>

              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink size={16} className="text-blue-400" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
