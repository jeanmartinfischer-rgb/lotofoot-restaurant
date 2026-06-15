'use client';

export default function Crown({ size = 22 }: { size?: number }) {
  return (
    <span
      style={{ display: 'inline-block', width: size, height: size, lineHeight: 0 }}
      aria-label="Leader"
      title="Leader du classement"
    >
      <style>{`
        @keyframes crownFloat {
          0%, 100% { transform: translateY(0) rotate(-3deg); }
          50% { transform: translateY(-2px) rotate(3deg); }
        }
        @keyframes crownGlow {
          0%, 100% { filter: drop-shadow(0 0 1px #D4AF37); }
          50% { filter: drop-shadow(0 0 5px #FFD970); }
        }
        @keyframes crownSparkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1); }
        }
        .crown-wrap { animation: crownFloat 2.6s ease-in-out infinite, crownGlow 2.2s ease-in-out infinite; transform-origin: center bottom; }
        .crown-sparkle { animation: crownSparkle 1.8s ease-in-out infinite; transform-origin: center; }
        .crown-sparkle.s2 { animation-delay: 0.9s; }
      `}</style>
      <svg className="crown-wrap" viewBox="0 0 24 24" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="crownGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFE9A0" />
            <stop offset="50%" stopColor="#F5C542" />
            <stop offset="100%" stopColor="#C9921A" />
          </linearGradient>
        </defs>
        <path
          d="M3 8l3.5 3L12 5l5.5 6L21 8l-1.5 9h-15L3 8z"
          fill="url(#crownGold)"
          stroke="#A9750F"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
        <rect x="4.5" y="17" width="15" height="2.4" rx="1" fill="url(#crownGold)" stroke="#A9750F" strokeWidth="0.6" />
        <circle cx="6.5" cy="11" r="1" fill="#FFF6D6" />
        <circle cx="12" cy="5" r="1.1" fill="#FFF6D6" />
        <circle cx="17.5" cy="11" r="1" fill="#FFF6D6" />
        <circle className="crown-sparkle" cx="20" cy="6" r="0.9" fill="#FFFDEB" />
        <circle className="crown-sparkle s2" cx="4" cy="6" r="0.8" fill="#FFFDEB" />
      </svg>
    </span>
  );
}
