import { ReactNode } from 'react';

interface VideoPlayerProps {
  children: ReactNode;
  isActive: boolean;
}

export function VideoPlayer({ children, isActive }: VideoPlayerProps) {
  if (!isActive) return null;

  return (
    <div data-ev-id="ev_d7c51fdb32" className="fixed inset-0 flex items-center justify-center bg-void z-20">
      {/* Decorative frame elements */}
      <div data-ev-id="ev_fa782f8ad4" className="absolute inset-0 pointer-events-none">
        {/* Corner brackets */}
        <div data-ev-id="ev_c938e19129" className="absolute top-[10%] left-[10%] w-8 h-8 border-l-2 border-t-2 border-white/20" />
        <div data-ev-id="ev_afac83e2c6" className="absolute top-[10%] right-[10%] w-8 h-8 border-r-2 border-t-2 border-white/20" />
        <div data-ev-id="ev_8a6b214001" className="absolute bottom-[10%] left-[10%] w-8 h-8 border-l-2 border-b-2 border-white/20" />
        <div data-ev-id="ev_5b9aa8d45f" className="absolute bottom-[10%] right-[10%] w-8 h-8 border-r-2 border-b-2 border-white/20" />
        
        {/* Scan lines effect */}
        <div data-ev-id="ev_56baa44f22"
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
        }} />

      </div>

      {/* Video player container - 16:9 horizontal standard format */}
      <div data-ev-id="ev_8f1a69f2ee" className="relative w-full max-w-[900px] mx-auto" style={{ aspectRatio: '16/9', maxHeight: '75vh' }}>
        {/* Volumetric glow effect behind the player */}
        <div data-ev-id="ev_0c2aaf508e"
        className="absolute -inset-6 blur-2xl rounded-2xl opacity-50"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0, 255, 255, 0.12) 0%, rgba(255, 0, 255, 0.08) 45%, transparent 75%)'
        }} />


        
        {/* Main video container */}
        <div data-ev-id="ev_ab32b23647" className="relative w-full h-full rounded-lg overflow-hidden border border-white/10 bg-black shadow-2xl shadow-cyan-500/10">
          {/* Inner glow border */}
          <div data-ev-id="ev_67f367ee89" className="absolute inset-0 rounded-lg border border-white/5 pointer-events-none z-10" />
          
          {/* Chromatic aberration edge effect */}
          <div data-ev-id="ev_2331d51cb0" className="absolute inset-0 pointer-events-none z-10">
            <div data-ev-id="ev_ce935f9a8e" className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent" />
            <div data-ev-id="ev_e53b2fa256" className="absolute inset-y-0 right-0 w-[2px] bg-gradient-to-b from-transparent via-magenta-400/30 to-transparent" style={{ backgroundColor: 'transparent', backgroundImage: 'linear-gradient(to bottom, transparent, rgba(255, 0, 255, 0.3), transparent)' }} />
            <div data-ev-id="ev_d14eabc15a" className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div data-ev-id="ev_bd4a896177" className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          {/* Content */}
          {children}
        </div>

        {/* Status indicators */}
        <div data-ev-id="ev_e706c0ddc5" className="absolute -bottom-8 left-0 right-0 flex justify-center gap-4">
          <div data-ev-id="ev_a2f6c5a02b" className="flex items-center gap-2">
            <div data-ev-id="ev_e9dd8b5f06" className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span data-ev-id="ev_c3ae5c9805" className="font-mono text-[9px] text-white/40 tracking-wider">RENDERING</span>
          </div>
          <div data-ev-id="ev_cc34c1878d" className="flex items-center gap-2">
            <span data-ev-id="ev_b8248c9016" className="font-mono text-[9px] text-white/40 tracking-wider">16:9</span>
          </div>
        </div>
      </div>
    </div>);

}