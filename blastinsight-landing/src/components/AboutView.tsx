import React from 'react';
import { Cpu, Eye, Calculator, BookOpen, AlertTriangle, Users } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto w-full flex flex-col gap-8 animate-fade-slide font-sans">
      
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-[#222222] pb-6">
        <div className="flex items-center gap-2 text-[#FF7300] text-xs uppercase tracking-widest font-bold mb-1">
          <span className="w-2 h-2 rounded-full bg-[#FF7300] shadow-[0_0_10px_rgba(255,115,0,0.8)] animate-pulse"></span>
          Dokumentasi Ilmiah & Arsitektur AI
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent tracking-tight">
          Tentang Sistem BlastInsight-XAI
        </h1>
        <p className="text-sm text-gray-400 max-w-3xl leading-relaxed">
          Sistem evaluasi fragmentasi batuan pascapeledakan berbasis Explainable Artificial Intelligence (XAI) yang mengintegrasikan instance segmentation, ekstraksi metrik geometris, dan Decision Support System.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Pilar Teknis (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Card 1: YOLO11-Seg Architecture */}
          <div className="bg-[#111111] rounded-xl border border-[#222222] p-6 flex flex-col gap-4 shadow-lg hover:border-[#FF7300]/40 transition-colors">
            <div className="flex items-center gap-3 text-[#FF7300]">
              <Cpu size={24} />
              <h2 className="text-lg font-bold text-white tracking-wide">Pipeline Instance Segmentation (YOLO11s-Seg)</h2>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Segmentasi fragmen dilakukan menggunakan arsitektur <strong className="text-[#FF7300]">YOLO11s-Seg</strong> pada citra <em>Bucket Excavation Rock</em> dan <em>Open Pits</em>. Model ini telah melalui eksperimen bertahap dan optimasi resolusi input (960 piksel), yang terbukti efektif mengidentifikasi poligon fragmen batuan padat secara individual.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#000000] p-4 rounded-lg border border-[#222222] text-xs mt-2">
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-widest mb-1">mAP50-95 Final</span>
                <span className="text-lg font-bold text-green-500">0.341</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-widest mb-1">Peningkatan Kinerja</span>
                <span className="text-lg font-bold text-[#FF7300]">+216% <span className="text-xs text-gray-400 font-medium">(vs YOLO11n baseline)</span></span>
              </div>
            </div>
          </div>

          {/* Card 2: Explainable AI & EigenCAM */}
          <div className="bg-[#111111] rounded-xl border border-[#222222] p-6 flex flex-col gap-4 shadow-lg hover:border-[#FF7300]/40 transition-colors">
            <div className="flex items-center gap-3 text-[#FF7300]">
              <Eye size={24} />
              <h2 className="text-lg font-bold text-white tracking-wide">Keterjelasan Visual (Eigen-CAM Layer 16)</h2>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Untuk mengatasi sifat <em>black-box</em> pada jaringan saraf konvolusi, sistem menerapkan <strong className="text-[#FF7300]">Eigen-CAM</strong> guna memvisualisasikan fitur yang dipelajari model. Ekstraksi secara spesifik dilakukan pada <strong className="text-white">Layer 16 (P3)</strong>, karena lapisan ini terbukti secara empiris menghasilkan pola aktivasi yang paling presisi, terdistribusi granular, dan terlokalisasi mengikuti kontur batas fragmen individual dibandingkan lapisan SPPF (terlalu kasar) atau <em>neck akhir</em> (kabur).
            </p>
          </div>

          {/* Card 3: Rock Fragmentation Assessment */}
          <div className="bg-[#111111] rounded-xl border border-[#222222] p-6 flex flex-col gap-4 shadow-lg hover:border-[#FF7300]/40 transition-colors">
            <div className="flex items-center gap-3 text-[#FF7300]">
              <Calculator size={24} />
              <h2 className="text-lg font-bold text-white tracking-wide">Decision Support System Berbasis D50</h2>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Poligon hasil segmentasi diekstraksi menjadi distribusi ukuran fragmentasi berdasarkan diameter ekuivalen relatif. Seluruh metrik tersebut diintegrasikan ke dalam <em>dashboard</em> interaktif yang menjadikan nilai sentral <strong className="text-white">D50</strong> sebagai logika penentu klasifikasi. Jika D50 melampaui batas atas, sistem mendeteksi kondisi <strong className="text-[#FF7300]">OVERSIZE</strong>. Sebaliknya, jika berada di bawah batas bawah, kondisi diklasifikasikan sebagai <strong className="text-red-500">OVER-BREAKING</strong>, yang kemudian diterjemahkan menjadi panduan evaluasi desain peledakan operasional.
            </p>
          </div>
        </div>

        {/* Kolom Kanan: Kredit Institusi (1 Col) */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#111111] rounded-xl border border-[#222222] p-6 flex flex-col gap-4 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF7300]/10 blur-[40px] pointer-events-none" />
            <span className="text-[11px] uppercase tracking-widest text-gray-500 font-bold border-b border-[#222222] pb-3 relative z-10">
              <BookOpen size={14} className="inline mr-2 mb-0.5" />
              Kredit Penelitian
            </span>
            
            <div className="relative z-10">
              <div className="text-base font-bold text-[#FF7300] mb-1 leading-tight">
                BlastInsight-XAI: Explainable Artificial Intelligence untuk Evaluasi Otomatis Fragmentasi Batuan pada Pertambangan Terbuka
              </div>
              <div className="text-[11px] text-gray-400 font-medium mt-2">
                DBEST 2026 - Dahana Blasting and Energetics Summit
              </div>
            </div>
            
            <div className="relative z-10 mt-3 pt-3 border-t border-[#222222]">
              <div className="flex items-center gap-2 text-white font-bold text-sm mb-4">
                <Users size={16} className="text-gray-400" /> Tim Kolaborasi Peneliti
              </div>
              
              <div className="space-y-4">
                <div className="border-l-2 border-[#FF7300] pl-3">
                  <span className="text-gray-500 uppercase tracking-wider text-[10px] block mb-1">1st Author / Researcher</span>
                  <strong className="text-white text-sm block">Muhammad Panca Nugraha</strong>
                  <span className="text-gray-400 text-xs">Universitas Ahmad Dahlan</span>
                </div>
                
                <div className="border-l-2 border-[#FF7300] pl-3">
                  <span className="text-gray-500 uppercase tracking-wider text-[10px] block mb-1">2nd Author / Researcher</span>
                  <strong className="text-white text-sm block">Annasya Maulafidatu Zahra</strong>
                  <span className="text-gray-400 text-xs">Telkom University Purwokerto</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#111111] rounded-xl border border-[#FF7300]/30 p-6 flex flex-col gap-3 shadow-[0_0_20px_rgba(255,115,0,0.08)]">
            <span className="text-[11px] uppercase tracking-widest text-[#FF7300] font-bold border-b border-[#FF7300]/20 pb-3 flex items-center gap-2">
              <AlertTriangle size={14} />
              Protokol & Quality Control
            </span>
            <ul className="text-xs text-gray-300 space-y-3 list-none mt-2">
              <li className="flex items-start gap-2">
                <span className="text-[#FF7300] mt-0.5">•</span>
                Ambil foto muckpile dengan sudut elevasi 45° dari crest bench aman.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF7300] mt-0.5">•</span>
                <strong className="text-white">Quality Control (QC):</strong> Sistem secara otomatis mengeksklusi fragmen yang menyentuh batas gambar (edge-touching) dan skor confidence di bawah 0.40 untuk menjaga akurasi distribusi.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};