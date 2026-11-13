import type { SVGProps } from "react";

export function AlamLogoIcon({
  size = 40,
  className,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient id="alam-grad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="50%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>
        <linearGradient id="alam-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#fdba74" />
        </linearGradient>
        <filter id="alam-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Premium squircle container */}
      <rect
        x="0.75"
        y="0.75"
        width="42.5"
        height="42.5"
        rx="12"
        fill="url(#alam-grad)"
        stroke="rgba(255, 255, 255, 0.28)"
        strokeWidth="1.5"
      />

      <g filter="url(#alam-glow)">
        {/* Main Architectural 'A' (Alam) in crisp white with inner transparent cutout */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M22 10L12 35H17.2L19.2 30H24.8L26.8 35H32L22 10ZM22 17.5L20.2 25.5H23.8L22 17.5Z"
          fill="#ffffff"
        />

        {/* Upper horizontal arm of 'F' (Fashion) in warm lustrous gold */}
        <rect x="23" y="13" width="11" height="2.8" rx="1.4" fill="url(#alam-gold)" />

        {/* Middle horizontal arm of 'F' in warm gold */}
        <rect x="24.2" y="19" width="8" height="2.8" rx="1.4" fill="url(#alam-gold)" />

        {/* Haute couture crown spark / diamond finial atop the apex */}
        <polygon points="22,6.5 24,8.5 22,10.5 20,8.5" fill="url(#alam-gold)" />
      </g>
    </svg>
  );
}

