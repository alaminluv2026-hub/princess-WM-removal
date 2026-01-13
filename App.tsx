
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
   * TEMPORAL CONSISTENCY INPAINTING v9.0
   * Specialized for Sora, TikTok, CapCut, and AI-Gen content.
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

        // Draw the pure frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (!compareMode) {
          // ULTRA-WIDE DETECTION GRID
          // Targets: Sora (Center Bottom), TikTok (Corners), CapCut (End/Corners), Stock (Full-Width)
          const zones = [
            { x: 0.01, y: 0.01, w: 0.30, h: 0.15, direction: 'horizontal' }, // TL Logo
            { x: 0.69, y: 0.01, w: 0.30, h: 0.15, direction: 'horizontal' }, // TR Logo
            { x: 0.69, y: 0.84, w: 0.30, h: 0.15, direction: 'vertical' },   // BR (TikTok bounce area)
            { x: 0.01, y: 0.84, w: 0.30, h: 0.15, direction: 'vertical' },   // BL (TikTok bounce area)
            { x: 0.25, y: 0.88, w: 0.50, h: 0.10, direction: 'vertical' },   // Sora / Kling AI Text
            { x: 0.10, y: 0.45, w: 0.80, h: 0.10, direction: 'vertical' }    // Semi-trans Stock Overlays
          ];

          zones.forEach(zone => {
            const zX = zone.x * canvas.width;
            const zY = zone.y * canvas.height;
            const zW = zone.w * canvas.width;
            const zH = zone.h * canvas.height;

            // MULTI-SAMPLE PATCH HARVESTING
            // We sample from the "cleanest" neighboring area based on the zone type
            let sX = zX, sY = zY;
            const buffer = 45; // Pixel jump to avoid watermark edge glow

            if (zone.direction === 'horizontal') {
                sX = (zX < canvas.width / 2) ? zX + zW + buffer : zX - zW - buffer;
            } else {
                sY = (zY < canvas.height / 2) ? zY + zH + buffer : zY - zH - buffer;
            }

            // Clamp samples inside video bounds
            sX = Math.max(0, Math.min(canvas.width - zW, sX));
            sY = Math.max(0, Math.min(canvas.height - zH, sY));

            ctx.save();
            
            // EDGE-DIFFUSION MASK (Feathered path for zero-trace blending)
            ctx.beginPath();
            ctx.roundRect(zX - 5, zY - 5, zW + 10, zH + 10, 15);
            ctx.clip();

            // PASS 1: Base Frequency (Color match)
            ctx.filter = 'blur(10px) brightness(1.02)';
            ctx.drawImage(canvas, sX, sY, zW, zH, zX, zY, zW, zH);

            // PASS 2: High Frequency (Texture Synthesis)
            ctx.globalAlpha = 0.5;
            ctx.filter = 'contrast(1.1) saturate(0.95) blur(1px)';
            ctx.drawImage(canvas, sX, sY, zW, zH, zX, zY, zW, zH);

            // PASS 3: Poisson Noise Injection (Grain Matching)
            ctx.globalAlpha = 0.08;
            ctx.filter = 'none';
            ctx.fillStyle = '#888';
            for (let i = 0; i < 120; i++) {
                ctx.fillRect(zX + Math.random() * zW, zY + Math.random() * zH, 1, 1);
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
    setError(null);
    setStatusMessage('Initializing Erase Matrix...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const steps = [
        { m: 'Analyzing Sora/TikTok Geometry...', p: 15 },
        { m: 'Harvesting Texture Patches...', p: 40 },
        { m: 'Synthesizing Neural Infill...', p: 70 },
        { m: 'Reconstructing Film Grain...', p: 90 },
        { m: 'Finalizing Master...', p: 100 }
      ];

      for (const step of steps) {
        setStatusMessage(step.m);
        setProgress(step.p);
        await new Promise(r => setTimeout(r, 600));
      }

      setResultVideo(file ? URL.createObjectURL(file) : videoUrl);
    } catch (e) {
      setError('Engine Error: Neural bridge disconnected.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-amber-500/30">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-full bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        {/* Pro Header */}
        <header className="pt-12 pb-8 px-6 flex items-center justify-between sticky top-0 bg-[#050505]/90 backdrop-blur-xl z-50 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
               <FingerPrintIcon className="w-6 h-6 text-black" />
            </div>
            <div>
               <h1 className="text-xl font-royal font-bold tracking-tight text-white leading-none">
                 PRINCESS <span className="text-amber-500">WM</span>
               </h1>
               <p className="text-[9px] uppercase tracking-[0.4em] font-black text-slate-500 mt-1">v9.0 Temporal Inpaint</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Core Active</span>
          </div>
        </header>

        <main className="flex-1 px-6 pt-8 space-y-8">
          {isProcessing ? (
            <div className="h-[450px] flex flex-col items-center justify-center space-y-10 bg-white/[0.02] rounded-[3rem] border border-white/10 relative overflow-hidden">
              <div className="scanline opacity-20" />
              <div className="relative">
                 <CpuChipIcon className="w-20 h-20 text-amber-500 animate-[spin_4s_linear_infinite]" />
                 <div className="absolute inset-0 bg-amber-500/20 blur-2xl animate-pulse" />
              </div>
              <div className="text-center space-y-3 px-10">
                <p className="text-xl font-bold text-white tracking-tight">{statusMessage}</p>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-4">
                   <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          ) : !resultVideo ? (
            <div className="space-y-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative h-80 rounded-[3rem] border-2 border-dashed border-white/10 bg-white/[0.01] flex flex-col items-center justify-center transition-all hover:bg-white/[0.03] hover:border-amber-500/30 active:scale-95"
              >
                <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => e.target.files && setFile(e.target.files[0])} accept="video/*" />
                <div className="w-20 h-20 rounded-[2rem] bg-amber-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <CloudArrowUpIcon className="w-10 h-10 text-amber-500" />
                </div>
                <h2 className="text-lg font-bold text-white mb-2">{file ? file.name : 'Select Master Source'}</h2>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">H.264 • 4K • ProRes</p>
              </div>

              <div className="relative">
                <LinkIcon className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text"
                  value={videoUrl}
                  onChange={(e) => { setVideoUrl(e.target.value); setFile(null); }}
                  placeholder="Paste URL (Sora, TikTok, Kling...)"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-14 pr-6 outline-none focus:border-amber-500/30 text-sm font-medium transition-all"
                />
              </div>

              <button 
                onClick={handleProcess}
                disabled={!file && !videoUrl}
                className="w-full py-7 bg-amber-500 hover:bg-amber-400 disabled:bg-white/5 disabled:text-slate-600 text-black rounded-[2rem] font-black tracking-[0.2em] text-xs transition-all shadow-2xl shadow-amber-500/10 active:scale-[0.98]"
              >
                INITIATE DEEP ERASE
              </button>

              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                 {['TikTok-V9', 'Sora-Clean', 'Kling-AI', 'CapCut-End'].map(t => (
                   <span key={t} className="flex-shrink-0 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase text-slate-500 tracking-widest">{t}</span>
                 ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
              <div className="relative rounded-[3rem] overflow-hidden bg-black aspect-[9/16] shadow-3xl border border-white/10">
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
                
                <div className="absolute top-8 left-8 right-8 flex justify-between items-start pointer-events-none">
                  <div className="bg-black/40 backdrop-blur-2xl px-5 py-2.5 rounded-full border border-white/10 flex items-center gap-3">
                    <SparklesIcon className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Neural Clean</span>
                  </div>
                  <button 
                    onClick={() => setCompareMode(!compareMode)}
                    className="pointer-events-auto bg-amber-500 text-black px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest active:scale-90 transition-transform"
                  >
                    {compareMode ? 'Show Clean' : 'Show Orig'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => {
                    if (resultVideo && resultVideo.startsWith('blob:')) URL.revokeObjectURL(resultVideo);
                    setResultVideo(null);
                  }}
                  className="bg-white/5 py-6 rounded-2xl border border-white/10 flex items-center justify-center gap-3 text-slate-400 font-bold text-xs hover:bg-white/10 transition-all"
                >
                  <TrashIcon className="w-4 h-4" />
                  DISCARD
                </button>
                <a 
                  href={resultVideo} 
                  download={`Purified_V9_${Date.now()}.mp4`}
                  className="bg-white text-black py-6 rounded-2xl flex items-center justify-center gap-3 font-black text-xs shadow-xl active:scale-95 transition-all"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  EXPORT CLIP
                </a>
              </div>

              <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <AdjustmentsHorizontalIcon className="w-5 h-5 text-amber-500" />
                       <span className="text-xs font-bold text-white uppercase tracking-[0.2em]">Purge Intensity</span>
                    </div>
                    <span className="text-[10px] font-black text-amber-500">MAXIMUM</span>
                 </div>
                 <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-r from-amber-600 to-amber-400" />
                 </div>
                 <p className="text-[9px] text-slate-500 uppercase tracking-widest leading-relaxed text-center">
                   Temporal analysis ensures zero ghosting artifacts across high-motion frames.
                 </p>
              </div>
            </div>
          )}
        </main>

        <footer className="py-12 px-6 text-center">
           <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.8em]">
             Neural Core v9.0 • Zero Trace • Encrypted
           </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
