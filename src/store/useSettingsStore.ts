import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type VoiceLanguage = 'zh-CN' | 'en';
export type ThemeMode = 'light' | 'dark' | 'gold';

interface SettingsState {
  voiceLanguage: VoiceLanguage;
  theme: ThemeMode;
  viewMode: 'grid' | 'list';
  setVoiceLanguage: (lang: VoiceLanguage) => void;
  toggleVoiceLanguage: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  toggleViewMode: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      voiceLanguage: 'zh-CN',
      theme: 'light',
      viewMode: 'grid',
      setVoiceLanguage: (lang: VoiceLanguage) => set({ voiceLanguage: lang }),
      toggleVoiceLanguage: () => {
        const current = get().voiceLanguage;
        set({ voiceLanguage: current === 'zh-CN' ? 'en' : 'zh-CN' });
      },
      setTheme: (theme: ThemeMode) => set({ theme }),
      toggleTheme: () => {
        const current = get().theme;
        const modes: ThemeMode[] = ['light', 'dark', 'gold'];
        const nextIndex = (modes.indexOf(current) + 1) % modes.length;
        set({ theme: modes[nextIndex] });
      },
      setViewMode: (mode: 'grid' | 'list') => set({ viewMode: mode }),
      toggleViewMode: () => {
        const current = get().viewMode;
        set({ viewMode: current === 'grid' ? 'list' : 'grid' });
      },
    }),
    {
      name: 'tradeshow-settings',
    }
  )
);