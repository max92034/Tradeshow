import { useState, useCallback, useRef, useEffect } from 'react';

interface UseVoiceSearchOptions {
  onResult: (text: string) => void;
  lang?: string;
}

export function useVoiceSearch({ onResult, lang = 'zh-CN' }: UseVoiceSearchOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const pressedRef = useRef(false);
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'mediaDevices' in window && 'MediaRecorder' in window) {
      setIsSupported(true);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const startListening = useCallback(async () => {
    setError(null);
    setTranscript('');
    setIsProcessing(false);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/ogg';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        setIsProcessing(true);
        setIsListening(false);

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        try {
          const arrayBuffer = await audioBlob.arrayBuffer();
          const base64 = btoa(
            new Uint8Array(arrayBuffer)
              .reduce((data, byte) => data + String.fromCharCode(byte), '')
          );

          const apiBase = typeof window !== 'undefined' ? window.location.origin : '';
          const response = await fetch(`${apiBase}/api/speech`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audio: base64, language: lang }),
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `Server error: ${response.status}`);
          }

          const result = await response.json();

          if (result.error) {
            setError(result.error);
          } else if (result.text) {
            setTranscript(result.text);
            onResultRef.current(result.text);
          } else {
            setError('No speech recognized - try speaking closer to the mic');
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Transcription failed';
          setError(msg);
        } finally {
          setIsProcessing(false);
          audioChunksRef.current = [];
        }
      };

      recorder.start(100);
      setIsListening(true);
    } catch (e) {
      const err = e as Error | DOMException;
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone access denied - allow mic in browser settings');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No microphone found on this device');
      } else {
        setError('Could not start recording: ' + (err.message || 'Unknown error'));
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    }
  }, [lang]);

  const stopListening = useCallback(() => {
    pressedRef.current = false;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    error,
    isProcessing,
    startListening,
    stopListening,
  };
}
