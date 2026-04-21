import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, limit, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { Shield, User, Mail, Settings, BadgeAlert, CheckCircle } from 'lucide-react';

export function AdminPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleAdmin = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    await updateDoc(doc(db, 'users', userId), { role: newRole });
  };

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-10">
         <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
            <Shield className="text-red-600" size={24} />
         </div>
         <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-500">Manage user roles and platform permissions.</p>
         </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">User</th>
                  <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Email</th>
                  <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
                  <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
               </tr>
            </thead>
            <tbody>
               {users.map((u) => (
                 <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-5">
                       <div className="flex items-center gap-3">
                          <img src={u.photoURL} alt="" className="w-8 h-8 rounded-full bg-gray-100" referrerPolicy="no-referrer" />
                          <span className="font-semibold text-gray-900 text-sm">{u.name}</span>
                       </div>
                    </td>
                    <td className="p-5 text-sm text-gray-500">{u.email}</td>
                    <td className="p-5">
                       {u.role === 'admin' ? (
                         <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 w-fit">
                           <Shield size={10} /> Admin
                         </span>
                       ) : (
                         <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 w-fit">
                           <User size={10} /> User
                         </span>
                       )}
                    </td>
                    <td className="p-5 text-right">
                       <button 
                         onClick={() => toggleAdmin(u.id, u.role)}
                         className="text-xs font-bold text-blue-600 hover:underline"
                       >
                         {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                       </button>
                    </td>
                 </tr>
               ))}
            </tbody>
         </table>
         {loading && <div className="p-10 text-center text-gray-400 animate-pulse">Loading users...</div>}
      </div>
    </div>
  );
}
