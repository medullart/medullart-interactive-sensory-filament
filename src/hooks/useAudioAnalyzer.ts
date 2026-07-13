import { useState, useRef, useCallback, useEffect } from 'react';

export interface AudioData {
  volume: number;
  bass: number;
  mid: number;
  treble: number;
  rawFrequencies: Uint8Array | null;
}

export function useAudioAnalyzer() {
  const [isActive, setIsActive] = useState(false);
  const [audioData, setAudioData] = useState<AudioData>({
    volume: 0,
    bass: 0,
    mid: 0,
    treble: 0,
    rawFrequencies: null,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataArrayRef = useRef<any>(null);
  const animationFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const analyze = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    const frequencies = dataArrayRef.current;
    const bufferLength = frequencies.length;

    // Calculate volume (average of all frequencies)
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += frequencies[i];
    }
    const volume = sum / bufferLength / 255;

    // Split into frequency bands (FFT analysis)
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

    setAudioData({
      volume,
      bass,
      mid,
      treble,
      rawFrequencies: Uint8Array.from(frequencies),
    });

    animationFrameRef.current = requestAnimationFrame(analyze);
  }, []);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      setIsActive(true);
      analyze();
    } catch (error) {
      console.error('Microphone access denied:', error);
    }
  }, [analyze]);

  const stop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsActive(false);
    setAudioData({ volume: 0, bass: 0, mid: 0, treble: 0, rawFrequencies: null });
  }, []);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return { isActive, audioData, start, stop };
}
