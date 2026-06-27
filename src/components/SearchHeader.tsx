import React, { useRef, useEffect, useCallback } from 'react';
import { Search, Mic, ScanLine, Upload, ShoppingCart, History, X } from 'lucide-react';
import { useSearchStore } from '../store/useSearchStore';
import { useOrderStore } from '../store/useOrderStore';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { useDebounce } from '../hooks/useDebounce';
import { cn } from '../lib/utils';

interface SearchHeaderProps {
  onUploadClick: () => void;
  onHistoryClick: () => void;
}

export const SearchHeader = React.memo(function SearchHeader({ onUploadClick, onHistoryClick }: SearchHeaderProps) {
  const query = useSearchStore(state => state.query);
  const setQuery = useSearchStore(state => state.setQuery);
  const performSearch = useSearchStore(state => state.performSearch);
  const debouncedQuery = useDebounce(query, 150);
  
  const totalItems = useOrderStore(state => state.currentOrder.totalItems);
  const toggleDrawer = useOrderStore(state => state.toggleDrawer);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const { isListening, isSupported: voiceSupported, transcript, startListening, stopListening } = useVoiceSearch({
    onResult: useCallback((text) => {
      setQuery(text);
      performSearch(text);
    }, [setQuery, performSearch]),
  });

  const handleVoiceStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    startListening();
  }, [startListening]);

  const handleVoiceEnd = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    stopListening();
  }, [stopListening]);

  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, [setQuery]);

  const handleClear = useCallback(() => {
    setQuery('');
    performSearch('');
    inputRef.current?.focus();
  }, [setQuery, performSearch]);

  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-lg">
      <div className="px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <h1 className="text-lg sm:text-2xl font-bold text-cyan-400 tracking-tight hidden sm:block whitespace-nowrap">
            Trade<span className="text-white">Show</span>
          </h1>
          
          <div className="flex-1 relative">
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-slate-400 pointer-events-none" size={20} />
              <input
                ref={inputRef}
                type="text"
                value={isListening ? transcript || query : query}
                onChange={handleChange}
                placeholder="Search SKU, description, keyword..."
                className="w-full pl-10 pr-24 sm:pr-28 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm sm:text-base transition-all"
              />
              <div className="absolute right-2 flex items-center gap-1">
                {query && (
                  <button
                    onClick={handleClear}
                    className="p-1.5 text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
                {voiceSupported && (
                  <button
                    onMouseDown={handleVoiceStart}
                    onMouseUp={handleVoiceEnd}
                    onMouseLeave={handleVoiceEnd}
                    onTouchStart={handleVoiceStart}
                    onTouchEnd={handleVoiceEnd}
                    onTouchCancel={handleVoiceEnd}
                    className={cn(
                      "p-2 sm:p-2 rounded-lg transition-all select-none active:scale-95",
                      isListening
                        ? "bg-red-500 text-white animate-pulse scale-110"
                        : "text-slate-400 hover:text-white hover:bg-slate-700"
                    )}
                    title="Hold to speak"
                  >
                    <Mic size={20} />
                  </button>
                )}
                <button
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all hidden sm:block"
                  title="Barcode scan"
                >
                  <ScanLine size={18} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={onHistoryClick}
              className="p-2 sm:p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
              title="Order history"
            >
              <History size={20} />
            </button>
            
            <button
              onClick={onUploadClick}
              className="p-2 sm:p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
              title="Upload products"
            >
              <Upload size={20} />
            </button>
            
            <button
              onClick={() => toggleDrawer(true)}
              className="relative p-2 sm:p-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl transition-all active:scale-95"
              title="View order"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-amber-500 text-slate-900 text-xs font-bold rounded-full flex items-center justify-center animate-bounce-in">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
});
