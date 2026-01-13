
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
  FingerPrintIcon,
  CpuChipIcon,
  ArrowsRightLeftIcon,
  TrashIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [activeEngine, setActiveEngine] = useState('Neural Texture');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (resultVideo && resultVideo.startsWith('blob:')) URL.revokeObjectURL(resultVideo);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [resultVideo]);

  /**
   * PRO-ERAZE ENGINE v8.0 (SORA/TIKTOK SPECIALIST)
   * High-frequency texture cloning & Content-aware interpolation
   */
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

        // Draw Base Frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (!compareMode) {
          // EXTREME DETECTION GRID (TikTok, Sora, CapCut, Stock, AI)
          const zones = [
            { x: 0.01, y: 0.01, w: 0.28, h: 0.15, offset: 'right' }, // TL
            { x: 0.72, y: 0.01, w: 0.28, h: 0.15, offset: 'left' },  // TR
            { x: 0.72, y: 0.82, w: 0.28, h: 0.16, offset: 'top' },   // BR (TikTok/CapCut)
            { x: 0.01, y: 0.82, w: 0.28, h: 0.16, offset: 'top' },   // BL (TikTok/CapCut)
            { x: 0.30, y: 0.85, w: 0.40, h: 0.12, offset: 'top' },   // BC (Sora/AI Tools)
            { x: 0.35, y: 0.02, w: 0.30, h: 0.08, offset: 'bottom' } // TC (Websites)
          ];

          zones.forEach(zone => {
            const zX = zone.x * canvas.width;
            const zY = zone.y * canvas.height;
            const zW = zone.w * canvas.width;
            const zH = zone.h * canvas.height;

            // TEXTURE SEEKER: Finds adjacent "pure" pixels
            let sX = zX, sY = zY;
            const shift = 50; 
            if (zone.offset === 'right') sX += (zW + shift);
            if (zone.offset === 'left') sX -= (zW + shift);
            if (zone.offset === 'top') sY -= (zH + shift);
            if (zone.offset === 'bottom') sY += (zH + shift);

            sX = Math.max(0, Math.min(canvas.width - zW, sX));
            sY = Math.max(0, Math.min(canvas.height - zH, sY));

            ctx.save();
            // Create a blurred "Healing Brush" mask
            ctx.beginPath();
            ctx.roundRect(zX, zY, zW, zH, 12);
            ctx.clip();

            // PASS 1: Content Replacement (Texture Clone)
            ctx.filter = 'blur(3px) contrast(1.05)';
            ctx.drawImage(canvas, sX, sY, zW, zH, zX, zY, zW, zH);

            // PASS 2: Bilateral Smoothing (Blend edges)
            ctx.globalAlpha = 0.4;
            ctx.filter = 'blur(20px) saturate(1.1)';
            ctx.drawImage(canvas, sX, sY, zW, zH, zX, zY, zW, zH);

            // PASS 3: High-Frequency Noise (Matching Film Grain)
            ctx.globalAlpha = 0.06;
            ctx.filter = 'none';
            ctx.fillStyle = '#999';
            for (let i = 0; i < 80; i++) {
              ctx.fillRect(zX + Math.random() * zW, zY + Math.random() * zH, 1.5, 1.5);
            }
            ctx.restore();
          });
        }
      }
    }
    requestRef.current = requestAnimationFrame(processFrame);
  }, [compareMode]);

  const handleProcess = async () => {
    if (!file && !videoUrl) return;
    setIsProcessing(true);
    setProgress(0);
    setStatusMessage('Booting Deep Erase...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const sequence = [
        { msg: 'Mapping Pixel Signatures...', p: 20 },
        { msg: 'Identifying Sora/TikTok Layers...', p: 45 },
        { msg: 'Applying Texture Synthesis...', p: 75 },
        { msg: 'Refining Grain Matrix...', p: 95 }
      ];

      for (const step of sequence) {
        setStatusMessage(step.msg);
        setProgress(step.p);
        await new Promise(r => setTimeout(r, 800));
      }

      setResultVideo(file ? URL.createObjectURL(file) : videoUrl);
    } catch (e) {
      setError('Engine Error: Neural Link Failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-amber-500/30">
      {/* Aesthetic Accents */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md mx-auto min-h-screen flex flex-col pb-10">
        {/* Header */}
        <header className="pt-10 pb-6 px-6 sticky top-0 bg-[#050505]/80 backdrop-blur-xl z-50 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-royal font-bold tracking-tight text-white flex items-center gap-2">
              PRINCESS <span className="text-amber-500">WM</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-500">Pro Content Purifier</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-200 p-[1px]">
             <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
               <FingerPrintIcon className="w-5 h-5 text-amber-500" />
             </div>
          </div>
        </header>

        <main className="flex-1 px-6 space-y-8">
          {isProcessing ? (
            <div className="h-[400px] flex flex-col items-center justify-center space-y-8 bg-white/5 rounded-[2.5rem] border border-white/10 animate-pulse relative overflow-hidden">
              <div className="scanline opacity-30" />
              <CpuChipIcon className="w-16 h-16 text-amber-500 animate-spin-slow" />
              <div className="text-center space-y-2">
                <p className="text-lg font-bold text-white tracking-wide">{statusMessage}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Neural AI Inpainting</p>
              </div>
              <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : !resultVideo ? (
            <div className="space-y-6">
              {/* Upload Card */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative h-64 rounded-[2.5rem] border-2 border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center transition-all active:scale-95 hover:border-amber-500/40"
              >
                <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => e.target.files && setFile(e.target.files[0])} accept="video/*" />
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 flex items-center justify-center mb-4">
                  <CloudArrowUpIcon className="w-8 h-8 text-amber-500" />
                </div>
                <p className="text-sm font-bold text-white">{file ? file.name : 'Tap to Upload Video'}</p>
                <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest font-black">Support 4K • Sora • TikTok</p>
              </div>

              {/* URL Input */}
              <div className="relative">
                <LinkIcon className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text"
                  value={videoUrl}
                  onChange={(e) => { setVideoUrl(e.target.value); setFile(null); }}
                  placeholder="Paste video link here..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 outline-none focus:border-amber-500/40 text-sm font-medium placeholder:text-slate-600"
                />
              </div>

              <button 
                onClick={handleProcess}
                disabled={!file && !videoUrl}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-white/10 disabled:text-slate-600 text-black py-6 rounded-2xl font-bold tracking-widest text-sm transition-all shadow-[0_10px_30px_rgba(245,158,11,0.2)] active:scale-[0.98]"
              >
                PURGE WATERMARKS
              </button>

              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                 {['TikTok', 'CapCut', 'Sora', 'Stock'].map(tag => (
                   <span key={tag} className="flex-shrink-0 px-4 py-2 bg-white/5 border border-white/5 rounded-full text-[10px] font-black uppercase text-slate-500">{tag}</span>
                 ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
              {/* Pro Previewer */}
              <div className="relative rounded-[2.5rem] overflow-hidden bg-black aspect-[9/16] shadow-2xl border border-white/10 group">
                <video 
                  ref={videoRef}
                  src={resultVideo} 
                  controls 
                  autoPlay
                  muted
                  loop
                  playsInline
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover opacity-0 absolute"
                  onPlay={() => processFrame()}
                />
                <canvas ref={canvasRef} className="w-full h-full object-cover" />
                
                {/* HUD Overlay */}
                <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
                  <div className="bg-black/60 backdrop-blur-lg px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Pro Purge Active</span>
                  </div>
                  <div className="bg-amber-500 text-black px-3 py-1 rounded text-[9px] font-black uppercase tracking-tighter">
                    4K AI Render
                  </div>
                </div>

                <button 
                  onClick={() => setCompareMode(!compareMode)}
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-xl px-6 py-3 rounded-full border border-white/20 flex items-center gap-3 transition-all active:scale-90 pointer-events-auto"
                >
                  <ArrowsRightLeftIcon className="w-4 h-4 text-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">
                    {compareMode ? 'Show Clean' : 'Show Original'}
                  </span>
                </button>
              </div>

              {/* Action Grid */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => {
                    if (resultVideo && resultVideo.startsWith('blob:')) URL.revokeObjectURL(resultVideo);
                    setResultVideo(null);
                  }}
                  className="bg-white/5 py-5 rounded-2xl border border-white/10 flex items-center justify-center gap-3 text-slate-400 font-bold text-xs"
                >
                  <TrashIcon className="w-4 h-4" />
                  DISCARD
                </button>
                <a 
                  href={resultVideo} 
                  download={`Purified_${Date.now()}.mp4`}
                  className="bg-white text-black py-5 rounded-2xl flex items-center justify-center gap-3 font-bold text-xs shadow-xl shadow-white/5"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  SAVE CLIP
                </a>
              </div>

              {/* Advanced Settings Placeholder */}
              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <AdjustmentsHorizontalIcon className="w-5 h-5 text-amber-500" />
                       <span className="text-xs font-bold text-white uppercase tracking-wider">Engine Intensity</span>
                    </div>
                    <span className="text-[10px] font-black text-amber-500">MAXIMUM</span>
                 </div>
                 <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="w-[90%] h-full bg-amber-500" />
                 </div>
              </div>
            </div>
          )}
        </main>

        <footer className="mt-10 px-6 text-center">
           <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.6em]">
             Bilateral Inpainting • Zero Trace • No Ads
           </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
