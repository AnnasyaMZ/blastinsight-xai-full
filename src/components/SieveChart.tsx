import React, { useState } from 'react';
import { BlastRecord } from '../types';

interface SieveChartProps {
  blast: BlastRecord;
}

export const SieveChart: React.FC<SieveChartProps> = ({ blast }) => {
  const [viewMode, setViewMode] = useState<'bars' | 'curve'>('bars');

  const items = [
    {
      category: 'fine',
      name: blast.sieve.fine.label,
      percentage: blast.sieve.fine.percentage,
      units: blast.sieve.fine.units,
      color: '#a08e7a',
      badgeClass: 'text-[#a08e7a]',
      bgDot: 'bg-[#a08e7a]'
    },
    {
      category: 'medium',
      name: blast.sieve.medium.label,
      percentage: blast.sieve.medium.percentage,
      units: blast.sieve.medium.units,
      color: '#4ae176',
      badgeClass: 'text-[#4ae176]',
      bgDot: 'bg-[#4ae176]'
    },
    {
      category: 'coarse',
      name: blast.sieve.coarse.label,
      percentage: blast.sieve.coarse.percentage,
      units: blast.sieve.coarse.units,
      color: '#f59e0b',
      badgeClass: 'text-[#dee3eb]',
      bgDot: 'bg-[#f59e0b]'
    },
    {
      category: 'oversize',
      name: blast.sieve.oversize.label,
      percentage: blast.sieve.oversize.percentage,
      units: blast.sieve.oversize.units,
      color: '#ffb4ab',
      badgeClass: 'text-[#ffb4ab]',
      bgDot: 'bg-[#ffb4ab]'
    }
  ];

  return (
    <div
      id="sieve-analysis-card"
      className="bg-[#1b2026] rounded-xl border border-[#30353c] p-4 sm:p-6 flex flex-col gap-4 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex flex-col">
          <div className="text-[16px] sm:text-[18px] font-semibold text-[#dee3eb]">
            Distribusi Ukuran Fragmentasi Batuan
          </div>
          <div className="text-[12px] text-[#a08e7a]">
            Analisis kurva saringan kumulatif saring partikel (Sieve Analysis)
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-[#0f141a] border border-[#30353c] text-[11px]">
            <button
              onClick={() => setViewMode('bars')}
              className={`px-2 py-0.5 rounded ${
                viewMode === 'bars'
                  ? 'bg-[#1b2026] text-[#dee3eb] font-medium'
                  : 'text-[#a08e7a] hover:text-[#dee3eb]'
              }`}
            >
              Fraksi
            </button>
            <button
              onClick={() => setViewMode('curve')}
              className={`px-2 py-0.5 rounded ${
                viewMode === 'curve'
                  ? 'bg-[#1b2026] text-[#dee3eb] font-medium'
                  : 'text-[#a08e7a] hover:text-[#dee3eb]'
              }`}
            >
              Kurva S
            </button>
          </div>

          <span className="text-[#a08e7a] text-[11px] bg-[#0f141a] px-2.5 py-1 rounded border border-[#30353c] font-medium whitespace-nowrap">
            P50 = {blast.percentiles.p50} cm
          </span>
        </div>
      </div>

      {viewMode === 'bars' ? (
        /* Progress Bar Breakdown */
        <div className="flex flex-col gap-3 pt-1">
          {items.map((item) => (
            <div key={item.category} className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[12px]">
                <span className={`flex items-center gap-1.5 font-medium ${item.badgeClass}`}>
                  <span className={`w-2.5 h-2.5 rounded-xs ${item.bgDot}`}></span>
                  <span>{item.name}</span>
                </span>
                <span className="text-[#dee3eb] font-semibold tabular-nums">
                  {item.percentage.toFixed(1).replace('.', ',')}% ({item.units} unit)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#0a0f14] overflow-hidden flex">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${Math.min(item.percentage, 100)}%`,
                    backgroundColor: item.color
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Cumulative Kuz-Ram S-Curve Graph */
        <div className="bg-[#0f141a] p-3 rounded-lg border border-[#30353c] flex flex-col gap-2">
          <div className="flex justify-between text-[11px] text-[#a08e7a]">
            <span>Kurva Kumulatif Lolos Saringan (Rosin-Rammler / Kuz-Ram)</span>
            <span className="text-[#ffc174]">Target P80 &lt; 80 cm</span>
          </div>
          <div className="w-full h-36 relative">
            <svg viewBox="0 0 500 140" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="40" y1="10" x2="480" y2="10" stroke="#30353c" strokeDasharray="3,3" />
              <line x1="40" y1="40" x2="480" y2="40" stroke="#30353c" strokeDasharray="3,3" />
              <line x1="40" y1="70" x2="480" y2="70" stroke="#30353c" strokeDasharray="3,3" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#30353c" strokeDasharray="3,3" />
              <line x1="40" y1="120" x2="480" y2="120" stroke="#534434" />
              <line x1="40" y1="10" x2="40" y2="120" stroke="#534434" />

              {/* Y Axis Labels */}
              <text x="10" y="15" fill="#a08e7a" fontSize="9">100%</text>
              <text x="15" y="45" fill="#a08e7a" fontSize="9">80%</text>
              <text x="15" y="75" fill="#a08e7a" fontSize="9">50%</text>
              <text x="15" y="105" fill="#a08e7a" fontSize="9">20%</text>

              {/* X Axis Labels */}
              <text x="40" y="135" fill="#a08e7a" fontSize="9">0</text>
              <text x="130" y="135" fill="#a08e7a" fontSize="9">25 cm</text>
              <text x="230" y="135" fill="#a08e7a" fontSize="9">50 cm</text>
              <text x="340" y="135" fill="#a08e7a" fontSize="9">100 cm</text>
              <text x="440" y="135" fill="#a08e7a" fontSize="9">150 cm</text>

              {/* Target Curve Ideal (Dashed Green) */}
              <path
                d="M 40,120 C 120,115 170,85 240,55 C 310,25 380,12 480,10"
                fill="none"
                stroke="#4ae176"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />

              {/* Actual Computed Curve (Solid Amber) */}
              <path
                d="M 40,120 C 130,116 190,92 260,70 C 330,45 390,26 480,12"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
              />

              {/* P50 Marker Point */}
              <circle cx="215" cy="70" r="4" fill="#f59e0b" stroke="#0f141a" strokeWidth="1.5" />
              <text x="222" y="66" fill="#ffc174" fontSize="9" fontWeight="600">
                P50={blast.percentiles.p50}cm
              </text>

              {/* P80 Marker Point */}
              <circle cx="340" cy="40" r="4" fill="#ffb4ab" stroke="#0f141a" strokeWidth="1.5" />
              <text x="346" y="38" fill="#ffb4ab" fontSize="9" fontWeight="600">
                P80={blast.percentiles.p80}cm
              </text>
            </svg>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#a08e7a] pt-1">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-[#f59e0b]"></span>
              Kurva Aktual Peledakan
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-[#4ae176] border-b border-dashed border-[#4ae176]"></span>
              Spesifikasi Desain Optimum
            </span>
          </div>
        </div>
      )}

      {/* Percentiles & Kuz-Ram Bar */}
      <div className="p-2.5 rounded-lg bg-[#0f141a] border border-[#30353c] flex flex-wrap items-center justify-between text-[#a08e7a] text-[11px] sm:text-[12px] gap-2">
        <span>
          P20: <strong className="text-[#dee3eb]">{blast.percentiles.p20} cm</strong>
        </span>
        <span className="text-[#30353c] hidden sm:inline">|</span>
        <span>
          P50: <strong className="text-[#dee3eb]">{blast.percentiles.p50} cm</strong>
        </span>
        <span className="text-[#30353c] hidden sm:inline">|</span>
        <span>
          P80: <strong className="text-[#dee3eb]">{blast.percentiles.p80} cm</strong>
        </span>
        <span className="text-[#30353c] hidden sm:inline">|</span>
        <span>
          Kuz-Ram Uniformity Index:{' '}
          <strong className="text-[#dee3eb]">
            {blast.percentiles.kuzRamIndex.toFixed(2)}
          </strong>
        </span>
      </div>
    </div>
  );
};
