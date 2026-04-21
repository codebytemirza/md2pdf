import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, User, Mail, ShieldCheck, Send, CheckCircle2 } from 'lucide-react';
import { auth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from '../lib/firebase';

interface LoginProps {
  login: () => void;
}

export function Login({ login }: LoginProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [mode, setMode] = useState<'google' | 'email'>('google');

  useEffect(() => {
    // Handle the incoming sign-in link
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let emailForSignIn = window.localStorage.getItem('emailForSignIn');
      if (!emailForSignIn) {
        emailForSignIn = window.prompt('Please provide your email for confirmation');
      }
      
      if (emailForSignIn) {
        setLoading(true);
        signInWithEmailLink(auth, emailForSignIn, window.location.href)
          .then(() => {
            window.localStorage.removeItem('emailForSignIn');
          })
          .catch((err) => {
            setError(err.message);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  }, []);

  const handleSendLink = async () => {
    setError('');
    setLoading(true);
    try {
      const actionCodeSettings = {
        url: window.location.href, // Redirect back to this same page
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setEmailSent(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send link');
    } finally {
      setLoading(false);
    }
  };

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
        <p className="text-center text-gray-500 mb-8 font-medium">Elevate your markdown with production-grade PDF conversion.</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium flex items-center gap-2">
            <ShieldCheck size={14} /> {error}
          </div>
        )}

        {emailSent ? (
          <div className="text-center space-y-6">
             <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                <CheckCircle2 size={40} />
             </div>
             <div>
                <h3 className="text-xl font-bold text-gray-900">Check your email</h3>
                <p className="text-gray-500 mt-2 text-sm">We've sent a secure login link to <strong>{email}</strong>. Open the link to sign in automatically.</p>
             </div>
             <button 
                onClick={() => setEmailSent(false)}
                className="text-sm text-blue-600 font-bold hover:underline"
              >
                Use a different email
              </button>
          </div>
        ) : mode === 'google' ? (
          <div className="space-y-4">
             <button 
                onClick={login}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center transition-all transform hover:scale-[1.02] shadow-md active:scale-95"
              >
                <User className="mr-2" size={20} />
                Continue with Google
              </button>
              <button 
                onClick={() => setMode('email')}
                className="w-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold py-4 rounded-xl flex items-center justify-center transition-all shadow-sm"
              >
                <Mail className="mr-2" size={20} />
                Sign in with Email Link
              </button>
          </div>
        ) : (
          <div className="space-y-4">
             <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all"
                />
             </div>
             <button 
              onClick={handleSendLink}
              disabled={loading || !email}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center transition-all transform hover:scale-[1.02] shadow-md active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Sending...' : <><Send className="mr-2" size={18} /> Send Login Link</>}
            </button>
            
             <button 
                onClick={() => setMode('google')}
                className="w-full text-sm text-gray-400 font-bold hover:text-blue-600 transition-colors"
                disabled={loading}
              >
                Back to social login
              </button>
          </div>
        )}

        <div className="mt-10 p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <p className="text-[10px] text-blue-800 font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
             <ShieldCheck size={10} /> Passwordless Technology
          </p>
          <p className="text-[9px] text-blue-700 leading-tight">
            Email link authentication is a secure, JWT-backed way to sign in without remembering passwords. The link acts as a one-time proof of identity.
          </p>
        </div>
        
        <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100">
          <p className="text-[10px] text-amber-800 font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
             <ShieldCheck size={10} /> Authorized Domains required
          </p>
          <div className="space-y-1 font-mono text-[9px] text-amber-700 leading-tight">
            <p className="mb-1">Firebase requires you to whitelist these domains in <strong>Auth &gt; Settings &gt; Authorized Domains</strong>:</p>
            <div className="p-1.5 bg-white/50 rounded border border-amber-200 select-all font-bold">hearings-presidential-automobile-blogging.trycloudflare.com</div>
            <div className="p-1.5 bg-white/50 rounded border border-amber-200 select-all">ais-dev-okls6c2auho2wrcswqvabc-780209537311.asia-southeast1.run.app</div>
          </div>
        </div>

        <p className="text-[10px] text-center text-gray-400 mt-6 font-mono tracking-widest uppercase">Secure JWT Access</p>
      </motion.div>
    </div>
  );
}
