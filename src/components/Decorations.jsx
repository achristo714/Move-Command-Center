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
      {/* Ears */}
      <ellipse cx="11" cy="7" rx="3" ry="6" fill="#f0e8de" stroke="#d4c8ba" strokeWidth="0.5" />
      <ellipse cx="21" cy="7" rx="3" ry="6" fill="#f0e8de" stroke="#d4c8ba" strokeWidth="0.5" />
      <ellipse cx="11" cy="6.5" rx="1.5" ry="4" fill="#eab8be" opacity="0.4" />
      <ellipse cx="21" cy="6.5" rx="1.5" ry="4" fill="#eab8be" opacity="0.4" />
      {/* Head */}
      <circle cx="16" cy="17" r="8" fill="#f0e8de" stroke="#d4c8ba" strokeWidth="0.5" />
      {/* Eyes */}
      <circle cx="13" cy="16" r="1.2" fill="#5a4e42" />
      <circle cx="19" cy="16" r="1.2" fill="#5a4e42" />
      <circle cx="13.4" cy="15.5" r="0.4" fill="white" />
      <circle cx="19.4" cy="15.5" r="0.4" fill="white" />
      {/* Nose */}
      <ellipse cx="16" cy="18.5" rx="1" ry="0.7" fill="#eab8be" />
      {/* Mouth */}
      <path d="M15 19.5 Q16 20.5 17 19.5" stroke="#d4c8ba" strokeWidth="0.5" fill="none" />
      {/* Cheeks */}
      <circle cx="10.5" cy="18" r="1.5" fill="#eab8be" opacity="0.25" />
      <circle cx="21.5" cy="18" r="1.5" fill="#eab8be" opacity="0.25" />
    </svg>
  )
}

export function Bird({ className = '', size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Body */}
      <ellipse cx="12" cy="14" rx="6" ry="5" fill="#b5cfe0" opacity="0.8" />
      {/* Head */}
      <circle cx="16" cy="10" r="3.5" fill="#b5cfe0" opacity="0.9" />
      {/* Eye */}
      <circle cx="17.2" cy="9.5" r="0.8" fill="#3d3429" />
      <circle cx="17.5" cy="9.2" r="0.25" fill="white" />
      {/* Beak */}
      <path d="M19.5 10 L22 9.5 L19.5 11Z" fill="#e8a87c" />
      {/* Wing */}
      <ellipse cx="10" cy="13.5" rx="4" ry="2.5" fill="#8fb8d0" opacity="0.6" transform="rotate(-10 10 13.5)" />
      {/* Cheek */}
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
      {/* Roof */}
      <path d="M14 3L3 13H25L14 3Z" fill="#e8a87c" opacity="0.7" />
      {/* Walls */}
      <rect x="6" y="13" width="16" height="12" rx="1" fill="#f5ede3" stroke="#d4c8ba" strokeWidth="0.5" />
      {/* Door */}
      <rect x="12" y="18" width="4" height="7" rx="1" fill="#9bb8a4" opacity="0.6" />
      <circle cx="14.8" cy="22" r="0.5" fill="#7a6b5d" />
      {/* Window */}
      <rect x="8" y="15.5" width="3" height="3" rx="0.5" fill="#b5cfe0" opacity="0.5" stroke="#d4c8ba" strokeWidth="0.3" />
      {/* Chimney */}
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
      {/* Left wings */}
      <ellipse cx="8" cy="9" rx="5" ry="4" fill="#c5b5d6" opacity="0.5" transform="rotate(-15 8 9)" />
      <ellipse cx="8" cy="15" rx="3.5" ry="3" fill="#eab8be" opacity="0.4" transform="rotate(10 8 15)" />
      {/* Right wings */}
      <ellipse cx="16" cy="9" rx="5" ry="4" fill="#c5b5d6" opacity="0.5" transform="rotate(15 16 9)" />
      <ellipse cx="16" cy="15" rx="3.5" ry="3" fill="#eab8be" opacity="0.4" transform="rotate(-10 16 15)" />
      {/* Body */}
      <ellipse cx="12" cy="12" rx="1" ry="5" fill="#8a7e72" opacity="0.5" />
      {/* Antennae */}
      <path d="M12 7 Q10 3 8 2" stroke="#8a7e72" strokeWidth="0.5" fill="none" opacity="0.4" />
      <path d="M12 7 Q14 3 16 2" stroke="#8a7e72" strokeWidth="0.5" fill="none" opacity="0.4" />
      <circle cx="8" cy="2" r="0.7" fill="#c5b5d6" opacity="0.5" />
      <circle cx="16" cy="2" r="0.7" fill="#c5b5d6" opacity="0.5" />
    </svg>
  )
}

// A decorative vine/branch divider
export function VineDivider({ className = '' }) {
  return (
    <svg width="100%" height="16" viewBox="0 0 200 16" fill="none" className={className} preserveAspectRatio="none">
      <path d="M0 8 Q25 2 50 8 T100 8 T150 8 T200 8" stroke="#9bb8a4" strokeWidth="1" fill="none" opacity="0.3" />
      <circle cx="30" cy="5" r="2" fill="#eab8be" opacity="0.4" />
      <circle cx="80" cy="10" r="1.5" fill="#c5b5d6" opacity="0.3" />
      <circle cx="130" cy="4" r="2" fill="#f5e6b8" opacity="0.4" />
      <circle cx="170" cy="11" r="1.5" fill="#eab8be" opacity="0.3" />
      {/* Tiny leaves */}
      <path d="M50 8 Q48 5 52 6" fill="#9bb8a4" opacity="0.4" />
      <path d="M100 8 Q98 11 102 10" fill="#9bb8a4" opacity="0.4" />
      <path d="M150 8 Q148 5 152 6" fill="#9bb8a4" opacity="0.4" />
    </svg>
  )
}
