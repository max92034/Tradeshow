import { useState, useCallback, useRef, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import {
  acquireMicStream,
  createMediaRecorder,
  detectIOS,
  stopStreamTracks,
} from '../utils/audioRecorder';

interface UseVoiceSearchOptions {
  onResult: (text: string) => void;
  lang?: string;
}

export function useDeepgramVoiceSearch({ onResult, lang }: UseVoiceSearchOptions) {
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
  const abortControllerRef = useRef<AbortController | null>(null);
  const stopRequestedRef = useRef(false);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    if (typeof MediaRecorder !== 'undefined' && typeof navigator !== 'undefined' && navigator.mediaDevices) {
      setIsSupported(true);
    }
    isIOSRef.current = detectIOS();
  }, []);

  useEffect(() => {
    return () => {
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (streamRef.current) {
        stopStreamTracks(streamRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  function getApiUrl(): string {
    const customUrl = import.meta.env.VITE_DEEPGRAM_API_URL;
    if (customUrl) return customUrl;

    const vercelApiUrl = import.meta.env.VITE_VERCEL_API_URL;
    if (vercelApiUrl) return vercelApiUrl + '/api/speech';

    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      if (host.endsWith('github.io') || host === 'localhost') {
        return 'https://tradeshow-sigma.vercel.app/api/speech';
      }
    }

    return '/api/speech';
  }

  const sendAudioForTranscription = useCallback(async (audioBlob: Blob, mimeType?: string) => {
    const apiUrl = getApiUrl();
    const voiceLanguage = useSettingsStore.getState().voiceLanguage;

    if (audioBlob.size > 10 * 1024 * 1024) {
      throw new Error('Audio too large - try recording shorter');
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, 15000);

    const formData = new FormData();
    formData.append('audio', audioBlob, `recording.${mimeType?.split('/')[1] || 'webm'}`);
    formData.append('language', lang || voiceLanguage);
    formData.append('mimeType', mimeType || 'audio/webm');

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        signal: abortController.signal,
      });

      if (response.status === 422) {
        throw new Error('No speech recognized - try speaking clearer');
      }

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
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        throw new Error('Request timed out - please retry');
      }
      throw e;
    } finally {
      clearTimeout(timeoutId);
      abortControllerRef.current = null;
    }
  }, [lang]);

  const scheduleStop = useCallback(() => {
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

      if (isIOS) {
        setTimeout(() => {
          if (streamRef.current) {
            stopStreamTracks(streamRef.current);
            streamRef.current = null;
          }
          mediaRecorderRef.current = null;
        }, 400);
      }
    }, delay);
  }, []);

  const startListening = useCallback(async () => {
    setError(null);
    setTranscript('');
    setIsProcessing(false);
    audioChunksRef.current = [];

    stopRequestedRef.current = false;

    // Force-stop any existing recorder before starting a new one.
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        // Detach handlers first so the orphaned recorder can't fire onstop
        // and send stale audio / clobber the new recording's state.
        mediaRecorderRef.current.ondataavailable = null;
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.onerror = null;
        mediaRecorderRef.current.stop();
      } catch { /* already stopping */ }
      mediaRecorderRef.current = null;
    }
    // Also clean up all stream tracks immediately
    if (streamRef.current) {
      stopStreamTracks(streamRef.current);
      streamRef.current = null;
    }

    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setIsPreparing(true);

    const isIOS = isIOSRef.current;

    try {
      const stream = await acquireMicStream(isIOS);
      streamRef.current = stream;

      if (!isIOS && typeof window !== 'undefined') {
        const AC = window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
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

      const { recorder, mimeType } = createMediaRecorder(stream, isIOS);
      mimeTypeRef.current = mimeType;

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
        const err = (e as Event & { error?: DOMException }).error;
        setError('Recording error: ' + (err?.message || 'unknown'));
        setIsListening(false);
        setIsPreparing(false);
      };

      const timeslice = isIOS ? 100 : 0;
      recorder.start(timeslice);

      setIsPreparing(false);
      setIsListening(true);

      // If the user released the button while getUserMedia was still pending
      // (common on iOS: the mic permission prompt and audio-session setup are
      // slow), stopListening ran before any recorder existed and was a no-op.
      // Without this check the recorder would keep recording forever.
      if (stopRequestedRef.current) {
        scheduleStop();
      }
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
        stopStreamTracks(streamRef.current);
        streamRef.current = null;
      }
    }
  }, [sendAudioForTranscription, scheduleStop]);

  const stopListening = useCallback(() => {
    stopRequestedRef.current = true;
    scheduleStop();
  }, [scheduleStop]);

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
