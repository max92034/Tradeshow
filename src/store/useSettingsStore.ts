import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type VoiceLanguage = 'auto' | 'en' | 'zh-CN';

interface SettingsState {
  voiceLanguage: VoiceLanguage;
  setVoiceLanguage: (lang: VoiceLanguage) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      voiceLanguage: 'auto',
      setVoiceLanguage: (lang: VoiceLanguage) => set({ voiceLanguage: lang }),
    }),
    {
      name: 'tradeshow-settings',
    }
  )
);
