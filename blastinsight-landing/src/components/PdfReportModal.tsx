import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { BlastRecord } from '../types';
import { LOGO_URL } from './Sidebar';
import {
  FileText,
  X,
  Printer,
  CalendarDays,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Cpu
} from 'lucide-react';

interface PdfReportModalProps {
  blast?: BlastRecord;
  blasts?: BlastRecord[];
  periodLabel?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PdfReportModal: React.FC<PdfReportModalProps> = ({
  blast,
  blasts,
  periodLabel = 'Laporan Analisis',
  isOpen,
  onClose
}) => {
  const pageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentScale, setContentScale] = useState(1);

  const records = useMemo(() => {
    if (blasts && blasts.length > 0) return blasts;
    if (blast) return [blast];
    return [];
  }, [blasts, blast]);

  const isSingleAnalysis = records.length === 1;
  const singleRecord = isSingleAnalysis ? records[0] : undefined;

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const fitContentToA4 = () => {
      const page = pageRef.current;
      const content = contentRef.current;
      if (!page || !content) return;

      setContentScale(1);

      requestAnimationFrame(() => {
        // Sisakan ruang untuk footer agar tidak tertimpa konten.
        const availableHeight = page.clientHeight - 78;
        const contentHeight = content.scrollHeight;

        if (contentHeight > availableHeight) {
          const scale = Math.max(
            0.72,
            Math.min(1, availableHeight / contentHeight)
          );
          setContentScale(scale);
        } else {
          setContentScale(1);
        }
      });
    };

    const timer = window.setTimeout(fitContentToA4, 150);
    window.addEventListener('resize', fitContentToA4);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', fitContentToA4);
    };
  }, [isOpen, records.length]);

  const formatDate = (value: string) => {
    if (!value) return '—';

    return new Date(value).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getPercentiles = (item: BlastRecord) => {
    const percentiles = item.percentiles as unknown as {
      p10?: number;
      p50?: number;
      p80?: number;
    };

    return {
      p10: Number(percentiles?.p10 ?? 0),
      p50: Number(percentiles?.p50 ?? 0),
      p80: Number(percentiles?.p80 ?? 0)
    };
  };

  const totalAnalyses = records.length;

  const totalFragments = records.reduce(
    (total, item) => total + Number(item.detectedFragments || 0),
    0
  );

  const validD50 = records
    .map((item) => getPercentiles(item).p50)
    .filter((value) => Number.isFinite(value) && value > 0);

  const averageD50 =
    validD50.length > 0
      ? validD50.reduce((total, value) => total + value, 0) / validD50.length
      : 0;

  const optimalCount = records.filter(
    (item) => item.evaluationStatus?.toUpperCase() === 'OPTIMAL'
  ).length;

  const evaluationCount = records.filter((item) => {
    const status = item.evaluationStatus?.toUpperCase() || '';

    return (
      status === 'OVERSIZE' ||
      status === 'OVER-BREAKING' ||
      status === 'PERLU EVALUASI' ||
      status === 'KRITIS'
    );
  }).length;

  const getStatusClass = (status?: string) => {
    const normalized = status?.toUpperCase() || '';

    if (normalized === 'OPTIMAL') {
      return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    }

    if (normalized === 'OVERSIZE') {
      return 'text-[#C95700] bg-orange-50 border-orange-200';
    }

    if (normalized === 'OVER-BREAKING') {
      return 'text-red-700 bg-red-50 border-red-200';
    }

    return 'text-amber-700 bg-amber-50 border-amber-200';
  };

  const handlePrint = () => {
    const previousTitle = document.title;
    const safePeriod = periodLabel
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '');

    document.title = `BlastInsight-XAI_Report_${safePeriod}`;
    window.print();

    window.setTimeout(() => {
      document.title = previousTitle;
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <>
      <style>
        {`
          @page {
            size: A4 portrait;
            margin: 0;
          }

          @media print {
            html,
            body {
              width: 210mm !important;
              height: 297mm !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              overflow: hidden !important;
            }

            body * {
              visibility: hidden !important;
            }

            #blast-pdf-overlay,
            #blast-pdf-overlay * {
              visibility: visible !important;
            }

            #blast-pdf-overlay {
              position: fixed !important;
              inset: 0 !important;
              width: 210mm !important;
              height: 297mm !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              overflow: hidden !important;
              display: block !important;
            }

            #blast-pdf-report {
              width: 210mm !important;
              height: 297mm !important;
              min-height: 297mm !important;
              max-width: none !important;
              margin: 0 !important;
              padding: 0 !important;
              border: 0 !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              background: #ffffff !important;
              overflow: hidden !important;
            }

            .report-scroll {
              width: 210mm !important;
              height: 297mm !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
              background: #ffffff !important;
            }

            .report-paper {
              width: 210mm !important;
              height: 297mm !important;
              min-height: 297mm !important;
              max-width: none !important;
              margin: 0 !important;
              padding: 10mm 11mm 8mm !important;
              box-sizing: border-box !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              overflow: hidden !important;
              break-after: avoid-page !important;
              break-before: avoid-page !important;
              page-break-after: avoid !important;
              page-break-before: avoid !important;
            }

            .report-fit-content {
              transform-origin: top center !important;
            }

            .no-print {
              display: none !important;
            }

            * {
              print-color-adjust: exact !important;
              -webkit-print-color-adjust: exact !important;
            }
          }

          @media screen {
            .report-paper {
              width: 210mm;
              height: 297mm;
              min-height: 297mm;
              box-sizing: border-box;
            }
          }
        `}
      </style>

      <div
        id="blast-pdf-overlay"
        className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-md overflow-y-auto p-3 sm:p-6"
        onClick={onClose}
      >
        <div
          id="blast-pdf-report"
          className="max-w-[900px] mx-auto bg-[#0A0A0A] border border-[#222222] rounded-xl shadow-[0_0_50px_rgba(255,115,0,0.15)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="no-print px-6 py-3 bg-[#111111] border-b border-[#222222] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="text-[#FF7300]" size={18} />
              <div>
                <div className="text-sm font-bold text-white">
                  Pratinjau Laporan A4
                </div>
                <div className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">
                  {periodLabel} • 1 halaman
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="report-scroll bg-[#050505] p-3 sm:p-5 overflow-auto">
            <div
              ref={pageRef}
              className="report-paper relative bg-white text-[#111111] mx-auto px-[11mm] pt-[10mm] pb-[8mm] shadow-2xl overflow-hidden"
            >
              <div
                ref={contentRef}
                className="report-fit-content"
                style={{
                  transform: `scale(${contentScale})`,
                  transformOrigin: 'top center'
                }}
              >
                {/* HEADER */}
                <header className="flex justify-between items-start gap-8 pb-3 border-b-[2.5px] border-[#FF7300]">
                  <div className="min-w-0">
                    <img
                      src={LOGO_URL}
                      alt="BlastInsight-XAI"
                      className="h-8 w-auto object-contain mb-2"
                    />
                    <h1 className="text-[22px] leading-none font-extrabold tracking-tight">
                      Laporan Analisis Fragmentasi
                    </h1>
                    <p className="text-[9px] text-gray-500 mt-1">
                      BlastInsight-XAI — Explainable AI Decision Support System
                    </p>
                  </div>

                  <div className="text-right text-[9px] shrink-0">
                    <div className="text-gray-400 uppercase font-bold text-[7px] tracking-widest">
                      Periode Laporan
                    </div>
                    <div className="font-bold text-[10px] mt-0.5">{periodLabel}</div>
                    <div className="text-gray-400 text-[8px] mt-1">
                      DBEST 2026 • 2in1 Team
                    </div>
                  </div>
                </header>

                {/* DISCLAIMER */}
                <div className="mt-3 px-3 py-2 bg-[#FFF7ED] border-l-[3px] border-[#FF7300] rounded-r-md text-[8px] leading-[1.35] text-[#555555]">
                  <strong>Catatan Penelitian:</strong> BlastInsight-XAI merupakan
                  research prototype decision support. Ukuran fragmentasi dinyatakan
                  sebagai relative equivalent diameter dalam pixel. Keputusan akhir
                  tetap berada pada blasting engineer.
                </div>

                {/* KPI */}
                <section className="mt-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <CalendarDays size={13} className="text-[#FF7300]" />
                    <h2 className="text-[10px] font-extrabold uppercase tracking-[0.08em]">
                      Ringkasan Analisis
                    </h2>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div className="border border-gray-200 rounded-md px-2.5 py-2">
                      <span className="block text-[6.5px] uppercase font-bold text-gray-400 tracking-wide">
                        Total Analisis
                      </span>
                      <strong className="text-[17px] leading-tight">{totalAnalyses}</strong>
                    </div>

                    <div className="border border-gray-200 rounded-md px-2.5 py-2">
                      <span className="block text-[6.5px] uppercase font-bold text-gray-400 tracking-wide">
                        Fragmen Valid
                      </span>
                      <strong className="text-[17px] leading-tight">{totalFragments}</strong>
                    </div>

                    <div className="border border-gray-200 rounded-md px-2.5 py-2">
                      <span className="block text-[6.5px] uppercase font-bold text-gray-400 tracking-wide">
                        Rata-rata D50
                      </span>
                      <strong className="text-[17px] leading-tight text-[#E66800]">
                        {averageD50.toFixed(2)} px
                      </strong>
                    </div>

                    <div className="border border-gray-200 rounded-md px-2.5 py-2">
                      <span className="block text-[6.5px] uppercase font-bold text-gray-400 tracking-wide">
                        Perlu Evaluasi
                      </span>
                      <strong className="text-[17px] leading-tight">
                        {evaluationCount}
                      </strong>
                    </div>
                  </div>
                </section>

                {singleRecord ? (
                  <SingleAnalysisReport
                    item={singleRecord}
                    formatDate={formatDate}
                    getPercentiles={getPercentiles}
                    getStatusClass={getStatusClass}
                  />
                ) : (
                  <PeriodReport
                    records={records}
                    getPercentiles={getPercentiles}
                    getStatusClass={getStatusClass}
                    optimalCount={optimalCount}
                    evaluationCount={evaluationCount}
                  />
                )}
              </div>

              <footer className="absolute bottom-[7mm] left-[11mm] right-[11mm] pt-2 border-t border-gray-200 flex justify-between items-center text-[7px] text-gray-400 bg-white">
                <span>BlastInsight-XAI Research Prototype</span>
                <span>DBEST 2026 • 2in1 Team</span>
              </footer>
            </div>
          </div>

          <div className="no-print px-6 py-3 bg-[#111111] border-t border-[#222222] flex items-center justify-between">
            <div className="text-[10px] text-gray-500">
              {records.length} analisis • format A4 • 1 halaman
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-black text-gray-300 font-bold text-xs border border-[#222222] hover:bg-[#222222] hover:text-white transition-colors"
              >
                Tutup
              </button>

              <button
                onClick={handlePrint}
                disabled={records.length === 0}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#FF7300] to-[#E66800] text-black font-bold text-xs hover:shadow-[0_0_20px_rgba(255,115,0,0.4)] flex items-center gap-2 transition-all active:scale-95 disabled:opacity-40"
              >
                <Printer size={16} />
                Cetak PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

interface SingleAnalysisReportProps {
  item: BlastRecord;
  formatDate: (value: string) => string;
  getPercentiles: (item: BlastRecord) => {
    p10: number;
    p50: number;
    p80: number;
  };
  getStatusClass: (status?: string) => string;
}

const SingleAnalysisReport: React.FC<SingleAnalysisReportProps> = ({
  item,
  formatDate,
  getPercentiles,
  getStatusClass
}) => {
  const p = getPercentiles(item);

  return (
    <>
      <section className="mt-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[10px] font-extrabold uppercase tracking-[0.08em]">
            Detail Analisis
          </h2>

          <div className="text-[8px] text-gray-500">
            {formatDate(item.blastDate)}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <InfoBox label="Blast ID" value={item.blastId} />
          <InfoBox label="Pit & Bench" value={item.pitBench} />
          <InfoBox label="Formasi Geologi" value={item.geologyFormation} />

          <div
            className={`border rounded-md px-2 py-1.5 ${getStatusClass(
              item.evaluationStatus
            )}`}
          >
            <span className="block text-[6px] uppercase font-bold opacity-60">
              Status DSS
            </span>
            <strong className="text-[9px] leading-tight">
              {item.evaluationStatus || '—'}
            </strong>
          </div>
        </div>
      </section>

      {(item.imageUrl ||
        item.segmentationImageBase64 ||
        item.eigenCamImageBase64) && (
        <section className="mt-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Cpu size={13} className="text-[#FF7300]" />
            <h2 className="text-[10px] font-extrabold uppercase tracking-[0.08em]">
              Dokumentasi Visual XAI
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <VisualCard label="Gambar Asli" src={item.imageUrl} />
            <VisualCard
              label="Segmentasi Mask"
              src={item.segmentationImageBase64}
              accent
            />
            <VisualCard
              label="EigenCAM — P3"
              src={item.eigenCamImageBase64}
            />
          </div>
        </section>
      )}

      <section className="mt-3">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-[10px] font-extrabold uppercase tracking-[0.08em]">
            Distribusi Ukuran Relatif
          </h2>

          {item.targetD50 &&
            item.targetD50.lower > 0 &&
            item.targetD50.upper > 0 && (
              <span className="text-[7px] font-bold bg-[#FFF7ED] text-[#C95700] px-2 py-1 rounded border border-orange-200">
                Target D50: {item.targetD50.lower}–{item.targetD50.upper} px
              </span>
            )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <MetricBox
            label="D10 — Fines"
            value={p.p10 > 0 ? `${p.p10} px` : '—'}
          />
          <MetricBox
            label="D50 — Sentral"
            value={p.p50 > 0 ? `${p.p50} px` : '—'}
            highlight
          />
          <MetricBox
            label="D80 — Coarse"
            value={p.p80 > 0 ? `${p.p80} px` : '—'}
          />
        </div>
      </section>

      <section className="mt-3 grid grid-cols-[0.9fr_1.1fr] gap-2">
        <div className="border border-gray-200 rounded-md p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <MapPin size={11} className="text-[#FF7300]" />
            <span className="text-[8px] font-extrabold uppercase">
              Catatan Lapangan
            </span>
          </div>

          <p className="text-[8px] text-gray-600 leading-[1.45]">
            {item.geotechnicalNote || 'Tidak ada catatan khusus.'}
          </p>
        </div>

        <div className="bg-[#FFF7ED] border border-orange-200 rounded-md p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            {item.evaluationStatus?.toUpperCase() === 'OPTIMAL' ? (
              <CheckCircle2 size={11} className="text-emerald-600" />
            ) : (
              <AlertTriangle size={11} className="text-[#E66800]" />
            )}

            <span className="text-[8px] font-extrabold uppercase text-[#C95700]">
              Decision Support System
            </span>
          </div>

          <p className="text-[8px] text-[#444] leading-[1.45]">
            {item.recommendationQuote ||
              'Belum tersedia rekomendasi untuk analisis ini.'}
          </p>
        </div>
      </section>
    </>
  );
};

interface PeriodReportProps {
  records: BlastRecord[];
  getPercentiles: (item: BlastRecord) => {
    p10: number;
    p50: number;
    p80: number;
  };
  getStatusClass: (status?: string) => string;
  optimalCount: number;
  evaluationCount: number;
}

const PeriodReport: React.FC<PeriodReportProps> = ({
  records,
  getPercentiles,
  getStatusClass,
  optimalCount,
  evaluationCount
}) => {
  return (
    <>
      <section className="mt-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[10px] font-extrabold uppercase tracking-[0.08em]">
            Rekapitulasi Periode
          </h2>

          <div className="text-[7px] text-gray-500">
            Optimal: {optimalCount} • Perlu evaluasi: {evaluationCount}
          </div>
        </div>

        <div className="rounded-md border border-gray-200 overflow-hidden">
          <table className="w-full border-collapse text-[7.5px]">
            <thead>
              <tr className="bg-[#111111] text-white">
                <th className="text-left px-2 py-1.5">Blast ID</th>
                <th className="text-left px-2 py-1.5">Tanggal</th>
                <th className="text-left px-2 py-1.5">Lokasi</th>
                <th className="text-center px-2 py-1.5">Fragmen</th>
                <th className="text-center px-2 py-1.5">D10</th>
                <th className="text-center px-2 py-1.5">D50</th>
                <th className="text-center px-2 py-1.5">D80</th>
                <th className="text-left px-2 py-1.5">Status</th>
              </tr>
            </thead>

            <tbody>
              {records.map((item) => {
                const p = getPercentiles(item);

                return (
                  <tr
                    key={item.id}
                    className="border-b border-gray-200 last:border-0"
                  >
                    <td className="px-2 py-1.5 font-bold">{item.blastId}</td>
                    <td className="px-2 py-1.5">
                      {new Date(item.blastDate).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-2 py-1.5">{item.pitBench}</td>
                    <td className="px-2 py-1.5 text-center">
                      {item.detectedFragments}
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      {p.p10 > 0 ? p.p10 : '—'}
                    </td>
                    <td className="px-2 py-1.5 text-center font-bold">
                      {p.p50 > 0 ? p.p50 : '—'}
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      {p.p80 > 0 ? p.p80 : '—'}
                    </td>
                    <td className="px-2 py-1.5">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded border text-[6px] font-bold ${getStatusClass(
                          item.evaluationStatus
                        )}`}
                      >
                        {item.evaluationStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-[8px] leading-[1.4] text-gray-600">
        Laporan periode diringkas dalam satu halaman A4. Detail visual setiap
        peledakan tetap tersedia pada laporan analisis individual.
      </div>
    </>
  );
};

const InfoBox: React.FC<{ label: string; value?: string }> = ({
  label,
  value
}) => (
  <div className="border border-gray-200 rounded-md px-2 py-1.5 min-w-0">
    <span className="block text-[6px] uppercase font-bold text-gray-400 tracking-wide">
      {label}
    </span>
    <strong className="block text-[9px] leading-tight truncate">
      {value || '—'}
    </strong>
  </div>
);

const VisualCard: React.FC<{
  label: string;
  src?: string;
  accent?: boolean;
}> = ({ label, src, accent = false }) => (
  <div
    className={`border rounded-md p-1.5 ${
      accent ? 'border-orange-300' : 'border-gray-200'
    }`}
  >
    <span
      className={`text-[6.5px] font-extrabold uppercase tracking-wide block text-center mb-1 ${
        accent ? 'text-[#E66800]' : 'text-gray-500'
      }`}
    >
      {label}
    </span>

    <div className="h-[35mm] bg-gray-100 rounded overflow-hidden flex items-center justify-center">
      {src ? (
        <img src={src} alt={label} className="w-full h-full object-cover" />
      ) : (
        <span className="text-[7px] text-gray-400">Tidak tersedia</span>
      )}
    </div>
  </div>
);

const MetricBox: React.FC<{
  label: string;
  value: string;
  highlight?: boolean;
}> = ({ label, value, highlight = false }) => (
  <div
    className={`rounded-md p-2 text-center ${
      highlight
        ? 'border-2 border-[#FF7300] bg-orange-50/40'
        : 'border border-gray-200'
    }`}
  >
    <span
      className={`text-[7px] uppercase font-bold block ${
        highlight ? 'text-[#E66800]' : 'text-gray-400'
      }`}
    >
      {label}
    </span>

    <strong
      className={`text-[14px] leading-tight ${
        highlight ? 'text-[#C95700]' : 'text-[#111111]'
      }`}
    >
      {value}
    </strong>
  </div>
);
