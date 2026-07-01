import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Search, Mic, Upload, ShoppingCart, History, X, Settings, Menu, Sparkles, Minimize2 } from 'lucide-react';
import { VoiceIcon } from './VoiceIcon';
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
  const theme = useSettingsStore(state => state.theme);
  const toggleTheme = useSettingsStore(state => state.toggleTheme);
  
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
    <header className="sticky top-0 z-30 bg-[var(--text-primary)] text-white shadow-xl">
      <div className="px-4 sm:px-8 py-4 sm:py-5 content-layer">
        <div className="flex items-center gap-3 sm:gap-6">
          <h1 className="text-xl sm:text-3xl font-display font-bold tracking-tight hidden sm:block whitespace-nowrap">
            <span className="text-[var(--accent)]">Trade</span>Show
          </h1>
          
          <div className="flex-1 relative">
            <div className="relative flex items-center">
              <Search className="absolute left-4 text-[var(--text-muted)] pointer-events-none" size={18} strokeWidth={1.5} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleChange}
                placeholder="Search SKU, description, keyword..."
                className="w-full pl-11 pr-16 sm:pr-24 py-3 sm:py-3.5 bg-white/[0.06] border border-white/[0.08] rounded-2xl text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)]/30 text-sm sm:text-base transition-all duration-200 font-body"
              />
              <div className="absolute right-2 flex items-center gap-1">
                {query && (
                  <button
                    onClick={handleClear}
                    className="p-1.5 text-[var(--text-muted)] hover:text-white transition-colors rounded-full"
                  >
                    <X size={16} />
                  </button>
                )}
                {voiceSupported && (
                  <button
                    onClick={handleVoiceToggle}
                    className={cn(
                      "p-2 rounded-full transition-all duration-200 hidden sm:block relative",
                      isListening
                        ? "bg-[#e85d2a] text-white shadow-lg shadow-[#e85d2a]/40 animate-pulse-soft"
                        : "bg-[#2aace8] text-white shadow-lg shadow-[#2aace8]/30 hover:bg-[#1a9cd8] hover:shadow-xl hover:shadow-[#2aace8]/40 active:scale-95"
                    )}
                    title="Voice search"
                  >
                    <VoiceIcon size={18} active={isListening} />
                    {!isListening && (
                      <span className="absolute inset-0 rounded-full bg-[#2aace8] opacity-0 hover:opacity-20 transition-opacity" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={onSettingsClick}
              className="p-2.5 text-[var(--text-muted)] hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-200 hidden sm:block"
              title="Settings"
            >
              <Settings size={20} strokeWidth={1.5} />
            </button>
            
            <button
              onClick={onHistoryClick}
              className="p-2.5 text-[var(--text-muted)] hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-200 hidden sm:block"
              title="Order history"
            >
              <History size={20} strokeWidth={1.5} />
            </button>
            
            <button
              onClick={onUploadClick}
              className="p-2.5 text-[var(--text-muted)] hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-200 hidden sm:block"
              title="Upload products"
            >
              <Upload size={20} strokeWidth={1.5} />
            </button>

            <div className="relative sm:hidden" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={cn(
                  "p-2.5 rounded-2xl transition-all duration-200",
                  menuOpen ? "bg-white/10 text-white" : "text-[var(--text-muted)] hover:text-white hover:bg-white/10"
                )}
                title="Menu"
              >
                {menuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
              </button>

              <div
                className={cn(
                  "absolute right-0 top-14 w-64 bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden z-50",
                  "transition-all duration-200 origin-top-right",
                  menuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                )}
              >
                <button
                  onClick={() => {
                    onSettingsClick();
                    closeMenu();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all duration-200"
                >
                  <Settings size={18} strokeWidth={1.5} />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">Settings</div>
                    <div className="text-xs text-[var(--text-muted)]">设置</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    toggleTheme();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all duration-200 border-t border-[var(--border-soft)]"
                >
                  {theme === 'trumpian' ? (
                    <Sparkles size={18} strokeWidth={1.5} className="text-yellow-600" />
                  ) : (
                    <Minimize2 size={18} strokeWidth={1.5} className="text-orange-500" />
                  )}
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">
                      Theme: {theme === 'trumpian' ? 'Trumpian' : 'Minimal'}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      Tap to switch / 点击切换
                    </div>
                  </div>
                  <div className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-bold",
                    theme === 'trumpian' ? 'bg-yellow-100 text-yellow-700' : 'bg-orange-100 text-orange-700'
                  )}>
                    {theme === 'trumpian' ? '✨' : '◻'}
                  </div>
                </button>

                <button
                  onClick={() => {
                    toggleVoiceLanguage();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all duration-200 border-t border-[var(--border-soft)]"
                >
                  <Mic size={18} strokeWidth={1.5} />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">
                      Voice: {voiceLanguage === 'zh-CN' ? '中文' : 'English'}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      Tap to switch / 点击切换
                    </div>
                  </div>
                  <div className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-bold",
                    voiceLanguage === 'zh-CN' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                  )}>
                    {voiceLanguage === 'zh-CN' ? '中' : 'EN'}
                  </div>
                </button>

                <div className="border-t border-[var(--border-soft)]">
                  <button
                    onClick={() => {
                      onHistoryClick();
                      closeMenu();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all duration-200"
                  >
                    <History size={18} strokeWidth={1.5} />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">Order History</div>
                      <div className="text-xs text-[var(--text-muted)]">订单历史</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onUploadClick();
                      closeMenu();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all duration-200"
                  >
                    <Upload size={18} strokeWidth={1.5} />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">Upload Products</div>
                      <div className="text-xs text-[var(--text-muted)]">上传产品</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => toggleDrawer(true)}
              className="relative p-2.5 sm:p-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-2xl transition-all duration-200 active:scale-95 shadow-lg shadow-[var(--accent)]/25"
              title="View order"
            >
              <ShoppingCart size={20} strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-white text-[var(--accent)] text-xs font-bold rounded-full flex items-center justify-center animate-bounce-in font-body">
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
