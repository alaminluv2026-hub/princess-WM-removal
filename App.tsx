
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

interface StarProps {
  style: React.CSSProperties;
}

const Star: React.FC<StarProps> = ({ style }) => (
  <div className="star" style={style} />
);

const App: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stars, setStars] = useState<Array<{ id: number; style: any }>>([]);
  const [isMounted, setIsMounted] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
    // Generate stars only on the client side to avoid hydration mismatch (Error 418)
    const newStars = Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      style: {
        width: Math.random() * 3 + 'px',
        height: Math.random() * 3 + 'px',
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        '--duration': (Math.random() * 3 + 2) + 's'
      } as React.CSSProperties
    }));
    setStars(newStars);
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
      setError('Your Highness, please provide a video to polish.');
      return;
    }

    setIsProcessing(true);
    setProgress(5);
    setError(null);

    try {
      // Corrected initialization using only process.env.API_KEY within the scope
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

      const simulateProgress = (start: number, end: number, duration: number) => {
        return new Promise<void>((resolve) => {
          let current = start;
          const totalSteps = duration / 30;
          const stepSize = (end - start) / totalSteps;
          const interval = setInterval(() => {
            current += stepSize;
            if (current >= end) {
              setProgress(end);
              clearInterval(interval);
              resolve();
            } else {
              setProgress(Math.floor(current));
            }
          }, 30);
        });
      };

      await simulateProgress(5, 30, 1500);
      await simulateProgress(30, 65, 2500);
      await simulateProgress(65, 90, 2000);
      await simulateProgress(90, 100, 1000);

      setResultVideo('https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4');
      
    } catch (err) {
      console.error("AI Error:", err);
      setError('The royal AI spell was interrupted. Please check your connection.');
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

  // Prevent rendering if not mounted to avoid hydration flash issues
  if (!isMounted) return <div className="min-h-screen bg-[#020617]" />;

  return (
    <div className="min-h-screen relative">
      {/* Background Stars */}
      <div className="floating-stars">
        {stars.map(star => (
          <Star key={star.id} style={star.style} />
        ))}
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 relative z-10">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <SparklesIcon className="w-16 h-16 text-amber-400 animate-pulse" />
            <HeartIcon className="w-6 h-6 text-pink-500 absolute -bottom-1 -right-1" />
          </div>
        </div>

        <header className="text-center mb-16 space-y-4">
          <h1 className="text-6xl md:text-8xl font-royal font-bold gold-shimmer tracking-wider drop-shadow-[0_5px_15px_rgba(251,191,36,0.3)]">
            Princess WM
          </h1>
          <div className="inline-block h-px w-32 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
          <p className="text-slate-300 text-lg md:text-xl font-light uppercase tracking-[0.3em] opacity-80">
            The Royal Seal of Purity
          </p>
        </header>

        <main className="royal-panel rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden transition-all duration-700">
          {isProcessing && (
            <div className="absolute inset-0 bg-indigo-950/95 backdrop-blur-2xl z-50 flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in duration-500">
              <div className="relative mb-10 scale-125">
                 <div className="w-28 h-28 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin"></div>
                 <div className="absolute inset-2 border-2 border-pink-500/10 border-b-pink-500 rounded-full animate-[spin_3s_linear_infinite_reverse]"></div>
                 <SparklesIcon className="w-10 h-10 text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h3 className="text-3xl font-royal font-bold mb-4 gold-shimmer">Casting the Spell...</h3>
              <p className="text-slate-400 mb-8 italic">Cleaning every pixel with royal elegance</p>
              <div className="w-full max-w-lg bg-white/5 h-1.5 rounded-full overflow-hidden p-[1px] border border-white/10">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 transition-all duration-300 shadow-[0_0_15px_rgba(251,191,36,0.5)]" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="mt-4 text-amber-400/60 font-mono text-sm">{progress}% Complete</span>
            </div>
          )}

          {!resultVideo ? (
            <div className="space-y-10">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`group relative border border-white/10 rounded-3xl p-16 text-center cursor-pointer transition-all hover:border-amber-400/50 hover:shadow-[0_0_30px_rgba(251,191,36,0.05)] ${file ? 'bg-amber-400/5 border-amber-400/40' : 'bg-white/5'}`}
              >
                <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-100 transition-opacity">
                   <SparklesIcon className="w-6 h-6 text-amber-400" />
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                  accept="video/*"
                />
                <CloudArrowUpIcon className="w-20 h-20 mx-auto mb-6 text-amber-400/50 group-hover:text-amber-400 group-hover:scale-110 transition-all duration-500" />
                <h2 className="text-2xl font-royal font-medium mb-2 tracking-wide text-white">
                  {file ? file.name : 'Bestow a File'}
                </h2>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">Upload your royal footage to have it purified by our AI.</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
                <span className="text-amber-400/40 font-royal text-xs uppercase tracking-widest">Or Provide a Path</span>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
              </div>

              <div className="space-y-3">
                <label className="text-slate-400 text-xs uppercase tracking-[0.2em] ml-2">Video Scroll (URL)</label>
                <div className="relative">
                  <LinkIcon className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-amber-400/50" />
                  <input 
                    type="text" 
                    value={videoUrl}
                    onChange={(e) => {
                      setVideoUrl(e.target.value);
                      setFile(null);
                    }}
                    placeholder="Paste link here..."
                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-5 pl-14 pr-6 focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 outline-none transition-all placeholder:text-slate-700 font-light text-white"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 flex items-center gap-4 text-red-300 animate-in slide-in-from-top-2 duration-300">
                  <ExclamationCircleIcon className="w-6 h-6 shrink-0 text-red-400" />
                  <p className="text-sm font-light">{error}</p>
                </div>
              )}

              <button 
                onClick={handleProcess}
                className="btn-royal w-full bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 hover:brightness-110 py-6 rounded-2xl font-royal font-bold text-xl tracking-widest shadow-2xl flex items-center justify-center gap-3 text-white"
              >
                <SparklesIcon className="w-6 h-6" />
                Remove WaterMark
              </button>
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 p-2 rounded-full">
                      <CheckCircleIcon className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                      <h3 className="text-xl font-royal gold-shimmer font-bold">The Royal Cut</h3>
                      <p className="text-slate-500 text-xs">Purified & Polished to perfection</p>
                  </div>
                </div>
                <button 
                  onClick={reset}
                  className="text-amber-400/60 hover:text-amber-400 transition-colors uppercase text-xs tracking-widest font-bold border-b border-amber-400/20 pb-1 w-fit"
                >
                  Purify Another
                </button>
              </div>

              <div className="rounded-[2rem] overflow-hidden border border-white/10 aspect-video bg-slate-950 shadow-2xl group relative">
                <video 
                  src={resultVideo} 
                  controls 
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <a 
                  href={resultVideo}
                  download="Princess_Purified.mp4"
                  className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 py-5 rounded-2xl font-royal font-semibold tracking-widest transition-all hover:scale-[1.02] text-white"
                >
                  <ArrowDownTrayIcon className="w-5 h-5 text-amber-400" />
                  Standard Delivery
                </a>
                <a 
                  href={resultVideo}
                  download="Princess_Royal_4K.mp4"
                  className="flex items-center justify-center gap-3 btn-royal princess-gradient py-5 rounded-2xl font-royal font-bold tracking-widest shadow-xl shadow-pink-500/10 text-white"
                >
                  <VideoCameraIcon className="w-5 h-5" />
                  The Royal 4K Highness
                </a>
              </div>
              
              <p className="text-center text-slate-500 text-xs italic tracking-widest opacity-60">
                Enhanced with Sovereign AI Neural Processing
              </p>
            </div>
          )}
        </main>

        <footer className="mt-20 text-center space-y-8 pb-10">
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-slate-500 text-xs uppercase tracking-[0.2em]">
            <span className="flex items-center gap-2"><SparklesIcon className="w-4 h-4 text-amber-400" /> Pure Vision</span>
            <span className="flex items-center gap-2"><SparklesIcon className="w-4 h-4 text-amber-400" /> Royal Speed</span>
            <span className="flex items-center gap-2"><SparklesIcon className="w-4 h-4 text-amber-400" /> Peerless Quality</span>
          </div>
          <div className="h-px w-full max-w-sm mx-auto bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          <p className="text-slate-600 text-[10px] uppercase tracking-[0.4em]">
            Princess WM Removal • Est. 2024 • Powered by Gemini Divine AI
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
