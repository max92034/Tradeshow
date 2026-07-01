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
      // iOS: stop any leftover tracks before starting fresh
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }

      // Create/resume AudioContext BEFORE awaiting getUserMedia
      // iOS requires AudioContext creation within the user gesture
      if (typeof window !== 'undefined') {
        const AC = window.AudioContext || (window as any).webkitAudioContext;
        if (AC) {
          if (!audioContextRef.current) {
            audioContextRef.current = new AC();
          }
          if (audioContextRef.current.state === 'suspended') {
            try {
              await audioContextRef.current.resume();
            } catch {
              // ignore
            }
          }
        }
      }

      // Get fresh stream (iOS can't cache streams)
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

      // Verify audio track is live and enabled
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('No audio track available');
      }
      const track = audioTracks[0];
      if (!track.enabled) track.enabled = true;

      // Determine mime type
      const mimeType = getBestAudioMimeType();
      mimeTypeRef.current = mimeType;

      const recorderOptions: MediaRecorderOptions = {};
      if (mimeType) {
        recorderOptions.mimeType = mimeType;
      }
      if (!isIOS) {
        recorderOptions.audioBitsPerSecond = 128000;
      }

      // Always create new MediaRecorder (iOS can't restart stopped ones)
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

        // Brief wait for any late ondataavailable
        await new Promise(r => setTimeout(r, 100));

        if (audioChunksRef.current.length === 0) {
          setError('No audio recorded - try holding longer');
          setIsProcessing(false);
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeTypeRef.current || 'audio/webm' });

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

      recorder.onerror = (e: Event) => {
        const err = (e as any).error;
        setError('Recording error: ' + (err?.message || 'unknown'));
        setIsListening(false);
        setIsPreparing(false);
      };

      // iOS: use 100ms timeslice to ensure regular data delivery
      // Without timeslice, iOS MediaRecorder may not produce data
      // Desktop/Android: timeslice=0 means deliver all data on stop
      const timeslice = isIOS ? 100 : 0;
      recorder.start(timeslice);

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
        setError('Could not start: ' + (err.message || 'Unknown error'));
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
    const delay = isIOS ? 400 : 200;

    stopTimeoutRef.current = setTimeout(() => {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        try {
          recorder.stop();
        } catch {
          // ignore
        }
      }

      // iOS: stop stream tracks after recording completes
      if (isIOS) {
        setTimeout(() => {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
          }
          mediaRecorderRef.current = null;
        }, 400);
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
