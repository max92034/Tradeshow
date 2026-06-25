import { useState, useCallback, useEffect, useRef } from 'react';

interface UseVoiceSearchOptions {
  onResult: (text: string) => void;
  lang?: string;
}

export function useVoiceSearch({ onResult, lang = 'en-US' }: UseVoiceSearchOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setIsSupported(true);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) return;

    const SpeechRecognition = (window as unknown as { 
      SpeechRecognition?: typeof SpeechRecognition;
      webkitSpeechRecognition?: typeof SpeechRecognition;
    }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition: typeof SpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    recognition.onresult = (event: unknown) => {
      const e = event as { resultIndex: number; results: Array<Array<{ transcript: string }> & { isFinal: boolean }> };
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      setTranscript(finalTranscript || interimTranscript);
      
      if (finalTranscript) {
        onResult(finalTranscript.trim());
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setTranscript('');
      recognitionRef.current = null;
    };

    recognition.onerror = () => {
      setIsListening(false);
      setTranscript('');
      recognitionRef.current = null;
    };

    recognition.start();
    setIsListening(true);
  }, [isSupported, lang, onResult]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setTranscript('');
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
  };
}
