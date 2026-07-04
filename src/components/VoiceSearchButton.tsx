import { useRef, useCallback, useEffect, useState } from 'react';
import { Mic, Check, Loader2 } from 'lucide-react';
import { useDeepgramVoiceSearch } from '../hooks/useDeepgramVoiceSearch';
import { useSearchStore } from '../store/useSearchStore';
import { cn } from '../lib/utils';

type VoiceState = 'idle' | 'preparing' | 'listening' | 'processing' | 'success' | 'error';

export function VoiceSearchButton() {
  const setQuery = useSearchStore(state => state.setQuery);
  const performSearch = useSearchStore(state => state.performSearch);
  const pressedRef = useRef(false);

  const { isListening, isPreparing, isSupported, transcript, error, isProcessing, startListening, stopListening } = useDeepgramVoiceSearch({
    onResult: useCallback((text) => {
      setQuery(text);
      performSearch(text);
    }, [setQuery, performSearch]),
  });

  const [displayError, setDisplayError] = useState<string | null>(null);
  const [displayTranscript, setDisplayTranscript] = useState<string | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transcriptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (error) {
      setDisplayError(error);
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      errorTimerRef.current = setTimeout(() => {
        setDisplayError(null);
      }, 3000);
    }
    return () => {
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }
    };
  }, [error]);

  useEffect(() => {
    if (transcript && !isProcessing) {
      setDisplayTranscript(transcript);
      if (transcriptTimerRef.current) clearTimeout(transcriptTimerRef.current);
      transcriptTimerRef.current = setTimeout(() => {
        setDisplayTranscript(null);
      }, 1500);
    }
    return () => {
      if (transcriptTimerRef.current) {
        clearTimeout(transcriptTimerRef.current);
      }
    };
  }, [transcript, isProcessing]);

  const getState = (): VoiceState => {
    if (displayError) return 'error';
    if (displayTranscript && !isProcessing) return 'success';
    if (isProcessing) return 'processing';
    if (isListening) return 'listening';
    if (isPreparing) return 'preparing';
    return 'idle';
  };

  const state = getState();

  const handleStart = useCallback(() => {
    if (pressedRef.current) return;
    pressedRef.current = true;

    setDisplayError(null);
    setDisplayTranscript(null);

    if (document.activeElement && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    startListening();
  }, [startListening]);

  const handleStop = useCallback(() => {
    if (!pressedRef.current) return;
    pressedRef.current = false;
    stopListening();
  }, [stopListening]);

  useEffect(() => {
    const onUp = () => { if (pressedRef.current) handleStop(); };
    const onCancel = () => { if (pressedRef.current) handleStop(); };

    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);

    return () => {
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
    };
  }, [handleStop]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    handleStart();
  }, [handleStart]);

  if (!isSupported) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="px-4 py-2 rounded-xl text-sm bg-[var(--warning)] text-[var(--text-inverse)] text-center shadow-lg">
          Voice not supported
        </div>
      </div>
    );
  }

  const showIndicator = state !== 'idle';
  const isErrorState = state === 'error';
  const isSuccessState = state === 'success';

  const bgClass = {
    idle: 'bg-[var(--accent)]',
    preparing: 'bg-[var(--bg-secondary)]',
    listening: 'bg-[var(--danger)]',
    processing: 'bg-[var(--warning)]',
    success: 'bg-[var(--success)]',
    error: 'bg-[var(--danger)]',
  }[state];

  const iconColor = state === 'preparing' || state === 'processing'
    ? 'text-[var(--text-primary)]'
    : 'text-[var(--text-inverse)]';

  const renderIcon = () => {
    if (state === 'success') {
      return <Check size={28} strokeWidth={2.5} className={iconColor} />;
    }
    if (state === 'processing') {
      return <Loader2 size={28} className={cn(iconColor, 'animate-spin-slow')} />;
    }
    return <Mic size={28} strokeWidth={2} className={iconColor} />;
  };

  const indicatorText = isErrorState
    ? displayError
    : isSuccessState
    ? displayTranscript
    : state === 'preparing'
    ? 'Preparing...'
    : state === 'listening'
    ? 'Listening...'
    : state === 'processing'
    ? 'Processing...'
    : '';

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
      {showIndicator && (
        <div
          className={cn(
            "absolute bottom-20 px-4 py-2 rounded-xl shadow-lg text-sm max-w-[80vw] text-center whitespace-nowrap transition-opacity duration-200",
            isErrorState
              ? "bg-[var(--danger)] text-[var(--text-inverse)]"
              : "bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-soft)]"
          )}
          style={{ bottom: '80px' }}
        >
          {indicatorText}
        </div>
      )}

      <button
        type="button"
        onPointerDown={onPointerDown}
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center shadow-lg touch-none relative transition-all duration-200 select-none",
          bgClass,
          state === 'preparing' && 'animate-pulse',
          state === 'error' && 'animate-shake'
        )}
        aria-label="Hold to voice search"
      >
        {state === 'listening' && (
          <span className="absolute inset-0 rounded-full bg-[var(--danger)] animate-pulse-ring" />
        )}
        {renderIcon()}
      </button>
    </div>
  );
}
