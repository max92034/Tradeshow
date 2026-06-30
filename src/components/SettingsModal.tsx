import React from 'react';
import { X, Settings as SettingsIcon, Mic, Globe, Sparkles } from 'lucide-react';
import { useSettingsStore, VoiceLanguage } from '../store/useSettingsStore';
import { cn } from '../lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const languageOptions: { value: VoiceLanguage; label: string; sublabel: string; flag: string }[] = [
  {
    value: 'auto',
    label: 'Auto Detect',
    sublabel: '自动检测 — English & 中文',
    flag: '🔄',
  },
  {
    value: 'en',
    label: 'English',
    sublabel: 'English only',
    flag: '🇺🇸',
  },
  {
    value: 'zh-CN',
    label: '中文',
    sublabel: '简体中文',
    flag: '🇨🇳',
  },
];

export const SettingsModal = React.memo(function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const voiceLanguage = useSettingsStore(state => state.voiceLanguage);
  const setVoiceLanguage = useSettingsStore(state => state.setVoiceLanguage);

  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />

      <div
        className={cn(
          "fixed z-50 bg-white shadow-2xl flex flex-col transition-all duration-300 ease-out rounded-2xl",
          "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          "w-[90vw] max-w-md max-h-[85vh]",
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl text-white shadow-lg shadow-cyan-500/30">
              <SettingsIcon size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-lg">Settings</h2>
              <p className="text-xs text-slate-500">设置</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Mic size={16} className="text-cyan-600" />
              <h3 className="font-semibold text-slate-700">Voice Search Language</h3>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Choose the language for voice search. Auto-detect works for both English and Chinese.
            </p>

            <div className="space-y-2">
              {languageOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setVoiceLanguage(option.value)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                    voiceLanguage === option.value
                      ? "border-cyan-500 bg-cyan-50 shadow-md shadow-cyan-500/10"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <span className="text-2xl">{option.flag}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-800">{option.label}</div>
                    <div className="text-xs text-slate-500">{option.sublabel}</div>
                  </div>
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                      voiceLanguage === option.value
                        ? "border-cyan-500 bg-cyan-500"
                        : "border-slate-300"
                    )}
                  >
                    {voiceLanguage === option.value && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </section>

          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl">
              <Sparkles size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-700">Tip:</span> Use "Auto Detect" for the most flexibility. The app will automatically recognize whether you're speaking English or Chinese.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl transition-all active:scale-95 shadow-lg shadow-cyan-600/25"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
});
