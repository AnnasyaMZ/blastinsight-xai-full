// src/data/blastData.ts
import type { BlastRecord } from '../types';

export const DEFAULT_BLAST: BlastRecord = {
  id: 'blast-023',
  blastId: 'BLAST-2026-023',
  pitBench: 'Pit B - Bench 04',
  blastDate: '2026-09-24',
  geologyFormation: 'Formasi Andesit Keras',
  notes: 'Zona kontak barat, elevasi bench +320 RL, kondisi pasca peledakan kering.',
  fileName: 'pit_b_blast_023.jpg',
  fileSize: '4.2 MB',
  dimensions: '3840 x 2160',
  imageUrl: 'https://images.unsplash.com/photo-1542382156828-59cbb147e8b2?q=80&w=800&auto=format&fit=crop',
  detectedFragments: 247,
  oversizePercentage: 18.7,
  oversizeCount: 46,
  oversizeTolerance: 15.0,
  dominantCategory: 'Medium',
  dominantPercentage: 43.0,
  dominantRange: '20 - 50 cm',
  evaluationStatus: 'Perlu Evaluasi',
  statusDetail: 'Divergensi target fragmentasi',
  inferenceTimeMs: 34,
  confidence: 0.92,
  backbone: 'CSP-Darknet11',
  operationalRisk: 'Sedang (Medium Risk)',
  riskLevel: 2,
  alertDescription: 'Sistem mendeteksi proporsi fragmen besar yang relatif tinggi (18,7%).',
  geotechnicalNote: 'Catatan Geoteknik: Rekomendasi pengecekan visual di area toe dan crest.',
  recommendationQuote: 'Pertimbangkan untuk melakukan evaluasi terhadap konfigurasi burden dan spacing.',
  actionPoints: [
    'Review Powder Factor (PF) pada zona batuan kompak.',
    'Inspeksi burden berlebih di baris pertama peledakan (toe burden check).',
  ],
  sieve: {
    fine: { category: 'fine', label: 'Fine (<20 cm)', subLabel: 'material halus / fines', percentage: 14.0, units: 35, colorClass: 'text-[#a08e7a]', barColor: '#a08e7a' },
    medium: { category: 'medium', label: 'Medium (20-50 cm) - Target Optimal', subLabel: 'fraksi ideal crusher', percentage: 43.0, units: 106, colorClass: 'text-[#4ae176]', barColor: '#4ae176' },
    coarse: { category: 'coarse', label: 'Coarse (50-100 cm)', subLabel: 'fraksi kasar terkendali', percentage: 24.0, units: 60, colorClass: 'text-[#FF7300]', barColor: '#FF7300' },
    oversize: { category: 'oversize', label: 'Oversize (>100 cm) - Secondary Blasting Needed', subLabel: 'boulder melampaui batas', percentage: 19.0, units: 46, colorClass: 'text-red-500', barColor: '#ef4444' }
  },
  percentiles: { p20: 22, p50: 38.4, p80: 89, kuzRamIndex: 1.18 },
  polygons: [],
  createdAt: '2026-09-24T14:32:00Z'
};

export const INITIAL_BLAST_HISTORY: BlastRecord[] = [
  DEFAULT_BLAST,
  {
    ...DEFAULT_BLAST,
    id: 'blast-024',
    blastId: 'BLAST-2026-024',
    pitBench: 'Pit A - Bench 02',
    blastDate: '2026-09-22',
    evaluationStatus: 'Optimal',
    oversizePercentage: 8.4,
    percentiles: { p20: 18, p50: 32.1, p80: 58, kuzRamIndex: 1.45 }
  },
  {
    ...DEFAULT_BLAST,
    id: 'blast-022',
    blastId: 'BLAST-2026-022',
    pitBench: 'Pit C - Bench 01',
    blastDate: '2026-09-20',
    evaluationStatus: 'Kritis',
    oversizePercentage: 28.5,
    percentiles: { p20: 34, p50: 64.2, p80: 114, kuzRamIndex: 0.92 }
  }
];

export const DEMO_PRESETS = [
  { name: 'Pit B - Bench 04', blastId: 'BLAST-2026-023', pitBench: 'Pit B - Bench 04', formation: 'Formasi Andesit Keras', date: '2026-09-24', status: 'Perlu Evaluasi', recordId: 'blast-023' },
  { name: 'Pit A - Bench 02', blastId: 'BLAST-2026-024', pitBench: 'Pit A - Bench 02', formation: 'Batugamping Terkristalisasi', date: '2026-09-22', status: 'Optimal', recordId: 'blast-024' },
  { name: 'Pit C - Bench 01', blastId: 'BLAST-2026-022', pitBench: 'Pit C - Bench 01', formation: 'Formasi Diorit Masif', date: '2026-09-20', status: 'Kritis', recordId: 'blast-022' }
];