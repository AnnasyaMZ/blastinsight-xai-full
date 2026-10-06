// src/components/Header.tsx
import React from 'react';
import { Menu, User } from 'lucide-react';

interface HeaderProps {
  onToggleMobile: () => void;
  currentBlastId: string;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobile, currentBlastId }) => {
  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-20 bg-black/40 backdrop-blur-md border-b border-white/10 z-40 px-6 sm:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={onToggleMobile} className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 border border-white/10">
          <Menu size={20} />
        </button>
        <div className="hidden sm:flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full border border-white/10">
          <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse"></span>
          <span className="text-[10px] text-white font-bold uppercase tracking-wider">System Online</span>
          <span className="text-gray-500">|</span>
          <span className="text-[10px] text-[#FF7300] font-bold">YOLO11-Seg Ready</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-[11px] text-gray-400 font-medium">
          <span>Active Session:</span>
          <span className="text-[#FF7300] font-bold">{currentBlastId}</span>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#FF7300]/20 border border-[#FF7300]/50 flex items-center justify-center text-[#FF7300] cursor-pointer hover:bg-[#FF7300]/30 transition-colors shadow-[0_0_15px_rgba(255,115,0,0.2)]">
          <User size={16} />
        </div>
      </div>
    </header>
  );
};