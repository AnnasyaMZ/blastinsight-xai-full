// src/components/Sidebar.tsx
import React from 'react';
import type { ActiveNav } from '../types'; // Tambahkan kata 'type' di sini
import { LayoutDashboard, ScanSearch, History, Info } from 'lucide-react';

interface SidebarProps {
  activeNav: ActiveNav;
  setActiveNav: (nav: ActiveNav) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const LOGO_URL = '/logo.png'; 

export const Sidebar: React.FC<SidebarProps> = ({ activeNav, setActiveNav, isOpenMobile, onCloseMobile }) => {
  const navItems = [
    { id: 'dashboard' as ActiveNav, label: 'Dashboard Telemetri', icon: LayoutDashboard },
    { id: 'analisis-baru' as ActiveNav, label: 'Ruang Analisis XAI', icon: ScanSearch },
    { id: 'riwayat' as ActiveNav, label: 'Riwayat Evaluasi', icon: History },
    { id: 'tentang-sistem' as ActiveNav, label: 'Tentang Sistem', icon: Info }
  ];

  return (
    <>
      {isOpenMobile && <div className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm" onClick={onCloseMobile} />}
      <aside className={`fixed left-0 top-0 h-full w-72 bg-[#050505]/90 backdrop-blur-xl border-r border-white/10 z-50 flex flex-col justify-between transition-transform duration-300 ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col">
          <div className="h-20 px-6 flex items-center gap-3 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => window.location.href = '/'}>
            <img alt="BlastInsight" className="h-8 w-auto object-contain hover:scale-105 transition-transform" src={LOGO_URL} />
          </div>
          <div className="px-4 py-8">
            <div className="px-2 pb-3 text-[10px] uppercase tracking-widest text-gray-500 font-bold">Navigation Menu</div>
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = activeNav === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveNav(item.id); onCloseMobile(); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-300 font-bold text-[13px] ${
                      isActive
                        ? 'bg-[#FF7300]/10 border border-[#FF7300]/30 text-[#FF7300] shadow-[0_0_15px_rgba(255,115,0,0.15)]'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
        <div className="p-4 m-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">BlastInsight-XAI</span>
            <span className="px-2 py-0.5 rounded text-[9px] bg-green-500/20 text-green-500 border border-green-500/30 uppercase font-bold">Ready</span>
          </div>
          <div className="text-[11px] text-gray-400">DBEST 2026</div>
          <div className="pt-3 mt-2 border-t border-white/10 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF7300] animate-pulse"></span>
            <span className="text-[10px] text-gray-300 font-medium">Prototype v1.0 • YOLO11-Seg</span>
          </div>
        </div>
      </aside>
    </>
  );
};