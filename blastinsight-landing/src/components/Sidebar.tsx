import React from 'react';
import type { ActiveNav } from '../types';

interface SidebarProps {
  activeNav: ActiveNav;
  setActiveNav: (nav: ActiveNav) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const LOGO_URL = '/logo.png';

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  setActiveNav,
  isOpenMobile,
  onCloseMobile
}) => {
  const navItems: { id: ActiveNav; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard Telemetri', icon: 'grid_view' },
    { id: 'analisis-baru', label: 'Ruang Analisis XAI', icon: 'analytics' },
    { id: 'riwayat', label: 'Riwayat Evaluasi', icon: 'history' },
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
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}
      
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-[#000000]/95 backdrop-blur-xl border-r border-[#222222] z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Logo Header */}
          <div className="h-16 px-6 flex items-center gap-3 border-b border-[#222222]">
            <img alt="BlastInsight-XAI" className="h-8 w-auto object-contain cursor-pointer hover:scale-105 transition-transform" src={LOGO_URL} onClick={() => window.location.href = '/'} />
        
          </div>

          {/* Navigation Menu */}
          <div className="px-4 py-6">
            <div className="px-2 pb-2 text-[10px] uppercase tracking-widest text-[#A3A3A3] font-bold">
              Navigation Menu
            </div>
            <nav className="flex flex-col gap-1 mt-1">
              {navItems.map((item) => {
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-300 font-semibold text-[13px] ${
                      isActive
                        ? 'bg-[#FF7300]/10 border border-[#FF7300]/30 text-[#FF7300] shadow-[0_0_15px_rgba(255,115,0,0.15)]'
                        : 'text-[#A3A3A3] hover:bg-[#111111] hover:text-[#F8FAFC] border border-transparent'
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
        <div className="p-4 m-4 rounded-xl bg-[#111111] border border-[#222222] flex flex-col gap-1 shadow-sm hover:border-[#FF7300]/30 transition-colors duration-300">
          <div className="flex items-center justify-between">
  
            <span className="px-2 py-0.5 rounded text-[9px] bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] uppercase font-bold tracking-wider">
              Ready
            </span>
          </div>
          <div className="text-[11px] text-[#A3A3A3] mt-1">DBEST 2026</div>
          <div className="pt-2 mt-2 border-t border-[#222222] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF7300] animate-pulse"></span>
            <span className="text-[10px] text-[#A3A3A3] font-medium">Prototype v1.0 • YOLO11-Seg</span>
          </div>
        </div>
      </aside>
    </>
  );
};