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
  onerror: ((event: Event) => void) | null;
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

export function useVoiceSearch({ onResult, lang = 'en-US' }: UseVoiceSearchOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');

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
        recognitionRef.current.abort();
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
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;
    finalTranscriptRef.current = '';
    setTranscript('');

    recognition.onresult = (event: unknown) => {
      const e = event as { resultIndex: number; results: Array<Array<{ transcript: string }> & { isFinal: boolean }> };
      let interimTranscript = '';
      let finalChunk = '';
      
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcriptText = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalChunk += transcriptText;
        } else {
          interimTranscript += transcriptText;
        }
      }

      if (finalChunk) {
        finalTranscriptRef.current += finalChunk;
      }
      
      setTranscript(finalTranscriptRef.current + interimTranscript);
    };

    recognition.onend = () => {
      const finalText = finalTranscriptRef.current.trim();
      if (finalText) {
        onResult(finalText);
      }
      setIsListening(false);
      setTranscript('');
      recognitionRef.current = null;
      finalTranscriptRef.current = '';
    };

    recognition.onerror = () => {
      setIsListening(false);
      setTranscript('');
      recognitionRef.current = null;
      finalTranscriptRef.current = '';
    };

    recognition.onstart = () => {
      setIsListening(true);
    };

    try {
      recognition.start();
    } catch (_e) {
      // ignore if already started
    }
  }, [isSupported, lang, onResult]);

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
    startListening,
    stopListening,
  };
}
