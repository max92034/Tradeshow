import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type VoiceLanguage = 'zh-CN' | 'en';

interface SettingsState {
  voiceLanguage: VoiceLanguage;
  setVoiceLanguage: (lang: VoiceLanguage) => void;
  toggleVoiceLanguage: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      voiceLanguage: 'zh-CN',
      setVoiceLanguage: (lang: VoiceLanguage) => set({ voiceLanguage: lang }),
      toggleVoiceLanguage: () => {
        const current = get().voiceLanguage;
        set({ voiceLanguage: current === 'zh-CN' ? 'en' : 'zh-CN' });
      },
    }),
    {
      name: 'tradeshow-settings',
    }
  )
);
