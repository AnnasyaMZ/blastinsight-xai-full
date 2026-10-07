// src/types.ts
export interface BlastPolygon {
  id: string;
  category: 'Oversize' | 'Medium' | 'Coarse' | 'Fine';
  sizePx: number; 
  confidence: number;
  type: 'polygon' | 'circle';
  points?: string;
  cx?: number;
  cy?: number;
  r?: number;
  labelX: number;
  labelY: number;
  labelText: string;
  color: string;
  fillColor: string;
  dashed?: boolean;
}

export interface SieveItem {
  category: 'fine' | 'medium' | 'coarse' | 'oversize';
  label: string;
  subLabel: string;
  percentage: number;
  units: number;
  colorClass: string;
  barColor: string;
}
export interface BlastRecord {
  id: string;

  // =========================================================
  // IDENTITAS ANALISIS
  // =========================================================

  blastId: string;
  pitBench: string;
  blastDate: string;
  geologyFormation: string;
  notes: string;

  fileName: string;
  fileSize: string;
  dimensions: string;

  // Original image.
  // Saat baru upload bisa blob:, setelah disimpan menjadi URL Supabase.
  imageUrl: string;

  // =========================================================
  // HASIL VISUAL FASTAPI
  // =========================================================

  // Bisa berupa Base64 dari FastAPI atau URL permanen Supabase Storage.
  segmentationImageBase64?: string;

  // Bisa berupa Base64 dari FastAPI atau URL permanen Supabase Storage.
  eigenCamImageBase64?: string;

  // =========================================================
  // DISTRIBUSI FRAGMENTASI
  // =========================================================

  distributionCurve?: Array<{
    diameter_px: number;
    cumulative_area_percent: number;
  }>;

  percentiles: {
    p10?: number;
    p20?: number;

    // D50
    p50: number;

    // D80
    p80: number;

    // Legacy / prototype lama.
    kuzRamIndex: number;
  };

  // =========================================================
  // QUALITY CONTROL
  // =========================================================

  // Semua deteksi sebelum QC.
  totalDetections?: number;

  // Fragmen yang lolos QC.
  detectedFragments: number;

  // Fragmen yang dikeluarkan QC.
  excludedFragments?: number;

  // Persentase fragmen valid setelah QC.
  validPercentage?: number;

  qc?: {
    confidence_threshold?: number;
    edge_touching_excluded?: number;
    low_confidence_excluded?: number;
  };

  // =========================================================
  // TARGET D50 OPERASIONAL
  // =========================================================

  targetD50?: {
    lower: number;
    upper: number;
  };

  // =========================================================
  // DECISION SUPPORT SYSTEM
  // =========================================================

  /*
    Tiga status utama penelitian:
    OPTIMAL
    OVERSIZE
    OVER-BREAKING

    NEEDS_TARGET dan UNAVAILABLE hanya status teknis backend.
    Keduanya tidak perlu ditampilkan sebagai kategori utama UI.
  */
  evaluationStatus:
    | 'OPTIMAL'
    | 'OVERSIZE'
    | 'OVER-BREAKING'
    | 'NEEDS_TARGET'
    | 'UNAVAILABLE';

  statusDetail: string;

  recommendationQuote: string;

  actionPoints: string[];

  // =========================================================
  // MODEL / INFERENCE
  // =========================================================

  inferenceTimeMs: number;
  confidence: number;
  backbone: string;

  // =========================================================
  // METADATA / INFORMASI OPERASIONAL
  // =========================================================

  geotechnicalNote: string;

  operationalRisk: string;

  riskLevel: 1 | 2 | 3;

  alertDescription: string;

  // =========================================================
  // LEGACY PROTOTYPE FIELDS
  // =========================================================

  /*
    Field ini dipertahankan agar data/mockup lama tidak error.
    JANGAN digunakan untuk menentukan DSS final.
  */
  oversizePercentage: number;
  oversizeCount: number;
  oversizeTolerance: number;

  dominantCategory: string;
  dominantPercentage: number;
  dominantRange: string;

  sieve: {
    fine: SieveItem;
    medium: SieveItem;
    coarse: SieveItem;
    oversize: SieveItem;
  };

  polygons: BlastPolygon[];

  createdAt: string;
}

export type ActiveNav =
  | 'dashboard'
  | 'analisis-baru'
  | 'riwayat'
  | 'tentang-sistem';

export type ViewerLayer =
  | 'segmentation'
  | 'original'
  | 'eigencam';