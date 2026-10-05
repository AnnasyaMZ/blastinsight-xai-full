import React from 'react';
import { ActiveNav } from '../types';

interface SidebarProps {
  activeNav: ActiveNav;
  setActiveNav: (nav: ActiveNav) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const LOGO_URL = 'https://lh3.googleusercontent.com/aida/AEtjO1UZ8VYl9Lea13s3I24xM2OJzZTSY6mglWeNGnjaRCStSDnyJtk1pX17Vs_c6LjmJlBRnJ21AyetBD-Nv16MV9BAuOOYJLQPYLEwEH9o6F5e0craOhDQmNBWBGrNG8xHOf08ayGYNFVqhpwq-Mitg38IX_3mHMWZ2NGjHuXOtdlmD5sqXFL5xRBnc6gAe7e2NNSmWbRlLmBiWKc5E6f1FM5D62Ta037GJ7kw2bVcYxYCtEDyDPWjQjYvOyI';

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  setActiveNav,
  isOpenMobile,
  onCloseMobile
}) => {
  const navItems: { id: ActiveNav; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid_view' },
    { id: 'analisis-baru', label: 'Analisis Baru', icon: 'analytics' },
    { id: 'riwayat', label: 'Riwayat', icon: 'history' },
    { id: 'tentang-sistem', label: 'Tentang Sistem', icon: 'info' }
  ];

  const handleNavClick = (id: ActiveNav) => {
    setActiveNav(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed left-0 top-0 h-full w-72 bg-[#171c22] border-r border-[#30353c] z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Logo Header */}
          <div className="h-16 px-6 flex items-center gap-2 border-b border-[#30353c]">
            <img
              alt="BlastInsight-XAI Logo"
              className="h-8 w-auto object-contain"
              src={LOGO_URL}
              onError={(e) => {
                // Fallback visual if external image is blocked
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-[14px] leading-5 text-[#dee3eb] tracking-wide uppercase truncate">
                BlastInsight-XAI
              </span>
              <span className="text-[11px] leading-3.5 text-[#d8c3ad] truncate">
                Decision Support System
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="px-4 py-6">
            <div className="px-2 pb-1 text-[11px] uppercase tracking-wider text-[#a08e7a] font-medium">
              Navigation Menu
            </div>
            <nav className="flex flex-col gap-1 mt-1">
              {navItems.map((item) => {
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-r text-left transition-colors font-medium text-[13px] ${
                      isActive
                        ? 'bg-[#1b2026] border-l-2 border-[#f59e0b] text-[#dee3eb] font-semibold'
                        : 'text-[#d8c3ad] hover:bg-[#252a31] hover:text-[#dee3eb]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom System Card */}
        <div className="p-4 m-4 rounded-lg bg-[#1b2026] border border-[#30353c] flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[#dee3eb]">
              BlastInsight-XAI
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#4ae176]/10 border border-[#4ae176]/30 text-[#4ae176] text-[10px] uppercase font-semibold">
              Ready
            </span>
          </div>
          <div className="text-[12px] text-[#d8c3ad]">DBEST 2026</div>
          <div className="text-[12px] text-[#a08e7a] truncate">
            Telkom University Purwokerto
          </div>
          <div className="pt-2 mt-1 border-t border-[#30353c]/60 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse"></span>
            <span className="text-[11px] text-[#d8c3ad]">
              Prototype v1.0 • YOLO11-Seg
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
