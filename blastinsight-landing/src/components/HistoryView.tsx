import React, { useEffect, useMemo, useState } from 'react';
import type { BlastRecord, ViewerLayer } from '../types';

import {
  Search,
  Plus,
  MapPin,
  FolderSearch,
  X,
  FileText,
  CheckCircle2,
  Printer,
  Eye,
  ArrowDownWideNarrow,
  Target,
  CalendarDays
} from 'lucide-react';

import { ImageViewer } from './ImageViewer';
import { SieveChart } from './SieveChart';
import { PdfReportModal } from './PdfReportModal';

interface HistoryViewProps {
  history: BlastRecord[];
  onSelectBlast: (blast: BlastRecord) => void;
  onGoToAnalysis: () => void;
  initialSelectedBlast?: BlastRecord | null;
  onInitialSelectedBlastHandled?: () => void;
}

type StatusFilter =
  | 'Semua'
  | 'OPTIMAL'
  | 'OVERSIZE'
  | 'OVER-BREAKING'
  | 'NEEDS_TARGET'
  | 'UNAVAILABLE';

type ReportMode = 'ALL' | 'MONTH' | 'CUSTOM';

type ExtendedBlastRecord = BlastRecord & {
  segmentationImageBase64?: string;
  eigenCamImageBase64?: string;

  distributionCurve?: {
    diameter_px: number;
    cumulative_area_percent: number;
  }[];

  totalDetections?: number;
  excludedFragments?: number;
  validPercentage?: number;

  qc?: {
    confidence_threshold?: number;
    edge_touching_excluded?: number;
    low_confidence_excluded?: number;
  };

  targetD50?: {
    lower: number;
    upper: number;
  };
};

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSelectBlast,
  onGoToAnalysis,
  initialSelectedBlast,
  onInitialSelectedBlastHandled
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('Semua');

  const [selectedDetail, setSelectedDetail] =
    useState<BlastRecord | null>(null);

  const [modalLayer, setModalLayer] =
    useState<ViewerLayer>('segmentation');

  // PDF per-card
  const [singleReportBlast, setSingleReportBlast] =
    useState<BlastRecord | null>(null);

  // PDF bulk / periode
  const [reportMode, setReportMode] =
    useState<ReportMode>('ALL');

  const today = new Date();
  const defaultMonth = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, '0')}`;

  const [reportMonth, setReportMonth] =
    useState(defaultMonth);

  const [customStartDate, setCustomStartDate] =
    useState('');

  const [customEndDate, setCustomEndDate] =
    useState('');

  const [isReportOpen, setIsReportOpen] =
    useState(false);

  const getPercentiles = (item: BlastRecord) => {
    const p = item.percentiles as unknown as {
      p10?: number;
      p50?: number;
      p80?: number;
    };

    return {
      p10: Number(p?.p10 ?? 0),
      p50: Number(p?.p50 ?? 0),
      p80: Number(p?.p80 ?? 0)
    };
  };

  const getExtended = (item: BlastRecord) =>
    item as ExtendedBlastRecord;

  const getTarget = (item: BlastRecord) => {
    const target = getExtended(item).targetD50;

    return {
      lower:
        target &&
        Number.isFinite(Number(target.lower)) &&
        Number(target.lower) > 0
          ? Number(target.lower)
          : null,

      upper:
        target &&
        Number.isFinite(Number(target.upper)) &&
        Number(target.upper) > 0
          ? Number(target.upper)
          : null
    };
  };

  const getStatusStyle = (status?: string) => {
    const normalized = status?.toUpperCase() || '';

    if (normalized === 'OPTIMAL') {
      return 'bg-green-500/10 text-green-500 border-green-500/30';
    }

    if (normalized === 'OVERSIZE') {
      return 'bg-[#FF7300]/10 text-[#FF7300] border-[#FF7300]/30';
    }

    if (normalized === 'OVER-BREAKING') {
      return 'bg-red-500/10 text-red-500 border-red-500/30';
    }

    if (normalized === 'NEEDS_TARGET') {
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    }

    return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
  };

  const getStatusLabel = (status?: string) => {
  const normalized = status?.toUpperCase() || '';

  if (normalized === 'NEEDS_TARGET') {
    return 'BELUM DIEVALUASI';
  }

  if (normalized === 'UNAVAILABLE' || !normalized) {
    return 'BELUM DIEVALUASI';
  }

  return normalized;
};

  const openDetail = (item: BlastRecord) => {
    onSelectBlast(item);
    setSelectedDetail(item);
    setModalLayer('segmentation');
  };

  const openSingleReport = (item: BlastRecord) => {
    setSingleReportBlast(item);
    setIsReportOpen(true);
  };

  const closeReport = () => {
    setIsReportOpen(false);
    setSingleReportBlast(null);
  };

  useEffect(() => {
    if (!initialSelectedBlast) return;

    openDetail(initialSelectedBlast);
    onInitialSelectedBlastHandled?.();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSelectedBlast]);

  // History display: newest -> oldest
  const filteredHistory = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return [...history]
      .filter((item) => {
        const matchesSearch =
          !term ||
          item.blastId?.toLowerCase().includes(term) ||
          item.pitBench?.toLowerCase().includes(term) ||
          item.geologyFormation?.toLowerCase().includes(term) ||
          item.fileName?.toLowerCase().includes(term);

        const normalizedStatus =
          item.evaluationStatus?.toUpperCase() || 'UNAVAILABLE';

        const matchesStatus =
          statusFilter === 'Semua' ||
          normalizedStatus === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(a.blastDate).getTime();
        const dateB = new Date(b.blastDate).getTime();
        return dateB - dateA;
      });
  }, [history, searchTerm, statusFilter]);

  // Report selection independent from display filters
  const reportRecords = useMemo(() => {
    const sorted = [...history].sort(
      (a, b) =>
        new Date(b.blastDate).getTime() -
        new Date(a.blastDate).getTime()
    );

    if (reportMode === 'ALL') return sorted;

    if (reportMode === 'MONTH') {
      return sorted.filter((item) => {
        const date = new Date(item.blastDate);
        const yyyyMm = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, '0')}`;

        return yyyyMm === reportMonth;
      });
    }

    if (reportMode === 'CUSTOM') {
      if (!customStartDate || !customEndDate) return [];

      const start = new Date(`${customStartDate}T00:00:00`);
      const end = new Date(`${customEndDate}T23:59:59`);

      return sorted.filter((item) => {
        const date = new Date(item.blastDate);
        return date >= start && date <= end;
      });
    }

    return sorted;
  }, [
    history,
    reportMode,
    reportMonth,
    customStartDate,
    customEndDate
  ]);

  const reportLabel = useMemo(() => {
    if (reportMode === 'ALL') {
      return 'Seluruh Riwayat Analisis';
    }

    if (reportMode === 'MONTH') {
      if (!reportMonth) return 'Laporan Bulanan';

      const [year, month] = reportMonth.split('-').map(Number);
      const date = new Date(year, month - 1, 1);

      return `Laporan ${date.toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric'
      })}`;
    }

    if (customStartDate && customEndDate) {
      return `Laporan ${new Date(
        `${customStartDate}T00:00:00`
      ).toLocaleDateString('id-ID')} - ${new Date(
        `${customEndDate}T00:00:00`
      ).toLocaleDateString('id-ID')}`;
    }

    return 'Laporan Rentang Tanggal';
  }, [
    reportMode,
    reportMonth,
    customStartDate,
    customEndDate
  ]);

  const openBulkReport = () => {
    if (reportRecords.length === 0) return;

    setSingleReportBlast(null);
    setIsReportOpen(true);
  };

  return (
    <>
      <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto w-full flex flex-col gap-8 animate-fade-slide font-sans relative">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#222222]">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#FF7300] text-xs uppercase tracking-widest font-bold mb-1">
              <span className="w-2 h-2 rounded-full bg-[#FF7300] shadow-[0_0_10px_rgba(255,115,0,0.8)] animate-pulse" />
              Arsip Data Penambangan
            </div>

            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent tracking-tight">
              Riwayat Analisis Peledakan
            </h1>

            <p className="text-sm text-gray-400 max-w-3xl leading-relaxed">
              Riwayat hasil analisis fragmentasi dari FastAPI,
              mencakup segmentasi YOLO11s-Seg, Quality Control,
              D10/D50/D80, Eigen-CAM, target D50, dan hasil
              Decision Support System.
            </p>
          </div>

          <button
            onClick={onGoToAnalysis}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#FF7300] to-[#E66800] text-black font-bold text-sm hover:shadow-[0_0_20px_rgba(255,115,0,0.4)] active:scale-95 flex items-center gap-2 transition-all group self-start md:self-auto shrink-0"
          >
            <Plus
              size={18}
              className="transition-transform group-hover:rotate-90"
            />
            Analisis Baru
          </button>
        </div>

        {/* SEARCH + CATEGORY */}
        <div className="bg-[#111111]/80 backdrop-blur-md p-4 rounded-xl border border-[#222222] shadow-lg flex flex-col gap-4">
          <div className="flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
            <div className="relative w-full xl:w-[420px]">
              <input
                type="text"
                placeholder="Cari Blast ID, lokasi, formasi, atau nama file..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#000000] text-white text-sm pl-10 pr-4 py-3 rounded-lg border border-[#222222] focus:outline-none focus:border-[#FF7300] transition-colors shadow-inner"
              />

              <Search
                className="absolute left-3.5 top-3.5 text-gray-500"
                size={16}
              />
            </div>

            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-black border border-[#222222] text-[10px] text-gray-400 uppercase tracking-wider font-bold shrink-0">
              <ArrowDownWideNarrow
                size={14}
                className="text-[#FF7300]"
              />
              Terbaru di atas
            </div>
          </div>

          <div className="pt-4 border-t border-[#222222] flex flex-wrap items-center gap-2 text-xs">
            <span className="text-gray-500 font-bold uppercase tracking-wider mr-2">
              Filter Kategori:
            </span>

            {(
              [
                'Semua',
                'OPTIMAL',
                'OVERSIZE',
                'OVER-BREAKING'
              ] as const
            ).map((status) => (
             <button
    key={status}
    onClick={() => setStatusFilter(status)}
    className={`px-3 py-2 rounded-lg border transition-all font-bold tracking-wide ${
      statusFilter === status
        ? 'bg-[#FF7300]/15 border-[#FF7300]/50 text-[#FF7300] shadow-[0_0_15px_rgba(255,115,0,0.15)]'
        : 'bg-[#000000] border-[#222222] text-gray-500 hover:text-white hover:border-gray-600'
    }`}
  >
    {status}
  </button>
            ))}
          </div>
        </div>

        {/* REPORT / PRINT */}
        <div className="bg-[#111111]/80 backdrop-blur-md p-4 rounded-xl border border-[#222222] shadow-lg">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays
                  size={16}
                  className="text-[#FF7300]"
                />
                <span className="text-[11px] text-gray-500 uppercase tracking-widest font-bold">
                  Cetak Laporan
                </span>
              </div>

              <div className="flex flex-wrap items-end gap-3">
                {(
                  [
                    ['ALL', 'Semua Data'],
                    ['MONTH', 'Per Bulan'],
                    ['CUSTOM', 'Custom Tanggal']
                  ] as const
                ).map(([mode, label]) => (
                  <button
                    key={mode}
                    onClick={() => setReportMode(mode)}
                    className={`px-3 py-2 rounded-lg border text-xs font-bold transition-all ${
                      reportMode === mode
                        ? 'bg-[#FF7300]/15 border-[#FF7300]/50 text-[#FF7300]'
                        : 'bg-black border-[#222222] text-gray-500 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}

                {reportMode === 'MONTH' && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-gray-600 uppercase font-bold">
                      Bulan
                    </span>
                    <input
                      type="month"
                      value={reportMonth}
                      onChange={(e) => setReportMonth(e.target.value)}
                      className="bg-black border border-[#222222] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF7300] [color-scheme:dark]"
                    />
                  </div>
                )}

                {reportMode === 'CUSTOM' && (
                  <>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-gray-600 uppercase font-bold">
                        Dari
                      </span>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) =>
                          setCustomStartDate(e.target.value)
                        }
                        className="bg-black border border-[#222222] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF7300] [color-scheme:dark]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-gray-600 uppercase font-bold">
                        Sampai
                      </span>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) =>
                          setCustomEndDate(e.target.value)
                        }
                        className="bg-black border border-[#222222] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF7300] [color-scheme:dark]"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={openBulkReport}
              disabled={reportRecords.length === 0}
              className="px-5 py-2.5 rounded-lg bg-[#FF7300] text-black font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#FF861F] hover:shadow-[0_0_20px_rgba(255,115,0,0.25)] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
            >
              <Printer size={16} />
              Cetak Laporan
              <span className="px-2 py-0.5 rounded bg-black/10">
                {reportRecords.length}
              </span>
            </button>
          </div>
        </div>

        {/* HISTORY GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHistory.map((item) => {
            const p = getPercentiles(item);
            const extended = getExtended(item);
            const target = getTarget(item);

            const previewImage =
              extended.segmentationImageBase64 ||
              item.imageUrl ||
              extended.eigenCamImageBase64 ||
              '';

            return (
              <article
                key={item.id}
                onClick={() => openDetail(item)}
                className="bg-[#111111]/90 backdrop-blur-md border border-[#222222] hover:border-[#FF7300]/50 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-[0_10px_30px_rgba(255,115,0,0.1)] hover:-translate-y-1 flex flex-col group"
              >
                <div className="relative h-44 w-full bg-[#000000] overflow-hidden">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt={item.fileName || item.blastId}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-75 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                      <FileText size={44} />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent opacity-90" />

                  <div className="absolute top-3 left-3 bg-[#000000]/80 backdrop-blur-md px-3 py-1.5 rounded text-xs font-bold text-white border border-[#222222] shadow-md">
                    {item.blastId}
                  </div>

                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-md border ${getStatusStyle(
                        item.evaluationStatus
                      )}`}
                    >
                      {getStatusLabel(item.evaluationStatus)}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex flex-col gap-4 flex-1 bg-[#111111]">
                  <div>
                    <div className="flex items-center justify-between gap-3 text-xs text-gray-500 font-bold mb-2">
                      <span className="flex items-center gap-1.5 min-w-0">
                        <MapPin
                          size={14}
                          className="text-gray-400 shrink-0"
                        />
                        <span className="truncate">
                          {item.pitBench}
                        </span>
                      </span>

                      <span className="shrink-0">
                        {new Date(
                          item.blastDate
                        ).toLocaleDateString('id-ID')}
                      </span>
                    </div>

                    <div className="text-base font-bold text-white tracking-wide truncate group-hover:text-[#FF7300] transition-colors">
                      {item.geologyFormation}
                    </div>

                    <div className="text-[10px] text-gray-600 mt-1 truncate">
                      {item.fileName || 'Citra fragmentasi'}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 py-3 border-y border-[#222222] text-center bg-[#000000] rounded-lg">
                    <MetricMini
                      label="Valid"
                      value={`${item.detectedFragments ?? 0}`}
                    />

                    <MetricMini
                      label="D10"
                      value={p.p10 > 0 ? `${p.p10}` : '—'}
                    />

                    <MetricMini
                      label="D50"
                      value={p.p50 > 0 ? `${p.p50}` : '—'}
                      accent
                    />

                    <MetricMini
                      label="D80"
                      value={p.p80 > 0 ? `${p.p80}` : '—'}
                    />
                  </div>

                  <div className="rounded-lg border border-[#222222] bg-black p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Target
                        size={13}
                        className="text-[#FF7300]"
                      />
                      <span className="text-[9px] uppercase tracking-widest font-bold text-gray-500">
                        Batas Target D50
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <TargetMini
                        label="Bawah"
                        value={
                          target.lower !== null
                            ? `${target.lower} px`
                            : 'Belum diisi'
                        }
                      />

                      <TargetMini
                        label="Atas"
                        value={
                          target.upper !== null
                            ? `${target.upper} px`
                            : 'Belum diisi'
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetail(item);
                      }}
                      className="px-3 py-2.5 rounded-lg bg-[#000000] border border-[#222222] text-gray-300 hover:text-white hover:border-gray-600 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Eye size={15} />
                      Lihat Detail
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openSingleReport(item);
                      }}
                      className="px-3 py-2.5 rounded-lg bg-[#FF7300]/10 border border-[#FF7300]/30 text-[#FF7300] hover:bg-[#FF7300]/20 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Printer size={15} />
                      Cetak Ulang
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {filteredHistory.length === 0 && (
          <div className="text-center py-24 bg-[#111111]/50 rounded-2xl border border-[#222222] border-dashed flex flex-col items-center justify-center">
            <FolderSearch
              size={48}
              className="text-gray-600 mb-4"
            />

            <h3 className="text-white font-bold text-lg mb-1">
              Tidak Ada Data Ditemukan
            </h3>

            <p className="text-gray-500 text-sm">
              Tidak ada riwayat analisis yang sesuai
              dengan pencarian atau kategori status.
            </p>
          </div>
        )}

        {/* DETAIL MODAL */}
        {selectedDetail && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md p-3 sm:p-5 lg:p-6"
            onClick={() => setSelectedDetail(null)}
          >
            <div
              className="mx-auto flex h-full max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[#262626] bg-[#090909] shadow-[0_0_60px_rgba(255,115,0,0.14)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* HEADER */}
              <div className="shrink-0 border-b border-[#222222] bg-[#111111] px-5 py-4 sm:px-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#FF7300]/25 bg-[#FF7300]/10 text-[#FF7300]">
                      <FileText size={18} />
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-base font-bold tracking-wide text-white sm:text-lg">
                        {selectedDetail.blastId}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-500">
                        <span>{selectedDetail.pitBench}</span>
                        <span>•</span>
                        <span>
                          {new Date(
                            selectedDetail.blastDate
                          ).toLocaleDateString('id-ID')}
                        </span>
                        <span>•</span>
                        <span>
                          {selectedDetail.geologyFormation}
                        </span>
                      </div>

                      <div className="mt-1 text-[9px] uppercase tracking-[0.16em] text-gray-600">
                        YOLO11s-Seg · QC · D10/D50/D80 · Eigen-CAM · DSS
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => openSingleReport(selectedDetail)}
                      className="flex items-center gap-2 rounded-lg border border-[#FF7300]/30 bg-[#FF7300]/10 px-3 py-2 text-xs font-bold text-[#FF7300] transition-colors hover:bg-[#FF7300]/20"
                    >
                      <Printer size={15} />
                      <span className="hidden sm:inline">Cetak Ulang</span>
                    </button>

                    <button
                      onClick={() => setSelectedDetail(null)}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* BODY */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {(() => {
                  const p = getPercentiles(selectedDetail);
                  const extended = getExtended(selectedDetail);
                  const target = getTarget(selectedDetail);

                  const hasQcDetail =
                    extended.totalDetections !== undefined ||
                    extended.excludedFragments !== undefined ||
                    extended.validPercentage !== undefined;

                  return (
                    <div className="flex flex-col gap-5">
                      {/* METRIC SUMMARY */}
                      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <CompactMetric
                          label="Fragmen Valid"
                          value={`${selectedDetail.detectedFragments ?? 0}`}
                          helper="Lolos QC"
                        />

                        <CompactMetric
                          label="D10"
                          value={p.p10 > 0 ? `${p.p10} px` : '—'}
                          helper="Fines"
                        />

                        <CompactMetric
                          label="D50"
                          value={p.p50 > 0 ? `${p.p50} px` : '—'}
                          helper="Ukuran sentral"
                          accent
                        />

                        <CompactMetric
                          label="D80"
                          value={p.p80 > 0 ? `${p.p80} px` : '—'}
                          helper="Upper tail"
                        />
                      </div>

                      {/* MAIN TWO-COLUMN LAYOUT */}
                      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(330px,0.85fr)]">
                        {/* LEFT: VISUAL ANALYSIS */}
                        <div className="flex min-w-0 flex-col gap-5">
                          <ImageViewer
                            blast={selectedDetail}
                            layer={modalLayer}
                            setLayer={setModalLayer}
                          />

                          <SieveChart blast={selectedDetail} />
                        </div>

                        {/* RIGHT: EVALUATION PANEL */}
                        <div className="flex min-w-0 flex-col gap-4">
                          {/* DSS + TARGET */}
                          <section className="rounded-xl border border-[#222222] bg-[#111111] p-5">
                            <div className="mb-4 flex items-start justify-between gap-3">
                              <div>
                                <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-gray-500">
                                  Decision Support System
                                </div>

                                <h3 className="mt-1 text-base font-bold text-white">
                                  Evaluasi D50
                                </h3>
                              </div>

                              <span
                                className={`inline-flex shrink-0 rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase ${getStatusStyle(
                                  selectedDetail.evaluationStatus
                                )}`}
                              >
                                {getStatusLabel(
                                  selectedDetail.evaluationStatus
                                )}
                              </span>
                            </div>

                            <div className="rounded-lg border border-[#222222] bg-black p-4">
                              <div className="text-[9px] font-bold uppercase tracking-wider text-gray-600">
                                D50 Hasil Analisis
                              </div>

                              <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-[#FF7300]">
                                  {p.p50 > 0 ? p.p50 : '—'}
                                </span>

                                {p.p50 > 0 && (
                                  <span className="text-xs font-bold text-gray-500">
                                    px
                                  </span>
                                )}
                              </div>

                              {selectedDetail.statusDetail && (
                                <div className="mt-2 text-[10px] leading-relaxed text-gray-500">
                                  {selectedDetail.statusDetail}
                                </div>
                              )}
                            </div>

                            <div className="mt-4">
                              <div className="mb-2 flex items-center gap-2">
                                <Target
                                  size={14}
                                  className="text-[#FF7300]"
                                />

                                <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-gray-500">
                                  Batas Target D50
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <TargetCompact
                                  label="Bawah"
                                  value={
                                    target.lower !== null
                                      ? `${target.lower} px`
                                      : 'Belum diisi'
                                  }
                                />

                                <TargetCompact
                                  label="Atas"
                                  value={
                                    target.upper !== null
                                      ? `${target.upper} px`
                                      : 'Belum diisi'
                                  }
                                />
                              </div>
                            </div>

                            {(target.lower === null ||
                              target.upper === null) && (
                              <div className="mt-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-3 py-2 text-[10px] leading-relaxed text-yellow-400">
                                Target D50 belum lengkap. Backend dapat
                                menghasilkan status BUTUH TARGET hingga
                                batas bawah dan atas tersedia.
                              </div>
                            )}
                          </section>

                          {/* QC */}
                          {hasQcDetail && (
                            <section className="rounded-xl border border-[#222222] bg-[#111111] p-5">
                              <div className="mb-3 text-[9px] font-bold uppercase tracking-[0.16em] text-gray-500">
                                Ringkasan Quality Control
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                {extended.totalDetections !== undefined && (
                                  <SmallStat
                                    label="Deteksi Mentah"
                                    value={`${extended.totalDetections}`}
                                  />
                                )}

                                <SmallStat
                                  label="Fragmen Valid"
                                  value={`${selectedDetail.detectedFragments ?? 0}`}
                                />

                                {extended.excludedFragments !== undefined && (
                                  <SmallStat
                                    label="Excluded"
                                    value={`${extended.excludedFragments}`}
                                  />
                                )}

                                {extended.validPercentage !== undefined && (
                                  <SmallStat
                                    label="Valid QC"
                                    value={`${extended.validPercentage}%`}
                                  />
                                )}
                              </div>

                              <div className="mt-3 border-t border-[#222222] pt-3 text-[9px] leading-relaxed text-gray-600">
                                Confidence QC: 0.40 · ukuran fragmentasi tetap
                                dalam pixel (px).
                              </div>
                            </section>
                          )}

                          {/* METADATA */}
                          <section className="rounded-xl border border-[#222222] bg-[#111111] p-5">
                            <div className="mb-3 text-[9px] font-bold uppercase tracking-[0.16em] text-gray-500">
                              Informasi Analisis
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <MetaCompact
                                label="Pit / Bench"
                                value={selectedDetail.pitBench}
                              />

                              <MetaCompact
                                label="Tanggal"
                                value={new Date(
                                  selectedDetail.blastDate
                                ).toLocaleDateString('id-ID')}
                              />

                              <MetaCompact
                                label="Formasi"
                                value={selectedDetail.geologyFormation}
                              />

                              <MetaCompact
                                label="Satuan"
                                value="pixel (px)"
                              />
                            </div>

                            <div className="mt-3 rounded-lg border-l-2 border-[#FF7300] bg-black px-3 py-3 text-xs leading-relaxed text-gray-400">
                              {selectedDetail.geotechnicalNote ||
                                'Tidak ada catatan spesifik dari operator lapangan.'}
                            </div>
                          </section>

                          {/* RECOMMENDATION */}
                          <section className="rounded-xl border border-[#222222] bg-[#111111] p-5">
                            <div className="mb-3 flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FF7300]/15 text-[#FF7300]">
                                <FileText size={14} />
                              </div>

                              <div>
                                <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-gray-500">
                                  DSS
                                </div>

                                <div className="text-sm font-bold text-white">
                                  Rekomendasi Evaluasi
                                </div>
                              </div>
                            </div>

                            <div className="rounded-lg border border-[#222222] bg-black p-3 text-xs italic leading-relaxed text-gray-300">
                              “
                              {selectedDetail.recommendationQuote ||
                                'Belum tersedia rekomendasi.'}
                              ”
                            </div>

                            {selectedDetail.actionPoints &&
                              selectedDetail.actionPoints.length > 0 && (
                                <div className="mt-3 flex flex-col gap-2">
                                  {selectedDetail.actionPoints.map(
                                    (action, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-start gap-2 text-[11px] leading-relaxed text-gray-400"
                                      >
                                        <CheckCircle2
                                          size={14}
                                          className="mt-0.5 shrink-0 text-green-500"
                                        />

                                        <span>{action}</span>
                                      </div>
                                    )
                                  )}
                                </div>
                              )}

                            <div className="mt-4 border-t border-[#222222] pt-3 text-[9px] leading-relaxed text-gray-600">
                              Hasil merupakan decision support. Keputusan
                              operasional akhir tetap berada pada blasting
                              engineer.
                            </div>
                          </section>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PDF: single card OR bulk report */}
      <PdfReportModal
        blast={singleReportBlast ?? undefined}
        blasts={
          singleReportBlast
            ? undefined
            : reportRecords
        }
        periodLabel={
          singleReportBlast
            ? `Analisis ${singleReportBlast.blastId}`
            : reportLabel
        }
        isOpen={isReportOpen}
        onClose={closeReport}
      />
    </>
  );
};


const CompactMetric: React.FC<{
  label: string;
  value: string;
  helper: string;
  accent?: boolean;
}> = ({ label, value, helper, accent = false }) => (
  <div
    className={`rounded-xl border p-4 ${
      accent
        ? 'border-[#FF7300]/30 bg-gradient-to-br from-[#111111] to-[#FF7300]/10'
        : 'border-[#222222] bg-[#111111]'
    }`}
  >
    <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-gray-500">
      {label}
    </div>

    <div
      className={`mt-2 text-2xl font-bold tabular-nums ${
        accent ? 'text-[#FF7300]' : 'text-white'
      }`}
    >
      {value}
    </div>

    <div className="mt-1 text-[10px] text-gray-600">
      {helper}
    </div>
  </div>
);

const TargetCompact: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => (
  <div className="rounded-lg border border-[#222222] bg-black px-3 py-3">
    <div className="text-[8px] font-bold uppercase tracking-wider text-gray-600">
      {label}
    </div>

    <div className="mt-1 text-sm font-bold text-white">
      {value}
    </div>
  </div>
);

const SmallStat: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => (
  <div className="rounded-lg border border-[#222222] bg-black px-3 py-3">
    <div className="text-[8px] font-bold uppercase tracking-wider text-gray-600">
      {label}
    </div>

    <div className="mt-1 text-base font-bold text-white">
      {value}
    </div>
  </div>
);

const MetaCompact: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => (
  <div className="min-w-0 rounded-lg border border-[#222222] bg-black px-3 py-3">
    <div className="text-[8px] font-bold uppercase tracking-wider text-gray-600">
      {label}
    </div>

    <div className="mt-1 truncate text-xs font-medium text-gray-300">
      {value || '—'}
    </div>
  </div>
);

const MetricMini: React.FC<{
  label: string;
  value: string;
  accent?: boolean;
}> = ({
  label,
  value,
  accent = false
}) => (
  <div className="flex flex-col gap-1 min-w-0">
    <span className="text-gray-500 text-[9px] uppercase font-bold tracking-wider">
      {label}
    </span>

    <span
      className={`font-bold text-sm truncate ${
        accent ? 'text-[#FF7300]' : 'text-white'
      }`}
    >
      {value}
    </span>
  </div>
);

const TargetMini: React.FC<{
  label: string;
  value: string;
}> = ({
  label,
  value
}) => (
  <div className="rounded-md border border-[#222222] bg-[#111111] px-2.5 py-2">
    <span className="block text-[8px] uppercase tracking-wider font-bold text-gray-600">
      {label}
    </span>

    <span className="block text-xs font-bold text-white mt-1">
      {value}
    </span>
  </div>
);


