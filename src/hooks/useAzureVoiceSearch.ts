import { useState, useCallback, useRef, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

interface UseVoiceSearchOptions {
  onResult: (text: string) => void;
  lang?: string; // Optional - if not provided, uses settings store preference
}

export function useVoiceSearch({ onResult, lang }: UseVoiceSearchOptions) {
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
  const mimeTypeRef = useRef<string>('');

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    setIsSupported(true);
  }, []);

  function getApiUrl(): string {
    if (typeof window === 'undefined') return '/api/speech';
    const host = window.location.hostname;
    const vercelApiUrl = import.meta.env.VITE_VERCEL_API_URL;
    if (vercelApiUrl) return vercelApiUrl + '/api/speech';
    if (host.endsWith('github.io') || host === 'localhost') {
      return 'https://tradeshow-sigma.vercel.app/api/speech';
    }
    return '/api/speech';
  }

  function getBestAudioMimeType(): string {
    // iOS Safari prefers MP4/AAC, Chrome/Android prefers WebM/Opus
    const types = [
      'audio/mp4',           // iOS Safari (AAC)
      'audio/webm;codecs=opus', // Chrome/Android
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    // Fallback - let browser choose
    return '';
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const sendAudioForTranscription = useCallback(async (audioBlob: Blob, mimeType?: string) => {
    const apiUrl = getApiUrl();
    const voiceLanguage = useSettingsStore.getState().voiceLanguage;

    const arrayBuffer = await audioBlob.arrayBuffer();

    // Check for large audio files - split into chunks if needed
    if (arrayBuffer.byteLength > 10 * 1024 * 1024) {
      throw new Error('Audio too large - try recording shorter');
    }

    // Convert to base64
    const base64 = btoa(
      new Uint8Array(arrayBuffer)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    // Include mime type so API knows the format
    const payload = {
      audio: base64,
      language: lang || voiceLanguage,
      mimeType: mimeType || 'audio/webm'
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server error: ${response.status}`);
    }

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error);
    } else if (result.text) {
      return result.text;
    } else {
      throw new Error('No speech recognized - try speaking closer to the mic');
    }
  }, [lang]);

  const startListening = useCallback(async () => {
    setError(null);
    setTranscript('');
    setIsProcessing(false);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const mimeType = getBestAudioMimeType();
      mimeTypeRef.current = mimeType;

      const recorderOptions: MediaRecorderOptions = {};
      if (mimeType) {
        recorderOptions.mimeType = mimeType;
      }
      // Use higher bitrate for better recognition accuracy
      recorderOptions.audioBitsPerSecond = 128000;

      const recorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        setIsListening(false);
        setIsProcessing(true);

        // Check if we have audio data
        if (audioChunksRef.current.length === 0) {
          setError('No audio recorded - try holding longer');
          setIsProcessing(false);
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeTypeRef.current || 'audio/webm' });

        // Check if audio blob is too small (likely empty or corrupted)
        if (audioBlob.size < 100) {
          setError('Audio too short - try speaking longer');
          setIsProcessing(false);
          audioChunksRef.current = [];
          return;
        }

        try {
          const text = await sendAudioForTranscription(audioBlob, mimeTypeRef.current);
          setTranscript(text);
          onResultRef.current(text);
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Transcription failed';
          setError(msg);
        } finally {
          setIsProcessing(false);
          audioChunksRef.current = [];
        }
      };

      recorder.start(250);
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
  }, [sendAudioForTranscription]);

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
