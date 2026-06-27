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
  onerror: ((event: Event | { error?: string }) => void) | null;
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
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');
  const interimTranscriptRef = useRef('');

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

    const recognition = new SpeechRecognitionCtor();
    // Support both Chinese and English
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;
    finalTranscriptRef.current = '';
    interimTranscriptRef.current = '';
    setTranscript('');

    recognition.onresult = (event: unknown) => {
      const e = event as { resultIndex: number; results: Array<Array<{ transcript: string }> & { isFinal: boolean }> };
      let newFinal = '';
      let newInterim = '';
      
      for (let i = 0; i < e.results.length; i++) {
        const transcriptText = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          newFinal += transcriptText;
        } else {
          newInterim += transcriptText;
        }
      }
      
      if (newFinal) {
        finalTranscriptRef.current += newFinal;
      }
      interimTranscriptRef.current = newInterim;
      
      setTranscript(finalTranscriptRef.current + interimTranscriptRef.current);
    };

    recognition.onend = () => {
      const finalText = (finalTranscriptRef.current + interimTranscriptRef.current).trim();
      if (finalText) {
        onResult(finalText);
      }
      setIsListening(false);
      setTranscript('');
      recognitionRef.current = null;
      finalTranscriptRef.current = '';
      interimTranscriptRef.current = '';
    };

    recognition.onerror = (event: unknown) => {
      const err = event as { error?: string };
      // Ignore "no-speech" errors - they just mean the user didn't say anything
      if (err.error === 'no-speech' || err.error === 'aborted') {
        // Don't treat these as errors
      }
      setIsListening(false);
      setTranscript('');
      recognitionRef.current = null;
      finalTranscriptRef.current = '';
      interimTranscriptRef.current = '';
    };

    recognition.onstart = () => {
      setIsListening(true);
    };

    try {
      recognition.start();
    } catch (_e) {
      setIsListening(false);
      recognitionRef.current = null;
    }
  }, [isSupported, lang, onResult]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_e) {
        // ignore - might already be stopped
      }
    }
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
  };
}
