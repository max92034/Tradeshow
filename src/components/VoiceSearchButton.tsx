import { useRef, useCallback, useEffect, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { VoiceIcon } from './VoiceIcon';
import { useVoiceSearch } from '../hooks/useAzureVoiceSearch';
import { useSearchStore } from '../store/useSearchStore';
import { cn } from '../lib/utils';

export function VoiceSearchButton() {
  const setQuery = useSearchStore(state => state.setQuery);
  const performSearch = useSearchStore(state => state.performSearch);
  const [pressed, setPressed] = useState(false);
  const pressedRef = useRef(false);

  const { isListening, isPreparing, isSupported, transcript, error, isProcessing, startListening, stopListening } = useVoiceSearch({
    onResult: useCallback((text) => {
      setQuery(text);
      performSearch(text);
    }, [setQuery, performSearch]),
  });

  const handleStart = useCallback(() => {
    if (pressedRef.current) return;
    pressedRef.current = true;
    setPressed(true);

    if (document.activeElement && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    startListening();
  }, [startListening]);

  const handleStop = useCallback(() => {
    if (!pressedRef.current) return;
    pressedRef.current = false;
    setPressed(false);
    stopListening();
  }, [stopListening]);

  useEffect(() => {
    const onUp = () => { if (pressedRef.current) handleStop(); };
    const onCancel = () => { if (pressedRef.current) handleStop(); };

    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    window.addEventListener('touchend', onUp);
    window.addEventListener('touchcancel', onCancel);

    return () => {
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      window.removeEventListener('touchend', onUp);
      window.removeEventListener('touchcancel', onCancel);
    };
  }, [handleStop]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    handleStart();
  }, [handleStart]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    handleStart();
  }, [handleStart]);

  if (!isSupported) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 sm:hidden">
        <div className="px-4 py-2 rounded-xl text-sm bg-amber-500 text-white text-center shadow-lg">
          Voice not supported
        </div>
      </div>
    );
  }

  const showIndicator = isListening || isPreparing || isProcessing || error || transcript;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3 sm:hidden">
      {showIndicator && (
        <div className={cn(
          "px-4 py-3 rounded-2xl text-sm max-w-[80vw] text-center shadow-xl font-medium",
          error ? "bg-red-500 text-white" : "bg-[var(--text-primary)] text-white"
        )}>
          {error ? (
            <div className="flex flex-col items-center gap-1">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          ) : isProcessing ? (
            <span>Processing...</span>
          ) : isPreparing ? (
            <div className="flex flex-col items-center gap-1">
              <Loader2 size={20} className="animate-spin" />
              <span>Preparing mic...</span>
            </div>
          ) : transcript ? (
            <span>{transcript}</span>
          ) : (
            <span>Recording... speak now</span>
          )}
        </div>
      )}
      <button
        type="button"
        onPointerDown={onPointerDown}
        onTouchStart={onTouchStart}
        className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 select-none touch-manipulation relative",
          error
            ? "bg-amber-500 text-white"
            : isListening
              ? "bg-[#e85d2a] text-white scale-110"
              : isProcessing
                ? "bg-[var(--text-secondary)] text-white scale-105"
                : isPreparing
                  ? "bg-[var(--text-secondary)] text-white animate-pulse"
                  : pressed
                    ? "bg-[#1a9cd8] text-white scale-95"
                    : "bg-[#2aace8] text-white active:scale-95 shadow-lg shadow-[#2aace8]/30"
        )}
        aria-label="Hold to voice search"
      >
        <VoiceIcon size={32} active={isListening || isProcessing} />
        {(isListening || isProcessing) && (
          <span className="absolute inset-0 rounded-full bg-[#e85d2a] animate-ping opacity-40" />
        )}
      </button>
      <p className="text-xs text-[var(--text-muted)] font-medium text-center">
        {isProcessing ? "Processing voice..." : isListening ? "Release to search" : isPreparing ? "Starting mic..." : error ? "Press and hold to retry" : "Hold to speak"}
      </p>
    </div>
  );
}
