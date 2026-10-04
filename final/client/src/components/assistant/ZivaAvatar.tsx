// Cute illustrated face avatar for Ziva AI

interface ZivaAvatarProps {
  size?: number;
  className?: string;
}

export function ZivaAvatar({ size = 36, className = '' }: ZivaAvatarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Ziva AI"
    >
      {/* face circle */}
      <circle cx="32" cy="32" r="28" fill="url(#zivaGrad)" />

      {/* cheek blush */}
      <ellipse cx="18" cy="38" rx="5" ry="3" fill="#f9a8d4" opacity="0.7" />
      <ellipse cx="46" cy="38" rx="5" ry="3" fill="#f9a8d4" opacity="0.7" />

      {/* star eyes */}
      <g transform="translate(20,25)">
        <path d="M0-5 L1.2-1.7 L4.8-1.5 L2.1 0.7 L3.1 4.3 L0 2.4 L-3.1 4.3 L-2.1 0.7 L-4.8-1.5 L-1.2-1.7Z" fill="white" />
      </g>
      <g transform="translate(44,25)">
        <path d="M0-5 L1.2-1.7 L4.8-1.5 L2.1 0.7 L3.1 4.3 L0 2.4 L-3.1 4.3 L-2.1 0.7 L-4.8-1.5 L-1.2-1.7Z" fill="white" />
      </g>

      {/* smile */}
      <path
        d="M22 40 Q32 49 42 40"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* small sparkle top-right */}
      <g transform="translate(50,12)" opacity="0.9">
        <path d="M0-4 L0.8-0.8 L4 0 L0.8 0.8 L0 4 L-0.8 0.8 L-4 0 L-0.8-0.8Z" fill="white" />
      </g>

      {/* tiny dot sparkle top-left */}
      <circle cx="14" cy="14" r="2.5" fill="white" opacity="0.7" />

      <defs>
        <linearGradient id="zivaGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
