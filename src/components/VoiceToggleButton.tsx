import { VoiceIcon } from './VoiceIcon';
import { cn } from '../lib/utils';

interface VoiceToggleButtonProps {
  isListening: boolean;
  onToggle: () => void;
  variant: 'desktop' | 'mobile';
}

export function VoiceToggleButton({ isListening, onToggle, variant }: VoiceToggleButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "items-center justify-center rounded-full transition-all duration-200",
        variant === 'desktop'
          ? "hidden sm:inline-flex w-9 h-9"
          : "sm:hidden inline-flex w-10 h-10 active:scale-95",
        variant === 'desktop' && !isListening && "hover:bg-[var(--accent-soft)]"
      )}
      style={
        variant === 'desktop'
          ? {
              color: isListening ? 'var(--text-inverse)' : 'var(--accent)',
              backgroundColor: isListening ? 'var(--accent)' : 'var(--accent-soft)',
            }
          : {
              color: 'var(--accent)',
              backgroundColor: 'var(--accent-soft)',
            }
      }
      aria-label={isListening ? "Stop voice search" : "Start voice search"}
    >
      <VoiceIcon size={18} active={isListening} />
    </button>
  );
}
