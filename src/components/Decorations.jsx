// Cute decorative SVG elements for "Hers" (light) mode
// Inspired by Animal Crossing / cottagecore aesthetics

export function Leaf({ className = '', size = 20, color = '#9bb8a4' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22.23C7.58 17.25 9.88 12.56 17 10V8Z" fill={color} opacity="0.7" />
      <path d="M20.5 3.5C15.5 3.5 7 6.5 7 16C7 16 9 14 12 13C15 12 20 11 20.5 3.5Z" fill={color} opacity="0.5" />
    </svg>
  )
}

export function Flower({ className = '', size = 22, color = '#eab8be' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="3" fill="#f5e6b8" />
      <ellipse cx="12" cy="6" rx="2.5" ry="3.5" fill={color} opacity="0.7" />
      <ellipse cx="12" cy="18" rx="2.5" ry="3.5" fill={color} opacity="0.7" />
      <ellipse cx="6" cy="12" rx="3.5" ry="2.5" fill={color} opacity="0.6" />
      <ellipse cx="18" cy="12" rx="3.5" ry="2.5" fill={color} opacity="0.6" />
      <ellipse cx="7.8" cy="7.8" rx="2.5" ry="3" transform="rotate(-45 7.8 7.8)" fill={color} opacity="0.5" />
      <ellipse cx="16.2" cy="16.2" rx="2.5" ry="3" transform="rotate(-45 16.2 16.2)" fill={color} opacity="0.5" />
    </svg>
  )
}

export function SmallFlower({ className = '', size = 14, color = '#c5b5d6' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <circle cx="8" cy="8" r="2" fill="#f5e6b8" />
      <circle cx="8" cy="3.5" r="2.2" fill={color} opacity="0.6" />
      <circle cx="8" cy="12.5" r="2.2" fill={color} opacity="0.6" />
      <circle cx="3.5" cy="8" r="2.2" fill={color} opacity="0.6" />
      <circle cx="12.5" cy="8" r="2.2" fill={color} opacity="0.6" />
    </svg>
  )
}

export function Bunny({ className = '', size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <ellipse cx="11" cy="7" rx="3" ry="6" fill="#f0e8de" stroke="#d4c8ba" strokeWidth="0.5" />
      <ellipse cx="21" cy="7" rx="3" ry="6" fill="#f0e8de" stroke="#d4c8ba" strokeWidth="0.5" />
      <ellipse cx="11" cy="6.5" rx="1.5" ry="4" fill="#eab8be" opacity="0.4" />
      <ellipse cx="21" cy="6.5" rx="1.5" ry="4" fill="#eab8be" opacity="0.4" />
      <circle cx="16" cy="17" r="8" fill="#f0e8de" stroke="#d4c8ba" strokeWidth="0.5" />
      <circle cx="13" cy="16" r="1.2" fill="#5a4e42" />
      <circle cx="19" cy="16" r="1.2" fill="#5a4e42" />
      <circle cx="13.4" cy="15.5" r="0.4" fill="white" />
      <circle cx="19.4" cy="15.5" r="0.4" fill="white" />
      <ellipse cx="16" cy="18.5" rx="1" ry="0.7" fill="#eab8be" />
      <path d="M15 19.5 Q16 20.5 17 19.5" stroke="#d4c8ba" strokeWidth="0.5" fill="none" />
      <circle cx="10.5" cy="18" r="1.5" fill="#eab8be" opacity="0.25" />
      <circle cx="21.5" cy="18" r="1.5" fill="#eab8be" opacity="0.25" />
    </svg>
  )
}

export function Bird({ className = '', size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <ellipse cx="12" cy="14" rx="6" ry="5" fill="#b5cfe0" opacity="0.8" />
      <circle cx="16" cy="10" r="3.5" fill="#b5cfe0" opacity="0.9" />
      <circle cx="17.2" cy="9.5" r="0.8" fill="#3d3429" />
      <circle cx="17.5" cy="9.2" r="0.25" fill="white" />
      <path d="M19.5 10 L22 9.5 L19.5 11Z" fill="#e8a87c" />
      <ellipse cx="10" cy="13.5" rx="4" ry="2.5" fill="#8fb8d0" opacity="0.6" transform="rotate(-10 10 13.5)" />
      <circle cx="15.5" cy="11" r="1" fill="#eab8be" opacity="0.3" />
    </svg>
  )
}

export function Star({ className = '', size = 12, color = '#f5e6b8' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M8 1L9.8 5.8L15 6.2L11.2 9.5L12.4 14.6L8 12L3.6 14.6L4.8 9.5L1 6.2L6.2 5.8Z" fill={color} opacity="0.7" />
    </svg>
  )
}

export function TinyHouse({ className = '', size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
      <path d="M14 3L3 13H25L14 3Z" fill="#e8a87c" opacity="0.7" />
      <rect x="6" y="13" width="16" height="12" rx="1" fill="#f5ede3" stroke="#d4c8ba" strokeWidth="0.5" />
      <rect x="12" y="18" width="4" height="7" rx="1" fill="#9bb8a4" opacity="0.6" />
      <circle cx="14.8" cy="22" r="0.5" fill="#7a6b5d" />
      <rect x="8" y="15.5" width="3" height="3" rx="0.5" fill="#b5cfe0" opacity="0.5" stroke="#d4c8ba" strokeWidth="0.3" />
      <rect x="19" y="6" width="2.5" height="7" fill="#d4c8ba" opacity="0.6" />
    </svg>
  )
}

export function Sparkle({ className = '', size = 10, color = '#f0d58c' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" className={className}>
      <path d="M6 0L7 4.5L12 6L7 7.5L6 12L5 7.5L0 6L5 4.5Z" fill={color} opacity="0.6" />
    </svg>
  )
}

export function Butterfly({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <ellipse cx="8" cy="9" rx="5" ry="4" fill="#c5b5d6" opacity="0.5" transform="rotate(-15 8 9)" />
      <ellipse cx="8" cy="15" rx="3.5" ry="3" fill="#eab8be" opacity="0.4" transform="rotate(10 8 15)" />
      <ellipse cx="16" cy="9" rx="5" ry="4" fill="#c5b5d6" opacity="0.5" transform="rotate(15 16 9)" />
      <ellipse cx="16" cy="15" rx="3.5" ry="3" fill="#eab8be" opacity="0.4" transform="rotate(-10 16 15)" />
      <ellipse cx="12" cy="12" rx="1" ry="5" fill="#8a7e72" opacity="0.5" />
      <path d="M12 7 Q10 3 8 2" stroke="#8a7e72" strokeWidth="0.5" fill="none" opacity="0.4" />
      <path d="M12 7 Q14 3 16 2" stroke="#8a7e72" strokeWidth="0.5" fill="none" opacity="0.4" />
      <circle cx="8" cy="2" r="0.7" fill="#c5b5d6" opacity="0.5" />
      <circle cx="16" cy="2" r="0.7" fill="#c5b5d6" opacity="0.5" />
    </svg>
  )
}

// Wavy scalloped divider — Animal Crossing style
export function WavyDivider({ className = '' }) {
  return (
    <div className={`relative py-2 ${className}`}>
      <svg width="100%" height="20" viewBox="0 0 400 20" preserveAspectRatio="none" className="block">
        <path
          d="M0 10 C20 0, 40 0, 60 10 C80 20, 100 20, 120 10 C140 0, 160 0, 180 10 C200 20, 220 20, 240 10 C260 0, 280 0, 300 10 C320 20, 340 20, 360 10 C380 0, 400 0, 400 10"
          stroke="#c5d9cb"
          strokeWidth="2.5"
          fill="none"
          opacity="0.6"
        />
      </svg>
      {/* Tiny scattered shapes along the divider */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 20" preserveAspectRatio="none">
        <circle cx="50" cy="5" r="2.5" fill="#eab8be" opacity="0.5" />
        <circle cx="150" cy="15" r="2" fill="#c5b5d6" opacity="0.5" />
        <circle cx="250" cy="4" r="2.5" fill="#f5e6b8" opacity="0.6" />
        <circle cx="350" cy="16" r="2" fill="#b5cfe0" opacity="0.5" />
        {/* tiny leaf shapes */}
        <path d="M100 8 Q97 4 103 6" fill="#9bb8a4" opacity="0.5" />
        <path d="M200 12 Q197 16 203 14" fill="#9bb8a4" opacity="0.5" />
        <path d="M300 8 Q297 4 303 6" fill="#9bb8a4" opacity="0.5" />
      </svg>
    </div>
  )
}

// Keep old name for backwards compatibility
export const VineDivider = WavyDivider

// Scattered icons pattern overlay for backgrounds
export function ScatteredPattern({ className = '' }) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <svg className="absolute w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
        {/* Flowers */}
        <g opacity="0.12">
          <circle cx="45" cy="30" r="3" fill="#f5e6b8" />
          <circle cx="45" cy="23" r="3" fill="#eab8be" />
          <circle cx="45" cy="37" r="3" fill="#eab8be" />
          <circle cx="38" cy="30" r="3" fill="#eab8be" />
          <circle cx="52" cy="30" r="3" fill="#eab8be" />
        </g>
        <g opacity="0.10">
          <circle cx="320" cy="70" r="2.5" fill="#f5e6b8" />
          <circle cx="320" cy="64" r="2.5" fill="#c5b5d6" />
          <circle cx="320" cy="76" r="2.5" fill="#c5b5d6" />
          <circle cx="314" cy="70" r="2.5" fill="#c5b5d6" />
          <circle cx="326" cy="70" r="2.5" fill="#c5b5d6" />
        </g>

        {/* Leaves */}
        <path d="M180 50 Q175 42 185 45" fill="#9bb8a4" opacity="0.15" />
        <path d="M280 150 Q275 142 285 145" fill="#9bb8a4" opacity="0.12" />
        <path d="M60 200 Q55 192 65 195" fill="#9bb8a4" opacity="0.14" />
        <path d="M350 280 Q345 272 355 275" fill="#9bb8a4" opacity="0.10" />
        <path d="M120 340 Q115 332 125 335" fill="#9bb8a4" opacity="0.13" />

        {/* Stars */}
        <path d="M100 100L101.5 104L106 104.5L102.5 107L103.5 111L100 109L96.5 111L97.5 107L94 104.5L98.5 104Z" fill="#f0d58c" opacity="0.15" />
        <path d="M250 220L251.5 224L256 224.5L252.5 227L253.5 231L250 229L246.5 231L247.5 227L244 224.5L248.5 224Z" fill="#f0d58c" opacity="0.12" />
        <path d="M370 350L371.5 354L376 354.5L372.5 357L373.5 361L370 359L366.5 361L367.5 357L364 354.5L368.5 354Z" fill="#f0d58c" opacity="0.10" />

        {/* Tiny triangles (trees) */}
        <path d="M200 300L195 310L205 310Z" fill="#9bb8a4" opacity="0.08" />
        <path d="M50 350L45 360L55 360Z" fill="#9bb8a4" opacity="0.08" />

        {/* Circles (berries/fruits) */}
        <circle cx="300" cy="30" r="3" fill="#eab8be" opacity="0.10" />
        <circle cx="150" cy="180" r="2.5" fill="#e8a87c" opacity="0.10" />
        <circle cx="380" cy="180" r="3" fill="#c5b5d6" opacity="0.08" />
        <circle cx="30" cy="120" r="2" fill="#b5cfe0" opacity="0.10" />
        <circle cx="220" cy="380" r="2.5" fill="#eab8be" opacity="0.10" />

        {/* Music notes (AC vibe) */}
        <g opacity="0.08">
          <circle cx="160" cy="120" r="2.5" fill="#c5b5d6" />
          <rect x="162" y="108" width="1" height="14" fill="#c5b5d6" />
          <circle cx="170" cy="115" r="2.5" fill="#c5b5d6" />
          <rect x="172" y="103" width="1" height="14" fill="#c5b5d6" />
          <rect x="162" y="108" width="11" height="1.5" fill="#c5b5d6" rx="0.5" />
        </g>

        {/* Footprints */}
        <g opacity="0.06" transform="rotate(30, 340, 130)">
          <ellipse cx="337" cy="128" rx="2" ry="3" fill="#d4c8ba" />
          <ellipse cx="343" cy="128" rx="2" ry="3" fill="#d4c8ba" />
          <ellipse cx="340" cy="134" rx="3.5" ry="4.5" fill="#d4c8ba" />
        </g>
      </svg>
    </div>
  )
}
