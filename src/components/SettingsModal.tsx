import React from 'react';
import { X, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSettingsStore, type ThemeMode } from '../store/useSettingsStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const themeOptions: { id: ThemeMode; name: string; description: string; swatch: string; accent?: string }[] = [
  { id: 'light', name: 'Light', description: 'Clean & bright', swatch: '#f7f5f2' },
  { id: 'dark', name: 'Dark', description: 'Modern & sleek', swatch: '#000000', accent: '#0a84ff' },
  { id: 'gold', name: 'Gold', description: 'Premium & bold', swatch: '#0f0f0f', accent: '#c9a96e' },
  { id: 'lakers', name: 'Lakers', description: 'Purple & gold', swatch: '#552583', accent: '#ffce32' },
];

const APP_VERSION = '1.0.0';
const BUILD_DATE = '2025-07-04';

export const SettingsModal = React.memo(function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const theme = useSettingsStore(state => state.theme);
  const setTheme = useSettingsStore(state => state.setTheme);
  const voiceLanguage = useSettingsStore(state => state.voiceLanguage);
  const toggleVoiceLanguage = useSettingsStore(state => state.toggleVoiceLanguage);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-modal animate-fade-in"
        )}
      />

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2",
          "flex flex-col",
          "bg-[var(--bg-card)] rounded-t-xl sm:rounded-xl",
          "w-full sm:max-w-lg",
          "sm:shadow-[var(--shadow-xl)]",
          "animate-slide-up sm:animate-scale-enter"
        )}
      >
        <div
          className="flex justify-between items-center border-b border-[var(--border-soft)]"
          style={{ padding: '24px 24px 16px' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              <SettingsIcon size={20} />
            </div>
            <h2
              className="font-semibold"
              style={{ fontSize: 'var(--text-h1)', color: 'var(--text-primary)' }}
            >
              Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="icon-btn"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div
          className="overflow-y-auto"
          style={{ padding: '16px 24px', maxHeight: '70vh' }}
        >
          <div className="space-y-6">
            <div className="space-y-3">
              <div>
                <h3
                  className="font-semibold"
                  style={{ fontSize: 'var(--text-h3)', color: 'var(--text-primary)' }}
                >
                  Theme
                </h3>
                <p
                  className="mt-1"
                  style={{ fontSize: 'var(--text-small)', color: 'var(--text-muted)' }}
                >
                  Choose your preferred visual style
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {themeOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setTheme(option.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center",
                      theme === option.id
                        ? "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg-card)]"
                        : ""
                    )}
                    style={{
                      borderColor: theme === option.id ? 'var(--accent)' : 'var(--border-soft)',
                      background: 'var(--bg-card)',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full border border-[var(--border)] relative overflow-hidden"
                      style={{ background: option.swatch }}
                    >
                      {option.accent && (
                        <div
                          className="absolute bottom-0 right-0 w-5 h-5 rounded-tl-full"
                          style={{ background: option.accent }}
                        />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <p
                        className="font-semibold"
                        style={{ fontSize: 'var(--text-small)', color: 'var(--text-primary)' }}
                      >
                        {option.name}
                      </p>
                      <p
                        className="leading-tight"
                        style={{ fontSize: '11px', color: 'var(--text-muted)' }}
                      >
                        {option.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-[var(--border-soft)] pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className="font-semibold"
                    style={{ fontSize: 'var(--text-h3)', color: 'var(--text-primary)' }}
                  >
                    Voice Language
                  </h3>
                  <p
                    className="mt-1"
                    style={{ fontSize: 'var(--text-small)', color: 'var(--text-muted)' }}
                  >
                    {voiceLanguage === 'zh-CN' ? '中文' : 'English'}
                  </p>
                </div>
                <button
                  onClick={toggleVoiceLanguage}
                  role="switch"
                  aria-checked={voiceLanguage === 'en'}
                  className="relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                  style={{
                    background: voiceLanguage === 'en' ? 'var(--accent)' : 'var(--bg-secondary)',
                  }}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
                    style={{
                      left: voiceLanguage === 'en' ? '22px' : '2px',
                    }}
                  />
                </button>
              </div>
            </div>

            <div className="border-t border-[var(--border-soft)] pt-5">
              <h3
                className="font-semibold mb-3"
                style={{ fontSize: 'var(--text-h3)', color: 'var(--text-primary)' }}
              >
                About
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span style={{ fontSize: 'var(--text-body)', color: 'var(--text-secondary)' }}>
                    Version
                  </span>
                  <span
                    className="font-mono"
                    style={{ fontSize: 'var(--text-small)', color: 'var(--text-muted)' }}
                  >
                    {APP_VERSION}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ fontSize: 'var(--text-body)', color: 'var(--text-secondary)' }}>
                    Build Date
                  </span>
                  <span
                    className="font-mono"
                    style={{ fontSize: 'var(--text-small)', color: 'var(--text-muted)' }}
                  >
                    {BUILD_DATE}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="border-t border-[var(--border-soft)]"
          style={{ padding: '16px 24px' }}
        >
          <button
            onClick={onClose}
            className="w-full btn-primary"
            style={{ fontSize: 'var(--text-body)' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
});
