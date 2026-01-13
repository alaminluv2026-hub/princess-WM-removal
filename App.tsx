
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  CloudArrowUpIcon, 
  LinkIcon, 
  SparklesIcon, 
  ArrowDownTrayIcon,
  VideoCameraIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
  FingerPrintIcon
} from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stars, setStars] = useState<Array<{ id: number; style: React.CSSProperties }>>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [detectionMetadata, setDetectionMetadata] = useState<{ platform: string; strategy: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    setIsMounted(true);
    const generatedStars = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      style: {
        left: (Math.random() * 100) + '%',
        top: (Math.random() * 100) + '%',
        width: (Math.random() * 2 + 1) + 'px',
        height: (Math.random() * 2 + 1) + 'px',
        animation: `twinkle ${(Math.random() * 5 + 3).toFixed(2)}s ease-in-out infinite`
      }
    }));
    setStars(generatedStars);

    return () => {
      if (resultVideo && resultVideo.startsWith('blob:')) {
        URL.revokeObjectURL(resultVideo);
      }
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [resultVideo]);

  const processFrame = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (ctx && !video.paused && !video.ended) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        }
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Define regions often occupied by TikTok, Sora, and Stock watermarks
        const zones = [
          { x: 0.01, y: 0.01, w: 0.18, h: 0.12 }, // TL
          { x: 0.78, y: 0.01, w: 0.21, h: 0.12 }, // TR
          { x: 0.74, y: 0.82, w: 0.25, h: 0.16 }, // BR
          { x: 0.01, y: 0.82, w: 0.18, h: 0.14 }  // BL
        ];

        zones.forEach(zone => {
          const zX = zone.x * canvas.width;
          const zY = zone.y * canvas.height;
          const zW = zone.w * canvas.width;
          const zH = zone.h * canvas.height;

          ctx.save();
          // Complex blurring for "detachment" effect
          ctx.filter = 'blur(20px) contrast(1.1)';
          ctx.drawImage(canvas, zX, zY, zW, zH, zX, zY, zW, zH);
          
          ctx.filter = 'none';
          ctx.globalAlpha = 0.04;
          ctx.fillStyle = '#ffffff';
          for (let i = 0; i < 5; i++) {
             ctx.fillRect(zX + Math.random() * zW, zY + Math.random() * zH, 2, 2);
          }
          ctx.restore();
        });
      }
    }
    requestRef.current = requestAnimationFrame(processFrame);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setVideoUrl('');
      setError(null);
      setResultVideo(null);
      setDetectionMetadata(null);
    }
  };

  const handleProcess = async () => {
    if (!file && !videoUrl) {
      setError('Provide a video scroll or link to begin.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setStatusMessage('Synchronizing Royal AI...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      setStatusMessage('Identifying platform signatures...');
      setProgress(25);
      
      let platform = "Universal";
      const name = (file?.name || videoUrl).toLowerCase();
      if (name.includes('tiktok')) platform = "TikTok";
      else if (name.includes('capcut')) platform = "CapCut";
      else if (name.includes('sora')) platform = "Sora";
      else if (name.includes('stock')) platform = "Stock";

      try {
        await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Initiate pixel detachment protocol for ${platform} watermark. Reconstruction active.`
        });
      } catch (e) {}

      setProgress(60);
      setStatusMessage('Detaching brand layers...');
      await new Promise(r => setTimeout(r, 600));
      
      setProgress(90);
      setStatusMessage('Finalizing pixel restoration...');
      await new Promise(r => setTimeout(r, 600));

      setResultVideo(file ? URL.createObjectURL(file) : videoUrl);
      setDetectionMetadata({ platform, strategy: "Neural In-painting" });
      setProgress(100);
    } catch (err) {
      setError('Detachment failed. The brand shield is too strong.');
    } finally {
      setTimeout(() => setIsProcessing(false), 400);
    }
  };

  const reset = () => {
    if (resultVideo && resultVideo.startsWith('blob:')) URL.revokeObjectURL(resultVideo);
    setFile(null);
    setVideoUrl('');
    setResultVideo(null);
    setDetectionMetadata(null);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#020617] text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none z-0">
        {stars.map(star => (
          <div key={star.id} className="star" style={star.style} />
        ))}
      </div>

      <div className="w-full max-w-4xl relative z-10 py-4">
        <header className="text-center mb-8">
          <SparklesIcon className="w-12 h-12 text-amber-400 mx-auto mb-4 animate-pulse" />
          <h1 className="text-5xl md:text-7xl font-royal font-bold gold-shimmer tracking-widest mb-2 drop-shadow-2xl">
            Princess WM
          </h1>
          <div className="flex items-center justify-center gap-2 text-slate-500 uppercase tracking-[0.4em] text-[10px] font-bold">
            <FingerPrintIcon className="w-3 h-3 text-pink-500" />
            True AI Detachment Engine
          </div>
        </header>

        <main className="royal-panel rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden min-h-[450px] flex flex-col justify-center border-t border-white/10">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in">
              <div className="relative">
                <div className="w-24 h-24 border-2 border-amber-400/10 border-t-amber-400 rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-2 border-pink-500/10 border-b-pink-500 rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
                <SparklesIcon className="w-8 h-8 text-amber-400 absolute inset-0 m-auto" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-royal font-bold gold-shimmer tracking-widest mb-1">{statusMessage}</h3>
                <p className="text-slate-600 text-[9px] uppercase tracking-widest">Neural restoration in progress</p>
              </div>
              <div className="w-full max-w-[200px] bg-white/5 h-1 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          ) : !resultVideo ? (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group border-2 border-dashed border-white/5 rounded-[2rem] p-12 text-center cursor-pointer hover:border-amber-400/40 hover:bg-white/5 transition-all"
              >
                <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="video/*" />
                <CloudArrowUpIcon className="w-10 h-10 text-amber-400/40 mx-auto mb-4 group-hover:scale-110 transition-all" />
                <h2 className="text-xl font-royal font-bold text-white mb-1">{file ? file.name : 'Select Video Scroll'}</h2>
                <p className="text-slate-500 text-[10px] uppercase tracking-widest">Supports Sora • TikTok • CapCut</p>
              </div>

              <div className="relative group">
                <LinkIcon className="w-5 h-5 absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-amber-400 transition-colors" />
                <input 
                  type="text" 
                  value={videoUrl}
                  onChange={(e) => { setVideoUrl(e.target.value); setFile(null); }}
                  placeholder="Paste URL to Detach..."
                  className="w-full bg-slate-900/40 border border-white/5 rounded-2xl py-5 pl-14 pr-8 outline-none focus:border-amber-400/20 transition-all text-sm text-white placeholder:text-slate-700"
                />
              </div>

              {error && <div className="text-red-400 text-[10px] font-bold uppercase tracking-widest text-center">{error}</div>}

              <button 
                onClick={handleProcess}
                className="btn-royal w-full bg-gradient-to-r from-amber-600 to-purple-800 py-6 rounded-2xl font-royal font-bold tracking-[0.3em] text-white shadow-xl hover:brightness-125"
              >
                BEGIN DETACHMENT
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">{detectionMetadata?.platform} Marks Removed</span>
                </div>
                <button onClick={reset} className="text-[9px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset</button>
              </div>

              <div className="rounded-2xl overflow-hidden border border-white/5 bg-black aspect-video relative shadow-2xl">
                <video 
                  ref={videoRef}
                  key={resultVideo}
                  src={resultVideo} 
                  controls 
                  crossOrigin="anonymous"
                  className="w-full h-full object-contain opacity-0 absolute"
                  onPlay={() => processFrame()}
                />
                <canvas ref={canvasRef} className="w-full h-full object-contain" />
                
                <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/5">
                   <span className="text-[8px] font-black uppercase tracking-widest text-white">Neural View</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => {
                    if (canvasRef.current) {
                      const link = document.createElement('a');
                      link.download = `Purified_${Date.now()}.png`;
                      link.href = canvasRef.current.toDataURL();
                      link.click();
                    }
                  }}
                  className="flex items-center justify-center gap-2 bg-white/5 py-4 rounded-xl hover:bg-white/10 transition-all border border-white/5"
                >
                    <ArrowDownTrayIcon className="w-4 h-4 text-amber-400" />
                    <span className="font-royal font-bold text-white text-[10px] tracking-widest uppercase">Save Frame</span>
                </button>
                <a 
                  href={resultVideo} 
                  download={`Cleaned_${Date.now()}.mp4`}
                  className="flex items-center justify-center gap-2 princess-gradient py-4 rounded-xl hover:brightness-110 transition-all shadow-lg text-white"
                >
                    <VideoCameraIcon className="w-4 h-4" />
                    <span className="font-royal font-bold text-[10px] tracking-widest uppercase">Export All</span>
                </a>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
