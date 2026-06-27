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
  const resultRef = useRef('');
  const interimRef = useRef('');
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setIsSupported(true);
    }
  }, []);

  useEffect(() => {
    return () => {
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

  const startListening = useCallback(() => {
    if (!isSupported) return;

    const SpeechRecognitionCtor = (window as unknown as { 
      SpeechRecognition?: new () => SpeechRecognition;
      webkitSpeechRecognition?: new () => SpeechRecognition;
    }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition: new () => SpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) return;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_e) {
        // ignore
      }
      recognitionRef.current = null;
    }

    setError(null);
    resultRef.current = '';
    setTranscript('');

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

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
        resultRef.current += finalChunk;
      }
      interimRef.current = interim;
      
      setTranscript(resultRef.current + interim);
    };

    recognition.onend = () => {
      const text = (resultRef.current + interimRef.current).trim();
      setIsListening(false);
      recognitionRef.current = null;
      if (text) {
        onResultRef.current(text);
      }
      setTranscript('');
      resultRef.current = '';
      interimRef.current = '';
    };

    recognition.onerror = (event: unknown) => {
      const err = event as { error?: string };
      if (err.error !== 'no-speech' && err.error !== 'aborted') {
        setError(err.error || 'Unknown error');
      }
      setIsListening(false);
      setTranscript('');
      recognitionRef.current = null;
      resultRef.current = '';
      interimRef.current = '';
    };

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    try {
      recognition.start();
    } catch (_e) {
      setIsListening(false);
      setError('Failed to start');
      recognitionRef.current = null;
    }
  }, [isSupported, lang]);

  const stopListening = useCallback(() => {
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
