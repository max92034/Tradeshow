import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Search, ShoppingCart, History, X, Settings, Menu, Sun, Moon, Sparkles, Mic, Upload } from 'lucide-react';
import { VoiceIcon } from './VoiceIcon';
import { useSearchStore } from '../store/useSearchStore';
import { useOrderStore } from '../store/useOrderStore';
import { useDeepgramVoiceSearch } from '../hooks/useDeepgramVoiceSearch';
import { useDebounce } from '../hooks/useDebounce';
import { useSettingsStore, ThemeMode } from '../store/useSettingsStore';
import { cn } from '../lib/utils';

interface SearchHeaderProps {
  onUploadClick: () => void;
  onHistoryClick: () => void;
  onSettingsClick: () => void;
}

const themeIconMap: Record<ThemeMode, React.ReactNode> = {
  light: <Sun size={18} strokeWidth={1.5} />,
  dark: <Moon size={18} strokeWidth={1.5} />,
  gold: <Sparkles size={18} strokeWidth={1.5} />,
};

const themeLabelMap: Record<ThemeMode, string> = {
  light: 'Light',
  dark: 'Dark',
  gold: 'Gold',
};

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

  const { isListening, isSupported: voiceSupported, startListening, stopListening } = useDeepgramVoiceSearch({
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

  const handleThemeToggle = useCallback(() => {
    toggleTheme();
    closeMenu();
  }, [toggleTheme, closeMenu]);

  const handleVoiceLanguageToggle = useCallback(() => {
    toggleVoiceLanguage();
    closeMenu();
  }, [toggleVoiceLanguage, closeMenu]);

  return (
    <header
      className="sticky top-0 z-30 border-b backdrop-blur-header"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-primary) 80%, transparent)',
        borderColor: 'var(--border-soft)',
      }}
    >
      <div className="h-16 sm:h-[72px] px-4 sm:px-8">
        <div className="h-full flex items-center gap-3 sm:gap-4">
          <h1 className="hidden sm:block text-xl font-bold tracking-tight whitespace-nowrap">
            <span style={{ color: 'var(--text-primary)' }}>Trade</span>
            <span style={{ color: 'var(--accent)' }}>Show</span>
          </h1>

          <div className="flex-1 relative">
            <div className="relative flex items-center h-10">
              <Search
                className="absolute left-4 pointer-events-none"
                size={18}
                strokeWidth={1.5}
                style={{ color: 'var(--text-muted)' }}
                aria-hidden="true"
              />
              <label htmlFor="search-input" className="sr-only">
                Search products
              </label>
              <input
                id="search-input"
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleChange}
                placeholder="Search SKU, name, or keyword..."
                className="w-full h-full pl-11 pr-16 sm:pr-20 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 transition-all duration-200 text-sm sm:text-base"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                }}
              />
              <div className="absolute right-2 flex items-center gap-1">
                {query && (
                  <button
                    onClick={handleClear}
                    className="p-1.5 rounded-full transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
                {voiceSupported && (
                  <button
                    onClick={handleVoiceToggle}
                    className={cn(
                      "hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200",
                      isListening
                        ? "bg-[var(--accent)] text-[var(--text-inverse)]"
                        : "hover:bg-[var(--accent-soft)]"
                    )}
                    style={{
                      color: isListening ? 'var(--text-inverse)' : 'var(--accent)',
                      backgroundColor: isListening ? 'var(--accent)' : 'var(--accent-soft)',
                    }}
                    aria-label={isListening ? "Stop voice search" : "Start voice search"}
                  >
                    <VoiceIcon size={18} active={isListening} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {voiceSupported && (
              <button
                onClick={handleVoiceToggle}
                className={cn(
                  "sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 active:scale-95",
                )}
                style={{
                  color: 'var(--accent)',
                  backgroundColor: 'var(--accent-soft)',
                }}
                aria-label={isListening ? "Stop voice search" : "Start voice search"}
              >
                <VoiceIcon size={18} active={isListening} />
              </button>
            )}

            <div className="relative sm:hidden" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 active:scale-95"
                style={{
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--bg-secondary)',
                }}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
              </button>

              <div
                className={cn(
                  "absolute right-0 top-12 w-64 rounded-2xl shadow-xl overflow-hidden z-50",
                  "transition-all duration-200 origin-top-right",
                  menuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                )}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                }}
              >
                <button
                  onClick={() => {
                    onSettingsClick();
                    closeMenu();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 transition-all duration-200"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <Settings size={18} strokeWidth={1.5} />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">Settings</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>设置</div>
                  </div>
                </button>

                <button
                  onClick={handleThemeToggle}
                  className="w-full flex items-center gap-3 px-4 py-3.5 transition-all duration-200"
                  style={{
                    color: 'var(--text-secondary)',
                    borderTop: '1px solid var(--border-soft)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  {themeIconMap[theme]}
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">
                      Theme: {themeLabelMap[theme]}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Tap to switch / 点击切换
                    </div>
                  </div>
                  <div
                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: 'var(--accent-soft)',
                      color: 'var(--accent)',
                    }}
                  >
                    {theme === 'light' ? '☀' : theme === 'dark' ? '☾' : '✨'}
                  </div>
                </button>

                <button
                  onClick={handleVoiceLanguageToggle}
                  className="w-full flex items-center gap-3 px-4 py-3.5 transition-all duration-200"
                  style={{
                    color: 'var(--text-secondary)',
                    borderTop: '1px solid var(--border-soft)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <Mic size={18} strokeWidth={1.5} />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">
                      Voice: {voiceLanguage === 'zh-CN' ? '中文' : 'English'}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Tap to switch / 点击切换
                    </div>
                  </div>
                  <div
                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: 'var(--accent-soft)',
                      color: 'var(--accent)',
                    }}
                  >
                    {voiceLanguage === 'zh-CN' ? '中' : 'EN'}
                  </div>
                </button>

                <div style={{ borderTop: '1px solid var(--border-soft)' }}>
                  <button
                    onClick={() => {
                      onHistoryClick();
                      closeMenu();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 transition-all duration-200"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    <History size={18} strokeWidth={1.5} />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">Order History</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>订单历史</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onUploadClick();
                      closeMenu();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 transition-all duration-200"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    <Upload size={18} strokeWidth={1.5} />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">Upload Products</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>上传产品</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={onSettingsClick}
              className="hidden sm:inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 active:scale-95 shadow-sm"
              style={{
                color: 'var(--text-inverse)',
                backgroundColor: 'var(--accent)',
                boxShadow: '0 2px 8px color-mix(in srgb, var(--accent) 20%, transparent)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              aria-label="Open settings"
            >
              <Settings size={20} strokeWidth={1.5} />
            </button>

            <button
              onClick={() => toggleDrawer(true)}
              className="relative inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 active:scale-95 shadow-md"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--text-inverse)',
                boxShadow: '0 4px 12px color-mix(in srgb, var(--accent) 25%, transparent)',
              }}
              aria-label={`View order, ${totalItems} items`}
            >
              <ShoppingCart size={20} strokeWidth={1.5} />
              {totalItems > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-5 h-5 px-1 text-xs font-bold rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: 'var(--danger)',
                    color: 'var(--text-inverse)',
                  }}
                >
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
