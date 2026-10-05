import React, { useState } from 'react';
import { 
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Layers,
  ScanSearch,
  Eye,
  FileSearch,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Info,
  Database
} from 'lucide-react';
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  XAxis, 
  YAxis,
  Area,
  AreaChart,
  Cell
} from 'recharts';

// Data for Experiments
const modelProgressData = [
  { name: 'Baseline', full: 'YOLO11n-seg 640', map: 0.108 },
  { name: 'Optimasi Model', full: 'YOLO11s-seg 960', map: 0.261 },
  { name: '+ Open Pits', full: 'Dataset digabung', map: 0.328 },
  { name: 'Final', full: 'Augmentation Tuning', map: 0.341 },
];

// Data for Tracking Concept
const trackingMockupData = [
  { blast: 'Blast 01', d80: 210 },
  { blast: 'Blast 02', d80: 195 },
  { blast: 'Blast 03', d80: 230 },
  { blast: 'Blast 04', d80: 180 },
];

// Data for Cumulative Fragmentation (Concept)
const cumulativeData = [
  { size: 0, percentage: 0 },
  { size: 50, percentage: 5 },
  { size: 100, percentage: 15 },
  { size: 150, percentage: 40 },
  { size: 200, percentage: 65 },
  { size: 250, percentage: 85 },
  { size: 300, percentage: 95 },
  { size: 350, percentage: 100 },
];

export default function App() {
  // State untuk melacak langkah mana yang sedang aktif diklik
  const [activeStep, setActiveStep] = useState(1);

  // Data alur kerja interaktif
  const workflowSteps = [
    {
      id: 0,
      flow: "Foto Input",
      title: "00 — Input Data Citra Mentah",
      desc: "Sistem menerima foto hasil peledakan mentah dari area tambang (baik dari kamera jarak jauh Bucket Excavation maupun zoom optik Open Pits)."
    },
    {
      id: 1,
      flow: "YOLO11-Seg",
      title: "01 — Instance Segmentation",
      desc: "Model YOLO11s-Seg memproses gambar dan secara cerdas mendeteksi kontur setiap fragmen batuan sebagai instance individual di tengah tumpukan muckpile yang ekstrem."
    },
    {
      id: 2,
      flow: "Fragment Analysis",
      title: "02 — Fragment Size Analysis",
      desc: "Luas (area) polygon dari hasil segmentasi diekstrak secara matematis untuk menghitung relative equivalent diameter (Deq) dari masing-masing batu."
    },
    {
      id: 3,
      flow: "Quality Control",
      title: "03 — Filter Quality Control",
      desc: "Sistem secara otomatis menyaring dan membuang fragmen yang terpotong di tepi gambar (edge-touching) serta prediksi dengan tingkat keyakinan (confidence) di bawah 0.40 agar data valid."
    },
    {
      id: 4,
      flow: "EigenCAM XAI",
      title: "04 — Explainability (XAI)",
      desc: "Menerapkan pustaka pytorch-grad-cam pada Layer 16 untuk memvisualisasikan peta panas (heatmap) guna membuktikan transparansi area visual yang menjadi fokus deteksi AI."
    },
    {
      id: 5,
      flow: "Decision Support",
      title: "05 — Decision Support System",
      desc: "Menghasilkan kurva persentil fragmentasi (D10, D50, D80) dan mendiagnosis status kualitas (Oversize / Over-breaking) untuk memberikan rekomendasi geometri peledakan kepada engineer."
    }
  ];

  return (
    <div className="min-h-screen font-sans bg-black text-text-main selection:bg-accent selection:text-black">
      
      {/* CSS Animasi Khusus & Smooth Scroll */}
      <style>{`
        html { scroll-behavior: smooth; }
        @keyframes fadeSlideUp {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-slide {
          animation: fadeSlideUp 0.5s ease-out forwards;
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/70 backdrop-blur-md border-b border-border/50 transition-all duration-300">
        <div className="flex items-center w-1/4">
          <img src="/logo.png" alt="BlastInsight-XAI Logo" className="h-10 object-contain hover:scale-105 transition-transform duration-300 cursor-pointer" />
        </div>
        
        {/* Navigation Menu */}
        <div className="hidden md:flex items-center justify-center gap-8 w-2/4">
          <a href="#" className="text-sm font-medium text-text-secondary hover:text-accent transition-colors duration-300">Beranda</a>
          <a href="#cara-kerja" className="text-sm font-medium text-text-secondary hover:text-accent transition-colors duration-300">Cara Kerja</a>
          <a href="#hasil-eksperimen" className="text-sm font-medium text-text-secondary hover:text-accent transition-colors duration-300">Hasil Analisis</a>
          <a href="#research-context" className="text-sm font-medium text-text-secondary hover:text-accent transition-colors duration-300">Tentang Sistem</a>
        </div>

        <div className="flex items-center justify-end w-1/4">
          <button 
            onClick={() => alert("Fitur Login sedang dalam tahap pengembangan untuk penjurian DBEST 2026.")}
            className="px-6 py-2 bg-gradient-to-r from-accent to-[#E66800] text-black font-bold rounded-lg hover:shadow-[0_0_20px_rgba(255,115,0,0.6)] hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Mulai
          </button>
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6 lg:pt-40 lg:pb-28 border-b border-border overflow-hidden bg-gradient-to-b from-black via-accent/5 to-black">
        <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-accent/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="animate-fade-slide">
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-4 bg-gradient-to-br from-accent via-accent-sec to-white bg-clip-text text-transparent">
              BlastInsight-XAI
            </h1>
            
            <h2 className="text-xl lg:text-2xl font-semibold text-text-main mb-2">
              Evaluasi Fragmentasi Batuan Berbasis Explainable AI
            </h2>
            
            <p className="text-sm font-medium text-accent-sec mb-8 tracking-wide">
              Explainable AI for Automated Rock Fragmentation Assessment in Surface Mining
            </p>
            
            <p className="text-text-secondary leading-relaxed mb-6">
              BlastInsight-XAI membantu blasting engineer mengevaluasi fragmentasi batuan pascapeledakan melalui instance segmentation, analisis ukuran relatif, Explainable AI, dan decision support.
            </p>
            
            <div className="bg-card/40 backdrop-blur-md border-l-4 border-accent p-4 mb-8 rounded-r-lg hover:bg-card/60 transition-colors duration-300">
              <p className="text-sm text-text-main">
                Dirancang sebagai <strong>early detection dan decision support</strong>, bukan pengganti keputusan blasting engineer.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <a href="#cara-kerja" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-accent to-[#E66800] text-black font-bold px-7 py-3 rounded-lg hover:shadow-[0_0_25px_rgba(255,115,0,0.5)] hover:-translate-y-1 transition-all duration-300 h-12">
                Lihat Cara Kerja <ArrowRight size={18} className="animate-pulse" />
              </a>
              <a href="#hasil-eksperimen" className="inline-flex items-center justify-center gap-2 bg-transparent border border-border/80 text-text-main font-semibold px-6 py-3 rounded-lg hover:bg-card hover:border-accent/50 hover:text-accent transition-all duration-300 h-12">
                Lihat Hasil Eksperimen
              </a>
            </div>
          </div>
          
          <div className="relative h-[500px] w-full bg-card/50 rounded-xl border border-border/80 p-2 shadow-[0_0_40px_rgba(255,115,0,0.05)] backdrop-blur-sm group overflow-hidden">
            <div className="absolute inset-2 rounded-lg bg-[url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center overflow-hidden transition-transform duration-700 group-hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/40 to-accent/20 mix-blend-multiply" />
              <div className="absolute inset-0 border border-border/30 rounded-lg" />
              
              <div className="absolute top-6 left-6 bg-black/80 backdrop-blur-md border border-accent/30 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 hover:-translate-y-1 transition-transform duration-300 cursor-default">
                <ScanSearch size={16} className="text-accent" />
                <span className="text-sm font-medium text-accent-sec">YOLO11-Seg</span>
              </div>
              
              <div className="absolute top-24 right-6 bg-black/80 backdrop-blur-md border border-accent/30 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 hover:-translate-y-1 transition-transform duration-300 cursor-default">
                <Layers size={16} className="text-accent" />
                <span className="text-sm font-medium text-accent-sec">Instance Segmentation</span>
              </div>
              
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-accent/30 px-4 py-2 rounded-lg shadow-[0_0_20px_rgba(255,115,0,0.2)] flex items-center gap-2 whitespace-nowrap hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(255,115,0,0.4)] transition-all duration-300 cursor-default">
                <Eye size={16} className="text-accent" />
                <span className="text-sm font-medium text-accent-sec">Explainable AI</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MASALAH SECTION */}
      <section className="py-24 px-6 bg-gradient-to-b from-black to-secondary border-b border-border">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-text-secondary bg-clip-text text-transparent">Mengapa Fragmentasi Perlu Dievaluasi?</h2>
          <p className="text-text-secondary max-w-3xl mx-auto mb-12">
            Kualitas fragmentasi hasil peledakan memengaruhi rangkaian proses mine-to-mill, mulai dari loading hingga crushing.
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-4 lg:gap-8 mb-16 text-sm font-medium text-text-main">
            <span className="bg-card/50 px-4 py-2 rounded border border-border hover:bg-card transition-colors cursor-default">Blasting</span>
            <ChevronRight className="text-muted" />
            <span className="bg-gradient-to-r from-accent/10 to-accent/5 px-4 py-2 rounded border border-accent text-accent shadow-[0_0_15px_rgba(255,115,0,0.2)] hover:scale-105 transition-transform cursor-default">Fragmentation</span>
            <ChevronRight className="text-muted" />
            <span className="bg-card/50 px-4 py-2 rounded border border-border hover:bg-card transition-colors cursor-default">Loading</span>
            <ChevronRight className="text-muted" />
            <span className="bg-card/50 px-4 py-2 rounded border border-border hover:bg-card transition-colors cursor-default">Hauling</span>
            <ChevronRight className="text-muted" />
            <span className="bg-card/50 px-4 py-2 rounded border border-border hover:bg-card transition-colors cursor-default">Crushing</span>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-card/40 backdrop-blur-sm border border-border/80 hover:border-accent/50 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(255,115,0,0.1)] transition-all duration-300 rounded-xl p-8 cursor-default">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                <AlertTriangle className="text-accent" size={24} />
                Evaluasi Manual
              </h3>
              <p className="text-text-secondary leading-relaxed">
                Inspeksi visual dapat bersifat subjektif dan bergantung pada pengalaman evaluator.
              </p>
            </div>
            
            <div className="bg-card/40 backdrop-blur-sm border border-border/80 hover:border-accent/50 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(255,115,0,0.1)] transition-all duration-300 rounded-xl p-8 cursor-default">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                <Layers className="text-accent" size={24} />
                Oversize
              </h3>
              <p className="text-text-secondary leading-relaxed">
                Fragmen terlalu besar dapat meningkatkan kebutuhan secondary breaking dan beban crushing.
              </p>
            </div>
            
            <div className="bg-card/40 backdrop-blur-sm border border-border/80 hover:border-accent/50 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(255,115,0,0.1)] transition-all duration-300 rounded-xl p-8 cursor-default">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                <ScanSearch className="text-accent" size={24} />
                Over-breaking
              </h3>
              <p className="text-text-secondary leading-relaxed">
                Fragmentasi terlalu halus dapat menunjukkan energi peledakan yang tidak terdistribusi secara optimal.
              </p>
            </div>
          </div>
          
        </div>
      </section>

      {/* 3. CARA KERJA SECTION (INTERAKTIF & ANIMASI) */}
      <section id="cara-kerja" className="py-24 px-6 bg-gradient-to-b from-secondary to-black border-b border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold mb-16 text-center bg-gradient-to-r from-white to-text-secondary bg-clip-text text-transparent">Bagaimana BlastInsight-XAI Bekerja?</h2>
          
          {/* Interactive Flow Pipeline */}
          <div className="flex flex-wrap items-center justify-center gap-3 lg:gap-4 mb-12">
            {workflowSteps.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => setActiveStep(index)}
                  className={`px-5 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${
                    activeStep === index
                      ? 'bg-accent/20 border-accent text-accent shadow-[0_0_20px_rgba(255,115,0,0.4)] border scale-110'
                      : 'bg-card/60 border-border text-text-secondary hover:border-accent/50 hover:text-white hover:scale-105 border'
                  }`}
                >
                  {step.flow}
                </button>
                {index < workflowSteps.length - 1 && (
                  <ChevronRight className="text-border hidden md:block" size={20} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Dynamic Content Card - Menggunakan key untuk memaksa re-render animasi fade-slide */}
          <div className="bg-card/30 border border-border/80 rounded-2xl p-8 lg:p-12 max-w-4xl mx-auto text-center backdrop-blur-sm transition-all duration-500 min-h-[220px] flex flex-col justify-center shadow-[0_0_40px_rgba(0,0,0,0.4)] relative overflow-hidden group hover:border-accent/30">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/10 blur-[80px] pointer-events-none group-hover:bg-accent/20 transition-all duration-700" />
            
            <div key={activeStep} className="animate-fade-slide relative z-10">
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-6">{workflowSteps[activeStep].title}</h3>
              <p className="text-lg text-text-secondary leading-relaxed">{workflowSteps[activeStep].desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. EXPLAINABLE AI SECTION */}
      <section className="py-24 px-6 bg-gradient-to-b from-black to-secondary border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-accent to-accent-sec bg-clip-text text-transparent">AI yang Dapat Ditinjau</h2>
            <p className="text-xl text-text-secondary">Prediksi tidak hanya ditampilkan sebagai hasil, tetapi juga disertai visualisasi area perhatian model.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="bg-card/50 border border-border/80 rounded-xl p-2 relative h-[400px] shadow-[0_0_30px_rgba(255,115,0,0.05)] hover:shadow-[0_0_40px_rgba(255,115,0,0.2)] transition-shadow duration-500 overflow-hidden group">
              <div className="absolute inset-2 rounded-lg bg-[url('https://images.unsplash.com/photo-1542382156828-59cbb147e8b2?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center overflow-hidden transition-transform duration-700 group-hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-tr from-accent/50 via-black/50 to-accent/20 mix-blend-color-dodge opacity-90" />
                <div className="absolute inset-0 border border-border/50 rounded-lg" />
              </div>
              <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur border border-accent/30 px-3 py-1.5 rounded text-xs font-semibold text-accent-sec">
                EigenCAM Heatmap (Illustrative)
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4 text-white">Mengapa EigenCAM?</h3>
              <p className="text-text-secondary mb-8 leading-relaxed">
                EigenCAM membantu memperlihatkan area citra yang memberikan kontribusi kuat terhadap representasi model.
              </p>

              <div className="space-y-6 mb-12">
                <div className="flex gap-4 p-4 rounded-lg bg-card/20 border border-border/30 hover:border-accent/40 hover:-translate-y-1 transition-all duration-300">
                  <Eye className="text-accent shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-bold text-text-main mb-1">Transparency</h4>
                    <p className="text-sm text-text-secondary">Membantu melihat area perhatian model.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-lg bg-card/20 border border-border/30 hover:border-accent/40 hover:-translate-y-1 transition-all duration-300">
                  <FileSearch className="text-accent shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-bold text-text-main mb-1">Auditability</h4>
                    <p className="text-sm text-text-secondary">Prediksi dapat diperiksa secara visual.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-lg bg-card/20 border border-border/30 hover:border-accent/40 hover:-translate-y-1 transition-all duration-300">
                  <ShieldCheck className="text-accent shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-bold text-text-main mb-1">Engineering Trust</h4>
                    <p className="text-sm text-text-secondary">Memberikan konteks tambahan sebelum hasil digunakan sebagai bahan evaluasi.</p>
                  </div>
                </div>
              </div>

              <div className="bg-card/40 border border-border/80 rounded-xl p-6 relative overflow-hidden hover:border-accent/30 transition-colors duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[50px]" />
                <h4 className="text-sm font-semibold text-accent uppercase tracking-wider mb-4">Layer Selection</h4>
                <div className="flex flex-wrap gap-3 mb-4">
                  <span className="px-3 py-1.5 rounded border border-border text-sm text-text-secondary cursor-default hover:bg-card transition-colors">SPPF</span>
                  <span className="px-3 py-1.5 rounded bg-accent/20 border border-accent text-accent-sec font-bold text-sm shadow-[0_0_15px_rgba(255,115,0,0.3)] cursor-default scale-105">P3 — Selected</span>
                  <span className="px-3 py-1.5 rounded border border-border text-sm text-text-secondary cursor-default hover:bg-card transition-colors">P5</span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  P3 menghasilkan visualisasi paling selaras dengan fragmen individual karena memiliki resolusi spasial lebih tinggi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HASIL EKSPERIMEN SECTION */}
      <section id="hasil-eksperimen" className="py-24 px-6 bg-gradient-to-b from-secondary to-black border-b border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-text-secondary bg-clip-text text-transparent">Perkembangan Model</h2>
            <p className="text-xl text-text-secondary">
              Model dikembangkan secara bertahap untuk meningkatkan kemampuan segmentasi pada scene fragmentasi yang padat.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-2 h-[400px] bg-card/40 border border-border/80 rounded-xl p-6 backdrop-blur-sm hover:border-accent/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,115,0,0.05)]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelProgressData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" vertical={false} />
                  <XAxis dataKey="name" stroke="#A3A3A3" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#A3A3A3" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    cursor={{fill: '#111111'}}
                    contentStyle={{backgroundColor: '#0A0A0A', borderColor: '#222222', borderRadius: '8px', color: '#F8FAFC'}}
                    itemStyle={{color: '#FF7300'}}
                  />
                  <Bar dataKey="map" name="Mask mAP50-95" radius={[4, 4, 0, 0]}>
                    {modelProgressData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 3 ? '#FF7300' : '#333333'} className="hover:opacity-80 transition-opacity cursor-pointer" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-6">
              <div className="bg-card/40 border border-accent/30 rounded-xl p-6 shadow-[0_0_30px_rgba(255,115,0,0.1)] relative overflow-hidden hover:scale-105 transition-transform duration-500 cursor-default">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/20 blur-[40px]" />
                <div className="text-5xl font-bold bg-gradient-to-r from-accent to-accent-sec bg-clip-text text-transparent mb-2">0.341</div>
                <div className="text-sm font-semibold mb-2 text-white">Mask mAP50-95 (Final)</div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Nilai digunakan sebagai baseline eksperimen sistem dan bukan klaim state-of-the-art.
                </p>
              </div>

              <div className="bg-black/60 border border-border/80 rounded-xl p-6 text-sm hover:border-accent/30 transition-colors duration-300 cursor-default">
                <h4 className="font-bold text-accent-sec mb-4 flex items-center gap-2">
                  <Database size={16} /> Dataset Context
                </h4>
                <div className="space-y-4 text-text-secondary">
                  <div>
                    <strong className="block text-white mb-1">Rock Blasting Benchmark</strong>
                    Ural Federal University
                  </div>
                  <div>
                    <strong className="block text-white mb-1">Domain</strong>
                    Bucket Excavation + Open Pits
                  </div>
                  <div>
                    <strong className="block text-white mb-1">Scene Complexity</strong>
                    ±258 fragmen rata-rata per gambar<br/>
                    hingga ±358 fragmen pada scene terpadat
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. DECISION SUPPORT SECTION */}
      <section className="py-24 px-6 bg-gradient-to-b from-black to-secondary border-b border-border">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold mb-16 text-center bg-gradient-to-r from-white to-text-secondary bg-clip-text text-transparent">Dari Segmentasi Menjadi Informasi Evaluasi</h2>
          
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="bg-card/40 border border-border/80 rounded-xl overflow-hidden backdrop-blur-sm hover:border-accent/40 transition-colors duration-500">
              <div className="h-64 bg-[url('https://images.unsplash.com/photo-1621504450181-5d356f61d307?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center relative group">
                <div className="absolute inset-0 bg-black/60 mix-blend-multiply group-hover:bg-black/40 transition-colors duration-500" />
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur border border-accent/30 px-3 py-1 rounded text-xs font-semibold text-accent-sec">
                  Segmentation Result
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <h3 className="font-bold text-white">Open Pits — Relative Fragment Distribution</h3>
                  <span className="px-2 py-1 bg-black border border-border rounded text-[10px] font-bold tracking-wider uppercase text-text-secondary">
                    Contoh Tampilan
                  </span>
                </div>
                
                <div className="h-48 mb-6 cursor-crosshair">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cumulativeData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222222" vertical={false} />
                      <XAxis dataKey="size" stroke="#A3A3A3" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#A3A3A3" fontSize={10} tickLine={false} axisLine={false} />
                      <RechartsTooltip 
                        contentStyle={{backgroundColor: '#0A0A0A', borderColor: '#222222', borderRadius: '8px', fontSize: '12px', color: '#FFF'}}
                      />
                      <Area type="monotone" dataKey="percentage" stroke="#FF7300" fill="url(#orangeGradient)" />
                      <defs>
                        <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF7300" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#FF7300" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex gap-4 border-t border-border/50 pt-6">
                  <div className="flex-1 text-center bg-black/30 p-3 rounded-lg border border-border/30 hover:border-white/20 transition-colors cursor-default">
                    <div className="text-xs text-text-secondary mb-1">D10</div>
                    <div className="font-bold font-mono text-white">68 px</div>
                  </div>
                  <div className="flex-1 text-center bg-accent/5 p-3 rounded-lg border border-accent/20 hover:border-accent/50 transition-colors cursor-default">
                    <div className="text-xs text-text-secondary mb-1">D50</div>
                    <div className="font-bold font-mono text-accent">142 px</div>
                  </div>
                  <div className="flex-1 text-center bg-danger/5 p-3 rounded-lg border border-danger/20 hover:border-danger/50 transition-colors cursor-default">
                    <div className="text-xs text-text-secondary mb-1">D80</div>
                    <div className="font-bold font-mono text-danger">218 px</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card/40 border border-accent/30 rounded-xl p-8 relative shadow-[0_0_30px_rgba(255,115,0,0.05)] backdrop-blur-sm hover:shadow-[0_0_40px_rgba(255,115,0,0.1)] transition-shadow duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[80px] pointer-events-none" />
              <div className="absolute top-8 right-8 px-3 py-1 bg-accent/10 border border-accent rounded text-[10px] font-bold tracking-wider uppercase text-accent">
                Konsep Decision Support
              </div>
              
              <h3 className="text-xl font-bold mb-8 text-white">Ringkasan Evaluasi</h3>
              
              <div className="mb-8">
                <div className="text-sm text-text-secondary mb-2">Fragmentation Status</div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 border border-accent/50 text-accent font-bold animate-pulse cursor-default">
                  <AlertTriangle size={18} />
                  Relatif Kasar
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-black/40 p-4 rounded-lg border border-border/50 hover:border-accent/30 transition-colors cursor-default">
                  <div className="text-sm text-text-secondary mb-3">Indikator</div>
                  <ul className="space-y-3 text-sm font-medium">
                    <li className="flex items-center gap-2 text-accent-sec"><TrendingUp size={14} /> D50 relatif meningkat</li>
                    <li className="flex items-center gap-2 text-accent-sec"><TrendingUp size={14} /> D80 relatif meningkat</li>
                    <li className="flex items-center gap-2 text-accent-sec"><TrendingUp size={14} /> Large tail meningkat</li>
                  </ul>
                </div>
                <div className="bg-black/40 p-4 rounded-lg border border-border/50 hover:border-accent/30 transition-colors cursor-default">
                  <div className="text-sm text-text-secondary mb-3">Potensi Dampak</div>
                  <ul className="space-y-3 text-sm text-text-main">
                    <li className="flex items-center gap-2"><ArrowRight size={14} className="text-muted" /> Loading efficiency</li>
                    <li className="flex items-center gap-2"><ArrowRight size={14} className="text-muted" /> Crusher workload</li>
                    <li className="flex items-center gap-2"><ArrowRight size={14} className="text-muted" /> Secondary breaking</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-black/60 rounded-lg p-5 border border-border/80 mb-6 hover:border-accent/30 transition-colors cursor-default">
                <div className="text-sm font-bold mb-4 text-white">Rekomendasi Evaluasi</div>
                <ul className="space-y-3 text-sm text-text-secondary">
                  <li className="flex items-start gap-3"><CheckCircle2 size={16} className="text-accent shrink-0 mt-0.5" /> Review burden & spacing</li>
                  <li className="flex items-start gap-3"><CheckCircle2 size={16} className="text-accent shrink-0 mt-0.5" /> Evaluasi distribusi energi</li>
                  <li className="flex items-start gap-3"><CheckCircle2 size={16} className="text-accent shrink-0 mt-0.5" /> Bandingkan dengan kondisi geologi</li>
                  <li className="flex items-start gap-3"><CheckCircle2 size={16} className="text-accent shrink-0 mt-0.5" /> Validasi kondisi lapangan</li>
                </ul>
              </div>
              
              <p className="text-xs text-muted flex items-start gap-2">
                <Info size={14} className="shrink-0 mt-0.5" />
                Rekomendasi merupakan bahan evaluasi, bukan instruksi perubahan blast parameter secara otomatis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TRACKING KUALITAS SECTION */}
      <section className="py-24 px-6 bg-gradient-to-b from-secondary to-black border-b border-border">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded border border-accent/30 bg-accent/5 text-xs font-bold text-accent-sec uppercase tracking-wider shadow-[0_0_10px_rgba(255,115,0,0.1)]">
            Konsep Pengembangan
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-white">Tracking Fragmentasi dari Waktu ke Waktu</h2>
          <p className="text-text-secondary max-w-2xl mx-auto mb-16">
            Riwayat analisis dirancang untuk membantu engineer membandingkan kondisi fragmentasi antar kegiatan blasting. Tren dapat digunakan untuk melihat apakah fragmentasi relatif menjadi lebih kasar atau lebih halus dari waktu ke waktu.
          </p>

          <div className="bg-card/40 border border-border/80 rounded-xl p-8 max-w-3xl mx-auto relative backdrop-blur-sm hover:border-accent/40 transition-colors duration-500">
            <div className="absolute top-4 right-4 px-2 py-1 bg-black border border-border rounded text-[10px] font-bold tracking-wider uppercase text-text-secondary">
              Concept Visualization
            </div>
            <h3 className="text-lg font-bold mb-8 text-left text-white">Relative D80 Trend</h3>
            
            <div className="h-64 cursor-crosshair">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trackingMockupData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" vertical={false} />
                  <XAxis dataKey="blast" stroke="#A3A3A3" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#A3A3A3" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{backgroundColor: '#0A0A0A', borderColor: '#222222', borderRadius: '8px', fontSize: '12px', color: '#FFF'}}
                    itemStyle={{color: '#FF7300'}}
                  />
                  <Line type="monotone" dataKey="d80" name="Relative D80 (px)" stroke="#FF7300" strokeWidth={3} dot={{ r: 4, fill: '#000', strokeWidth: 2, stroke: '#FF7300' }} activeDot={{ r: 6, fill: '#FF7300' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TIM & RESEARCH CONTEXT SECTION */}
      <section id="research-context" className="pt-24 pb-12 px-6 bg-gradient-to-b from-black to-[#050505]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 bg-gradient-to-r from-accent to-accent-sec bg-clip-text text-transparent">Research Context</h2>
          
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex gap-4 pb-4 border-b border-border/50 hover:border-accent/50 transition-colors cursor-default">
                <div className="w-32 text-sm text-text-secondary font-medium">Project</div>
                <div className="font-bold text-white">BlastInsight-XAI</div>
              </div>
              <div className="flex gap-4 pb-4 border-b border-border/50 hover:border-accent/50 transition-colors cursor-default">
                <div className="w-32 text-sm text-text-secondary font-medium">Competition</div>
                <div className="font-bold text-white">DBEST 2026</div>
              </div>
              <div className="flex gap-4 pb-4 border-b border-border/50 hover:border-accent/50 transition-colors cursor-default">
                <div className="w-32 text-sm text-text-secondary font-medium">Category</div>
                <div className="font-bold text-white">Smart Blasting & Digital Mining Systems</div>
              </div>
              <div className="flex gap-4 pb-4 border-b border-border/50 hover:border-accent/50 transition-colors cursor-default">
                <div className="w-32 text-sm text-text-secondary font-medium">Institution</div>
                <div className="font-bold text-white">Telkom University Purwokerto</div>
              </div>
              <div className="flex gap-4 pb-4 border-b border-border/50 hover:border-accent/50 transition-colors cursor-default">
                <div className="w-32 text-sm text-text-secondary font-medium">Dataset</div>
                <div className="font-bold text-white">Rock Blasting Benchmark — Ural Federal University</div>
              </div>
            </div>
            
            <div className="bg-card/30 border border-border/80 rounded-xl p-6 backdrop-blur-sm hover:border-accent/50 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(255,115,0,0.1)] cursor-default">
              <h3 className="font-bold mb-6 text-white">Research Team</h3>
              <ul className="space-y-6">
                <li>
                  <div className="font-bold text-text-main mb-1">Annasya Maulafidatu Zahra</div>
                  <div className="text-sm text-accent font-medium">AI / Machine Learning</div>
                </li>
                <li>
                  <div className="font-bold text-text-main mb-1">Muhammad Panca Nugraha</div>
                  <div className="text-sm text-accent font-medium">Data & Analysis</div>
                </li>
              </ul>
            </div>
          </div>
          
          {/* LIMITATION NOTE */}
          <div className="bg-black/60 border border-border/50 rounded-lg p-6 mb-12 relative overflow-hidden hover:border-accent/30 transition-colors duration-300 cursor-default">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent to-transparent opacity-50" />
            <h4 className="text-sm font-bold mb-4 text-text-secondary flex items-center gap-2">
              <Info size={16} /> Catatan Penelitian
            </h4>
            <ul className="grid md:grid-cols-2 gap-x-8 gap-y-3 text-xs text-muted list-disc pl-5">
              <li>Dataset gabungan masih terbatas.</li>
              <li>Training menggunakan resource komputasi terbatas.</li>
              <li>Ukuran fragmen masih berupa relative equivalent diameter dalam pixel.</li>
              <li>Projected area 2D tidak merepresentasikan volume batu secara langsung.</li>
              <li>EigenCAM digunakan sebagai interpretasi kualitatif.</li>
              <li>Validasi lapangan tetap dibutuhkan.</li>
            </ul>
          </div>
          
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 bg-black border-t border-border/50 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          
          <div className="md:w-1/3">
            <div className="font-bold text-accent-sec mb-1 text-base">BlastInsight-XAI</div>
            <div className="text-muted text-xs">Explainable AI for Automated Rock Fragmentation Assessment in Surface Mining</div>
          </div>
          
          <div className="md:w-1/3 text-text-secondary font-medium">
            Telkom University Purwokerto
          </div>
          
          <div className="md:w-1/3 md:text-right">
            <div className="font-medium text-text-main mb-1">DBEST 2026 Research Prototype</div>
            <div className="text-muted text-[10px] space-y-1">
              <div>Dikembangkan sebagai prototype penelitian untuk DBEST 2026.</div>
              <div>Dataset benchmark: Ural Federal University.</div>
            </div>
          </div>
          
        </div>
      </footer>

    </div>
  );
}