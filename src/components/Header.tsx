import React from 'react';
import { LOGO_URL } from './Sidebar';

interface HeaderProps {
  onToggleMobile: () => void;
  currentBlastId: string;
  onSelectPreset?: (presetId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobile,
  currentBlastId
}) => {
  return (
    <header
      id="app-header"
      className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-[#0f141a]/90 backdrop-blur-md border-b border-[#30353c] z-40 px-4 sm:px-6 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onToggleMobile}
          id="mobile-menu-toggle-btn"
          className="lg:hidden p-1.5 rounded text-[#d8c3ad] hover:text-[#dee3eb] hover:bg-[#252a31] border border-[#30353c]"
          aria-label="Buka Menu"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        {/* Mobile Logo fallback */}
        <img
          alt="BlastInsight-XAI Logo"
          className="h-7 w-auto object-contain lg:hidden"
          src={LOGO_URL}
        />

        {/* System Status Pill */}
        <div className="flex items-center gap-2 bg-[#171c22] px-3 py-1 rounded border border-[#30353c]">
          <span className="w-2 h-2 rounded-full bg-[#4ae176] shadow-[0_0_8px_rgba(74,225,118,0.5)]"></span>
          <span className="text-[11px] text-[#dee3eb] font-medium uppercase tracking-wide">
            System Online
          </span>
          <span className="text-[#a08e7a]">|</span>
          <span className="text-[11px] text-[#ffc174] font-semibold">
            YOLO11-Seg Ready
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {/* Telemetry Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-[#d8c3ad] text-[11px]">
          <span className="material-symbols-outlined text-[16px] text-[#a08e7a]">
            calendar_today
          </span>
          <span>Current Session • 2026 Telemetry Active</span>
        </div>

        {/* Active Blast Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1b2026] border border-[#30353c] text-[11px] text-[#a08e7a]">
          <span>Active:</span>
          <span className="text-[#ffc174] font-semibold">{currentBlastId}</span>
        </div>

        {/* User Profile Avatar */}
        <div
          title="Field Mining Engineer (Telkom University Purwokerto)"
          className="w-8 h-8 rounded-full bg-[#ffc174] flex items-center justify-center text-[#472a00] font-bold cursor-pointer hover:brightness-110 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">person</span>
        </div>
      </div>
    </header>
  );
};
