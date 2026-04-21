import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, updateDoc, Timestamp } from 'firebase/firestore';
import { 
    ArrowLeft, 
    Download, 
    Settings as SettingsIcon, 
    Share2, 
    Save, 
    Eye, 
    EyeOff, 
    Sparkles, 
    Columns,
    Type,
    Maximize2,
    CheckCircle2,
    Loader2,
    Printer,
    X as XIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { PDF_TEMPLATES } from '../constants/templates';
import { summarizeMarkdown } from '../services/aiService';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';

export function Editor({ projectId, onBack }: { projectId: string | null, onBack: () => void }) {
  const [project, setProject] = useState<any>(null);
  const [content, setContent] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const saveTimeout = useRef<any>(null);

  useEffect(() => {
    if (!projectId) return;
    const unsubscribe = onSnapshot(doc(db, 'projects', projectId), (snapshot) => {
      if (snapshot.exists()) {
        const data = { id: snapshot.id, ...(snapshot.data() as any) };
        setProject(data);
        if (!content) setContent(data?.content || '');
      }
    });
    return () => unsubscribe();
  }, [projectId]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setSaveStatus('saving');

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      try {
        if (projectId) {
          await updateDoc(doc(db, 'projects', projectId), {
            content: newContent,
            updatedAt: Timestamp.now()
          });
          setSaveStatus('saved');
        }
      } catch (err) {
        setSaveStatus('error');
      }
    }, 1000);
  };

  const updateSettings = async (newSettings: any) => {
    if (!projectId || !project) return;
    const mergedSettings = { ...project.settings, ...newSettings };
    await updateDoc(doc(db, 'projects', projectId), {
      settings: mergedSettings,
      updatedAt: Timestamp.now()
    });
  };

  const handleConvert = async (format: 'pdf' | 'html' = 'pdf') => {
    setIsConverting(true);
    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markdown: content,
          config: project.settings,
          outputFormat: format,
          customCss: project.settings.customCss,
          watermark: project.settings.watermark,
        })
      });

      if (!response.ok) throw new Error('Conversion failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#3b82f6', '#60a5fa']
      });
    } catch (err) {
      alert('Failed to generate file');
    } finally {
      setIsConverting(false);
    }
  };

  const handleAiSummary = async () => {
    setIsAiLoading(true);
    const summary = await summarizeMarkdown(content);
    setAiSummary(summary);
    setIsAiLoading(false);
  };

  if (!project) return null;

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Editor Header */}
      <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <div className="h-6 w-[1px] bg-gray-200"></div>
          <div>
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              {project.name}
              {saveStatus === 'saving' ? (
                 <Loader2 size={14} className="text-blue-500 animate-spin" />
              ) : (
                 <CheckCircle2 size={14} className={cn("transition-opacity", saveStatus === 'saved' ? "text-green-500" : "opacity-0")} />
              )}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsPreviewOpen(!isPreviewOpen)}
            className={cn(
              "p-2.5 rounded-xl transition-all border",
              isPreviewOpen ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
            )}
          >
            {isPreviewOpen ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={cn(
              "p-2.5 rounded-xl transition-all border",
              isSettingsOpen ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
            )}
          >
            <SettingsIcon size={20} />
          </button>
          <button 
             onClick={handleAiSummary}
             disabled={isAiLoading}
             className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all disabled:opacity-50"
             title="AI Summary"
          >
             {isAiLoading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
          </button>
          <div className="h-6 w-[1px] bg-gray-200 mx-1"></div>
          <button 
            onClick={() => handleConvert('pdf')}
            disabled={isConverting}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isConverting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            Generate PDF
          </button>
          <button 
            onClick={() => handleConvert('html')}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-all"
            title="Export HTML"
          >
            <Sparkles size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Workspace */}
        <div className="flex-1 flex overflow-hidden">
          {/* Markdown Input */}
          <div className={cn("flex-1 h-full flex flex-col transition-all", isPreviewOpen ? "w-1/2" : "w-full")}>
            <textarea 
              value={content}
              onChange={handleContentChange}
              placeholder="Paste your markdown here..."
              className="flex-1 w-full p-10 font-mono text-sm resize-none outline-none text-gray-800 bg-white"
            />
          </div>

          {/* Real-time Preview */}
          {isPreviewOpen && (
            <div className="w-1/2 h-full bg-gray-50 border-l border-gray-100 flex flex-col">
               <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Eye size={12} /> Live Preview
                  </span>
                  <div className="flex gap-2">
                     <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Maximize2 size={14} className="text-gray-400" /></button>
                  </div>
               </div>
               
               {aiSummary && (
                 <div className="m-10 mb-0 p-6 bg-blue-50 border border-blue-100 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => setAiSummary(null)} className="text-blue-400 hover:text-blue-600"><XIcon size={14} /></button>
                    </div>
                    <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                       <Sparkles size={12} /> AI Summary
                    </h4>
                    <p className="text-sm text-blue-800 leading-relaxed font-medium">{aiSummary}</p>
                 </div>
               )}

               <div className="flex-1 overflow-auto p-10 prose prose-blue max-w-none prose-img:rounded-xl">
                  <Markdown>{content || '*Preview will appear here...*'}</Markdown>
               </div>
            </div>
          )}
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {isSettingsOpen && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute top-0 right-0 h-full w-80 bg-white border-l border-gray-200 shadow-2xl z-30 flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <SettingsIcon size={18} /> Output Settings
                </h3>
                <button onClick={() => setIsSettingsOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><XIcon size={18} /></button>
              </div>
              
              <div className="flex-1 overflow-auto p-6 space-y-8">
                {/* Template Selection */}
                <div>
                   <label className="text-sm font-bold text-gray-900 block mb-3 uppercase tracking-tighter">PDF Style Template</label>
                   <div className="grid grid-cols-1 gap-3">
                      {PDF_TEMPLATES.slice(0, 10).map(t => (
                        <button 
                          key={t.id}
                          onClick={() => updateSettings({ template: t.id, customCss: t.css })}
                          className={cn(
                            "w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group",
                            project.settings.template === t.id ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100" : "border-gray-200 hover:border-blue-400"
                          )}
                        >
                          <div>
                            <p className={cn("text-sm font-bold", project.settings.template === t.id ? "text-blue-700" : "text-gray-700")}>{t.name}</p>
                            <p className="text-[10px] text-gray-400">{t.description}</p>
                          </div>
                          {project.settings.template === t.id && <CheckCircle2 size={16} className="text-blue-600" />}
                        </button>
                      ))}
                   </div>
                </div>

                {/* Page Setup */}
                <div className="space-y-4">
                   <label className="text-sm font-bold text-gray-900 block mb-3 uppercase tracking-tighter">Page Setup</label>
                   <div>
                      <p className="text-xs text-gray-500 mb-2 font-medium">Paper Size</p>
                      <select 
                        value={project.settings.paperSize}
                        onChange={(e) => updateSettings({ paperSize: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-blue-400"
                      >
                         <option value="A4">A4 (Standard)</option>
                         <option value="Letter">Letter</option>
                         <option value="Legal">Legal</option>
                         <option value="A3">A3</option>
                      </select>
                   </div>
                   <div>
                      <p className="text-xs text-gray-500 mb-2 font-medium">Watermark Text</p>
                      <input 
                        type="text" 
                        placeholder="CONFIDENTIAL"
                        value={project.settings.watermark}
                        onChange={(e) => updateSettings({ watermark: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-blue-400 placeholder:text-gray-300"
                      />
                   </div>
                </div>

                {/* Custom CSS */}
                <div>
                   <label className="text-sm font-bold text-gray-900 block mb-3 uppercase tracking-tighter">Advanced Styling (CSS)</label>
                   <textarea 
                     value={project.settings.customCss}
                     onChange={(e) => updateSettings({ customCss: e.target.value })}
                     placeholder="/* Inject custom CSS here */"
                     className="w-full h-40 bg-gray-900 text-green-400 p-4 font-mono text-xs rounded-xl outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                   />
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                 <button 
                   onClick={() => handleConvert('pdf')}
                   className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-blue-200 shadow-blue-100 transition-all flex items-center justify-center gap-2"
                 >
                   <Printer size={18} /> Export Document
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
