import React from 'react';
import { BlastRecord } from '../types';

interface DashboardViewProps {
  history: BlastRecord[];
  onSelectBlast: (blast: BlastRecord) => void;
  onGoToAnalysis: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  history,
  onSelectBlast,
  onGoToAnalysis
}) => {
  const totalBlasts = history.length + 18; // plus recorded fleet events
  const avgP50 = (
    history.reduce((acc, b) => acc + b.percentiles.p50, 0) / history.length
  ).toFixed(1);
  const totalBoulders = history.reduce((acc, b) => acc + b.oversizeCount, 0);

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#30353c] pb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[#ffc174] text-[11px] uppercase tracking-widest font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ae176]"></span>
            Monitoring Operasional Penambangan
          </div>
          <h1 className="text-[26px] sm:text-[32px] font-bold text-[#dee3eb] tracking-tight">
            Dashboard Telemetri Peledakan
          </h1>
          <p className="text-[13px] text-[#d8c3ad]">
            Ringkasan metrik fragmentasi batuan, efisiensi penggalian, dan mitigasi
            oversize boulder di seluruh pit aktif.
          </p>
        </div>
        <button
          onClick={onGoToAnalysis}
          className="px-5 py-2.5 rounded-lg bg-[#f59e0b] text-[#0f141a] font-bold text-[13px] hover:brightness-110 flex items-center gap-2 transition-all shadow-md self-start md:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Analisis Peledakan Baru</span>
        </button>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1b2026] rounded-xl border border-[#30353c] p-4 flex flex-col justify-between">
          <span className="text-[11px] uppercase tracking-wider text-[#a08e7a] font-semibold">
            Total Peledakan Teranalisis
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-[32px] font-bold text-[#dee3eb]">{totalBlasts}</span>
            <span className="text-[11px] text-[#4ae176]">Bulan Berjalan</span>
          </div>
          <span className="text-[11px] text-[#a08e7a] mt-1">
            Cakupan: Pit A, Pit B, Pit C
          </span>
        </div>

        <div className="bg-[#1b2026] rounded-xl border border-[#30353c] p-4 flex flex-col justify-between">
          <span className="text-[11px] uppercase tracking-wider text-[#a08e7a] font-semibold">
            Rata-rata Nilai P50
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-[32px] font-bold text-[#ffc174]">{avgP50} cm</span>
            <span className="text-[11px] text-[#dee3eb]">Target: 25-45 cm</span>
          </div>
          <span className="text-[11px] text-[#4ae176] mt-1">
            Dalam rentang batas desain
          </span>
        </div>

        <div className="bg-[#1b2026] rounded-xl border border-[#30353c] p-4 flex flex-col justify-between">
          <span className="text-[11px] uppercase tracking-wider text-[#a08e7a] font-semibold">
            Boulder Terdeteksi
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-[32px] font-bold text-[#ffb4ab]">{totalBoulders}</span>
            <span className="text-[11px] text-[#a08e7a]">partikel &gt;100 cm</span>
          </div>
          <span className="text-[11px] text-[#f59e0b] mt-1">
            Disposisi secondary breaking
          </span>
        </div>

        <div className="bg-[#1b2026] rounded-xl border border-[#30353c] p-4 flex flex-col justify-between">
          <span className="text-[11px] uppercase tracking-wider text-[#a08e7a] font-semibold">
            Kesiapan Primary Crusher
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-[32px] font-bold text-[#4ae176]">98.4%</span>
            <span className="text-[11px] text-[#4ae176]">Uptime Index</span>
          </div>
          <span className="text-[11px] text-[#a08e7a] mt-1">
            Zero bridging incidence (24h)
          </span>
        </div>
      </div>

      {/* Active Pit Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1b2026] border border-[#30353c] rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[#30353c] pb-2">
            <span className="font-semibold text-[14px] text-[#dee3eb]">Pit A (Batugamping)</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#4ae176]/10 text-[#4ae176] border border-[#4ae176]/30">
              Optimal
            </span>
          </div>
          <div className="text-[12px] text-[#d8c3ad] space-y-1">
            <div className="flex justify-between">
              <span className="text-[#a08e7a]">Oversize Rate:</span>
              <span className="font-medium text-[#dee3eb]">8.4%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#a08e7a]">Powder Factor:</span>
              <span className="font-medium text-[#dee3eb]">0.42 kg/m³</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#a08e7a]">Excavator Fleet:</span>
              <span className="font-medium text-[#dee3eb]">CAT 6020B (#EX-01)</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1b2026] border border-[#f59e0b]/40 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[#30353c] pb-2">
            <span className="font-semibold text-[14px] text-[#dee3eb]">Pit B (Andesit Keras)</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40">
              Perlu Evaluasi
            </span>
          </div>
          <div className="text-[12px] text-[#d8c3ad] space-y-1">
            <div className="flex justify-between">
              <span className="text-[#a08e7a]">Oversize Rate:</span>
              <span className="font-medium text-[#f59e0b]">18.7%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#a08e7a]">Powder Factor:</span>
              <span className="font-medium text-[#dee3eb]">0.48 kg/m³</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#a08e7a]">Excavator Fleet:</span>
              <span className="font-medium text-[#dee3eb]">Komatsu PC1250 (#EX-03)</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1b2026] border border-[#30353c] rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[#30353c] pb-2">
            <span className="font-semibold text-[14px] text-[#dee3eb]">Pit C (Diorit Masif)</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/30">
              Kritis
            </span>
          </div>
          <div className="text-[12px] text-[#d8c3ad] space-y-1">
            <div className="flex justify-between">
              <span className="text-[#a08e7a]">Oversize Rate:</span>
              <span className="font-medium text-[#ffb4ab]">28.5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#a08e7a]">Powder Factor:</span>
              <span className="font-medium text-[#dee3eb]">0.38 kg/m³</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#a08e7a]">Excavator Fleet:</span>
              <span className="font-medium text-[#dee3eb]">Hitachi EX1200 (#EX-05)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Blasts Table */}
      <div className="bg-[#1b2026] rounded-xl border border-[#30353c] p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[15px] text-[#dee3eb]">
            Riwayat Peledakan Terbaru
          </span>
          <span className="text-[11px] text-[#a08e7a]">
            Klik baris untuk membuka analisis lengkap
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-[#30353c] text-[#a08e7a] uppercase text-[10px]">
                <th className="py-2.5 px-3">Blast ID</th>
                <th className="py-2.5 px-3">Lokasi Pit</th>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Fragmen</th>
                <th className="py-2.5 px-3">Oversize</th>
                <th className="py-2.5 px-3">P50</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30353c]/60">
              {history.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelectBlast(item)}
                  className="hover:bg-[#252a31] cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3 font-semibold text-[#dee3eb]">
                    {item.blastId}
                  </td>
                  <td className="py-3 px-3 text-[#d8c3ad]">{item.pitBench}</td>
                  <td className="py-3 px-3 text-[#a08e7a]">{item.blastDate}</td>
                  <td className="py-3 px-3 text-[#dee3eb] tabular-nums">
                    {item.detectedFragments} partikel
                  </td>
                  <td className="py-3 px-3 tabular-nums font-semibold">
                    <span
                      className={
                        item.oversizePercentage > 15
                          ? 'text-[#f59e0b]'
                          : 'text-[#4ae176]'
                      }
                    >
                      {item.oversizePercentage}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#dee3eb] tabular-nums">
                    {item.percentiles.p50} cm
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        item.evaluationStatus === 'Optimal'
                          ? 'bg-[#4ae176]/10 text-[#4ae176] border border-[#4ae176]/30'
                          : item.evaluationStatus === 'Perlu Evaluasi'
                          ? 'bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30'
                          : 'bg-[#ffb4ab]/15 text-[#ffb4ab] border border-[#ffb4ab]/30'
                      }`}
                    >
                      {item.evaluationStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button className="text-[#ffc174] hover:underline font-medium text-[11px]">
                      Buka Analisis →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
