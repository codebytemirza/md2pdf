import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Loader2, Download, AlertCircle } from 'lucide-react';
import JSZip from 'jszip';

export function BatchConverter() {
  const [files, setFiles] = useState<{ file: File, id: string, status: 'pending' | 'converting' | 'completed' | 'error' }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(f => ({
      file: f,
      id: Math.random().toString(36).substring(7),
      status: 'pending' as const
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/markdown': ['.md', '.markdown'] }
  });

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const processBatch = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    
    try {
      const items = await Promise.all(files.map(async (f) => ({
        name: f.file.name.replace(/\.[^/.]+$/, ""),
        markdown: await f.file.text(),
      })));

      const response = await fetch('/api/convert-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });

      if (!response.ok) throw new Error('Batch conversion failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `batch-conversion-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      setFiles(prev => prev.map(f => ({ ...f, status: 'completed' })));
    } catch (err) {
      alert('Batch processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <div className="mb-10 text-center">
         <h1 className="text-3xl font-bold text-gray-900">Batch Converter</h1>
         <p className="text-gray-500 mt-2">Upload multiple markdown files to convert them all at once into a ZIP archive.</p>
      </div>

      <div 
        {...getRootProps()} 
        className={`
          border-3 border-dashed rounded-3xl p-16 transition-all cursor-pointer text-center
          ${isDragActive ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 bg-white hover:border-blue-400 hover:bg-gray-50'}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
           <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Upload className="text-blue-600" size={32} />
           </div>
           <p className="text-xl font-bold text-gray-900">Drag & drop markdown files here</p>
           <p className="text-gray-400 mt-1">or click to select files from your computer</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-10 space-y-4">
           <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">{files.length} Files Ready</h3>
              <button 
                onClick={() => setFiles([])}
                className="text-sm text-red-600 font-bold hover:underline"
              >
                Clear All
              </button>
           </div>
           
           <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              {files.map((f) => (
                <div key={f.id} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                         <File className="text-gray-400" size={20} />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-gray-900">{f.file.name}</p>
                         <p className="text-xs text-gray-400">{(f.file.size / 1024).toFixed(1)} KB</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      {f.status === 'completed' && <CheckCircle className="text-green-500" size={18} />}
                      {f.status === 'error' && <AlertCircle className="text-red-500" size={18} />}
                      <button 
                        onClick={() => removeFile(f.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-gray-300 hover:text-red-500 transition-colors"
                      >
                         <X size={18} />
                      </button>
                   </div>
                </div>
              ))}
           </div>

           <button 
             onClick={processBatch}
             disabled={isProcessing}
             className="w-full mt-6 bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
           >
             {isProcessing ? (
               <>
                 <Loader2 size={24} className="animate-spin" />
                 Processing Batch...
               </>
             ) : (
               <>
                 <Download size={24} />
                 Convert & Download All (.zip)
               </>
             )}
           </button>
        </div>
      )}
    </div>
  );
}

function CheckCircle({ className, size }: { className?: string, size?: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
    )
}
