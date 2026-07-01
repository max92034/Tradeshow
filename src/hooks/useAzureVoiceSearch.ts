import { useState, useCallback, useRef, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

interface UseVoiceSearchOptions {
  onResult: (text: string) => void;
  lang?: string;
}

export function useVoiceSearch({ onResult, lang }: UseVoiceSearchOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const onResultRef = useRef(onResult);
  const mimeTypeRef = useRef<string>('');
  const audioContextRef = useRef<AudioContext | null>(null);
  const stopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isIOSRef = useRef(false);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    // Check MediaRecorder support
    if (typeof MediaRecorder !== 'undefined' && typeof navigator !== 'undefined' && navigator.mediaDevices) {
      setIsSupported(true);
    }
    // Detect iOS (including iPadOS 13+ which reports as Mac)
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent || '';
      const isIOSDevice = /iPad|iPhone|iPod/.test(ua) ||
        (navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1);
      isIOSRef.current = isIOSDevice;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
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
    const types = [
      'audio/mp4',
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
    ];
    for (const type of types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  }

  const sendAudioForTranscription = useCallback(async (audioBlob: Blob, mimeType?: string) => {
    const apiUrl = getApiUrl();
    const voiceLanguage = useSettingsStore.getState().voiceLanguage;

    const arrayBuffer = await audioBlob.arrayBuffer();

    if (arrayBuffer.byteLength > 10 * 1024 * 1024) {
      throw new Error('Audio too large - try recording shorter');
    }

    const base64 = btoa(
      new Uint8Array(arrayBuffer)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

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

    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }

    setIsPreparing(true);

    const isIOS = isIOSRef.current;

    try {
      // iOS: Always stop any previous stream tracks — iOS can't reuse streams
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }

      // Get fresh stream every time (iOS can't cache streams reliably)
      const constraints: MediaStreamConstraints = {
        audio: isIOS
          ? true
          : {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: true,
              channelCount: 1,
            },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Create/resume AudioContext within the user gesture (required by iOS)
      if (!audioContextRef.current && typeof window !== 'undefined') {
        const AC = window.AudioContext || (window as any).webkitAudioContext;
        if (AC) {
          audioContextRef.current = new AC();
        }
      }
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        try {
          await audioContextRef.current.resume();
        } catch {
          // Resume can fail if not in gesture, ignore
        }
      }

      // Determine best mime type
      const mimeType = getBestAudioMimeType();
      mimeTypeRef.current = mimeType;

      const recorderOptions: MediaRecorderOptions = {};
      if (mimeType) {
        recorderOptions.mimeType = mimeType;
      }
      if (!isIOS) {
        recorderOptions.audioBitsPerSecond = 128000;
      }

      // Always create a new MediaRecorder (iOS can't restart stopped ones)
      const recorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        setIsListening(false);
        setIsProcessing(true);

        // Small delay to let any late ondataavailable fire (iOS quirk)
        await new Promise(r => setTimeout(r, 150));

        if (audioChunksRef.current.length === 0) {
          setError('No audio recorded - try holding longer');
          setIsProcessing(false);
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeTypeRef.current || 'audio/webm' });

        if (audioBlob.size < 200) {
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

      recorder.onerror = () => {
        setError('Recording error - try again');
        setIsListening(false);
        setIsPreparing(false);
      };

      // Start recording — NO timeslice on iOS (data only comes on stop)
      // On non-iOS, timeslice=0 also delivers data on stop
      recorder.start();

      setIsPreparing(false);
      setIsListening(true);
    } catch (e) {
      setIsPreparing(false);
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
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
    }

    const isIOS = isIOSRef.current;
    // Longer delay on iOS to ensure all audio is captured
    const delay = isIOS ? 500 : 200;

    stopTimeoutRef.current = setTimeout(() => {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        try {
          // Force flush any buffered data before stopping (critical for iOS)
          if (typeof recorder.requestData === 'function') {
            recorder.requestData();
          }
        } catch {
          // ignore
        }

        // Wait briefly after requestData, then stop
        setTimeout(() => {
          try {
            if (recorder.state !== 'inactive') {
              recorder.stop();
            }
          } catch {
            // ignore
          }
        }, 100);
      }

      // iOS: stop stream tracks after recording (don't reuse streams)
      if (isIOS && streamRef.current) {
        setTimeout(() => {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
          }
        }, 300);
      }
    }, delay);
  }, []);

  return {
    isListening,
    isPreparing,
    isSupported,
    transcript,
    error,
    isProcessing,
    startListening,
    stopListening,
  };
}
