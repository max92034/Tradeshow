import React from 'react';

interface VoiceIconProps {
  size?: number;
  className?: string;
  active?: boolean;
}

export const VoiceIcon = React.memo(function VoiceIcon({ size = 20, className = '', active = false }: VoiceIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="9"
        y="4"
        width="6"
        height="10"
        rx="3"
        fill="currentColor"
        opacity={active ? 1 : 0.85}
      />
      <path
        d="M5 11C5 14.866 8.13401 18 12 18C15.866 18 19 14.866 19 11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 18V21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8 21H16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {active && (
        <>
          <path
            d="M2 9C2 13.9706 6.02944 18 11 18"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.5"
            className="animate-pulse"
          />
          <path
            d="M22 9C22 13.9706 17.9706 18 13 18"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.5"
            className="animate-pulse"
          />
        </>
      )}
      {!active && (
        <circle cx="12" cy="9" r="1.5" fill="currentColor" opacity="0.6" />
      )}
    </svg>
  );
});
