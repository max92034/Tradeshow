import { useRef, useCallback, useEffect, useState } from 'react';
import { Mic, Check, Loader2 } from 'lucide-react';
import { useVoiceSearchToQuery } from '../hooks/useVoiceSearchToQuery';
import { cn } from '../lib/utils';

type VoiceState = 'idle' | 'preparing' | 'listening' | 'processing' | 'success' | 'error';

export function VoiceSearchButton() {
  const pressedRef = useRef(false);

  const { isListening, isPreparing, isSupported, transcript, error, isProcessing, startListening, stopListening } = useVoiceSearchToQuery();

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
    // handleStart() blurs the active element, so keyup may not reach the
    // button — listen on window while pressed, same as pointerup.
    window.addEventListener('keyup', onUp);

    return () => {
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      window.removeEventListener('keyup', onUp);
    };
  }, [handleStop]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (document.activeElement && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    handleStart();
  }, [handleStart]);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    if (!e.repeat) handleStart();
  }, [handleStart]);

  if (!isSupported) {
    return null;
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

  const iconColor = state === 'preparing'
    ? 'text-[var(--text-primary)]'
    : state === 'listening' || state === 'error' || state === 'processing'
    ? 'text-[var(--on-danger,#fff)]'
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
              ? "bg-[var(--danger)] text-[var(--on-danger,#fff)]"
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
        onKeyDown={onKeyDown}
        onContextMenu={(e) => e.preventDefault()}
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center shadow-lg touch-none relative transition-all duration-200 select-none",
          bgClass,
          state === 'preparing' && 'animate-pulse',
          state === 'error' && 'animate-shake'
        )}
        style={{ WebkitTouchCallout: 'none' }}
        aria-label="Voice search: press and hold, or hold Enter or Space"
      >
        {state === 'listening' && (
          <span className="absolute inset-0 rounded-full bg-[var(--danger)] animate-pulse-ring" />
        )}
        {renderIcon()}
      </button>
    </div>
  );
}
