import { useRef, useCallback, useEffect } from 'react';
import { Mic, AlertCircle } from 'lucide-react';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { useSearchStore } from '../store/useSearchStore';
import { cn } from '../lib/utils';

export function VoiceSearchButton() {
  const setQuery = useSearchStore(state => state.setQuery);
  const performSearch = useSearchStore(state => state.performSearch);
  const isActiveRef = useRef(false);

  const { isListening, isSupported, transcript, error, startListening, stopListening } = useVoiceSearch({
    onResult: useCallback((text) => {
      setQuery(text);
      performSearch(text);
    }, [setQuery, performSearch]),
    lang: 'zh-CN',
  });

  const handleStart = useCallback(() => {
    if (isActiveRef.current) return;
    isActiveRef.current = true;
    startListening();
  }, [startListening]);

  const handleStop = useCallback(() => {
    if (!isActiveRef.current) return;
    isActiveRef.current = false;
    stopListening();
  }, [stopListening]);

  useEffect(() => {
    const handleDocumentUp = () => {
      if (isActiveRef.current) {
        handleStop();
      }
    };

    const handleTouchCancel = () => {
      if (isActiveRef.current) {
        handleStop();
      }
    };

    document.addEventListener('mouseup', handleDocumentUp);
    document.addEventListener('touchend', handleDocumentUp);
    document.addEventListener('touchcancel', handleTouchCancel);

    return () => {
      document.removeEventListener('mouseup', handleDocumentUp);
      document.removeEventListener('touchend', handleDocumentUp);
      document.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [handleStop]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    handleStart();
  }, [handleStart]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleStart();
  }, [handleStart]);

  if (!isSupported) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 pointer-events-none sm:hidden">
      {(isListening || error) && (
        <div className={cn(
          "px-4 py-2 rounded-xl text-sm max-w-xs text-center shadow-lg animate-fade-in pointer-events-none",
          error ? "bg-red-500 text-white" : "bg-slate-900 text-white"
        )}>
          {error ? (
            <span className="flex items-center justify-center gap-1">
              <AlertCircle size={14} />
              {error}
            </span>
          ) : (
            transcript || "Listening..."
          )}
        </div>
      )}
      <button
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all pointer-events-auto select-none",
          "active:scale-90 touch-manipulation relative",
          error
            ? "bg-amber-500 text-white"
            : isListening
              ? "bg-red-500 text-white scale-110"
              : "bg-cyan-600 hover:bg-cyan-700 text-white"
        )}
        aria-label="Hold to voice search"
      >
        <Mic size={28} className={cn(isListening && "animate-pulse")} />
        {isListening && (
          <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
        )}
      </button>
      <p className="text-xs text-slate-500 font-medium pointer-events-none">
        {isListening ? "Release to search" : "Hold to speak"}
      </p>
    </div>
  );
}
