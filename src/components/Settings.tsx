import React, { useState } from 'react';
import { Shield, Key, Copy, Check, Info, Globe, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

interface SettingsProps {
  user: any;
  getToken: () => Promise<string | null>;
}

export function Settings({ user, getToken }: SettingsProps) {
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingToken, setLoadingToken] = useState(false);

  const fetchAndCopyToken = async () => {
    setLoadingToken(true);
    const t = await getToken();
    setToken(t);
    if (t) {
      navigator.clipboard.writeText(t);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setLoadingToken(false);
  };

  return (
    <div className="p-10 max-w-4xl mx-auto space-y-8">
      <div className="mb-10">
         <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
         <p className="text-gray-500 mt-2">Manage your authentication methods and developer keys.</p>
      </div>

      <div className="grid gap-6">
        {/* User Info Card */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-blue-50">
                 {user?.email?.[0].toUpperCase() || user?.phoneNumber?.[0] || 'U'}
              </div>
              <div>
                 <p className="text-xl font-bold text-gray-900">{user?.displayName || 'Active User'}</p>
                 <p className="text-gray-500">{user?.email || user?.phoneNumber || 'No identifier stored'}</p>
              </div>
           </div>
           <div className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-widest border border-green-100 flex items-center gap-2">
              <Shield size={14} /> Verified Account
           </div>
        </div>

        {/* JWT API Session Card */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                    <Key size={20} />
                 </div>
                 <div>
                    <h3 className="font-bold text-gray-900">API Session JWT</h3>
                    <p className="text-xs text-gray-400">Use this token for programmatic access to the MD2PDF Pro API.</p>
                 </div>
              </div>
              <button 
                onClick={fetchAndCopyToken}
                disabled={loadingToken}
                className={cn(
                  "px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
                  copied 
                    ? "bg-green-600 text-white" 
                    : "bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-100"
                )}
              >
                {loadingToken ? 'Generating...' : copied ? <><Check size={16}/> Copied</> : <><Copy size={16}/> Copy JWT</>}
              </button>
           </div>

           {token && (
             <div className="p-4 bg-gray-900 rounded-xl font-mono text-[10px] text-gray-400 break-all overflow-hidden border border-gray-800 relative">
                <div className="absolute top-2 right-2 bg-purple-600 text-[8px] text-white px-2 py-0.5 rounded font-black uppercase">Live Session Token</div>
                {token}
             </div>
           )}

           <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-xs text-blue-700 flex gap-4">
              <Info className="flex-shrink-0" size={16} />
              <p>This token is valid for 1 hour. Never share your JWT in public screenshots or with untrusted parties. It grants full access to your projects via our CLI/API.</p>
           </div>
        </div>

        {/* Authorized Domains Fix Card */}
        <div className="bg-amber-50 p-8 rounded-3xl border border-amber-100 space-y-6">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                 <Globe size={20} />
              </div>
              <div>
                 <h3 className="font-bold text-gray-900">Domain Whitelisting (Localhost Fix)</h3>
                 <p className="text-xs text-amber-600/70">Required for Google OAuth and OTP verification in the AI Studio environment.</p>
              </div>
           </div>

           <div className="space-y-3">
              <div className="p-4 bg-white/50 rounded-xl border border-amber-200">
                <p className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-2">
                   <AlertTriangle size={14} /> Add these to Firebase Authorized Domains:
                </p>
                <div className="space-y-1 font-mono text-[10px] text-amber-800">
                   <div className="p-2 bg-white rounded border border-amber-100 select-all">ais-dev-okls6c2auho2wrcswqvabc-780209537311.asia-southeast1.run.app</div>
                   <div className="p-2 bg-white rounded border border-amber-100 select-all">ais-pre-okls6c2auho2wrcswqvabc-780209537311.asia-southeast1.run.app</div>
                </div>
              </div>
              <p className="text-[10px] text-amber-700 italic">Navigate to: <strong>Firebase Console &gt; Auth &gt; Settings &gt; Authorized Domains</strong> to add these.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
