import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type VoiceLanguage = 'zh-CN' | 'en';
export type Theme = 'minimal' | 'trumpian';

interface SettingsState {
  voiceLanguage: VoiceLanguage;
  theme: Theme;
  setVoiceLanguage: (lang: VoiceLanguage) => void;
  toggleVoiceLanguage: () => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      voiceLanguage: 'zh-CN',
      theme: 'minimal',
      setVoiceLanguage: (lang: VoiceLanguage) => set({ voiceLanguage: lang }),
      toggleVoiceLanguage: () => {
        const current = get().voiceLanguage;
        set({ voiceLanguage: current === 'zh-CN' ? 'en' : 'zh-CN' });
      },
      setTheme: (theme: Theme) => set({ theme }),
      toggleTheme: () => {
        const current = get().theme;
        set({ theme: current === 'minimal' ? 'trumpian' : 'minimal' });
      },
    }),
    {
      name: 'tradeshow-settings',
    }
  )
);
