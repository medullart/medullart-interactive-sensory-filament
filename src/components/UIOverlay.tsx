import { useState, useEffect, useRef } from 'react';
import type { SentimentScore } from '@/hooks/useKeyboardInput';
import type { AudioData } from '@/hooks/useAudioAnalyzer';
import type { FileAudioState } from '@/hooks/useFileAudioAnalyzer';
import type { RecordingState } from '@/hooks/useVideoRecorder';

interface UIOverlayProps {
  inputText: string;
  audioActive: boolean;
  sentiment: SentimentScore;
  audioData: AudioData;
  nodeCount: number;
  rotation: number;
  flash: boolean;
  onAudioToggle: () => void;
  // New props for expanded system
  systemMode: 'idle' | 'render';
  fileAudioState: FileAudioState;
  onFileUpload: (file: File) => void;
  onPlayAudio: () => void;
  onStopAudio: () => void;
  recordingState: RecordingState;
  onExport: () => void;
  fileError: string | null;
  vertexCount: number;
  // Mobile input support
  onMobileInput?: (text: string) => void;
  onMobileEnter?: () => void;
}

export function UIOverlay({
  inputText,
  audioActive,
  sentiment,
  audioData,
  nodeCount,
  rotation,
  flash,
  onAudioToggle,
  systemMode,
  fileAudioState,
  onFileUpload,
  onPlayAudio,
  onStopAudio,
  recordingState,
  onExport,
  fileError,
  vertexCount,
  onMobileInput,
  onMobileEnter
}: UIOverlayProps) {
  const [cursorVisible, setCursorVisible] = useState(true);
  const [frequency, setFrequency] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Handle mobile input focus
  const handleMobileInputFocus = () => {
    if (mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  };

  // Handle mobile input change
  const handleMobileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onMobileInput) {
      onMobileInput(e.target.value);
    }
  };

  // Handle Enter key on mobile
  const handleMobileKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onMobileEnter) {
      e.preventDefault();
      onMobileEnter();
      // Clear the mobile input
      if (mobileInputRef.current) {
        mobileInputRef.current.value = '';
      }
    }
  };

  // Blink cursor
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  // Calculate dominant frequency
  useEffect(() => {
    if (audioData.rawFrequencies && audioData.rawFrequencies.length > 0) {
      let maxVal = 0;
      let maxIndex = 0;
      for (let i = 0; i < audioData.rawFrequencies.length; i++) {
        if (audioData.rawFrequencies[i] > maxVal) {
          maxVal = audioData.rawFrequencies[i];
          maxIndex = i;
        }
      }
      const freq = Math.round(maxIndex * 48000 / 256);
      setFrequency(freq);
    }
  }, [audioData.rawFrequencies]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileUpload(file);
  };

  const rotationDegrees = rotation * 180 / Math.PI % 360;
  const year = new Date().getFullYear();

  const sentimentColor =
  sentiment.type === 'chaos' ? 'text-red-400' :
  sentiment.type === 'calm' ? 'text-cyan-400' :
  sentiment.type === 'love' ? 'text-pink-400' :
  sentiment.type === 'hate' ? 'text-orange-400' :
  'text-white';

  const systemStatus = systemMode === 'render' ?
  fileAudioState.isPlaying ? 'RENDERING' : 'READY' :
  'IDLE';

  const audioStatus = fileAudioState.isLoaded ?
  fileAudioState.isPlaying ? 'PLAYING' : 'STAGED' :
  audioActive ? 'MIC_ACTIVE' : 'WAITING';

  return (
    <>
      {/* Flash overlay */}
      {flash &&
      <div data-ev-id="ev_325fcbad47" className="fixed inset-0 bg-white z-50 pointer-events-none" />
      }

      {/* Drag overlay */}
      {isDragging &&
      <div data-ev-id="ev_0e89a9fc18" className="fixed inset-0 bg-white/5 z-40 pointer-events-none flex items-center justify-center">
          <div data-ev-id="ev_94eaf2eee6" className="font-mono text-lg text-white/50 tracking-widest">
            [ DROP AUDIO FILE ]
          </div>
        </div>
      }

      {/* Top Left - System Title */}
      <div data-ev-id="ev_d3adf4e57d" className="fixed top-6 left-6 z-10">
        <a data-ev-id="ev_edccbb1339"
        href="https://www.instagram.com/medullart/"
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-[11px] text-white/80 tracking-[0.3em] font-medium hover:text-white transition-colors cursor-pointer">

          MEDULLART
        </a>
        {systemMode === 'render' &&
        <div data-ev-id="ev_cd623a0f75" className="font-mono text-[9px] text-cyan-400/60 tracking-wider mt-1">
            GENERATIVE ENGINE ACTIVE
          </div>
        }
      </div>

      {/* Top Right - System Status */}
      <div data-ev-id="ev_75a89116ee" className="fixed top-6 right-6 z-10 text-right">
        <div data-ev-id="ev_b22a5102e4" className="font-mono text-[11px] text-tech-gray tracking-wider">
          SYSTEM: {systemStatus} // INPUT_AUDIO: {audioStatus} // {year}
        </div>
        {fileAudioState.isLoaded &&
        <div data-ev-id="ev_838131100d" className="font-mono text-[10px] text-tech-gray/70 mt-1">
            {fileAudioState.fileName?.slice(0, 30)} [{Math.floor(fileAudioState.duration)}s]
          </div>
        }
        {fileAudioState.isPlaying &&
        <div data-ev-id="ev_4915b4a2f8" className="font-mono text-[10px] text-cyan-400 mt-1">
            {fileAudioState.currentTime.toFixed(1)}s / {fileAudioState.duration.toFixed(1)}s
          </div>
        }
        <div data-ev-id="ev_42efb69ae8" className={`font-mono text-[10px] mt-1 tracking-wide ${sentimentColor}`}>
          SENTIMENT: {sentiment.type.toUpperCase()} [{(sentiment.intensity * 100).toFixed(0)}%]
        </div>
      </div>

      {/* Bottom Left - Input Display & Audio Upload */}
      <div data-ev-id="ev_418fffe2d4"
      className="fixed bottom-6 left-6 z-10 max-w-[60vw]"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}>

        {/* Tappable area for mobile input */}
        <button
          data-ev-id="ev_305721473a"
          onClick={handleMobileInputFocus}
          className="font-mono text-[10px] text-tech-gray mb-2 tracking-wider cursor-pointer hover:text-cyan-400 transition-colors text-left">

          {'>'} {systemMode === 'idle' ? 'TAP TO TYPE / MORPH FILAMENT' : 'RENDERING MODE'}
        </button>
        
        {/* Hidden mobile input */}
        <input
          data-ev-id="ev_18aa161d1f"
          ref={mobileInputRef}
          type="text"
          value={inputText}
          onChange={handleMobileInputChange}
          onKeyDown={handleMobileKeyDown}
          className="sr-only"
          aria-label="Type to morph filament"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          enterKeyHint="send" />


        
        <div data-ev-id="ev_209460c833" className="flex items-end gap-4">
          <button
            data-ev-id="ev_d33ea41219"
            onClick={handleMobileInputFocus}
            className="font-mono text-lg text-white tracking-wide cursor-pointer text-left min-h-[28px]">

            {inputText || <span data-ev-id="ev_cfce64df39" className="text-tech-gray/50">tap here...</span>}
            <span data-ev-id="ev_d766a91a5a" className={`${cursorVisible ? 'opacity-100' : 'opacity-0'} text-white`}>
              █
            </span>
          </button>
          
          {/* Audio Upload Button */}
          <div data-ev-id="ev_f879efb5c9" className="flex gap-3">
            <button data-ev-id="ev_929b2571b8"
            onClick={() => fileInputRef.current?.click()}
            className="font-mono text-[11px] text-cyan-400/70 tracking-wider border-2 border-cyan-400/40 px-4 py-2 transition-all duration-300 hover:text-white hover:border-cyan-400 hover:bg-cyan-400/20 hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:scale-105 active:scale-95">
              [ + UPLOAD_AUDIO ]
            </button>
            <input data-ev-id="ev_787157af60"
            ref={fileInputRef}
            type="file"
            accept="audio/mp3,audio/wav,audio/*"
            onChange={handleFileSelect}
            className="hidden" />

            {/* Mic Toggle */}
            <button data-ev-id="ev_c8587e3666"
            onClick={onAudioToggle}
            className={`font-mono text-[11px] tracking-wider border-2 px-4 py-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
            audioActive ?
            'text-cyan-400 border-cyan-400 bg-cyan-400/20 shadow-[0_0_15px_rgba(0,255,255,0.5)]' :
            'text-magenta-400/70 border-magenta-400/40 hover:text-white hover:border-magenta-400 hover:bg-magenta-400/20 hover:shadow-[0_0_20px_rgba(255,0,255,0.4)]'}`
            }>
              [ MIC ]
            </button>
          </div>
        </div>
        
        {fileError &&
        <div data-ev-id="ev_fe8412bbdf" className="font-mono text-[10px] text-red-400 mt-2">
            ERROR: {fileError}
          </div>
        }

        {/* Audio controls when loaded - show in any mode */}
        {fileAudioState.isLoaded &&
        <div data-ev-id="ev_b7038e4f8d" className="flex gap-3 mt-4">
            <button data-ev-id="ev_16256e8175"
          onClick={fileAudioState.isPlaying ? onStopAudio : onPlayAudio}
          className={`font-mono text-[12px] tracking-wider border-2 px-5 py-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
          fileAudioState.isPlaying ?
          'text-red-400 border-red-400 bg-red-400/20 shadow-[0_0_20px_rgba(255,100,100,0.5)] animate-pulse' :
          'text-green-400 border-green-400/60 hover:border-green-400 hover:bg-green-400/20 hover:shadow-[0_0_25px_rgba(0,255,100,0.5)]'}`
          }>
              [ {fileAudioState.isPlaying ? 'STOP' : '▶ PLAY_VIDEO'} ]
            </button>
          </div>
        }
      </div>

      {/* Bottom Right - Telemetry */}
      <div data-ev-id="ev_6ee0152a29" className="fixed bottom-6 right-6 z-10 text-right">
        <div data-ev-id="ev_74b52c10d0" className="font-mono text-[11px] text-tech-gray tracking-wider flex flex-col gap-1">
          <span data-ev-id="ev_0fa1f8c564">FREQ: {frequency.toFixed(0)}Hz</span>
          <span data-ev-id="ev_63ee4b58a4">NODE_STRETCH: {nodeCount}</span>
          <span data-ev-id="ev_345203eed5">ROT: {rotationDegrees.toFixed(1)}°</span>
          <span data-ev-id="ev_3afd99c1b8">VOL: {(audioData.volume * 100).toFixed(0)}%</span>
          <span data-ev-id="ev_76d0fde661">VERT_COUNT: {vertexCount}</span>
        </div>

        {/* Export Button - visible in render mode */}
        {systemMode === 'render' &&
        <button data-ev-id="ev_4f3bddbd17"
        onClick={onExport}
        disabled={recordingState.isRecording || recordingState.isProcessing}
        className={`mt-4 font-mono text-[11px] tracking-wider border px-4 py-2 transition-all ${
        recordingState.isRecording || recordingState.isProcessing ?
        'text-cyan-400 border-cyan-400 animate-pulse' :
        'text-white border-white/50 hover:bg-white/10'}`
        }>

            {recordingState.isRecording ?
          `[ RECORDING ${recordingState.progress.toFixed(0)}% ]` :
          recordingState.isProcessing ?
          '[ PROCESSING... ]' :
          '[ EXPORT_VIDEO ]'
          }
          </button>
        }
      </div>

      {/* Center hint - only when idle */}
      {!inputText && !audioActive && !fileAudioState.isLoaded && systemMode === 'idle' &&
      <div data-ev-id="ev_874c7e4d35" className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <div data-ev-id="ev_ccb9da01d2" className="font-mono text-[10px] text-tech-gray/50 tracking-[0.5em] text-center">
            AWAITING INPUT
          </div>
          <div data-ev-id="ev_4c5600989b" className="font-mono text-[9px] text-tech-gray/30 tracking-wider text-center mt-2">
            TYPE + UPLOAD AUDIO + PRESS ENTER
          </div>
        </div>
      }

      {/* Audio visualization bars */}
      <div data-ev-id="ev_36a72c1282" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-1 items-end h-8">
        <div data-ev-id="ev_52c683d1e1"
        className="w-1 bg-cyan-400/30 transition-all duration-75"
        style={{ height: `${Math.max(audioData.bass * 100, 2)}%` }} />

        <div data-ev-id="ev_acb36d4511"
        className="w-1 bg-magenta-400/30 transition-all duration-75"
        style={{ height: `${Math.max(audioData.mid * 100, 2)}%`, backgroundColor: 'rgba(255, 0, 255, 0.3)' }} />

        <div data-ev-id="ev_fed0f114a6"
        className="w-1 bg-green-400/30 transition-all duration-75"
        style={{ height: `${Math.max(audioData.treble * 100, 2)}%` }} />

      </div>

      {/* Drag hint - only show in idle mode */}
      {systemMode === 'idle' &&
      <div data-ev-id="ev_drag_hint" className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-10">
          <div data-ev-id="ev_ccef9b32f2" className="font-mono text-[10px] text-white/30 tracking-wider text-center animate-pulse">
            ← DRAG FILAMENT TO EXPLORE CODEX →
          </div>
        </div>
      }
    </>);

}