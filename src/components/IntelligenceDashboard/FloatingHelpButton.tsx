import { useState } from "react";

interface FloatingHelpButtonProps {
  onClick: () => void;
}

/**
 * Floating Help Button - Premium AI Assistant trigger
 * Provides always-accessible help for new traders
 * Features: Pulsing glow, tooltip, micro-interactions
 */
export function FloatingHelpButton({ onClick }: FloatingHelpButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Tooltip on hover */}
      <div
        className={`
          absolute bottom-full right-0 mb-3 px-4 py-2 rounded-xl
          bg-gray-900/95 backdrop-blur-sm border border-white/10
          text-sm text-white whitespace-nowrap
          transition-all duration-300 pointer-events-none
          ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
        `}
      >
        <div className="flex items-center gap-2">
          <span className="text-purple-400">✨</span>
          <span>Ask AI anything about trading</span>
        </div>
        {/* Tooltip arrow */}
        <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-gray-900/95 border-r border-b border-white/10 transform rotate-45" />
      </div>

      {/* Pulsing glow rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`
            absolute w-16 h-16 rounded-full
            bg-gradient-to-r from-purple-500/30 to-blue-500/30
            animate-ping-slow
            ${isHovered ? "opacity-100" : "opacity-50"}
          `}
        />
        <div
          className={`
            absolute w-20 h-20 rounded-full
            bg-gradient-to-r from-purple-500/20 to-blue-500/20
            animate-ping-slower
            ${isHovered ? "opacity-100" : "opacity-30"}
          `}
        />
      </div>

      {/* Main button */}
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsPressed(false);
        }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        className={`
          relative w-14 h-14 rounded-2xl
          bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600
          shadow-lg shadow-purple-500/30
          flex items-center justify-center
          transition-all duration-300 ease-out
          group
          ${isHovered ? "scale-110 shadow-xl shadow-purple-500/40" : ""}
          ${isPressed ? "scale-95" : ""}
        `}
        aria-label="Open AI Trading Assistant"
      >
        {/* Inner glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />

        {/* Icon with animation */}
        <div
          className={`
            relative transition-transform duration-300
            ${isHovered ? "scale-110 rotate-12" : ""}
          `}
        >
          {/* Sparkle icon */}
          <svg
            className="w-6 h-6 text-white drop-shadow-lg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
        </div>

        {/* Keyboard shortcut hint */}
        <div
          className={`
            absolute -top-2 -right-2 px-1.5 py-0.5 rounded-md
            bg-gray-900 border border-white/20
            text-[10px] font-mono text-gray-300
            transition-all duration-300
            ${isHovered ? "opacity-100 scale-100" : "opacity-0 scale-75"}
          `}
        >
          ⌘K
        </div>
      </button>

      {/* Animation styles */}
      <style>{`
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes ping-slower {
          0% { transform: scale(1); opacity: 0.75; }
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-ping-slower {
          animation: ping-slower 3s cubic-bezier(0, 0, 0.2, 1) infinite;
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
}
