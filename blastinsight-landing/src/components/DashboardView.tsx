import React, { useMemo } from 'react';
import type { BlastRecord } from '../types';
import {
  PlusCircle,
  Activity,
  TrendingUp,
  AlertTriangle,
  Layers,
  ChevronRight,
  ScanLine,
  Target,
  Cpu,
  Eye,
  Database
} from 'lucide-react';

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
  const normalizedHistory = useMemo(() => {
    return [...history].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.blastDate).getTime();
      const dateB = new Date(b.createdAt || b.blastDate).getTime();

      return (Number.isFinite(dateB) ? dateB : 0) -
        (Number.isFinite(dateA) ? dateA : 0);
    });
  }, [history]);

  const getPercentiles = (item: BlastRecord) => ({
    p10: Number(item.percentiles?.p10 ?? 0),
    p50: Number(item.percentiles?.p50 ?? 0),
    p80: Number(item.percentiles?.p80 ?? 0)
  });

  const getStatusLabel = (status?: string) => {
    const normalized = status?.toUpperCase() || '';

    if (
      normalized === 'NEEDS_TARGET' ||
      normalized === 'UNAVAILABLE' ||
      !normalized
    ) {
      return 'BELUM DIEVALUASI';
    }

    return normalized;
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

    return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
  };

  const totalAnalyses = history.length;

  const totalValidFragments = history.reduce(
    (acc, item) => acc + Number(item.detectedFragments || 0),
    0
  );

  const validD50 = history
    .map((item) => getPercentiles(item).p50)
    .filter((value) => Number.isFinite(value) && value > 0);

  const averageD50 =
    validD50.length > 0
      ? validD50.reduce((acc, value) => acc + value, 0) / validD50.length
      : 0;

  const statusCounts = useMemo(() => {
    return history.reduce(
      (acc, item) => {
        const status = item.evaluationStatus?.toUpperCase() || '';

        if (status === 'OPTIMAL') {
          acc.optimal += 1;
        } else if (status === 'OVERSIZE') {
          acc.oversize += 1;
        } else if (status === 'OVER-BREAKING') {
          acc.overBreaking += 1;
        } else {
          acc.pending += 1;
        }

        return acc;
      },
      {
        optimal: 0,
        oversize: 0,
        overBreaking: 0,
        pending: 0
      }
    );
  }, [history]);

  const evaluationCount =
    statusCounts.oversize + statusCounts.overBreaking;

  const latestAnalysis =
    normalizedHistory.length > 0
      ? normalizedHistory[0]
      : null;

  const recentAnalyses = normalizedHistory.slice(0, 6);

  return (
    <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto w-full flex flex-col gap-8 relative z-10 animate-fade-slide font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#222222]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[#FF7300] text-xs uppercase tracking-widest font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF7300] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF7300]" />
            </span>

            Ringkasan Analisis Fragmentasi
          </div>

          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent tracking-tight">
            Dashboard BlastInsight-XAI
          </h1>

          <p className="text-sm text-gray-400 max-w-3xl leading-relaxed">
            Ringkasan hasil analisis fragmentasi dari pipeline YOLO11s-Seg,
            Quality Control, D10/D50/D80, Eigen-CAM, dan Decision Support
            System berbasis D50.
          </p>
        </div>

        <button
          onClick={onGoToAnalysis}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#FF7300] to-[#E66800] text-black font-bold text-sm hover:shadow-[0_0_20px_rgba(255,115,0,0.4)] active:scale-95 transition-all flex items-center gap-2 group self-start md:self-auto shrink-0"
        >
          <PlusCircle
            size={18}
            className="group-hover:rotate-90 transition-transform"
          />
          <span>Analisis Baru</span>
        </button>
      </div>

      {/* KPI UTAMA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Analisis"
          value={String(totalAnalyses)}
          helper="Data analisis tersimpan"
          icon={<Activity size={16} className="text-[#FF7300]" />}
        />

        <KpiCard
          label="Fragmen Valid (QC)"
          value={String(totalValidFragments)}
          helper="Akumulasi fragmen lolos QC"
          icon={<ScanLine size={16} className="text-green-500" />}
        />

        <KpiCard
          label="Rata-rata D50"
          value={averageD50 > 0 ? `${averageD50.toFixed(2)} px` : '—'}
          helper="Ukuran sentral distribusi"
          icon={<TrendingUp size={16} className="text-[#FF7300]" />}
          accent
        />

        <KpiCard
          label="Perlu Evaluasi DSS"
          value={String(evaluationCount)}
          helper="OVERSIZE + OVER-BREAKING"
          icon={<AlertTriangle size={16} className="text-yellow-500" />}
        />
      </div>

      {/* STATUS DSS + PIPELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-[#111111]/80 backdrop-blur-md rounded-xl border border-[#222222] p-6 shadow-lg">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                Decision Support System
              </div>

              <h2 className="text-lg font-bold text-white mt-1">
                Distribusi Status Analisis
              </h2>
            </div>

            <Target size={20} className="text-[#FF7300]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatusSummary
              label="OPTIMAL"
              value={statusCounts.optimal}
              className="text-green-500 border-green-500/20 bg-green-500/5"
            />

            <StatusSummary
              label="OVERSIZE"
              value={statusCounts.oversize}
              className="text-[#FF7300] border-[#FF7300]/20 bg-[#FF7300]/5"
            />

            <StatusSummary
              label="OVER-BREAKING"
              value={statusCounts.overBreaking}
              className="text-red-500 border-red-500/20 bg-red-500/5"
            />
          </div>

          <div className="mt-4 pt-4 border-t border-[#222222] text-[11px] text-gray-500 leading-relaxed">
            Status DSS ditentukan berdasarkan posisi nilai D50 terhadap rentang
            target fragmentasi spesifik operasi. D10 dan D80 digunakan sebagai
            informasi pendukung untuk memberikan konteks distribusi ukuran
            fragmentasi.
          </div>

          {statusCounts.pending > 0 && (
            <div className="mt-3 text-[10px] text-gray-600">
              {statusCounts.pending} analisis belum memiliki evaluasi DSS final
              karena target D50 atau hasil D50 belum tersedia.
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-[#000000] rounded-xl border border-[#222222] p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-[#FF7300]/10 border border-[#FF7300]/20 flex items-center justify-center">
              <Cpu size={18} className="text-[#FF7300]" />
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                Pipeline Aktif
              </div>

              <div className="text-base font-bold text-white">
                BlastInsight-XAI
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <PipelineRow
              label="Instance Segmentation"
              value="YOLO11s-Seg"
            />

            <PipelineRow
              label="Input Model"
              value="960 px"
            />

            <PipelineRow
              label="QC Confidence"
              value="0.40"
            />

            <PipelineRow
              label="Explainability"
              value="Eigen-CAM · Layer 16 / P3"
            />

            <PipelineRow
              label="Satuan Ukuran"
              value="pixel (px)"
            />
          </div>

          <div className="mt-5 pt-4 border-t border-[#222222] text-[10px] text-gray-600 leading-relaxed">
            Sistem berfungsi sebagai decision support dan tidak menggantikan
            engineering judgment maupun keputusan operasional blasting engineer.
          </div>
        </div>
      </div>

      {/* ANALISIS TERBARU */}
      {latestAnalysis && (
        <div className="bg-[#111111]/80 backdrop-blur-md rounded-xl border border-[#222222] p-6 shadow-lg">
          {(() => {
            const p = getPercentiles(latestAnalysis);

            const previewImage =
              latestAnalysis.segmentationImageBase64 ||
              latestAnalysis.imageUrl ||
              latestAnalysis.eigenCamImageBase64 ||
              '';

            const targetLabel = latestAnalysis.targetD50
              ? `${latestAnalysis.targetD50.lower}–${latestAnalysis.targetD50.upper} px`
              : 'Belum diisi';

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                        Analisis Terbaru
                      </div>

                      <div className="text-lg font-bold text-white mt-1">
                        {latestAnalysis.blastId}
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1.5 rounded border text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(
                        latestAnalysis.evaluationStatus
                      )}`}
                    >
                      {getStatusLabel(latestAnalysis.evaluationStatus)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectBlast(latestAnalysis)}
                    className="relative w-full h-60 bg-black rounded-xl border border-[#222222] overflow-hidden group text-left"
                  >
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt={latestAnalysis.fileName || latestAnalysis.blastId}
                        className="w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-700">
                        <Layers size={48} />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <div className="text-xs text-gray-300">
                        {latestAnalysis.pitBench}
                      </div>

                      <div className="flex items-center gap-1 text-[#FF7300] text-xs font-bold">
                        <Eye size={14} />
                        Buka Detail
                      </div>
                    </div>
                  </button>
                </div>

                <div className="lg:col-span-7 flex flex-col gap-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <MetricCard
                      label="Fragmen Valid"
                      value={`${latestAnalysis.detectedFragments ?? 0}`}
                    />

                    <MetricCard
                      label="D10"
                      value={p.p10 > 0 ? `${p.p10.toFixed(2)} px` : '—'}
                    />

                    <MetricCard
                      label="D50"
                      value={p.p50 > 0 ? `${p.p50.toFixed(2)} px` : '—'}
                      accent
                    />

                    <MetricCard
                      label="D80"
                      value={p.p80 > 0 ? `${p.p80.toFixed(2)} px` : '—'}
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <MiniInfo
                      label="Target D50"
                      value={targetLabel}
                    />

                    <MiniInfo
                      label="Total Deteksi"
                      value={
                        latestAnalysis.totalDetections !== undefined
                          ? String(latestAnalysis.totalDetections)
                          : '—'
                      }
                    />

                    <MiniInfo
                      label="Excluded QC"
                      value={
                        latestAnalysis.excludedFragments !== undefined
                          ? String(latestAnalysis.excludedFragments)
                          : '—'
                      }
                    />

                    <MiniInfo
                      label="Valid QC"
                      value={
                        latestAnalysis.validPercentage !== undefined
                          ? `${latestAnalysis.validPercentage.toFixed(2)}%`
                          : '—'
                      }
                    />
                  </div>

                  <div className="bg-black border border-[#222222] rounded-xl p-4 flex-1">
                    <div className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2">
                      Rekomendasi DSS
                    </div>

                    <p className="text-sm text-gray-300 leading-relaxed">
                      {latestAnalysis.recommendationQuote ||
                        'Belum tersedia rekomendasi untuk analisis ini.'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* RIWAYAT TERBARU */}
      <div className="bg-[#111111]/80 backdrop-blur-md rounded-xl border border-[#222222] p-6 flex flex-col gap-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
              Data Analisis
            </div>

            <span className="font-bold text-lg text-white">
              Riwayat Analisis Terbaru
            </span>
          </div>

          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold bg-[#000000] px-3 py-1.5 rounded-lg border border-[#222222]">
            {recentAnalyses.length} data terbaru
          </span>
        </div>

        {recentAnalyses.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-[#222222]">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#000000]">
                <tr className="text-gray-500 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-4 px-5 border-b border-[#222222]">
                    Blast ID
                  </th>

                  <th className="py-4 px-5 border-b border-[#222222]">
                    Lokasi Pit
                  </th>

                  <th className="py-4 px-5 border-b border-[#222222]">
                    Tanggal
                  </th>

                  <th className="py-4 px-5 border-b border-[#222222] text-center">
                    Valid
                  </th>

                  <th className="py-4 px-5 border-b border-[#222222] text-center">
                    D10
                  </th>

                  <th className="py-4 px-5 border-b border-[#222222] text-center">
                    D50
                  </th>

                  <th className="py-4 px-5 border-b border-[#222222] text-center">
                    D80
                  </th>

                  <th className="py-4 px-5 border-b border-[#222222]">
                    Status DSS
                  </th>

                  <th className="py-4 px-5 border-b border-[#222222] text-right">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#222222] bg-[#111111]/50">
                {recentAnalyses.map((item) => {
                  const p = getPercentiles(item);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelectBlast(item)}
                      className="hover:bg-[#222222]/50 cursor-pointer transition-colors group"
                    >
                      <td className="py-4 px-5 font-bold text-white group-hover:text-[#FF7300] transition-colors">
                        {item.blastId}
                      </td>

                      <td className="py-4 px-5 text-gray-300 font-medium">
                        {item.pitBench}
                      </td>

                      <td className="py-4 px-5 text-gray-500 text-xs font-bold">
                        {new Date(item.blastDate).toLocaleDateString('id-ID')}
                      </td>

                      <td className="py-4 px-5 text-center text-white font-bold">
                        {item.detectedFragments ?? 0}
                      </td>

                      <td className="py-4 px-5 text-center text-gray-300 tabular-nums">
                        {p.p10 > 0 ? `${p.p10.toFixed(2)} px` : '—'}
                      </td>

                      <td className="py-4 px-5 text-center text-[#FF7300] tabular-nums font-bold">
                        {p.p50 > 0 ? `${p.p50.toFixed(2)} px` : '—'}
                      </td>

                      <td className="py-4 px-5 text-center text-gray-300 tabular-nums">
                        {p.p80 > 0 ? `${p.p80.toFixed(2)} px` : '—'}
                      </td>

                      <td className="py-4 px-5">
                        <span
                          className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(
                            item.evaluationStatus
                          )}`}
                        >
                          {getStatusLabel(item.evaluationStatus)}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          className="text-gray-500 group-hover:text-[#FF7300] font-bold text-xs inline-flex items-center gap-1 transition-colors"
                        >
                          Buka
                          <ChevronRight
                            size={14}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 rounded-xl border border-dashed border-[#222222] bg-black/30 flex flex-col items-center justify-center text-center">
            <Database size={38} className="text-gray-700 mb-3" />

            <div className="text-white font-bold">
              Belum Ada Hasil Analisis
            </div>

            <div className="text-gray-500 text-sm mt-1 max-w-md">
              Jalankan analisis baru untuk menampilkan hasil fragmentasi dari
              FastAPI pada dashboard.
            </div>

            <button
              onClick={onGoToAnalysis}
              className="mt-5 px-5 py-2.5 rounded-lg bg-[#FF7300] text-black font-bold text-xs"
            >
              Mulai Analisis
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const KpiCard: React.FC<{
  label: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
  accent?: boolean;
}> = ({
  label,
  value,
  helper,
  icon,
  accent = false
}) => (
  <div
    className={`rounded-xl p-5 flex flex-col justify-between shadow-lg ${
      accent
        ? 'bg-gradient-to-br from-[#111111] to-[#FF7300]/10 border border-[#FF7300]/30'
        : 'bg-[#111111]/80 backdrop-blur-md border border-[#222222]'
    }`}
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
        {label}
      </span>

      {icon}
    </div>

    <div className="flex items-baseline gap-2 my-2">
      <span
        className={`text-3xl font-bold ${
          accent ? 'text-[#FF7300]' : 'text-white'
        }`}
      >
        {value}
      </span>
    </div>

    <div className="text-[10px] text-gray-600">
      {helper}
    </div>
  </div>
);

const StatusSummary: React.FC<{
  label: string;
  value: number;
  className: string;
}> = ({
  label,
  value,
  className
}) => (
  <div className={`border rounded-xl p-3 ${className}`}>
    <div className="text-[8px] uppercase tracking-wider font-bold opacity-70 truncate">
      {label}
    </div>

    <div className="text-2xl font-bold mt-1">
      {value}
    </div>
  </div>
);

const PipelineRow: React.FC<{
  label: string;
  value: string;
}> = ({
  label,
  value
}) => (
  <div className="flex items-center justify-between gap-4 text-xs">
    <span className="text-gray-500">
      {label}
    </span>

    <span className="text-white font-bold text-right">
      {value}
    </span>
  </div>
);

const MetricCard: React.FC<{
  label: string;
  value: string;
  accent?: boolean;
}> = ({
  label,
  value,
  accent = false
}) => (
  <div
    className={`rounded-xl p-4 ${
      accent
        ? 'bg-[#FF7300]/10 border border-[#FF7300]/30'
        : 'bg-black border border-[#222222]'
    }`}
  >
    <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">
      {label}
    </div>

    <div
      className={`text-xl font-bold mt-2 ${
        accent ? 'text-[#FF7300]' : 'text-white'
      }`}
    >
      {value}
    </div>
  </div>
);

const MiniInfo: React.FC<{
  label: string;
  value: string;
}> = ({
  label,
  value
}) => (
  <div className="bg-black border border-[#222222] rounded-lg p-3">
    <div className="text-[8px] uppercase tracking-wider text-gray-600 font-bold">
      {label}
    </div>

    <div className="text-sm text-white font-bold mt-1">
      {value}
    </div>
  </div>
);
