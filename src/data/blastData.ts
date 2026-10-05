import { BlastRecord } from '../types';

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
  imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTuHE31QXqAh9PoDmW6Y9Cp7m1Bkf5eDinVCnF57x-DR9S3YQT2FbeMagRW8jI6SRWN4nVkwwhxWAWGHOhuog9Cn6kqZRz9C1E1kUMvFPHH3B-jSXICf-m_FaFAateqtxqg8Yuf6WOO_ES8W87fJ0rPNrUz4Rtb8joePt45h7aSA8_59lDcwwLtF6uBwsIkxKaLwPOlqonqWzag8Frbw-a6Uo7e3Jw8EWnDO0Hx49frby-O16N9krB',
  detectedFragments: 247,
  oversizePercentage: 18.7,
  oversizeCount: 46,
  oversizeTolerance: 15.0,
  dominantCategory: 'Medium',
  dominantPercentage: 43.0,
  dominantRange: '20 — 50 cm',
  evaluationStatus: 'Perlu Evaluasi',
  statusDetail: 'Divergensi target fragmentasi',
  inferenceTimeMs: 34,
  confidence: 0.92,
  backbone: 'CSP-Darknet11',
  operationalRisk: 'Sedang (Medium Risk)',
  riskLevel: 2,
  alertDescription: 'Sistem mendeteksi proporsi fragmen besar yang relatif tinggi (18,7%) dan berpotensi menghambat proses muat (loading) pada excavator kelas 100-ton serta berisiko menyebabkan penyumbatan (bridging) pada primary jaw crusher.',
  geotechnicalNote: 'Catatan Geoteknik: Rekomendasi pengecekan visual di area toe dan crest muckpile sebelum pemuatan unit loader dimulai.',
  recommendationQuote: '“Pertimbangkan untuk melakukan evaluasi terhadap konfigurasi burden dan spacing, distribusi energi peledakan, serta kondisi geologi pada area tersebut.”',
  actionPoints: [
    'Review Powder Factor (PF) pada zona batuan kompak (usulan penyesuaian: +0.03 kg/m³).',
    'Inspeksi burden berlebih di baris pertama peledakan (toe burden check).',
    'Validasi melalui inspeksi lapangan sebelum melakukan perubahan desain peledakan operasional.'
  ],
  sieve: {
    fine: {
      category: 'fine',
      label: 'Fine (<20 cm)',
      subLabel: 'material halus / fines',
      percentage: 14.0,
      units: 35,
      colorClass: 'text-[#a08e7a]',
      barColor: '#a08e7a'
    },
    medium: {
      category: 'medium',
      label: 'Medium (20 – 50 cm) — Target Optimal',
      subLabel: 'fraksi ideal crusher',
      percentage: 43.0,
      units: 106,
      colorClass: 'text-[#4ae176]',
      barColor: '#4ae176'
    },
    coarse: {
      category: 'coarse',
      label: 'Coarse (50 – 100 cm)',
      subLabel: 'fraksi kasar terkendali',
      percentage: 24.0,
      units: 60,
      colorClass: 'text-[#f59e0b]',
      barColor: '#f59e0b'
    },
    oversize: {
      category: 'oversize',
      label: 'Oversize (>100 cm) — Secondary Blasting Needed',
      subLabel: 'boulder melampaui batas',
      percentage: 19.0,
      units: 46,
      colorClass: 'text-[#ffb4ab]',
      barColor: '#ffb4ab'
    }
  },
  percentiles: {
    p20: 22,
    p50: 38.4,
    p80: 89,
    kuzRamIndex: 1.18
  },
  polygons: [
    {
      id: 'poly-1',
      category: 'Oversize',
      sizeCm: 124,
      confidence: 0.94,
      type: 'polygon',
      points: '380,360 480,340 520,420 460,490 390,470 350,400',
      labelX: 365,
      labelY: 325,
      labelText: 'OVERSIZE: 124cm [0.94]',
      color: '#EF4444',
      fillColor: 'rgba(239, 68, 68, 0.35)',
      dashed: true
    },
    {
      id: 'poly-2',
      category: 'Medium',
      sizeCm: 42,
      confidence: 0.91,
      type: 'polygon',
      points: '540,280 620,290 640,360 580,390 530,340',
      labelX: 540,
      labelY: 262,
      labelText: 'MEDIUM: 42cm [0.91]',
      color: '#4ae176',
      fillColor: 'rgba(74, 225, 118, 0.35)',
      dashed: false
    },
    {
      id: 'poly-3',
      category: 'Coarse',
      sizeCm: 78,
      confidence: 0.89,
      type: 'polygon',
      points: '210,410 320,400 340,480 270,540 180,490',
      labelX: 200,
      labelY: 385,
      labelText: 'COARSE: 78cm [0.89]',
      color: '#F59E0B',
      fillColor: 'rgba(245, 158, 11, 0.35)',
      dashed: false
    },
    {
      id: 'poly-4',
      category: 'Oversize',
      sizeCm: 112,
      confidence: 0.96,
      type: 'polygon',
      points: '680,380 790,390 820,480 760,530 670,470',
      labelX: 680,
      labelY: 360,
      labelText: 'OVERSIZE: 112cm [0.96]',
      color: '#EF4444',
      fillColor: 'rgba(239, 68, 68, 0.35)',
      dashed: true
    },
    {
      id: 'circle-1',
      category: 'Fine',
      sizeCm: 18,
      confidence: 0.85,
      type: 'circle',
      cx: 500,
      cy: 510,
      r: 18,
      labelX: 470,
      labelY: 535,
      labelText: 'FINE: 18cm',
      color: '#d8c3ad',
      fillColor: 'rgba(160, 142, 122, 0.4)'
    },
    {
      id: 'circle-2',
      category: 'Fine',
      sizeCm: 14,
      confidence: 0.82,
      type: 'circle',
      cx: 535,
      cy: 525,
      r: 14,
      labelX: 520,
      labelY: 545,
      labelText: 'FINE: 14cm',
      color: '#d8c3ad',
      fillColor: 'rgba(160, 142, 122, 0.4)'
    },
    {
      id: 'circle-3',
      category: 'Fine',
      sizeCm: 12,
      confidence: 0.88,
      type: 'circle',
      cx: 520,
      cy: 495,
      r: 12,
      labelX: 510,
      labelY: 480,
      labelText: 'FINE: 12cm',
      color: '#d8c3ad',
      fillColor: 'rgba(160, 142, 122, 0.4)'
    }
  ],
  createdAt: '2026-09-24T14:32:00Z'
};

export const INITIAL_BLAST_HISTORY: BlastRecord[] = [
  DEFAULT_BLAST,
  {
    id: 'blast-024',
    blastId: 'BLAST-2026-024',
    pitBench: 'Pit A - Bench 02',
    blastDate: '2026-09-22',
    geologyFormation: 'Batugamping Terkristalisasi',
    notes: 'Kondisi formasi rekahan rapat, blasting pola staggered pattern, hasil sangat seragam.',
    fileName: 'pit_a_blast_024.jpg',
    fileSize: '3.8 MB',
    dimensions: '3840 x 2160',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDR0z5j4OVYMMDi-_RAUM6CSxfwko3IR8KVYqgl8nxlK-9hstp3at0FmT9UVVRXiB_dNdRmlqW7_U0PQyLRgFZVBDdWxlXrqQazZKUD1I6gm2tvvcm4oPGgiOuK4g5VRe508NOB9jHHm-sHtn8N6mEwMYR_h_bJbB-OwFZokbAYzirTaQJXoiRQO4sS1m4S0WWuL3X9oTQZ8UPXHqogxKN2Djb5QM5sNmJxbQ4c6Bz_i5VAQudmO8jS',
    detectedFragments: 312,
    oversizePercentage: 8.4,
    oversizeCount: 26,
    oversizeTolerance: 15.0,
    dominantCategory: 'Medium',
    dominantPercentage: 58.2,
    dominantRange: '20 — 50 cm',
    evaluationStatus: 'Optimal',
    statusDetail: 'Sesuai spesifikasi desain peledakan',
    inferenceTimeMs: 29,
    confidence: 0.95,
    backbone: 'CSP-Darknet11',
    operationalRisk: 'Rendah (Low Risk)',
    riskLevel: 1,
    alertDescription: 'Distribusi fragmentasi berada dalam spektrum kurva distribusi ideal. Rasio oversize 8.4% jauh di bawah ambang batas kritis (≤15.0%).',
    geotechnicalNote: 'Catatan Geoteknik: Muckpile stabil dengan sudut henti 36°, aman untuk pemuatan fleet excavator.',
    recommendationQuote: '“Pertahankan parameter burden, spacing, dan stemming ratio saat ini untuk blok peledakan berikutnya pada litologi batuan serupa.”',
    actionPoints: [
      'Pertahankan Powder Factor saat ini (0.42 kg/m³).',
      'Dokumentasikan waktu siklus muat excavator sebagai data pembanding.',
      'Lanjutkan ke sequence peledakan bench 03 dengan pola inisiasi sama.'
    ],
    sieve: {
      fine: {
        category: 'fine',
        label: 'Fine (<20 cm)',
        subLabel: 'material halus / fines',
        percentage: 16.5,
        units: 51,
        colorClass: 'text-[#a08e7a]',
        barColor: '#a08e7a'
      },
      medium: {
        category: 'medium',
        label: 'Medium (20 – 50 cm) — Target Optimal',
        subLabel: 'fraksi ideal crusher',
        percentage: 58.2,
        units: 182,
        colorClass: 'text-[#4ae176]',
        barColor: '#4ae176'
      },
      coarse: {
        category: 'coarse',
        label: 'Coarse (50 – 100 cm)',
        subLabel: 'fraksi kasar terkendali',
        percentage: 16.9,
        units: 53,
        colorClass: 'text-[#f59e0b]',
        barColor: '#f59e0b'
      },
      oversize: {
        category: 'oversize',
        label: 'Oversize (>100 cm) — Secondary Blasting Needed',
        subLabel: 'boulder terkendali',
        percentage: 8.4,
        units: 26,
        colorClass: 'text-[#ffb4ab]',
        barColor: '#ffb4ab'
      }
    },
    percentiles: {
      p20: 18,
      p50: 32.1,
      p80: 58,
      kuzRamIndex: 1.45
    },
    polygons: [
      {
        id: 'poly-24-1',
        category: 'Medium',
        sizeCm: 35,
        confidence: 0.94,
        type: 'polygon',
        points: '300,300 390,310 420,380 350,420 280,370',
        labelX: 300,
        labelY: 280,
        labelText: 'MEDIUM: 35cm [0.94]',
        color: '#4ae176',
        fillColor: 'rgba(74, 225, 118, 0.35)'
      },
      {
        id: 'poly-24-2',
        category: 'Medium',
        sizeCm: 44,
        confidence: 0.92,
        type: 'polygon',
        points: '500,320 600,330 630,410 540,440 480,390',
        labelX: 500,
        labelY: 300,
        labelText: 'MEDIUM: 44cm [0.92]',
        color: '#4ae176',
        fillColor: 'rgba(74, 225, 118, 0.35)'
      }
    ],
    createdAt: '2026-09-22T09:15:00Z'
  },
  {
    id: 'blast-022',
    blastId: 'BLAST-2026-022',
    pitBench: 'Pit C - Bench 01',
    blastDate: '2026-09-20',
    geologyFormation: 'Formasi Diorit Masif',
    notes: 'Struktur diskontinuitas jarang, terdapat boulder boulder masif di bagian crest.',
    fileName: 'pit_c_blast_022.jpg',
    fileSize: '5.1 MB',
    dimensions: '3840 x 2160',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTuHE31QXqAh9PoDmW6Y9Cp7m1Bkf5eDinVCnF57x-DR9S3YQT2FbeMagRW8jI6SRWN4nVkwwhxWAWGHOhuog9Cn6kqZRz9C1E1kUMvFPHH3B-jSXICf-m_FaFAateqtxqg8Yuf6WOO_ES8W87fJ0rPNrUz4Rtb8joePt45h7aSA8_59lDcwwLtF6uBwsIkxKaLwPOlqonqWzag8Frbw-a6Uo7e3Jw8EWnDO0Hx49frby-O16N9krB',
    detectedFragments: 198,
    oversizePercentage: 28.5,
    oversizeCount: 56,
    oversizeTolerance: 15.0,
    dominantCategory: 'Coarse',
    dominantPercentage: 39.0,
    dominantRange: '50 — 100 cm',
    evaluationStatus: 'Kritis',
    statusDetail: 'Oversize melebihi batas kritis keselamatan loading',
    inferenceTimeMs: 41,
    confidence: 0.89,
    backbone: 'CSP-Darknet11',
    operationalRisk: 'Tinggi (High Risk)',
    riskLevel: 3,
    alertDescription: 'Tingkat boulder oversize sangat tinggi (28,5%). Dibutuhkan penanganan secondary breaking sebelum material diumpankan ke primary jaw crusher.',
    geotechnicalNote: 'Catatan Geoteknik: Risiko hanging boulder pada muckpile crest. Rock breaker mobile harus dialokasikan.',
    recommendationQuote: '“Perlu penambahan sub-drilling dan evaluasi kembali burden stiffness ratio serta densitas bahan peledak.”',
    actionPoints: [
      'Gunakan hydraulic rock breaker sebelum armada excavator memuat.',
      'Kaji ulang pola delay timing inter-hole untuk memperbaiki retakan antar kolom ledak.',
      'Tingkatkan Powder Factor dari 0.38 menjadi 0.44 kg/m³.'
    ],
    sieve: {
      fine: {
        category: 'fine',
        label: 'Fine (<20 cm)',
        subLabel: 'material halus / fines',
        percentage: 9.0,
        units: 18,
        colorClass: 'text-[#a08e7a]',
        barColor: '#a08e7a'
      },
      medium: {
        category: 'medium',
        label: 'Medium (20 – 50 cm) — Target Optimal',
        subLabel: 'fraksi ideal crusher',
        percentage: 23.5,
        units: 47,
        colorClass: 'text-[#4ae176]',
        barColor: '#4ae176'
      },
      coarse: {
        category: 'coarse',
        label: 'Coarse (50 – 100 cm)',
        subLabel: 'fraksi kasar terkendali',
        percentage: 39.0,
        units: 77,
        colorClass: 'text-[#f59e0b]',
        barColor: '#f59e0b'
      },
      oversize: {
        category: 'oversize',
        label: 'Oversize (>100 cm) — Secondary Blasting Needed',
        subLabel: 'boulder kritis',
        percentage: 28.5,
        units: 56,
        colorClass: 'text-[#ffb4ab]',
        barColor: '#ffb4ab'
      }
    },
    percentiles: {
      p20: 34,
      p50: 64.2,
      p80: 114,
      kuzRamIndex: 0.92
    },
    polygons: [],
    createdAt: '2026-09-20T16:00:00Z'
  }
];

export const DEMO_PRESETS = [
  {
    name: 'Pit B - Bench 04 (Andesit Keras)',
    blastId: 'BLAST-2026-023',
    pitBench: 'Pit B - Bench 04',
    formation: 'Formasi Andesit Keras',
    date: '2026-09-24',
    fileName: 'pit_b_blast_023.jpg',
    status: 'Perlu Evaluasi',
    oversize: '18.7%',
    p50: '38.4 cm',
    recordId: 'blast-023'
  },
  {
    name: 'Pit A - Bench 02 (Batugamping)',
    blastId: 'BLAST-2026-024',
    pitBench: 'Pit A - Bench 02',
    formation: 'Batugamping Terkristalisasi',
    date: '2026-09-22',
    fileName: 'pit_a_blast_024.jpg',
    status: 'Optimal',
    oversize: '8.4%',
    p50: '32.1 cm',
    recordId: 'blast-024'
  },
  {
    name: 'Pit C - Bench 01 (Diorit Masif)',
    blastId: 'BLAST-2026-022',
    pitBench: 'Pit C - Bench 01',
    formation: 'Formasi Diorit Masif',
    date: '2026-09-20',
    fileName: 'pit_c_blast_022.jpg',
    status: 'Kritis',
    oversize: '28.5%',
    p50: '64.2 cm',
    recordId: 'blast-022'
  }
];
