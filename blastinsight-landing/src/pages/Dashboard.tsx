import { useCallback, useEffect, useState } from 'react';
import type { ActiveNav, BlastRecord } from '../types';
import { DEFAULT_BLAST, INITIAL_BLAST_HISTORY } from '../data/blastData';
import { Sidebar } from '../components/Sidebar';
import { AnalysisView } from '../components/AnalysisView';
import { DashboardView } from '../components/DashboardView';
import { HistoryView } from '../components/HistoryView';
import { AboutView } from '../components/AboutView';
import { supabase } from '../lib/supabaseClient';

/*
  IMPORTANT:
  - Sesuaikan nama bucket ini jika bucket Supabase Storage milikmu berbeda.
  - Bucket harus PUBLIC jika URL disimpan dengan getPublicUrl().
*/
const STORAGE_BUCKET = 'blast-analysis';

type DistributionPoint = {
  diameter_px: number;
  cumulative_area_percent: number;
};

type ExtendedBlastRecord = BlastRecord & {
  segmentationImageBase64?: string;
  eigenCamImageBase64?: string;

  distributionCurve?: DistributionPoint[];

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

const toNumberOrZero = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const toNumberOrUndefined = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
};

const sanitizeFilePart = (value: string) =>
  value
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'blast';

const extensionFromMime = (mime: string) => {
  if (mime.includes('png')) return 'png';
  if (mime.includes('webp')) return 'webp';
  return 'jpg';
};

const isSupabaseStorageUrl = (value?: string) =>
  Boolean(
    value &&
      value.startsWith('http') &&
      value.includes('/storage/v1/object/')
  );

/*
  Menyimpan source gambar blob:/data: ke Supabase Storage.
  Jika source sudah berupa URL Supabase Storage, URL lama dipakai kembali.
*/
const persistImageToStorage = async (
  source: string | undefined,
  blastId: string,
  variant: 'original' | 'segmentation' | 'eigencam'
) => {
  if (!source) return null;

  if (isSupabaseStorageUrl(source)) {
    return source;
  }

  /*
    URL eksternal lama (mis. Unsplash) tidak dipaksa di-upload ulang.
    Untuk analisis baru, original biasanya blob: dan output AI berupa data:.
  */
  if (
    source.startsWith('http') &&
    !source.startsWith('blob:') &&
    !source.startsWith('data:')
  ) {
    return source;
  }

  const response = await fetch(source);

  if (!response.ok) {
    throw new Error(`Gagal membaca gambar ${variant}.`);
  }

  const blob = await response.blob();
  const extension = extensionFromMime(blob.type || 'image/jpeg');
  const safeBlastId = sanitizeFilePart(blastId);
  const stamp = Date.now();

  const path =
    `${safeBlastId}/${stamp}/${variant}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, blob, {
      contentType: blob.type || 'image/jpeg',
      cacheControl: '3600',
      upsert: true
    });

  if (uploadError) {
    throw new Error(
      `Upload ${variant} ke Supabase Storage gagal: ${uploadError.message}`
    );
  }

  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
};

/*
  Status DSS:
  1. Prioritas pertama: status yang sudah dihasilkan FastAPI.
  2. Fallback hanya jika row lama belum punya evaluation_status tetapi
     D50 + target bawah/atas tersedia.
  3. TIDAK PERNAH memakai oversize_percentage.
*/
const resolveEvaluationStatus = (
  storedStatus: unknown,
  d50: number,
  lower?: number,
  upper?: number
) => {
  const normalized = String(storedStatus ?? '').toUpperCase();

  if (
    normalized === 'OPTIMAL' ||
    normalized === 'OVERSIZE' ||
    normalized === 'OVER-BREAKING' ||
    normalized === 'NEEDS_TARGET' ||
    normalized === 'UNAVAILABLE'
  ) {
    return normalized;
  }

  if (
    d50 > 0 &&
    lower !== undefined &&
    upper !== undefined &&
    lower < upper
  ) {
    if (d50 > upper) return 'OVERSIZE';
    if (d50 < lower) return 'OVER-BREAKING';
    return 'OPTIMAL';
  }

  return 'UNAVAILABLE';
};

export default function Dashboard() {
  const [activeNav, setActiveNav] =
    useState<ActiveNav>('dashboard');

  const [currentBlast, setCurrentBlast] =
    useState<BlastRecord>(DEFAULT_BLAST);

  /*
    History dimulai KOSONG.
    Jangan lagi menjadikan INITIAL_BLAST_HISTORY sebagai data dashboard,
    supaya KPI tidak bercampur dengan data demo.
  */
  const [history, setHistory] =
    useState<BlastRecord[]>([]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  const [historyBlastToOpen, setHistoryBlastToOpen] =
    useState<BlastRecord | null>(null);

  const mapRowToBlastRecord = useCallback(
    (row: any): BlastRecord => {
      const id = String(row.id);

      const d10 = toNumberOrZero(row.d10_score);
      const d50 = toNumberOrZero(row.d50_score);
      const d80 = toNumberOrZero(row.d80_score);

      const targetLower =
        toNumberOrUndefined(row.target_d50_lower);

      const targetUpper =
        toNumberOrUndefined(row.target_d50_upper);

      const evaluationStatus = resolveEvaluationStatus(
        row.evaluation_status,
        d50,
        targetLower,
        targetUpper
      );

      const extendedRecord: ExtendedBlastRecord = {
        ...DEFAULT_BLAST,

        id,

        blastId:
          row.blast_id ||
          `BLAST-${id.slice(0, 4).toUpperCase()}`,

        pitBench:
          row.location ||
          'Area Tidak Diketahui',

        blastDate:
          row.blast_date ||
          row.created_at,

        geologyFormation:
          row.geology_formation ||
          DEFAULT_BLAST.geologyFormation,

        fileName:
          row.file_name ||
          'Citra fragmentasi',

        /*
          URL ini sekarang harus URL permanen Supabase Storage.
          Blob URL lama tetap bisa terbaca dari DB, tetapi setelah reload
          memang tidak valid. Record lama sebaiknya dianalisis/simpan ulang.
        */
        imageUrl:
          row.original_image_url ||
          '',

        detectedFragments:
          toNumberOrZero(
            row.valid_fragments ??
            row.detected_fragments
          ),

        /*
          Legacy field dipertahankan hanya agar shape BlastRecord lama
          tidak rusak. TIDAK dipakai untuk DSS.
        */
        oversizePercentage:
          toNumberOrZero(row.oversize_percentage),

        evaluationStatus:
          evaluationStatus as BlastRecord['evaluationStatus'],

        statusDetail:
          row.status_detail ||
          (
            evaluationStatus === 'NEEDS_TARGET'
              ? 'Target D50 belum ditentukan.'
              : evaluationStatus === 'UNAVAILABLE'
                ? 'Evaluasi DSS belum tersedia.'
                : `Hasil Evaluasi D50: ${d50.toFixed(2)} px`
          ),

        recommendationQuote:
          row.ai_recommendation ||
          'Belum tersedia rekomendasi.',

        actionPoints:
          Array.isArray(row.action_points)
            ? row.action_points
            : [],

        percentiles: {
          ...DEFAULT_BLAST.percentiles,
          p10: d10,
          p50: d50,
          p80: d80
        },

        createdAt:
          row.created_at,

        segmentationImageBase64:
          row.mask_image_url ||
          undefined,

        eigenCamImageBase64:
          row.eigencam_image_url ||
          undefined,

        distributionCurve:
          Array.isArray(row.distribution_curve)
            ? row.distribution_curve
            : [],

        totalDetections:
          toNumberOrUndefined(
            row.total_detections
          ),

        excludedFragments:
          toNumberOrUndefined(
            row.excluded_fragments
          ),

        validPercentage:
          toNumberOrUndefined(
            row.valid_percentage
          ),

        qc: {
          confidence_threshold:
            toNumberOrUndefined(
              row.qc_confidence_threshold
            ) ?? 0.40,

          edge_touching_excluded:
            toNumberOrUndefined(
              row.edge_touching_excluded
            ),

          low_confidence_excluded:
            toNumberOrUndefined(
              row.low_confidence_excluded
            )
        },

        targetD50:
          targetLower !== undefined &&
          targetUpper !== undefined
            ? {
                lower: targetLower,
                upper: targetUpper
              }
            : undefined
      };

      return extendedRecord;
    },
    []
  );

  const fetchHistoryFromDB =
    useCallback(async () => {
      const { data, error } = await supabase
        .from('blast_records')
        .select('*')
        .order('created_at', {
          ascending: false
        });

      if (error) {
        console.error(
          'Gagal mengambil history Supabase:',
          error
        );
        return;
      }

      const mappedHistory =
        (data ?? []).map(mapRowToBlastRecord);

      setHistory(mappedHistory);
    }, [mapRowToBlastRecord]);

  useEffect(() => {
    fetchHistoryFromDB();

    /*
      Realtime Supabase:
      Dashboard/history ikut refresh jika ada INSERT/UPDATE/DELETE.
      Pastikan Realtime untuk table blast_records diaktifkan di Supabase
      jika ingin update antar-tab/perangkat secara live.
    */
    const channel = supabase
      .channel('blast-records-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blast_records'
        },
        () => {
          fetchHistoryFromDB();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchHistoryFromDB]);

  const handleSaveToHistory =
    async (recordToSave: BlastRecord) => {
      try {
        const record =
          recordToSave as ExtendedBlastRecord;

        const p10 =
          toNumberOrZero(
            (record.percentiles as any)?.p10
          );

        const p50 =
          toNumberOrZero(
            record.percentiles?.p50
          );

        const p80 =
          toNumberOrZero(
            record.percentiles?.p80
          );

        const targetLower =
          toNumberOrUndefined(
            record.targetD50?.lower
          );

        const targetUpper =
          toNumberOrUndefined(
            record.targetD50?.upper
          );

        /*
          Status dari FastAPI adalah source of truth.
          Kalau status teknis belum tersedia tetapi target lengkap,
          fallback dihitung dari D50 vs target.
        */
        const evaluationStatus =
          resolveEvaluationStatus(
            record.evaluationStatus,
            p50,
            targetLower,
            targetUpper
          );

        /*
          1. Simpan ketiga gambar terlebih dahulu.
          - original: blob URL browser
          - segmentation: data:image/... base64 dari FastAPI
          - eigencam: data:image/... base64 dari FastAPI
        */
        const [
          originalImageUrl,
          segmentationImageUrl,
          eigenCamImageUrl
        ] = await Promise.all([
          persistImageToStorage(
            record.imageUrl,
            record.blastId,
            'original'
          ),

          persistImageToStorage(
            record.segmentationImageBase64,
            record.blastId,
            'segmentation'
          ),

          persistImageToStorage(
            record.eigenCamImageBase64,
            record.blastId,
            'eigencam'
          )
        ]);

        /*
          2. Simpan metadata/hasil numerik ke Postgres.
          oversize_percentage TIDAK lagi digunakan sebagai basis DSS.
        */
        const payload = {
          blast_id:
            record.blastId,

          location:
            record.pitBench,

          blast_date:
            record.blastDate,

          geology_formation:
            record.geologyFormation,

          file_name:
            record.fileName,

          d10_score:
            p10,

          d50_score:
            p50,

          d80_score:
            p80,

          valid_fragments:
            Number(
              record.detectedFragments ?? 0
            ),

          total_detections:
            record.totalDetections ?? null,

          excluded_fragments:
            record.excludedFragments ?? null,

          valid_percentage:
            record.validPercentage ?? null,

          qc_confidence_threshold:
            record.qc?.confidence_threshold ?? 0.40,

          edge_touching_excluded:
            record.qc?.edge_touching_excluded ?? null,

          low_confidence_excluded:
            record.qc?.low_confidence_excluded ?? null,

          target_d50_lower:
            targetLower ?? null,

          target_d50_upper:
            targetUpper ?? null,

          evaluation_status:
            evaluationStatus,

          status_detail:
            record.statusDetail ?? null,

          ai_recommendation:
            record.recommendationQuote ?? null,

          action_points:
            record.actionPoints ?? [],

          distribution_curve:
            record.distributionCurve ?? [],

          original_image_url:
            originalImageUrl,

          mask_image_url:
            segmentationImageUrl,

          eigencam_image_url:
            eigenCamImageUrl
        };

        const {
          data,
          error
        } = await supabase
          .from('blast_records')
          .insert([payload])
          .select('*')
          .single();

        if (error) {
          throw error;
        }

        /*
          3. Gunakan row yang benar-benar tersimpan di DB
          untuk memperbarui React state.
        */
        const savedRecord =
          mapRowToBlastRecord(data);

        setHistory((prev) => [
          savedRecord,
          ...prev.filter(
            (item) =>
              item.id !== savedRecord.id &&
              item.blastId !== savedRecord.blastId
          )
        ]);

        setCurrentBlast(savedRecord);

        console.info(
          'Analisis berhasil disimpan:',
          savedRecord.blastId
        );
      } catch (error) {
        console.error(
          'Gagal menyimpan analisis:',
          error
        );

        /*
          Penting:
          Jangan memasukkan record ke history secara optimistik ketika
          upload/insert gagal, supaya UI tidak menampilkan data yang
          sebenarnya belum permanen.
        */
        throw error;
      }
    };

  const handleSelectPresetRecord =
    (recordId: string) => {
      /*
        Preset demo tetap boleh berasal dari blastData,
        tetapi tidak ikut dihitung sebagai history/dashboard
        sampai user menyimpannya.
      */
      const found =
        history.find(
          (item) => item.id === recordId
        ) ||
        INITIAL_BLAST_HISTORY.find(
          (item) => item.id === recordId
        ) ||
        DEFAULT_BLAST;

      setCurrentBlast(found);
    };

  const handleOpenHistoryDetail =
    (blast: BlastRecord) => {
      setCurrentBlast(blast);
      setHistoryBlastToOpen(blast);
      setActiveNav('riwayat');
    };

  const handleHistoryModalOpened = () => {
    setHistoryBlastToOpen(null);
  };

  return (
    <div className="min-h-screen bg-black text-[#F8FAFC] font-sans flex selection:bg-[#FF7300] selection:text-black relative overflow-hidden">
      <style>{`
        @keyframes fadeSlideUp {
          0% {
            opacity: 0;
            transform: translateY(15px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-slide {
          animation: fadeSlideUp .4s ease-out forwards;
        }
      `}</style>

      <div className="fixed top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#FF7300]/15 blur-[120px] rounded-full pointer-events-none z-0" />

      <div className="fixed bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-[#22C55E]/10 blur-[120px] rounded-full pointer-events-none z-0" />

      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() =>
          setIsMobileMenuOpen(false)
        }
      />

      <div className="lg:pl-72 flex flex-col flex-1 min-h-screen w-full min-w-0 relative z-10 transition-all duration-300">
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-[#222] bg-black/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="BlastInsight-XAI"
              className="h-7 w-auto object-contain"
            />

            <span className="font-bold text-[14px]">
              BlastInsight-XAI
            </span>
          </div>

          <button
            onClick={() =>
              setIsMobileMenuOpen(true)
            }
            className="p-1.5 rounded-lg text-[#A3A3A3] hover:text-white hover:bg-[#111] border border-[#222] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              menu
            </span>
          </button>
        </div>

        <main className="w-full flex-1 bg-transparent">
          {activeNav === 'dashboard' && (
            <DashboardView
              history={history}
              onSelectBlast={
                handleOpenHistoryDetail
              }
              onGoToAnalysis={() =>
                setActiveNav(
                  'analisis-baru'
                )
              }
            />
          )}

          {activeNav ===
            'analisis-baru' && (
            <AnalysisView
              currentBlast={
                currentBlast
              }
              setCurrentBlast={
                setCurrentBlast
              }
              onSaveToHistory={
                handleSaveToHistory
              }
              onSelectPresetRecord={
                handleSelectPresetRecord
              }
            />
          )}

          {activeNav === 'riwayat' && (
            <HistoryView
              history={history}
              onSelectBlast={
                setCurrentBlast
              }
              onGoToAnalysis={() =>
                setActiveNav(
                  'analisis-baru'
                )
              }
              initialSelectedBlast={
                historyBlastToOpen
              }
              onInitialSelectedBlastHandled={
                handleHistoryModalOpened
              }
            />
          )}

          {activeNav ===
            'tentang-sistem' && (
            <AboutView />
          )}
        </main>
      </div>
    </div>
  );
}
