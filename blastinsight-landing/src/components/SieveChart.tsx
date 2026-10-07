import React, { useState } from 'react';
import type { BlastRecord } from '../types';

interface SieveChartProps {
  blast: BlastRecord;
}

export const SieveChart: React.FC<SieveChartProps> = ({ blast }) => {
  const [viewMode, setViewMode] = useState<'bars' | 'curve'>('bars');

  const items = [
    { category: 'fine', name: blast.sieve.fine.label, percentage: blast.sieve.fine.percentage, units: blast.sieve.fine.units, color: '#6b7280', badgeClass: 'text-gray-400', bgDot: 'bg-gray-500' },
    { category: 'medium', name: blast.sieve.medium.label, percentage: blast.sieve.medium.percentage, units: blast.sieve.medium.units, color: '#22c55e', badgeClass: 'text-green-500', bgDot: 'bg-green-500' },
    { category: 'coarse', name: blast.sieve.coarse.label, percentage: blast.sieve.coarse.percentage, units: blast.sieve.coarse.units, color: '#FF7300', badgeClass: 'text-[#FF7300]', bgDot: 'bg-[#FF7300]' },
    { category: 'oversize', name: blast.sieve.oversize.label, percentage: blast.sieve.oversize.percentage, units: blast.sieve.oversize.units, color: '#ef4444', badgeClass: 'text-red-500', bgDot: 'bg-red-500' }
  ];

  // ==========================================
  // FUNGSI PEMBUATAN KURVA SVG SECARA DINAMIS
  // ==========================================
  const generateCurvePath = () => {
    // 1. Ambil data kurva aktual dari backend, atau gunakan fallback garis lurus jika kosong
    const curveData = blast.distributionCurve || [
      { diameter_px: 0, cumulative_area_percent: 0 },
      { diameter_px: 150, cumulative_area_percent: 100 }
    ];

    if (curveData.length === 0) return "M 40,120 L 480,10";

    // 2. Tentukan nilai maksimum sumbu X (diameter) agar skala grafik pas
    // Kita asumsikan batas maksimal grafik adalah nilai d80 ditambah margin toleransi (misal 150px)
    // Jika tidak ada data, default max X adalah 150 px.
    const maxDiameter = Math.max(150, blast.percentiles.p80 ? blast.percentiles.p80 * 1.5 : curveData[curveData.length - 1].diameter_px);

    // 3. Konversi setiap titik data (diameter_px, persentase) ke koordinat SVG (X, Y)
    // Area SVG: X(40 -> 480), Y(120 -> 10)
    // Sumbu X: Lebar total 440px (480 - 40)
    // Sumbu Y: Tinggi total 110px (120 - 10)
    const points = curveData.map(point => {
      // Normalisasi nilai diameter ke skala X grafik
      const normalizedX = Math.min(Math.max(point.diameter_px / maxDiameter, 0), 1);
      const x = 40 + (normalizedX * 440);
      
      // Persentase (0-100) diubah ke koordinat Y terbalik (karena Y 0 ada di atas SVG)
      const y = 120 - ((point.cumulative_area_percent / 100) * 110);
      return `${x},${y}`;
    });

    // 4. Rangkai titik-titik tersebut menjadi perintah path SVG ("M x1,y1 L x2,y2 L x3,y3 ...")
    return `M ${points.join(' L ')}`;
  };

  // Kalkulasi posisi titik P50 dan P80 pada grafik SVG
  const maxScaleDiameter = Math.max(150, blast.percentiles.p80 ? blast.percentiles.p80 * 1.5 : 150);
  const p50_x = blast.percentiles.p50 ? 40 + (Math.min(blast.percentiles.p50 / maxScaleDiameter, 1) * 440) : 0;
  const p80_x = blast.percentiles.p80 ? 40 + (Math.min(blast.percentiles.p80 / maxScaleDiameter, 1) * 440) : 0;

  return (
    <div className="bg-[#000000] rounded-xl border border-[#222222] p-5 sm:p-6 flex flex-col gap-5 shadow-[0_0_20px_rgba(255,115,0,0.03)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col">
          <div className="text-base sm:text-lg font-bold text-white tracking-wide">Distribusi Fragmentasi Batuan</div>
          <div className="text-xs text-gray-500 font-medium">Analisis Kumulatif Luas Proyeksi (Projected Area)</div>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center p-1 rounded-lg bg-[#111111] border border-[#222222] text-[11px] font-bold">
            <button onClick={() => setViewMode('bars')} className={`px-3 py-1.5 rounded transition-all ${viewMode === 'bars' ? 'bg-black text-[#FF7300] border border-[#FF7300]/30 shadow-[0_0_10px_rgba(255,115,0,0.1)]' : 'text-gray-500 hover:text-white border border-transparent'}`}>Fraksi</button>
            <button onClick={() => setViewMode('curve')} className={`px-3 py-1.5 rounded transition-all ${viewMode === 'curve' ? 'bg-black text-[#FF7300] border border-[#FF7300]/30 shadow-[0_0_10px_rgba(255,115,0,0.1)]' : 'text-gray-500 hover:text-white border border-transparent'}`}>Kurva S</button>
          </div>
          {/* PERUBAHAN: Satuan cm ke px */}
          <span className="text-white text-xs bg-[#111111] px-3 py-1.5 rounded-lg border border-[#222222] font-bold shadow-sm">P50 = <span className="text-[#FF7300]">{blast.percentiles.p50?.toFixed(1) || '0'} px</span></span>
        </div>
      </div>

      {viewMode === 'bars' ? (
        <div className="flex flex-col gap-3.5 pt-2">
          {items.map((item) => (
            <div key={item.category} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className={`flex items-center gap-2 font-bold ${item.badgeClass}`}>
                  <span className={`w-2 h-2 rounded-full ${item.bgDot}`}></span>
                  <span>{item.name}</span>
                </span>
                <span className="text-white font-bold tabular-nums bg-[#111111] px-2 py-0.5 rounded border border-[#222222]">
                  {item.percentage.toFixed(1).replace('.', ',')}% <span className="text-gray-500 text-[10px]">({item.units} partikel)</span>
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#111111] overflow-hidden flex border border-[#222222]">
                <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${Math.min(item.percentage, 100)}%`, backgroundColor: item.color }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#111111] p-4 rounded-xl border border-[#222222] flex flex-col gap-3">
          <div className="flex justify-between text-[11px] text-gray-400 font-bold uppercase tracking-wider">
            <span>Kurva Distribusi Kumulatif</span>
            <span className="text-green-500">Berdasarkan Ekstraksi Area YOLO11s-Seg</span>
          </div>
          <div className="w-full h-40 relative flex items-center justify-center">
            <svg viewBox="0 0 500 140" className="w-full h-full overflow-visible">
              <line x1="40" y1="10" x2="480" y2="10" stroke="#222222" strokeDasharray="3,3" />
              <line x1="40" y1="40" x2="480" y2="40" stroke="#222222" strokeDasharray="3,3" />
              <line x1="40" y1="70" x2="480" y2="70" stroke="#222222" strokeDasharray="3,3" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#222222" strokeDasharray="3,3" />
              <line x1="40" y1="120" x2="480" y2="120" stroke="#444444" strokeWidth="1.5" />
              <line x1="40" y1="10" x2="40" y2="120" stroke="#444444" strokeWidth="1.5" />
              
              <text x="10" y="15" fill="#6b7280" fontSize="9" fontWeight="bold">100%</text>
              <text x="15" y="45" fill="#6b7280" fontSize="9" fontWeight="bold">80%</text>
              <text x="15" y="75" fill="#6b7280" fontSize="9" fontWeight="bold">50%</text>
              <text x="15" y="105" fill="#6b7280" fontSize="9" fontWeight="bold">20%</text>
              
              <text x="40" y="135" fill="#6b7280" fontSize="9" fontWeight="bold">0</text>
              
              {/* Teks Sumbu X Dinamis (dalam PX) */}
              <text x="130" y="135" fill="#6b7280" fontSize="9" fontWeight="bold">{(maxScaleDiameter * 0.2).toFixed(0)} px</text>
              <text x="230" y="135" fill="#6b7280" fontSize="9" fontWeight="bold">{(maxScaleDiameter * 0.43).toFixed(0)} px</text>
              <text x="340" y="135" fill="#6b7280" fontSize="9" fontWeight="bold">{(maxScaleDiameter * 0.68).toFixed(0)} px</text>
              <text x="440" y="135" fill="#6b7280" fontSize="9" fontWeight="bold">{(maxScaleDiameter * 0.9).toFixed(0)} px</text>
              
              {/* Actual Curve yang Di-generate Secara Matematis */}
              <path d={generateCurvePath()} fill="none" stroke="#FF7300" strokeWidth="2.5" />
              
              {/* P50 Marker Dinamis */}
              {blast.percentiles.p50 && p50_x > 0 && (
                <g>
                  <circle cx={p50_x} cy="65" r="5" fill="#000000" stroke="#FF7300" strokeWidth="2.5" />
                  <text x={p50_x + 10} y="61" fill="#FF7300" fontSize="10" fontWeight="bold">D50={blast.percentiles.p50.toFixed(1)}px</text>
                </g>
              )}
              
              {/* P80 Marker Dinamis */}
              {blast.percentiles.p80 && p80_x > 0 && (
                <g>
                  <circle cx={p80_x} cy="32" r="5" fill="#000000" stroke="#ef4444" strokeWidth="2.5" />
                  <text x={p80_x + 10} y="30" fill="#ef4444" fontSize="10" fontWeight="bold">D80={blast.percentiles.p80.toFixed(1)}px</text>
                </g>
              )}
            </svg>
          </div>
        </div>
      )}

      {/* PERUBAHAN SATUAN: cm menjadi px di Panel Bawah */}
      <div className="p-3 rounded-lg bg-[#111111] border border-[#222222] flex flex-wrap items-center justify-between text-gray-400 text-xs gap-3">
        <span>D10 (Fines): <strong className="text-white bg-[#000000] px-2 py-0.5 rounded border border-[#222222]">{blast.percentiles.p10?.toFixed(2) || '-'} px</strong></span>
        <span className="text-[#333333] hidden sm:inline">|</span>
        <span>D50 (Sentral): <strong className="text-[#FF7300] bg-[#FF7300]/10 px-2 py-0.5 rounded border border-[#FF7300]/20">{blast.percentiles.p50?.toFixed(2) || '-'} px</strong></span>
        <span className="text-[#333333] hidden sm:inline">|</span>
        <span>D80 (Coarse): <strong className="text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">{blast.percentiles.p80?.toFixed(2) || '-'} px</strong></span>
        <span className="text-[#333333] hidden sm:inline">|</span>
        <span>Uniformity Index: <strong className="text-white">{blast.percentiles.kuzRamIndex?.toFixed(2) || '-'}</strong></span>
      </div>
    </div>
  );
};