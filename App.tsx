import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  CloudArrowUpIcon, 
  LinkIcon, 
  SparklesIcon, 
  ArrowDownTrayIcon,
  VideoCameraIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stars, setStars] = useState<Array<{ id: number; style: React.CSSProperties }>>([]);
  const [isMounted, setIsMounted] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
    
    // Generate stars on client only to avoid React hydration errors
    const generatedStars = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      style: {
        position: 'absolute' as const,
        backgroundColor: 'white',
        borderRadius: '50%',
        opacity: Math.random() * 0.5 + 0.2,
        width: (Math.random() * 3 + 1) + 'px',
        height: (Math.random() * 3 + 1) + 'px',
        left: (Math.random() * 100) + '%',
        top: (Math.random() * 100) + '%',
        animation: `twinkle ${(Math.random() * 4 + 2).toFixed(2)}s ease-in-out infinite`
      }
    }));
    setStars(generatedStars);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setVideoUrl('');
      setError(null);
    }
  };

  const handleProcess = async () => {
    if (!file && !videoUrl) {
      setError('Please provide a video file or a link.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      // Simulate progress steps
      const steps = 20;
      for (let i = 0; i <= steps; i++) {
        await new Promise(resolve => setTimeout(resolve, 150));
        setProgress(Math.floor((i / steps) * 100));
      }

      // Placeholder result
      setResultVideo('https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4');
    } catch (err) {
      console.error(err);
      setError('The AI processing failed. Please try again later.');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setVideoUrl('');
    setResultVideo(null);
    setProgress(0);
    setError(null);
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#020617] text-slate-100 flex flex-col items-center justify-center p-4">
      {/* Background Stars */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {stars.map(star => (
          <div key={star.id} className="star" style={star.style} />
        ))}
      </div>

      <div className="w-full max-w-4xl relative z-10 py-12">
        <header className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <SparklesIcon className="w-16 h-16 text-amber-400 animate-pulse" />
              <HeartIcon className="w-6 h-6 text-pink-500 absolute -bottom-1 -right-1" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-royal font-bold gold-shimmer tracking-widest mb-2">
            Princess WM
          </h1>
          <p className="text-slate-400 uppercase tracking-[0.3em] text-sm">Royal Quality Watermark Removal</p>
        </header>

        <main className="royal-panel rounded-[2rem] p-6 md:p-12 relative overflow-hidden min-h-[400px] flex flex-col justify-center">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-amber-400/20 border-t-amber-400 rounded-full animate-spin"></div>
                <SparklesIcon className="w-8 h-8 text-amber-400 absolute inset-0 m-auto" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-royal font-bold gold-shimmer mb-2">Purifying...</h3>
                <p className="text-slate-500 italic">Polishing pixels with royal grace</p>
              </div>
              <div className="w-full max-w-md bg-white/5 h-2 rounded-full overflow-hidden border border-white/10">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-amber-400/60 font-mono">{progress}%</span>
            </div>
          ) : !resultVideo ? (
            <div className="space-y-8">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`group border-2 border-dashed border-white/10 rounded-3xl p-10 text-center cursor-pointer transition-all hover:border-amber-400/40 hover:bg-white/5 ${file ? 'border-amber-400/40 bg-amber-400/5' : ''}`}
              >
                <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="video/*" />
                <CloudArrowUpIcon className="w-12 h-12 mx-auto mb-4 text-amber-400/50 group-hover:text-amber-400 transition-all" />
                <h2 className="text-xl font-royal font-semibold mb-1">
                  {file ? file.name : 'Choose Royal Scroll'}
                </h2>
                <p className="text-slate-500 text-sm">Select a video file to purify</p>
              </div>

              <div className="flex items-center gap-4 text-slate-600">
                <div className="h-px flex-1 bg-white/10"></div>
                <span className="text-[10px] uppercase tracking-widest">or paste link</span>
                <div className="h-px flex-1 bg-white/10"></div>
              </div>

              <div className="relative">
                <LinkIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-amber-400/50" />
                <input 
                  type="text" 
                  value={videoUrl}
                  onChange={(e) => { setVideoUrl(e.target.value); setFile(null); }}
                  placeholder="https://video-link.com/..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-amber-400/50 transition-all"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
                  <ExclamationCircleIcon className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <button 
                onClick={handleProcess}
                className="btn-royal w-full bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 py-5 rounded-xl font-royal font-bold text-lg tracking-widest shadow-xl"
              >
                Commence Purification
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-700">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-royal font-bold flex items-center gap-2">
                  <CheckCircleIcon className="w-6 h-6 text-green-400" />
                  Purified Cut
                </h3>
                <button onClick={reset} className="text-amber-400/60 hover:text-amber-400 text-xs uppercase tracking-widest font-bold">
                  Purify New
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden border border-white/10 bg-black aspect-video shadow-2xl">
                <video src={resultVideo} controls className="w-full h-full" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a 
                  href={resultVideo} 
                  download 
                  className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 py-4 rounded-xl font-royal font-semibold transition-all"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  Download 1080p
                </a>
                <a 
                  href={resultVideo} 
                  download 
                  className="flex items-center justify-center gap-2 princess-gradient py-4 rounded-xl font-royal font-bold shadow-lg"
                >
                  <VideoCameraIcon className="w-5 h-5" />
                  Royal 4K Cut
                </a>
              </div>
            </div>
          )}
        </main>

        <footer className="mt-12 text-center opacity-40">
          <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">
            Princess WM • Powered by Sovereign AI
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;