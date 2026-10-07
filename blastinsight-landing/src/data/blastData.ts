// src/data/blastData.ts
import type { BlastRecord } from '../types';

export const DEFAULT_BLAST: BlastRecord = {
  id: 'blast-023',
  blastId: 'BLAST-2026-023',
  pitBench: 'Pit B - Bench 04',
  blastDate: '2026-09-24',
  geologyFormation: 'Formasi Andesit Keras',
  notes: 'Zona kontak barat, kondisi pasca peledakan kering.',
  fileName: 'pit_b_blast_023.jpg',
  fileSize: '4.2 MB',
  dimensions: '3840 x 2160',
  imageUrl: 'https://images.unsplash.com/photo-1542382156828-59cbb147e8b2?q=80&w=800&auto=format&fit=crop',
  detectedFragments: 132, // Sesuai data QC valid di paper
  oversizePercentage: 18.7,
  oversizeCount: 24,
  oversizeTolerance: 15.0,
  dominantCategory: 'Medium',
  dominantPercentage: 43.0,
  dominantRange: '20 - 50 px',
  evaluationStatus: 'OVERSIZE', // Menggunakan terminologi baru
  statusDetail: 'Nilai D50 melampaui batas atas (Oversize)',
  inferenceTimeMs: 34, // Sesuai paper
  confidence: 0.92,
  backbone: 'YOLO11s-Seg',
  operationalRisk: 'Sedang (Medium Risk)',
  riskLevel: 2,
  alertDescription: 'Geometri peledakan saat ini menghasilkan fragmentasi yang secara rata-rata terlalu kasar.',
  geotechnicalNote: 'Berimplikasi pada perpanjangan siklus loading & keausan crusher.',
  recommendationQuote: 'Kondisi OVERSIZE: Lakukan pengurangan jarak antarlubang ledak (burden & spacing) atau penambahan energi bahan peledak pada desain siklus berikutnya.',
  actionPoints: [
    'Review Powder Factor (PF) pada zona batuan kompak.',
    'Inspeksi burden berlebih di baris pertama peledakan.',
  ],
  sieve: {
    fine: { category: 'fine', label: 'Fine (<20 px)', subLabel: 'material halus', percentage: 14.0, units: 18, colorClass: 'text-gray-500', barColor: '#6b7280' },
    medium: { category: 'medium', label: 'Medium (20-50 px)', subLabel: 'target optimal', percentage: 43.0, units: 56, colorClass: 'text-green-500', barColor: '#22c55e' },
    coarse: { category: 'coarse', label: 'Coarse (50-100 px)', subLabel: 'kasar terkendali', percentage: 24.0, units: 34, colorClass: 'text-[#FF7300]', barColor: '#FF7300' },
    oversize: { category: 'oversize', label: 'Oversize (>100 px)', subLabel: 'boulder kritis', percentage: 19.0, units: 24, colorClass: 'text-red-500', barColor: '#ef4444' }
  },
  percentiles: { 
    p10: 22.01, // Nilai asli paper
    p20: 34.0, 
    p50: 46.61, // Nilai asli paper
    p80: 122.91, // Nilai asli paper
    kuzRamIndex: 1.18 
  },
  polygons: [],
  createdAt: '2026-09-24T14:32:00Z'
};
// src/data/blastData.ts
export const INITIAL_BLAST_HISTORY: BlastRecord[] = [
  DEFAULT_BLAST, // Status: OVERSIZE
  {
    ...DEFAULT_BLAST,
    id: 'blast-024',
    blastId: 'BLAST-2026-024',
    pitBench: 'Pit A - Bench 02',
    blastDate: '2026-09-22',
    geologyFormation: 'Batugamping Terkristalisasi',
    evaluationStatus: 'OPTIMAL',
    statusDetail: 'Distribusi fragmen sesuai spesifikasi desain',
    oversizePercentage: 8.4,
    percentiles: { p10: 15.2, p20: 18.0, p50: 32.1, p80: 58.0, kuzRamIndex: 1.45 },
    recommendationQuote: 'Kondisi OPTIMAL: Pertahankan parameter burden, spacing, dan stemming ratio saat ini.'
  },
  {
    ...DEFAULT_BLAST,
    id: 'blast-022',
    blastId: 'BLAST-2026-022',
    pitBench: 'Pit C - Bench 01',
    blastDate: '2026-09-20',
    geologyFormation: 'Formasi Diorit Masif',
    evaluationStatus: 'OVER-BREAKING', // Status disesuaikan
    statusDetail: 'Nilai D50 di bawah batas bawah (Over-breaking)',
    oversizePercentage: 2.5,
    percentiles: { p10: 8.5, p20: 12.0, p50: 18.4, p80: 42.0, kuzRamIndex: 0.92 },
    alertDescription: 'Fragmentasi berlebih berpotensi menimbulkan inefisiensi energi dan risiko backbreak.',
    recommendationQuote: 'Kondisi OVER-BREAKING: Lakukan pelebaran geometri peledakan guna mengoptimalkan distribusi energi.'
  }
];

export const DEMO_PRESETS = [
  { name: 'Pit B - Bench 04', blastId: 'BLAST-2026-023', pitBench: 'Pit B - Bench 04', formation: 'Andesit Keras', date: '2026-09-24', status: 'OVERSIZE', recordId: 'blast-023' },
  { name: 'Pit A - Bench 02', blastId: 'BLAST-2026-024', pitBench: 'Pit A - Bench 02', formation: 'Batugamping', date: '2026-09-22', status: 'OPTIMAL', recordId: 'blast-024' },
  { name: 'Pit C - Bench 01', blastId: 'BLAST-2026-022', pitBench: 'Pit C - Bench 01', formation: 'Diorit Masif', date: '2026-09-20', status: 'OVER-BREAKING', recordId: 'blast-022' }
];