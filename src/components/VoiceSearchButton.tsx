import { useRef, useCallback, useEffect, useState } from 'react';
import { Mic, AlertCircle } from 'lucide-react';
import { useVoiceSearch } from '../hooks/useAzureVoiceSearch';
import { useSearchStore } from '../store/useSearchStore';
import { cn } from '../lib/utils';

export function VoiceSearchButton() {
  const setQuery = useSearchStore(state => state.setQuery);
  const performSearch = useSearchStore(state => state.performSearch);
  const [pressed, setPressed] = useState(false);
  const pressedRef = useRef(false);

  const { isListening, isSupported, transcript, error, isProcessing, startListening, stopListening } = useVoiceSearch({
    onResult: useCallback((text) => {
      setQuery(text);
      performSearch(text);
    }, [setQuery, performSearch]),
  });

  const handleStart = useCallback(() => {
    if (pressedRef.current) return;
    pressedRef.current = true;
    setPressed(true);
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

    return () => {
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
    };
  }, [handleStop]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleStart();
  }, [handleStart]);

  if (!isSupported) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="px-4 py-2 rounded-xl text-sm bg-amber-500 text-white text-center shadow-lg">
          Voice not supported on this browser
        </div>
      </div>
    );
  }

  const showIndicator = isListening || isProcessing || error || transcript;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3">
      {showIndicator && (
        <div className={cn(
          "px-4 py-3 rounded-2xl text-sm max-w-[80vw] text-center shadow-xl font-medium",
          error ? "bg-red-500 text-white" : "bg-slate-900 text-white"
        )}>
          {error ? (
            <div className="flex flex-col items-center gap-1">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          ) : isProcessing ? (
            <span>Processing...</span>
          ) : transcript ? (
            <span>{transcript}</span>
          ) : (
            <span>Recording... speak now</span>
          )}
        </div>
      )}
      <button
        onPointerDown={onPointerDown}
        className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-transform select-none touch-none relative",
          error
            ? "bg-amber-500 text-white"
            : isListening
              ? "bg-red-500 text-white scale-110"
              : isProcessing
                ? "bg-purple-500 text-white scale-105"
                : pressed
                  ? "bg-cyan-700 text-white scale-95"
                  : "bg-cyan-600 text-white active:scale-95"
        )}
        aria-label="Hold to voice search"
      >
        <Mic size={32} className={cn((isListening || isProcessing) && "animate-pulse")} />
        {(isListening || isProcessing) && (
          <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
        )}
      </button>
      <p className="text-xs text-slate-500 font-medium text-center">
        {isProcessing ? "Processing voice..." : isListening ? "Release to search" : error ? "Press and hold to retry" : "Hold to speak"}
      </p>
    </div>
  );
}
