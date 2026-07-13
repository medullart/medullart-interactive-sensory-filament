import { useState, useEffect, useCallback, useRef } from 'react';
import { FilamentCanvas } from '@/components/FilamentCanvas';
import { HumanoidMesh } from '@/components/HumanoidMesh';
import { VideoPlayer } from '@/components/VideoPlayer';
import { UIOverlay } from '@/components/UIOverlay';
import { useKeyboardInput } from '@/hooks/useKeyboardInput';
import { useAudioAnalyzer } from '@/hooks/useAudioAnalyzer';
import { useFileAudioAnalyzer } from '@/hooks/useFileAudioAnalyzer';
import { useVideoRecorder } from '@/hooks/useVideoRecorder';
import { useClickSound } from '@/hooks/useClickSound';

export default function Index() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [systemMode, setSystemMode] = useState<'idle' | 'render'>('idle');
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null);
  const [isClicking, setIsClicking] = useState(false);
  const [clickIntensity, setClickIntensity] = useState(0);
  const [enterVibration, setEnterVibration] = useState(0);
  const rotationAccumRef = useRef(0);
  const vertexCountRef = useRef(100);

  const {
    inputText,
    lastKeyEvent,
    sentiment,
    flash,
    curvature,
    nodeCount,
    charOffsets,
    setTextFromMobile,
    triggerEnter
  } = useKeyboardInput();

  const {
    isActive: micActive,
    audioData: micAudioData,
    start: startMic,
    stop: stopMic
  } = useAudioAnalyzer();

  const {
    audioData: fileAudioData,
    fileState,
    error: fileError,
    loadFile,
    play: playFile,
    stop: stopFile,
    audioContext,
    audioDestination
  } = useFileAudioAnalyzer();

  const {
    isRecording,
    isProcessing,
    progress,
    error: recordError,
    startRecording
  } = useVideoRecorder();

  const { playSpringSound, playEnterSound } = useClickSound();
  const [enterPressed, setEnterPressed] = useState(false);

  const activeAudioData = systemMode === 'render' && fileState.isPlaying ?
  fileAudioData :
  micAudioData;

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Handle click/tap for filament vibration + spring sound
  useEffect(() => {
    const handleMouseDown = () => {
      setIsClicking(true);
      setClickIntensity(1.0);
      playSpringSound();
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    const handleTouchStart = () => {
      setIsClicking(true);
      setClickIntensity(1.0);
      playSpringSound();
    };

    const handleTouchEnd = () => {
      setIsClicking(false);
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [playSpringSound]);

  // Accumulate rotation from key events
  useEffect(() => {
    if (lastKeyEvent) {
      const rotationAmount = lastKeyEvent.charCode / 2 * (Math.PI / 180);
      rotationAccumRef.current += rotationAmount;
    }
  }, [lastKeyEvent]);

  // Handle Enter key - vibration + sound + color change
  useEffect(() => {
    if (lastKeyEvent?.key === 'Enter') {
      // Trigger intense vibration on Enter (stronger than click)
      setEnterVibration(2.0);
      // Play deep bass enter sound
      playEnterSound();
      // Change filament to pink
      setEnterPressed(true);
      // Reset after a while
      setTimeout(() => setEnterPressed(false), 3000);
    }
  }, [lastKeyEvent, playEnterSound]);

  // Handle mobile Enter
  const handleMobileEnter = useCallback(() => {
    // Trigger intense vibration on Enter (stronger than click)
    setEnterVibration(2.0);
    // Play deep bass enter sound
    playEnterSound();
    // Change filament to pink
    setEnterPressed(true);
    // Reset after a while
    setTimeout(() => setEnterPressed(false), 3000);
    // Trigger the keyboard hook's enter
    triggerEnter();
  }, [playEnterSound, triggerEnter]);

  // Handle ESC to go back to idle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && systemMode === 'render') {
        stopFile();
        setSystemMode('idle');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [systemMode, stopFile]);

  const handleMicToggle = useCallback(() => {
    if (micActive) {
      stopMic();
    } else {
      startMic();
    }
  }, [micActive, startMic, stopMic]);

  // Handle play - switch to render mode and start audio
  const handlePlayAudio = useCallback(() => {
    setSystemMode('render');
    setTimeout(() => playFile(), 100);
  }, [playFile]);

  // Handle stop - stop audio and go back to idle
  const handleStopAudio = useCallback(() => {
    stopFile();
    setSystemMode('idle');
  }, [stopFile]);

  const handleFileUpload = useCallback((file: File) => {
    loadFile(file);
  }, [loadFile]);

  const handleExport = useCallback(() => {
    if (canvasElement && !isRecording && !isProcessing) {
      // Pass audio context and destination for recording with audio
      const duration = fileState.duration ? fileState.duration * 1000 : 8000;
      startRecording(canvasElement, audioContext, audioDestination, duration);
    }
  }, [canvasElement, isRecording, isProcessing, startRecording, audioContext, audioDestination, fileState.duration]);

  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    setCanvasElement(canvas);
  }, []);

  useEffect(() => {
    vertexCountRef.current = systemMode === 'render' ? 500 : 100 + nodeCount * 5;
  }, [systemMode, nodeCount]);

  return (
    <div data-ev-id="ev_d5c75d0445" className="fixed inset-0 bg-void overflow-hidden cursor-none select-none">
      {/* Background - always show filament for visual continuity */}
      <div data-ev-id="ev_a1ce27c7a8" className={`transition-opacity duration-500 ${systemMode === 'render' ? 'opacity-20' : 'opacity-100'}`}>
        <FilamentCanvas
          nodeCount={nodeCount}
          curvature={curvature}
          lastKeyEvent={lastKeyEvent}
          sentiment={sentiment}
          audioData={activeAudioData}
          mousePosition={mousePosition}
          charOffsets={charOffsets}
          isClicking={isClicking}
          clickIntensity={clickIntensity}
          enterVibration={enterVibration}
          textLength={inputText.length}
          enterPressed={enterPressed} />

      </div>

      {/* Video Player with Humanoid Mesh - centered */}
      <VideoPlayer isActive={systemMode === 'render'}>
        <HumanoidMesh
          audioData={activeAudioData}
          isActive={systemMode === 'render'}
          onCanvasReady={handleCanvasReady} />

      </VideoPlayer>

      {/* UI Overlay - always on top */}
      <div data-ev-id="ev_cc8f39c80e" className="relative z-30">
        <UIOverlay
          inputText={inputText}
          audioActive={micActive}
          sentiment={sentiment}
          audioData={activeAudioData}
          nodeCount={nodeCount}
          rotation={rotationAccumRef.current}
          flash={flash}
          onAudioToggle={handleMicToggle}
          systemMode={systemMode}
          fileAudioState={fileState}
          onFileUpload={handleFileUpload}
          onPlayAudio={handlePlayAudio}
          onStopAudio={handleStopAudio}
          recordingState={{
            isRecording,
            isProcessing,
            progress,
            error: recordError
          }}
          onExport={handleExport}
          fileError={fileError}
          vertexCount={vertexCountRef.current}
          onMobileInput={setTextFromMobile}
          onMobileEnter={handleMobileEnter} />

      </div>
    </div>);

}