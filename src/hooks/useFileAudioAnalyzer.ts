import { useState, useRef, useCallback, useEffect } from 'react';
import type { AudioData } from './useAudioAnalyzer';

export interface FileAudioState {
  isLoaded: boolean;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  fileName: string | null;
}

const MAX_DURATION = 120; // 2 minutes max

export function useFileAudioAnalyzer() {
  const [audioData, setAudioData] = useState<AudioData>({
    volume: 0,
    bass: 0,
    mid: 0,
    treble: 0,
    rawFrequencies: null,
  });
  const [fileState, setFileState] = useState<FileAudioState>({
    isLoaded: false,
    isPlaying: false,
    duration: 0,
    currentTime: 0,
    fileName: null,
  });
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataArrayRef = useRef<any>(null);
  const animationFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  const analyze = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current || !audioContextRef.current) return;

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    const frequencies = dataArrayRef.current;
    const bufferLength = frequencies.length;

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += frequencies[i];
    }
    const volume = sum / bufferLength / 255;

    const bassEnd = Math.floor(bufferLength * 0.1);
    const midEnd = Math.floor(bufferLength * 0.5);

    let bassSum = 0;
    for (let i = 0; i < bassEnd; i++) {
      bassSum += frequencies[i];
    }
    const bass = bassSum / bassEnd / 255;

    let midSum = 0;
    for (let i = bassEnd; i < midEnd; i++) {
      midSum += frequencies[i];
    }
    const mid = midSum / (midEnd - bassEnd) / 255;

    let trebleSum = 0;
    for (let i = midEnd; i < bufferLength; i++) {
      trebleSum += frequencies[i];
    }
    const treble = trebleSum / (bufferLength - midEnd) / 255;

    const currentTime = audioContextRef.current.currentTime - startTimeRef.current;
    
    setAudioData({
      volume,
      bass,
      mid,
      treble,
      rawFrequencies: Uint8Array.from(frequencies),
    });

    setFileState(prev => ({
      ...prev,
      currentTime: Math.min(currentTime, prev.duration),
    }));

    if (currentTime < (audioBufferRef.current?.duration ?? 0)) {
      animationFrameRef.current = requestAnimationFrame(analyze);
    } else {
      setFileState(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const loadFile = useCallback(async (file: File) => {
    setError(null);
    
    if (!file.type.includes('audio')) {
      setError('Please upload an audio file (.mp3 or .wav)');
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      
      if (audioBuffer.duration > MAX_DURATION) {
        setError(`Audio must be under ${MAX_DURATION / 60} minutes. Current: ${(audioBuffer.duration / 60).toFixed(1)} min`);
        return;
      }

      audioBufferRef.current = audioBuffer;
      
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 512;
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = 1;

      // Create audio destination for recording
      audioDestinationRef.current = audioContextRef.current.createMediaStreamDestination();

      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      setFileState({
        isLoaded: true,
        isPlaying: false,
        duration: audioBuffer.duration,
        currentTime: 0,
        fileName: file.name,
      });
    } catch (err) {
      setError('Failed to decode audio file');
      console.error(err);
    }
  }, []);

  const play = useCallback(() => {
    if (!audioContextRef.current || !audioBufferRef.current || !analyserRef.current || !gainNodeRef.current || !audioDestinationRef.current) return;

    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current.disconnect();
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.connect(analyserRef.current);
    analyserRef.current.connect(gainNodeRef.current);
    gainNodeRef.current.connect(audioContextRef.current.destination);
    // Also connect to audio destination for recording
    gainNodeRef.current.connect(audioDestinationRef.current);
    
    sourceRef.current = source;
    startTimeRef.current = audioContextRef.current.currentTime;
    
    source.start(0);
    setFileState(prev => ({ ...prev, isPlaying: true, currentTime: 0 }));
    
    analyze();

    source.onended = () => {
      setFileState(prev => ({ ...prev, isPlaying: false }));
    };
  }, [analyze]);

  const stop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current.disconnect();
    }
    setFileState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
    setAudioData({ volume: 0, bass: 0, mid: 0, treble: 0, rawFrequencies: null });
  }, []);

  const reset = useCallback(() => {
    stop();
    audioBufferRef.current = null;
    setFileState({
      isLoaded: false,
      isPlaying: false,
      duration: 0,
      currentTime: 0,
      fileName: null,
    });
  }, [stop]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (sourceRef.current) {
        try { sourceRef.current.stop(); } catch (e) { /* ignore */ }
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    audioData,
    fileState,
    error,
    loadFile,
    play,
    stop,
    reset,
    audioContext: audioContextRef.current,
    audioDestination: audioDestinationRef.current,
  };
}
