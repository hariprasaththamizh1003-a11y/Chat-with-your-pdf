import React from 'react';

export const StaxBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#0a0b16]">
      {/* Ambient background radial gradient glow spots */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-900/25 blur-3xl" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-purple-900/20 blur-3xl" />
      <div className="absolute -bottom-32 left-1/3 w-[600px] h-[600px] rounded-full bg-blue-900/30 blur-3xl" />

      {/* Sweeping Neon Wave Ribbons matching the reference image */}
      <svg
        className="absolute inset-0 w-full h-full opacity-40 mix-blend-screen"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="neonCyanBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.5" />
          </linearGradient>

          <linearGradient id="neonMagentaPurple" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d946ef" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="neonElectric" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.6" />
          </linearGradient>

          <filter id="ribbonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Ribbon 1 */}
        <path
          d="M -100 680 C 300 750, 600 480, 1100 620 C 1300 680, 1500 600, 1600 620"
          stroke="url(#neonCyanBlue)"
          strokeWidth="38"
          strokeLinecap="round"
          filter="url(#ribbonGlow)"
        />

        {/* Ribbon 2 - Vibrant Magenta / Purple Core */}
        <path
          d="M -50 720 C 350 780, 700 520, 1150 660 C 1350 720, 1520 640, 1620 660"
          stroke="url(#neonMagentaPurple)"
          strokeWidth="24"
          strokeLinecap="round"
          filter="url(#ribbonGlow)"
        />

        {/* Ribbon 3 - High Intensity Electric Cyan Centerline */}
        <path
          d="M -20 740 C 400 800, 750 550, 1200 690 C 1400 740, 1550 670, 1650 690"
          stroke="url(#neonElectric)"
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Ribbon 4 - Upper Flow */}
        <path
          d="M -80 520 C 250 580, 500 360, 950 490 C 1200 560, 1450 480, 1580 500"
          stroke="url(#neonCyanBlue)"
          strokeWidth="16"
          strokeLinecap="round"
          opacity="0.45"
          filter="url(#ribbonGlow)"
        />
      </svg>
    </div>
  );
};
