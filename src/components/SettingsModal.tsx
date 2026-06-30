import React from 'react';
import { X, Settings as SettingsIcon, Sparkles, Minimize2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSettingsStore } from '../store/useSettingsStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = React.memo(function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const theme = useSettingsStore(state => state.theme);
  const setTheme = useSettingsStore(state => state.setTheme);

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
          "w-[90vw] max-w-sm",
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
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Theme</h3>
              <p className="text-xs text-slate-500">Choose your preferred visual style</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTheme('minimal')}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all text-left",
                  theme === 'minimal'
                    ? "border-orange-500 bg-orange-50 shadow-md"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Minimize2 size={16} className={cn(theme === 'minimal' ? 'text-orange-500' : 'text-slate-400')} />
                  <span className={cn("font-semibold text-sm", theme === 'minimal' ? 'text-orange-700' : 'text-slate-700')}>
                    Minimal
                  </span>
                </div>
                <p className="text-xs text-slate-500">Clean, modern, refined</p>
              </button>
              <button
                onClick={() => setTheme('trumpian')}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all text-left",
                  theme === 'trumpian'
                    ? "border-yellow-500 bg-yellow-50 shadow-md"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className={cn(theme === 'trumpian' ? 'text-yellow-600' : 'text-slate-400')} />
                  <span className={cn("font-semibold text-sm", theme === 'trumpian' ? 'text-yellow-700' : 'text-slate-700')}>
                    Trumpian
                  </span>
                </div>
                <p className="text-xs text-slate-500">Gold, glamorous, HUGE</p>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center">
              Voice language can be toggled from the mobile menu.
              <br />
              语音语言可在菜单中切换
            </p>
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
