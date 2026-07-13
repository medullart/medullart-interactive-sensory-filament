import { useState, useRef, useCallback } from 'react';

export interface RecordingState {
  isRecording: boolean;
  isProcessing: boolean;
  progress: number;
  error: string | null;
}

export function useVideoRecorder() {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isProcessing: false,
    progress: 0,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async (
    canvas: HTMLCanvasElement,
    audioContext?: AudioContext | null,
    audioDestination?: MediaStreamAudioDestinationNode | null,
    duration?: number
  ) => {
    chunksRef.current = [];
    const recordDuration = duration || 8000;
    const TARGET_FPS = 30;

    try {
      // Get video stream from canvas
      const videoStream = canvas.captureStream(TARGET_FPS);
      
      // Combine video and audio if audio is available
      let combinedStream: MediaStream;
      
      if (audioDestination && audioDestination.stream.getAudioTracks().length > 0) {
        const audioTrack = audioDestination.stream.getAudioTracks()[0];
        combinedStream = new MediaStream([
          ...videoStream.getVideoTracks(),
          audioTrack
        ]);
      } else {
        combinedStream = videoStream;
      }

      // Find best supported mime type
      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
        'video/mp4'
      ];
      
      let mimeType = 'video/webm';
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 5000000,
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onerror = (e) => {
        console.error('MediaRecorder error:', e);
        setState(prev => ({
          ...prev,
          error: 'Recording error occurred',
          isRecording: false,
        }));
      };

      mediaRecorder.onstop = () => {
        setState(prev => ({ ...prev, isProcessing: true, progress: 80 }));

        try {
          if (chunksRef.current.length === 0) {
            throw new Error('No data recorded');
          }

          const blob = new Blob(chunksRef.current, { type: mimeType });
          
          if (blob.size === 0) {
            throw new Error('Empty recording');
          }

          setState(prev => ({ ...prev, progress: 95 }));
          
          // Download the file
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
          a.download = `medullart_${Date.now()}.${extension}`;
          document.body.appendChild(a);
          a.click();
          
          // Cleanup
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 100);

          setState({
            isRecording: false,
            isProcessing: false,
            progress: 100,
            error: null,
          });

        } catch (err) {
          console.error('Export error:', err);
          setState({
            isRecording: false,
            isProcessing: false,
            progress: 0,
            error: err instanceof Error ? err.message : 'Export failed',
          });
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      
      // Start recording with timeslice for more reliable data capture
      mediaRecorder.start(500);

      setState({
        isRecording: true,
        isProcessing: false,
        progress: 0,
        error: null,
      });

      // Progress tracking
      const startTime = Date.now();
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / recordDuration) * 75, 75);
        setState(prev => ({ ...prev, progress }));

        if (elapsed >= recordDuration) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
          }
        }
      }, 100);

    } catch (err) {
      console.error('Failed to start recording:', err);
      setState({
        isRecording: false,
        isProcessing: false,
        progress: 0,
        error: err instanceof Error ? err.message : 'Failed to start recording',
      });
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
  };
}
