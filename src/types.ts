export interface BlastPolygon {
  id: string;
  category: 'Oversize' | 'Medium' | 'Coarse' | 'Fine';
  sizeCm: number;
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
  blastId: string;
  pitBench: string;
  blastDate: string;
  geologyFormation: string;
  notes: string;
  fileName: string;
  fileSize: string;
  dimensions: string;
  imageUrl: string;
  detectedFragments: number;
  oversizePercentage: number;
  oversizeCount: number;
  oversizeTolerance: number;
  dominantCategory: string;
  dominantPercentage: number;
  dominantRange: string;
  evaluationStatus: 'Perlu Evaluasi' | 'Optimal' | 'Kritis';
  statusDetail: string;
  inferenceTimeMs: number;
  confidence: number;
  backbone: string;
  operationalRisk: string;
  riskLevel: 1 | 2 | 3; // 1: Low, 2: Medium, 3: High
  alertDescription: string;
  geotechnicalNote: string;
  recommendationQuote: string;
  actionPoints: string[];
  sieve: {
    fine: SieveItem;
    medium: SieveItem;
    coarse: SieveItem;
    oversize: SieveItem;
  };
  percentiles: {
    p20: number;
    p50: number;
    p80: number;
    kuzRamIndex: number;
  };
  polygons: BlastPolygon[];
  createdAt: string;
}

export type ActiveNav = 'dashboard' | 'analisis-baru' | 'riwayat' | 'tentang-sistem';
export type ViewerLayer = 'segmentation' | 'original' | 'eigencam';
