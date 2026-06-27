import { useRef, useCallback, useEffect, useState } from 'react';
import { Mic, AlertCircle } from 'lucide-react';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { useSearchStore } from '../store/useSearchStore';
import { cn } from '../lib/utils';

export function VoiceSearchButton() {
  const setQuery = useSearchStore(state => state.setQuery);
  const performSearch = useSearchStore(state => state.performSearch);
  const isHoldingRef = useRef(false);
  const [pressed, setPressed] = useState(false);

  const { isListening, isSupported, transcript, error, startListening, stopListening } = useVoiceSearch({
    onResult: useCallback((text) => {
      setQuery(text);
      performSearch(text);
    }, [setQuery, performSearch]),
    lang: 'zh-CN',
  });

  const handleStart = useCallback(() => {
    if (isHoldingRef.current) return;
    isHoldingRef.current = true;
    setPressed(true);
    startListening();
  }, [startListening]);

  const handleStop = useCallback(() => {
    if (!isHoldingRef.current) return;
    isHoldingRef.current = false;
    setPressed(false);
    stopListening();
  }, [stopListening]);

  useEffect(() => {
    const onDocMouseUp = () => { if (isHoldingRef.current) handleStop(); };
    const onDocTouchEnd = () => { if (isHoldingRef.current) handleStop(); };
    const onDocTouchCancel = () => { if (isHoldingRef.current) handleStop(); };

    document.addEventListener('mouseup', onDocMouseUp);
    document.addEventListener('touchend', onDocTouchEnd);
    document.addEventListener('touchcancel', onDocTouchCancel);

    return () => {
      document.removeEventListener('mouseup', onDocMouseUp);
      document.removeEventListener('touchend', onDocTouchEnd);
      document.removeEventListener('touchcancel', onDocTouchCancel);
    };
  }, [handleStop]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    handleStart();
  }, [handleStart]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleStart();
  }, [handleStart]);

  if (!isSupported) return null;

  const showIndicator = isListening || error || pressed;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 pointer-events-none sm:hidden">
      {showIndicator && (
        <div className={cn(
          "px-4 py-2 rounded-xl text-sm max-w-xs text-center shadow-lg pointer-events-none",
          error ? "bg-red-500 text-white" : "bg-slate-900 text-white"
        )}>
          {error ? (
            <span className="flex items-center justify-center gap-1">
              <AlertCircle size={14} />
              {error}
            </span>
          ) : transcript ? (
            transcript
          ) : pressed && !isListening ? (
            "Starting..."
          ) : (
            "Listening..."
          )}
        </div>
      )}
      <button
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all pointer-events-auto select-none",
          "touch-manipulation relative",
          error
            ? "bg-amber-500 text-white"
            : isListening
              ? "bg-red-500 text-white scale-110"
              : pressed
                ? "bg-cyan-700 text-white scale-95"
                : "bg-cyan-600 hover:bg-cyan-700 text-white active:scale-90"
        )}
        aria-label="Hold to voice search"
      >
        <Mic size={28} className={cn(isListening && "animate-pulse")} />
        {isListening && (
          <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
        )}
      </button>
      <p className="text-xs text-slate-500 font-medium pointer-events-none">
        {isListening ? "Release to search" : error ? "Tap to retry" : "Hold to speak"}
      </p>
    </div>
  );
}
