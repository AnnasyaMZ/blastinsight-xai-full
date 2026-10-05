import React, { useState } from 'react';
import { BlastRecord } from '../types';

interface HistoryViewProps {
  history: BlastRecord[];
  onSelectBlast: (blast: BlastRecord) => void;
  onGoToAnalysis: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSelectBlast,
  onGoToAnalysis
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Optimal' | 'Perlu Evaluasi' | 'Kritis'>('Semua');

  const filteredHistory = history.filter((b) => {
    const matchesSearch =
      b.blastId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.pitBench.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.geologyFormation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'Semua' || b.evaluationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#30353c] pb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[#ffc174] text-[11px] uppercase tracking-widest font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>
            Arsip Data Penambangan
          </div>
          <h1 className="text-[26px] sm:text-[32px] font-bold text-[#dee3eb] tracking-tight">
            Riwayat Analisis Peledakan
          </h1>
          <p className="text-[13px] text-[#d8c3ad]">
            Daftar lengkap dokumentasi citra muckpile, hasil segmentasi AI, dan evaluasi
            geoteknik yang tersimpan.
          </p>
        </div>
        <button
          onClick={onGoToAnalysis}
          className="px-5 py-2.5 rounded-lg bg-[#f59e0b] text-[#0f141a] font-bold text-[13px] hover:brightness-110 flex items-center gap-2 transition-all shadow-md self-start md:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Analisis Baru</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-[#1b2026] p-4 rounded-xl border border-[#30353c] flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Cari Blast ID, Pit, atau Formasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0f141a] text-[#dee3eb] text-[13px] pl-9 pr-4 py-2 rounded-lg border border-[#30353c] focus:outline-none focus:border-[#f59e0b]"
          />
          <span className="absolute left-3 top-2.5 text-[#a08e7a] material-symbols-outlined text-[18px]">
            search
          </span>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto text-[11px]">
          <span className="text-[#a08e7a] mr-1 hidden md:inline">Filter Status:</span>
          {(['Semua', 'Optimal', 'Perlu Evaluasi', 'Kritis'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                statusFilter === status
                  ? 'bg-[#252a31] border-[#f59e0b] text-[#ffc174] font-semibold'
                  : 'bg-[#0f141a] border-[#30353c] text-[#a08e7a] hover:text-[#dee3eb]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* History Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHistory.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectBlast(item)}
            className="bg-[#1b2026] border border-[#30353c] hover:border-[#f59e0b]/60 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg flex flex-col group"
          >
            {/* Image Preview thumbnail */}
            <div className="relative h-44 w-full bg-[#0f141a] overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.fileName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 left-2 bg-[#0f141a]/85 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-semibold text-[#dee3eb] border border-[#30353c]">
                {item.blastId}
              </div>
              <div className="absolute top-2 right-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    item.evaluationStatus === 'Optimal'
                      ? 'bg-[#4ae176]/90 text-[#0f141a]'
                      : item.evaluationStatus === 'Perlu Evaluasi'
                      ? 'bg-[#f59e0b]/90 text-[#0f141a]'
                      : 'bg-[#ffb4ab]/90 text-[#0f141a]'
                  }`}
                >
                  {item.evaluationStatus}
                </span>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-4 flex flex-col gap-3 flex-1 justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] text-[#a08e7a]">
                  <span>{item.pitBench}</span>
                  <span>{item.blastDate}</span>
                </div>
                <div className="text-[13px] font-semibold text-[#dee3eb] mt-1">
                  {item.geologyFormation}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#30353c] text-center text-[11px]">
                <div>
                  <span className="text-[#a08e7a] block text-[10px]">Fragmen</span>
                  <span className="font-bold text-[#dee3eb]">
                    {item.detectedFragments}
                  </span>
                </div>
                <div>
                  <span className="text-[#a08e7a] block text-[10px]">Oversize</span>
                  <span
                    className={`font-bold ${
                      item.oversizePercentage > 15
                        ? 'text-[#f59e0b]'
                        : 'text-[#4ae176]'
                    }`}
                  >
                    {item.oversizePercentage}%
                  </span>
                </div>
                <div>
                  <span className="text-[#a08e7a] block text-[10px]">P50</span>
                  <span className="font-bold text-[#dee3eb]">
                    {item.percentiles.p50} cm
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#ffc174] font-medium pt-1">
                <span>Inspeksi Detail Fragmentasi</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
