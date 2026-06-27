import { useRef, useCallback, useEffect, useState } from 'react';
import { Mic, AlertCircle } from 'lucide-react';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { useSearchStore } from '../store/useSearchStore';
import { cn } from '../lib/utils';

export function VoiceSearchButton() {
  const setQuery = useSearchStore(state => state.setQuery);
  const performSearch = useSearchStore(state => state.performSearch);
  const isHoldingRef = useRef(false);

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
    startListening();
  }, [startListening]);

  const handleStop = useCallback(() => {
    if (!isHoldingRef.current) return;
    isHoldingRef.current = false;
    stopListening();
  }, [stopListening]);

  useEffect(() => {
    const onMouseUp = () => { if (isHoldingRef.current) handleStop(); };
    const onTouchEnd = () => { if (isHoldingRef.current) handleStop(); };
    const onTouchCancel = () => { if (isHoldingRef.current) handleStop(); };

    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchend', onTouchEnd);
    document.addEventListener('touchcancel', onTouchCancel);

    return () => {
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('touchcancel', onTouchCancel);
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

  if (!isSupported) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 sm:hidden">
        <div className="px-4 py-2 rounded-xl text-sm bg-amber-500 text-white text-center shadow-lg">
          Voice not supported on this browser
        </div>
      </div>
    );
  }

  const showIndicator = isListening || error || transcript;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 sm:hidden">
      {showIndicator && (
        <div className={cn(
          "px-4 py-2 rounded-xl text-sm max-w-xs text-center shadow-lg min-h-[40px] flex items-center justify-center",
          error ? "bg-red-500 text-white" : "bg-slate-900 text-white"
        )}>
          {error ? (
            <span className="flex items-center justify-center gap-1">
              <AlertCircle size={14} />
              {error}
            </span>
          ) : transcript ? (
            <span className="font-medium">{transcript}</span>
          ) : (
            <span>Listening... speak now</span>
          )}
        </div>
      )}
      <button
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchEnd={handleStop}
        onTouchCancel={handleStop}
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all select-none touch-manipulation relative",
          error
            ? "bg-amber-500 text-white"
            : isListening
              ? "bg-red-500 text-white scale-110"
              : "bg-cyan-600 text-white"
        )}
        aria-label="Hold to voice search"
      >
        <Mic size={28} className={cn(isListening && "animate-pulse")} />
        {isListening && (
          <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
        )}
      </button>
      <p className="text-xs text-slate-500 font-medium">
        {isListening ? "Release to search" : error ? "Tap to retry" : "Hold to speak"}
      </p>
    </div>
  );
}
