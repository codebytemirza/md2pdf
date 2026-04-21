import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, User, Phone, ShieldCheck, Key } from 'lucide-react';
import { auth, setupRecaptcha } from '../lib/firebase';
import { signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

interface LoginProps {
  login: () => void;
}

export function Login({ login }: LoginProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'google' | 'phone'>('google');

  const handleSendCode = async () => {
    setError('');
    setLoading(true);
    try {
      const verifier = setupRecaptcha('recaptcha-container');
      if (!verifier) throw new Error('Recaptcha failed');
      const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      setConfirmationResult(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');
    setLoading(true);
    try {
      if (!confirmationResult) return;
      await confirmationResult.confirm(verificationCode);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Invalid code');
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

        {mode === 'google' ? (
          <div className="space-y-4">
             <button 
                onClick={login}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center transition-all transform hover:scale-[1.02] shadow-md active:scale-95"
              >
                <User className="mr-2" size={20} />
                Continue with Google
              </button>
              <button 
                onClick={() => setMode('phone')}
                className="w-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold py-4 rounded-xl flex items-center justify-center transition-all shadow-sm"
              >
                <Phone className="mr-2" size={20} />
                Use Phone OTP
              </button>
          </div>
        ) : (
          <div className="space-y-4">
             {!confirmationResult ? (
               <>
                 <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="tel"
                      placeholder="+1234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all font-mono"
                    />
                 </div>
                 <button 
                  onClick={handleSendCode}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center transition-all transform hover:scale-[1.02] shadow-md active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send OTP Code'}
                </button>
                <div id="recaptcha-container"></div>
               </>
             ) : (
               <>
                 <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all font-mono tracking-widest text-center text-lg"
                    />
                 </div>
                 <button 
                  onClick={handleVerifyCode}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl flex items-center justify-center transition-all transform hover:scale-[1.02] shadow-md active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
               </>
             )}
             <button 
                onClick={() => { setMode('google'); setConfirmationResult(null); }}
                className="w-full text-sm text-gray-400 font-bold hover:text-blue-600 transition-colors"
                disabled={loading}
              >
                Back to social login
              </button>
          </div>
        )}

        <div className="mt-10 p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
          <p className="text-[10px] text-yellow-800 font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
             <ShieldCheck size={10} /> Authorized Domains Fix
          </p>
          <p className="text-[9px] text-yellow-700 leading-tight">
            If Google login fails, ensure these domains are added to <strong>Firebase Console → Auth → Settings → Authorized Domains</strong>:
            <br />
            1. ais-dev-okls6c2auho2wrcswqvabc-780209537311.asia-southeast1.run.app
            <br />
            2. ais-pre-okls6c2auho2wrcswqvabc-780209537311.asia-southeast1.run.app
          </p>
        </div>
        
        <p className="text-[10px] text-center text-gray-400 mt-6 font-mono tracking-widest">SECURE JWT-BASED ACCESS</p>
      </motion.div>
    </div>
  );
}
