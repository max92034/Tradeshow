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
  onstart: (() => void) | void;
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
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setIsSupported(true);
      console.log('[VoiceSearch] Speech recognition supported');
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_e) { /* ignore */ }
      }
    };
  }, []);

  const startListening = useCallback(() => {
    console.log('[VoiceSearch] startListening called, isSupported:', isSupported);

    if (!isSupported) {
      console.log('[VoiceSearch] Not supported');
      return;
    }

    const SpeechRecognitionCtor = (window as unknown as {
      SpeechRecognition?: new () => SpeechRecognition;
      webkitSpeechRecognition?: new () => SpeechRecognition;
    }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition: new () => SpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      console.log('[VoiceSearch] Constructor not found');
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    let finalTranscript = '';
    let interimTranscript = '';

    recognition.onstart = () => {
      console.log('[VoiceSearch] Recognition started');
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: unknown) => {
      const e = event as { resultIndex: number; results: Array<Array<{ transcript: string }> & { isFinal: boolean }> };
      interimTranscript = '';
      finalTranscript = '';

      for (let i = 0; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalTranscript += t;
          console.log('[VoiceSearch] Final result:', t);
        } else {
          interimTranscript += t;
          console.log('[VoiceSearch] Interim result:', t);
        }
      }

      const displayText = finalTranscript + interimTranscript;
      setTranscript(displayText);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        console.log('[VoiceSearch] Timeout reached, finalizing');
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (_e) { /* ignore */ }
        }
      }, 3000);
    };

    recognition.onerror = (event: unknown) => {
      const err = event as { error?: string };
      const errorCode = err.error || 'unknown';
      console.log('[VoiceSearch] Error:', errorCode);

      if (errorCode === 'aborted') {
        return;
      }

      if (errorCode === 'no-speech') {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        return;
      }

      if (errorCode === 'not-allowed' || errorCode === 'service-not-allowed') {
        setError('Microphone denied - check browser permissions');
      } else if (errorCode === 'network') {
        setError('Network error');
      } else if (errorCode === 'audio-capture') {
        setError('No microphone found');
      } else {
        setError(errorCode);
      }

      setIsListening(false);
      setTranscript('');
    };

    recognition.onend = () => {
      console.log('[VoiceSearch] Recognition ended, final:', finalTranscript, 'interim:', interimTranscript);
      setIsListening(false);
      recognitionRef.current = null;

      const text = (finalTranscript || interimTranscript).trim();
      setTranscript('');

      if (text) {
        console.log('[VoiceSearch] Returning result:', text);
        onResultRef.current(text);
      }
    };

    try {
      console.log('[VoiceSearch] Calling recognition.start()');
      recognition.start();
    } catch (e) {
      console.log('[VoiceSearch] Failed to start:', e);
      setIsListening(false);
      setError('Failed to start');
      recognitionRef.current = null;
    }
  }, [isSupported, lang]);

  const stopListening = useCallback(() => {
    console.log('[VoiceSearch] stopListening called');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        console.log('[VoiceSearch] Calling recognition.stop()');
        recognitionRef.current.stop();
      } catch (e) {
        console.log('[VoiceSearch] stop() error:', e);
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
