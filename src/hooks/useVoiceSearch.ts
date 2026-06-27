import { useState, useCallback, useEffect, useRef } from 'react';

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event | { error?: string; message?: string }) => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface Window {
  SpeechRecognition: new () => SpeechRecognition;
  webkitSpeechRecognition: new () => SpeechRecognition;
}

interface UseVoiceSearchOptions {
  onResult: (text: string) => void;
  lang?: string;
}

export function useVoiceSearch({ onResult, lang = 'zh-CN' }: UseVoiceSearchOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const activeRef = useRef(false);
  const finalTextRef = useRef('');
  const interimTextRef = useRef('');
  const onResultRef = useRef(onResult);
  const langRef = useRef(lang);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setIsSupported(true);
    }
  }, []);

  useEffect(() => {
    return () => {
      activeRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onstart = null;
        try {
          recognitionRef.current.abort();
        } catch (_e) {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  const createRecognition = useCallback((): SpeechRecognition | null => {
    const SpeechRecognitionCtor = (window as unknown as {
      SpeechRecognition?: new () => SpeechRecognition;
      webkitSpeechRecognition?: new () => SpeechRecognition;
    }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition: new () => SpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) return null;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = langRef.current;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: unknown) => {
      const e = event as { resultIndex: number; results: Array<Array<{ transcript: string }> & { isFinal: boolean }> };
      let interim = '';
      let finalChunk = '';

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalChunk += t;
        } else {
          interim += t;
        }
      }

      if (finalChunk) {
        finalTextRef.current += finalChunk;
      }
      interimTextRef.current = interim;
      setTranscript(finalTextRef.current + interim);
    };

    recognition.onerror = (event: unknown) => {
      const err = event as { error?: string };
      const errorCode = err.error || 'unknown';

      if (errorCode === 'aborted') {
        return;
      }

      if (errorCode === 'no-speech') {
        if (activeRef.current) {
          return;
        }
      }

      if (errorCode === 'not-allowed' || errorCode === 'service-not-allowed') {
        setError('Microphone permission denied');
      } else if (errorCode === 'network') {
        setError('Network error');
      } else if (errorCode === 'audio-capture') {
        setError('No microphone found');
      } else if (errorCode !== 'no-speech') {
        setError(errorCode);
      }

      setIsListening(false);
      setTranscript('');
      recognitionRef.current = null;
      finalTextRef.current = '';
      interimTextRef.current = '';
      activeRef.current = false;
    };

    recognition.onend = () => {
      if (activeRef.current) {
        const currentFinal = finalTextRef.current + interimTextRef.current;
        if (currentFinal.trim()) {
          finalTextRef.current = currentFinal.trim() + ' ';
          interimTextRef.current = '';
          setTranscript(finalTextRef.current);
        }

        try {
          if (recognitionRef.current) {
            recognitionRef.current.start();
            return;
          }
        } catch (_e) {
          // fall through to finalize
        }
      }

      const text = (finalTextRef.current + interimTextRef.current).trim();
      setIsListening(false);
      setTranscript('');
      recognitionRef.current = null;
      finalTextRef.current = '';
      interimTextRef.current = '';
      if (text) {
        onResultRef.current(text);
      }
    };

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    return recognition;
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported || activeRef.current) return;

    setError(null);
    finalTextRef.current = '';
    interimTextRef.current = '';
    setTranscript('');
    activeRef.current = true;

    const recognition = createRecognition();
    if (!recognition) {
      activeRef.current = false;
      setError('Speech recognition not supported');
      return;
    }

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (_e) {
      setIsListening(false);
      setError('Failed to start recognition');
      recognitionRef.current = null;
      activeRef.current = false;
    }
  }, [isSupported, createRecognition]);

  const stopListening = useCallback(() => {
    activeRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_e) {
        // ignore
      }
    }
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
  };
}
