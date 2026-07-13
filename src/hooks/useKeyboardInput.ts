import { useState, useEffect, useCallback, useRef } from 'react';

export interface KeyEvent {
  key: string;
  code: string;
  charCode: number;
  timestamp: number;
}

export interface SentimentScore {
  type: 'chaos' | 'calm' | 'neutral' | 'love' | 'hate';
  intensity: number;
}

export interface CharOffset {
  x: number;
  y: number;
  z: number;
  speed: number;
  phase: number;
}

const CHAOS_WORDS = ['ruido', 'caos', 'error', 'destruir', 'romper', 'crash', 'noise', 'chaos', 'break', 'destroy', 'rage', 'fury'];
const CALM_WORDS = ['calma', 'fluir', 'espacio', 'paz', 'suave', 'calm', 'flow', 'space', 'peace', 'soft', 'gentle', 'quiet', 'serene'];
const LOVE_PHRASES = ['te amo', 'i love you', 'love', 'amor', 'te quiero'];
const HATE_PHRASES = ['te odio', 'i hate you', 'hate', 'odio'];

export function useKeyboardInput() {
  const [inputText, setInputText] = useState('');
  const [lastKeyEvent, setLastKeyEvent] = useState<KeyEvent | null>(null);
  const [sentiment, setSentiment] = useState<SentimentScore>({ type: 'neutral', intensity: 0 });
  const [flash, setFlash] = useState(false);
  const [charOffsets, setCharOffsets] = useState<CharOffset[]>([]);
  const historyRef = useRef<string[]>([]);

  // Generate random offset for each new character
  const generateCharOffset = useCallback((): CharOffset => {
    return {
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
      z: (Math.random() - 0.5) * 1,
      speed: 0.5 + Math.random() * 2,
      phase: Math.random() * Math.PI * 2,
    };
  }, []);

  const analyzeSentiment = useCallback((text: string): SentimentScore => {
    const lowerText = text.toLowerCase();
    
    // Check for love phrases first (highest priority)
    for (const phrase of LOVE_PHRASES) {
      if (lowerText.includes(phrase)) {
        return { type: 'love', intensity: 1 };
      }
    }
    
    // Check for hate phrases
    for (const phrase of HATE_PHRASES) {
      if (lowerText.includes(phrase)) {
        return { type: 'hate', intensity: 1 };
      }
    }
    
    const words = lowerText.split(/\s+/);
    let chaosScore = 0;
    let calmScore = 0;

    for (const word of words) {
      if (CHAOS_WORDS.some(cw => word.includes(cw))) chaosScore++;
      if (CALM_WORDS.some(cw => word.includes(cw))) calmScore++;
    }

    if (chaosScore > calmScore) {
      return { type: 'chaos', intensity: Math.min(chaosScore / 3, 1) };
    } else if (calmScore > chaosScore) {
      return { type: 'calm', intensity: Math.min(calmScore / 3, 1) };
    }
    return { type: 'neutral', intensity: 0 };
  }, []);

  const getCurvatureFromChar = useCallback((char: string): number => {
    const curved = ['o', 'O', 'q', 'Q', 'c', 'C', '0', 'e', 'E', 's', 'S', 'g', 'G', 'd', 'D', 'b', 'p', 'P'];
    const angular = ['x', 'X', 't', 'T', 'a', 'A', 'z', 'Z', 'k', 'K', 'v', 'V', 'w', 'W', 'm', 'M', 'n', 'N'];
    
    if (curved.includes(char)) return 1;
    if (angular.includes(char)) return -1;
    return 0;
  }, []);

  const getTextCurvature = useCallback((text: string): number => {
    if (!text) return 0;
    let total = 0;
    for (const char of text) {
      total += getCurvatureFromChar(char);
    }
    return total / text.length;
  }, [getCurvatureFromChar]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore modifier keys alone
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) return;

      const charCode = e.key.length === 1 ? e.key.charCodeAt(0) : e.keyCode;
      
      setLastKeyEvent({
        key: e.key,
        code: e.code,
        charCode,
        timestamp: Date.now(),
      });

      if (e.key === 'Enter') {
        // Flash effect
        setFlash(true);
        setTimeout(() => setFlash(false), 50);
        
        // Save to history and clear
        if (inputText.trim()) {
          historyRef.current.push(inputText);
        }
        setInputText('');
        setCharOffsets([]);
        setSentiment({ type: 'neutral', intensity: 0 });
      } else if (e.key === 'Backspace') {
        setInputText(prev => {
          const newText = prev.slice(0, -1);
          setSentiment(analyzeSentiment(newText));
          return newText;
        });
        setCharOffsets(prev => prev.slice(0, -1));
      } else if (e.key.length === 1) {
        setInputText(prev => {
          const newText = prev + e.key;
          setSentiment(analyzeSentiment(newText));
          return newText;
        });
        setCharOffsets(prev => [...prev, generateCharOffset()]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputText, analyzeSentiment, generateCharOffset]);

  // Function to set text from external source (mobile input)
  const setTextFromMobile = useCallback((newText: string) => {
    const prevLength = inputText.length;
    const newLength = newText.length;
    
    // Update text
    setInputText(newText);
    setSentiment(analyzeSentiment(newText));
    
    // Generate key event for the new character
    if (newLength > prevLength) {
      const newChar = newText[newLength - 1];
      setLastKeyEvent({
        key: newChar,
        code: `Key${newChar.toUpperCase()}`,
        charCode: newChar.charCodeAt(0),
        timestamp: Date.now(),
      });
      // Add char offset for new character
      setCharOffsets(prev => {
        const newOffsets = [...prev];
        while (newOffsets.length < newLength) {
          newOffsets.push(generateCharOffset());
        }
        return newOffsets;
      });
    } else if (newLength < prevLength) {
      // Backspace effect
      setCharOffsets(prev => prev.slice(0, newLength));
      setLastKeyEvent({
        key: 'Backspace',
        code: 'Backspace',
        charCode: 8,
        timestamp: Date.now(),
      });
    }
  }, [inputText, analyzeSentiment, generateCharOffset]);

  // Function to handle Enter from mobile
  const triggerEnter = useCallback(() => {
    setFlash(true);
    setTimeout(() => setFlash(false), 50);
    
    if (inputText.trim()) {
      historyRef.current.push(inputText);
    }
    setInputText('');
    setCharOffsets([]);
    setSentiment({ type: 'neutral', intensity: 0 });
    
    setLastKeyEvent({
      key: 'Enter',
      code: 'Enter',
      charCode: 13,
      timestamp: Date.now(),
    });
  }, [inputText]);

  return {
    inputText,
    lastKeyEvent,
    sentiment,
    flash,
    curvature: getTextCurvature(inputText),
    nodeCount: inputText.length || 1,
    charOffsets,
    history: historyRef.current,
    setTextFromMobile,
    triggerEnter,
  };
}
