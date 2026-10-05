import React from 'react';
import { BlastRecord } from '../types';
import { LOGO_URL } from './Sidebar';

interface PdfReportModalProps {
  blast: BlastRecord;
  isOpen: boolean;
  onClose: () => void;
}

export const PdfReportModal: React.FC<PdfReportModalProps> = ({
  blast,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#171c22] border border-[#30353c] rounded-xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#1b2026] border-b border-[#30353c] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ffc174] text-[22px]">
              picture_as_pdf
            </span>
            <span className="text-[16px] font-semibold text-[#dee3eb]">
              Pratinjau Laporan Resmi Analisis Peledakan
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#a08e7a] hover:text-[#dee3eb] hover:bg-[#252a31]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Printable Report Document Body */}
        <div
          id="printable-report"
          className="p-6 overflow-y-auto flex flex-col gap-6 text-[#dee3eb] bg-[#0f141a]"
        >
          {/* Document Header */}
          <div className="flex items-start justify-between border-b border-[#30353c] pb-4">
            <div className="flex items-center gap-3">
              <img
                src={LOGO_URL}
                alt="BlastInsight Logo"
                className="h-10 w-auto object-contain"
              />
              <div className="flex flex-col">
                <span className="font-bold text-[16px] text-[#dee3eb] tracking-wide">
                  BLASTINSIGHT-XAI • DSS REPORT
                </span>
                <span className="text-[11px] text-[#a08e7a]">
                  Telkom University Purwokerto — DBEST 2026 Mining AI Research
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-[#a08e7a] block">
                Nomor Dokumen
              </span>
              <span className="font-mono text-[13px] font-bold text-[#ffc174]">
                RPT-{blast.blastId}
              </span>
            </div>
          </div>

          {/* Blast Metadata Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#1b2026] p-4 rounded-lg border border-[#30353c] text-[12px]">
            <div>
              <span className="text-[#a08e7a] block text-[10px] uppercase">
                Blast ID
              </span>
              <span className="font-semibold text-[#dee3eb]">{blast.blastId}</span>
            </div>
            <div>
              <span className="text-[#a08e7a] block text-[10px] uppercase">
                Pit &amp; Bench
              </span>
              <span className="font-semibold text-[#dee3eb]">{blast.pitBench}</span>
            </div>
            <div>
              <span className="text-[#a08e7a] block text-[10px] uppercase">
                Tanggal Ledak
              </span>
              <span className="font-semibold text-[#dee3eb]">{blast.blastDate}</span>
            </div>
            <div>
              <span className="text-[#a08e7a] block text-[10px] uppercase">
                Formasi Geologi
              </span>
              <span className="font-semibold text-[#dee3eb]">
                {blast.geologyFormation}
              </span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-[#1b2026] border border-[#30353c]">
              <span className="text-[10px] text-[#a08e7a] uppercase block">
                Total Fragmen
              </span>
              <span className="text-[20px] font-bold text-[#dee3eb]">
                {blast.detectedFragments}
              </span>
              <span className="text-[10px] text-[#4ae176] block">
                YOLO11-Seg Verified
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#1b2026] border border-[#f59e0b]/40">
              <span className="text-[10px] text-[#a08e7a] uppercase block">
                Oversize (&gt;100 cm)
              </span>
              <span className="text-[20px] font-bold text-[#f59e0b]">
                {blast.oversizePercentage}%
              </span>
              <span className="text-[10px] text-[#f59e0b] block">
                {blast.oversizeCount} boulders
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#1b2026] border border-[#30353c]">
              <span className="text-[10px] text-[#a08e7a] uppercase block">
                Nilai P50
              </span>
              <span className="text-[20px] font-bold text-[#dee3eb]">
                {blast.percentiles.p50} cm
              </span>
              <span className="text-[10px] text-[#a08e7a] block">
                P80: {blast.percentiles.p80} cm
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#1b2026] border border-[#30353c]">
              <span className="text-[10px] text-[#a08e7a] uppercase block">
                Kuz-Ram Uniformity
              </span>
              <span className="text-[20px] font-bold text-[#dee3eb]">
                {blast.percentiles.kuzRamIndex.toFixed(2)}
              </span>
              <span className="text-[10px] text-[#a08e7a] block">
                Status: {blast.evaluationStatus}
              </span>
            </div>
          </div>

          {/* Sieve Breakdown Table */}
          <div className="bg-[#1b2026] rounded-lg border border-[#30353c] p-4 flex flex-col gap-3">
            <span className="text-[13px] font-semibold text-[#dee3eb]">
              Distribusi Saringan Fragmentasi Kumulatif
            </span>
            <div className="grid grid-cols-4 gap-2 text-[11px] text-center">
              <div className="p-2 rounded bg-[#0f141a] border border-[#30353c]">
                <span className="text-[#a08e7a] block">Fine (&lt;20cm)</span>
                <span className="font-bold text-[#dee3eb]">
                  {blast.sieve.fine.percentage}%
                </span>
              </div>
              <div className="p-2 rounded bg-[#0f141a] border border-[#30353c]">
                <span className="text-[#4ae176] block">Medium (20-50cm)</span>
                <span className="font-bold text-[#4ae176]">
                  {blast.sieve.medium.percentage}%
                </span>
              </div>
              <div className="p-2 rounded bg-[#0f141a] border border-[#30353c]">
                <span className="text-[#f59e0b] block">Coarse (50-100cm)</span>
                <span className="font-bold text-[#f59e0b]">
                  {blast.sieve.coarse.percentage}%
                </span>
              </div>
              <div className="p-2 rounded bg-[#0f141a] border border-[#ffb4ab]">
                <span className="text-[#ffb4ab] block">Oversize (&gt;100cm)</span>
                <span className="font-bold text-[#ffb4ab]">
                  {blast.sieve.oversize.percentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Geotechnical & Blasting Recommendations */}
          <div className="flex flex-col gap-2 bg-[#1b2026] rounded-lg border border-[#30353c] p-4 text-[12px]">
            <span className="font-semibold text-[#ffc174] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">engineering</span>
              Rekomendasi Operasional &amp; XAI Decision Support
            </span>
            <p className="text-[#d8c3ad] italic bg-[#0f141a] p-3 rounded border border-[#30353c]">
              {blast.recommendationQuote}
            </p>
            <ul className="list-disc pl-5 text-[#d8c3ad] flex flex-col gap-1 mt-1">
              {blast.actionPoints.map((pt, i) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
          </div>

          <div className="text-[10px] text-[#a08e7a] flex justify-between border-t border-[#30353c] pt-3">
            <span>Dihasilkan oleh model AI YOLO11-Seg-Mining-v1 &amp; EigenCAM</span>
            <span>Tanda Tangan Blasting Engineer: _____________________</span>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3 bg-[#1b2026] border-t border-[#30353c] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#252a31] text-[#dee3eb] text-[13px] hover:bg-[#30353c] transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-lg bg-[#f59e0b] text-[#0f141a] font-semibold text-[13px] hover:brightness-110 flex items-center gap-1.5 transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
