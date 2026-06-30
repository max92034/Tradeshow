import React from 'react';
import { X, Settings as SettingsIcon, Mic } from 'lucide-react';
import { useSettingsStore, VoiceLanguage } from '../store/useSettingsStore';
import { cn } from '../lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = React.memo(function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const voiceLanguage = useSettingsStore(state => state.voiceLanguage);
  const setVoiceLanguage = useSettingsStore(state => state.setVoiceLanguage);
  const toggleVoiceLanguage = useSettingsStore(state => state.toggleVoiceLanguage);

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
          "w-[90vw] max-w-sm max-h-[85vh]",
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

        <div className="p-5 space-y-5">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Mic size={20} className="text-cyan-600" />
              <div>
                <div className="font-semibold text-slate-800 text-sm">Voice Language</div>
                <div className="text-xs text-slate-500">语音识别语言</div>
              </div>
            </div>

            <button
              onClick={toggleVoiceLanguage}
              className={cn(
                "relative w-14 h-8 rounded-full transition-all duration-300",
                "focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2",
                voiceLanguage === 'zh-CN' ? 'bg-red-500' : 'bg-blue-500'
              )}
              aria-label="Toggle voice language"
            >
              <div
                className={cn(
                  "absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center text-xs font-bold",
                  voiceLanguage === 'zh-CN' ? 'left-7' : 'left-1'
                )}
              >
                {voiceLanguage === 'zh-CN' ? '中' : 'A'}
              </div>
            </button>
          </div>

          <div className="text-center text-sm text-slate-600">
            {voiceLanguage === 'zh-CN' ? (
              <span>当前: <span className="font-semibold text-red-600">中文</span></span>
            ) : (
              <span>Current: <span className="font-semibold text-blue-600">English</span></span>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => setVoiceLanguage(voiceLanguage === 'zh-CN' ? 'en' : 'zh-CN')}
              className="w-full py-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl text-sm font-medium transition-all"
            >
              切换到 {voiceLanguage === 'zh-CN' ? 'English' : '中文'}
            </button>
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
