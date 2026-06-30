import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Search, Mic, ScanLine, Upload, ShoppingCart, History, X, Settings, Menu } from 'lucide-react';
import { useSearchStore } from '../store/useSearchStore';
import { useOrderStore } from '../store/useOrderStore';
import { useVoiceSearch } from '../hooks/useAzureVoiceSearch';
import { useDebounce } from '../hooks/useDebounce';
import { useSettingsStore } from '../store/useSettingsStore';
import { cn } from '../lib/utils';

interface SearchHeaderProps {
  onUploadClick: () => void;
  onHistoryClick: () => void;
  onSettingsClick: () => void;
}

export const SearchHeader = React.memo(function SearchHeader({ onUploadClick, onHistoryClick, onSettingsClick }: SearchHeaderProps) {
  const query = useSearchStore(state => state.query);
  const setQuery = useSearchStore(state => state.setQuery);
  const performSearch = useSearchStore(state => state.performSearch);
  const debouncedQuery = useDebounce(query, 150);
  
  const totalItems = useOrderStore(state => state.currentOrder.totalItems);
  const toggleDrawer = useOrderStore(state => state.toggleDrawer);
  const voiceLanguage = useSettingsStore(state => state.voiceLanguage);
  const toggleVoiceLanguage = useSettingsStore(state => state.toggleVoiceLanguage);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { isListening, isSupported: voiceSupported, startListening, stopListening } = useVoiceSearch({
    onResult: useCallback((text) => {
      setQuery(text);
      performSearch(text);
    }, [setQuery, performSearch]),
  });

  const handleVoiceToggle = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

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
                value={query}
                onChange={handleChange}
                placeholder="Search SKU, description, keyword..."
                className="w-full pl-10 pr-16 sm:pr-24 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm sm:text-base transition-all"
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
                    onClick={handleVoiceToggle}
                    className={cn(
                      "p-1.5 sm:p-2 rounded-lg transition-all hidden sm:block",
                      isListening
                        ? "bg-red-500 text-white animate-pulse"
                        : "text-slate-400 hover:text-white hover:bg-slate-700"
                    )}
                    title="Voice search"
                  >
                    <Mic size={18} />
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
              onClick={onSettingsClick}
              className="p-2 sm:p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all hidden sm:block"
              title="Settings"
            >
              <Settings size={20} />
            </button>
            
            <button
              onClick={onHistoryClick}
              className="p-2 sm:p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all hidden sm:block"
              title="Order history"
            >
              <History size={20} />
            </button>
            
            <button
              onClick={onUploadClick}
              className="p-2 sm:p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all hidden sm:block"
              title="Upload products"
            >
              <Upload size={20} />
            </button>

            <div className="relative sm:hidden" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={cn(
                  "p-2 rounded-xl transition-all",
                  menuOpen ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
                title="Menu"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <div
                className={cn(
                  "absolute right-0 top-12 w-56 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden z-50",
                  "transition-all duration-200 origin-top-right",
                  menuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                )}
              >
                <button
                  onClick={() => {
                    onSettingsClick();
                    closeMenu();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                >
                  <Settings size={18} />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">Settings</div>
                    <div className="text-xs text-slate-500">设置</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    toggleVoiceLanguage();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white transition-all border-t border-slate-700"
                >
                  <Mic size={18} />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">
                      Voice: {voiceLanguage === 'zh-CN' ? '中文' : 'English'}
                    </div>
                    <div className="text-xs text-slate-500">
                      Tap to switch / 点击切换
                    </div>
                  </div>
                  <div className={cn(
                    "px-2 py-0.5 rounded text-xs font-bold",
                    voiceLanguage === 'zh-CN' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                  )}>
                    {voiceLanguage === 'zh-CN' ? '中' : 'EN'}
                  </div>
                </button>

                <div className="border-t border-slate-700">
                  <button
                    onClick={() => {
                      onHistoryClick();
                      closeMenu();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                  >
                    <History size={18} />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">Order History</div>
                      <div className="text-xs text-slate-500">订单历史</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onUploadClick();
                      closeMenu();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                  >
                    <Upload size={18} />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">Upload Products</div>
                      <div className="text-xs text-slate-500">上传产品</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            
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
