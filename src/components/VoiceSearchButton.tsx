import { useRef, useCallback } from 'react';
import { Mic } from 'lucide-react';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { useSearchStore } from '../store/useSearchStore';
import { cn } from '../lib/utils';

export function VoiceSearchButton() {
  const setQuery = useSearchStore(state => state.setQuery);
  const performSearch = useSearchStore(state => state.performSearch);
  const isActivated = useRef(false);

  const { isListening, isSupported, transcript, startListening, stopListening } = useVoiceSearch({
    onResult: useCallback((text) => {
      setQuery(text);
      performSearch(text);
    }, [setQuery, performSearch]),
  });

  const handleStart = useCallback(() => {
    isActivated.current = true;
    startListening();
  }, [startListening]);

  const handleEnd = useCallback(() => {
    if (isActivated.current) {
      stopListening();
      isActivated.current = false;
    }
  }, [stopListening]);

  if (!isSupported) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 pointer-events-none sm:hidden">
      {isListening && transcript && (
        <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm max-w-xs text-center shadow-lg animate-fade-in pointer-events-none">
          {transcript}
        </div>
      )}
      <button
        onMouseDown={handleStart}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
        onTouchCancel={handleEnd}
        className={cn(
          "w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-2xl transition-all pointer-events-auto select-none",
          "active:scale-90 touch-manipulation",
          isListening
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
        {isListening ? "Listening..." : "Hold to speak"}
      </p>
    </div>
  );
}
