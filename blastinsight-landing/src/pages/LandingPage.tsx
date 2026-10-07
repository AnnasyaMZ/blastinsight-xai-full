import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip as RechartsTooltip,
  XAxis, YAxis, Area, AreaChart, Cell
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

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);

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
    <div className="min-h-screen font-sans bg-[#000000] text-[#F8FAFC] selection:bg-[#FF7300] selection:text-black">
      
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
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#000000]/80 backdrop-blur-md border-b border-[#222222] transition-all duration-300">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="h-8 object-contain hover:scale-105 transition-transform duration-300 cursor-pointer" />
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-[13px] font-semibold text-[#A3A3A3] hover:text-[#FF7300] transition-colors">Beranda</a>
          <a href="#cara-kerja" className="text-[13px] font-semibold text-[#A3A3A3] hover:text-[#FF7300] transition-colors">Cara Kerja</a>
          <a href="#hasil-eksperimen" className="text-[13px] font-semibold text-[#A3A3A3] hover:text-[#FF7300] transition-colors">Hasil Analisis</a>
          <a href="#research-context" className="text-[13px] font-semibold text-[#A3A3A3] hover:text-[#FF7300] transition-colors">Tentang Sistem</a>
        </div>

        <button 
          onClick={() => navigate('/login')}
          className="px-6 py-2 bg-gradient-to-r from-[#FF7300] to-[#E66800] text-black font-bold rounded-lg hover:shadow-[0_0_20px_rgba(255,115,0,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 text-[13px]"
        >
          Mulai
        </button>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6 lg:pt-40 lg:pb-28 border-b border-[#222222] overflow-hidden bg-gradient-to-b from-[#000000] via-[#FF7300]/5 to-[#000000]">
        <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-[#FF7300]/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen z-0" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
          <div className="animate-fade-slide">
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-4">
               <span className="bg-gradient-to-r from-[#FF7300] to-[#FFA751] bg-clip-text text-transparent">
                BlastInsight-XAI
              </span>
            </h1>
            
            <h2 className="text-xl lg:text-2xl font-semibold text-white mb-2">
              Evaluasi Fragmentasi Batuan Berbasis<br/>Explainable AI
            </h2>
            
            <p className="text-[13px] font-medium text-[#FF7300] mb-8 tracking-wide">
              Explainable AI for Automated Rock Fragmentation Assessment in Surface Mining
            </p>
            
            <p className="text-[14px] text-[#A3A3A3] leading-relaxed mb-6 max-w-xl">
              BlastInsight-XAI membantu blasting engineer mengevaluasi fragmentasi batuan pascapeledakan melalui instance segmentation, analisis ukuran relatif, Explainable AI, dan decision support.
            </p>
            
            <div className="bg-[#111111]/60 backdrop-blur-md border-l-4 border-[#FF7300] p-4 mb-8 rounded-r-lg hover:bg-[#111111] transition-colors duration-300">
              <p className="text-[13px] text-[#F8FAFC]">
                Dirancang sebagai <strong className="text-white">early detection dan decision support</strong>, bukan pengganti keputusan blasting engineer.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <a href="#cara-kerja" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF7300] to-[#E66800] text-black font-bold px-7 py-3.5 rounded-lg hover:shadow-[0_0_25px_rgba(255,115,0,0.5)] hover:-translate-y-1 transition-all duration-300">
                Lihat Cara Kerja <span className="material-symbols-outlined text-[18px] animate-pulse">arrow_forward</span>
              </a>
              <a href="#hasil-eksperimen" className="inline-flex items-center justify-center gap-2 bg-transparent border border-white/20 text-white font-semibold px-6 py-3.5 rounded-lg hover:bg-white/5 hover:border-[#FF7300]/50 transition-all duration-300">
                Lihat Hasil Eksperimen
              </a>
            </div>
          </div>
          
          <div className="relative h-[450px] w-full bg-[#111111] rounded-2xl border border-[#222222] p-2 shadow-[0_0_40px_rgba(255,115,0,0.1)] backdrop-blur-sm group overflow-hidden animate-fade-slide">
            <div 
              className="absolute inset-2 rounded-xl bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542382156828-59cbb147e8b2?q=80&w=800&auto=format&fit=crop')` }}
            >
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF7300]/20 blur-[60px]"></div>
            </div>
            
            <div className="absolute top-8 left-8 bg-[#000000]/80 backdrop-blur-md border border-[#FF7300]/30 px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 cursor-default">
              <span className="material-symbols-outlined text-[16px] text-[#FF7300]">center_focus_weak</span>
              <span className="text-[12px] font-semibold text-[#FFA751]">YOLO11-Seg</span>
            </div>
            
            <div className="absolute top-1/3 right-8 bg-[#000000]/80 backdrop-blur-md border border-[#FF7300]/30 px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 cursor-default">
              <span className="material-symbols-outlined text-[16px] text-[#FF7300]">layers</span>
              <span className="text-[12px] font-semibold text-[#FFA751]">Instance Segmentation</span>
            </div>
            
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#000000]/90 backdrop-blur-md border border-[#FF7300]/50 px-4 py-2 rounded-lg shadow-[0_0_20px_rgba(255,115,0,0.2)] flex items-center gap-2 hover:-translate-y-1 transition-transform cursor-default">
              <span className="material-symbols-outlined text-[16px] text-[#FF7300]">visibility</span>
              <span className="text-[12px] font-bold text-[#FFA751]">Explainable AI</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MASALAH SECTION */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#000000] to-[#0A0A0A] border-b border-[#222222]">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-white">Mengapa Fragmentasi Perlu Dievaluasi?</h2>
          <p className="text-[#A3A3A3] max-w-3xl mx-auto mb-12 text-[15px]">
            Kualitas fragmentasi hasil peledakan memengaruhi rangkaian proses mine-to-mill, mulai dari loading hingga crushing.
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-4 lg:gap-8 mb-16 text-[13px] font-semibold text-[#F8FAFC]">
            <span className="bg-[#111111] px-4 py-2 rounded border border-[#222222]">Blasting</span>
            <span className="material-symbols-outlined text-[#A3A3A3]">chevron_right</span>
            <span className="bg-[#FF7300]/10 px-4 py-2 rounded border border-[#FF7300] text-[#FF7300] shadow-[0_0_15px_rgba(255,115,0,0.2)] scale-105">Fragmentation</span>
            <span className="material-symbols-outlined text-[#A3A3A3]">chevron_right</span>
            <span className="bg-[#111111] px-4 py-2 rounded border border-[#222222]">Loading</span>
            <span className="material-symbols-outlined text-[#A3A3A3]">chevron_right</span>
            <span className="bg-[#111111] px-4 py-2 rounded border border-[#222222]">Hauling</span>
            <span className="material-symbols-outlined text-[#A3A3A3]">chevron_right</span>
            <span className="bg-[#111111] px-4 py-2 rounded border border-[#222222]">Crushing</span>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-[#111111]/80 backdrop-blur-sm border border-[#222222] hover:border-[#FF7300]/50 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(255,115,0,0.1)] transition-all duration-300 rounded-xl p-8">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-3 text-white">
                <span className="material-symbols-outlined text-[#FF7300] text-[28px]">warning</span>
                Evaluasi Manual
              </h3>
              <p className="text-[#A3A3A3] leading-relaxed text-[13px]">
                Inspeksi visual dapat bersifat subjektif dan bergantung pada pengalaman evaluator.
              </p>
            </div>
            
            <div className="bg-[#111111]/80 backdrop-blur-sm border border-[#222222] hover:border-[#FF7300]/50 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(255,115,0,0.1)] transition-all duration-300 rounded-xl p-8">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-3 text-white">
                <span className="material-symbols-outlined text-[#FF7300] text-[28px]">layers</span>
                Oversize
              </h3>
              <p className="text-[#A3A3A3] leading-relaxed text-[13px]">
                Fragmen terlalu besar dapat meningkatkan kebutuhan secondary breaking dan beban crushing.
              </p>
            </div>
            
            <div className="bg-[#111111]/80 backdrop-blur-sm border border-[#222222] hover:border-[#FF7300]/50 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(255,115,0,0.1)] transition-all duration-300 rounded-xl p-8">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-3 text-white">
                <span className="material-symbols-outlined text-[#FF7300] text-[28px]">document_scanner</span>
                Over-breaking
              </h3>
              <p className="text-[#A3A3A3] leading-relaxed text-[13px]">
                Fragmentasi terlalu halus dapat menunjukkan energi peledakan yang tidak terdistribusi secara optimal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CARA KERJA SECTION */}
      <section id="cara-kerja" className="py-24 px-6 bg-gradient-to-b from-[#0A0A0A] to-[#000000] border-b border-[#222222]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold mb-16 text-center text-white">Bagaimana BlastInsight-XAI Bekerja?</h2>
          
          <div className="flex flex-wrap items-center justify-center gap-3 lg:gap-4 mb-12">
            {workflowSteps.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => setActiveStep(index)}
                  className={`px-5 py-3 rounded-lg text-[13px] font-bold transition-all duration-300 ${
                    activeStep === index
                      ? 'bg-[#FF7300]/20 border-[#FF7300] text-[#FF7300] shadow-[0_0_20px_rgba(255,115,0,0.2)] border scale-105'
                      : 'bg-[#111111] border-[#222222] text-[#A3A3A3] hover:border-[#FF7300]/50 hover:text-white border'
                  }`}
                >
                  {step.flow}
                </button>
                {index < workflowSteps.length - 1 && (
                  <span className="material-symbols-outlined text-[#222222] hidden md:block">chevron_right</span>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="bg-[#111111]/50 border border-[#222222] rounded-2xl p-8 lg:p-12 max-w-4xl mx-auto text-center backdrop-blur-sm transition-all duration-500 min-h-[220px] flex flex-col justify-center shadow-lg relative overflow-hidden group hover:border-[#FF7300]/30">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#FF7300]/5 blur-[80px] pointer-events-none group-hover:bg-[#FF7300]/10 transition-all duration-700" />
            
            <div key={activeStep} className="animate-fade-slide relative z-10">
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-6">{workflowSteps[activeStep].title}</h3>
              <p className="text-[15px] text-[#A3A3A3] leading-relaxed max-w-2xl mx-auto">{workflowSteps[activeStep].desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. EXPLAINABLE AI SECTION */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#000000] to-[#0A0A0A] border-b border-[#222222]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-[#FF7300]">AI yang Dapat Ditinjau</h2>
            <p className="text-[16px] text-[#A3A3A3]">Prediksi tidak hanya ditampilkan sebagai hasil, tetapi juga disertai visualisasi area perhatian model.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="bg-[#111111] border border-[#222222] rounded-xl p-2 relative h-[400px] shadow-lg overflow-hidden group">
              <div 
                className="absolute inset-2 rounded-lg bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542382156828-59cbb147e8b2?q=80&w=800&auto=format&fit=crop')` }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-[#FF7300]/50 via-black/50 to-[#FF7300]/20 mix-blend-color-dodge opacity-90" />
                <div className="absolute inset-0 border border-white/10 rounded-lg" />
              </div>
              <div className="absolute bottom-6 left-6 bg-[#000000]/90 backdrop-blur border border-[#FF7300]/30 px-3 py-1.5 rounded text-[11px] font-semibold text-[#FFA751]">
                EigenCAM Heatmap (Illustrative)
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4 text-white">Mengapa EigenCAM?</h3>
              <p className="text-[#A3A3A3] mb-8 leading-relaxed text-[14px]">
                EigenCAM membantu memperlihatkan area citra yang memberikan kontribusi kuat terhadap representasi model.
              </p>

              <div className="space-y-4 mb-10">
                <div className="flex gap-4 p-4 rounded-lg bg-[#111111] border border-[#222222] hover:border-[#FF7300]/40 transition-colors">
                  <span className="material-symbols-outlined text-[#FF7300] mt-0.5">visibility</span>
                  <div>
                    <h4 className="font-bold text-white mb-1 text-[14px]">Transparency</h4>
                    <p className="text-[12px] text-[#A3A3A3]">Membantu melihat area perhatian model.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-lg bg-[#111111] border border-[#222222] hover:border-[#FF7300]/40 transition-colors">
                  <span className="material-symbols-outlined text-[#FF7300] mt-0.5">manage_search</span>
                  <div>
                    <h4 className="font-bold text-white mb-1 text-[14px]">Auditability</h4>
                    <p className="text-[12px] text-[#A3A3A3]">Prediksi dapat diperiksa secara visual.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-lg bg-[#111111] border border-[#222222] hover:border-[#FF7300]/40 transition-colors">
                  <span className="material-symbols-outlined text-[#FF7300] mt-0.5">verified_user</span>
                  <div>
                    <h4 className="font-bold text-white mb-1 text-[14px]">Engineering Trust</h4>
                    <p className="text-[12px] text-[#A3A3A3]">Memberikan konteks tambahan sebelum hasil digunakan sebagai bahan evaluasi.</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#111111]/50 border border-[#222222] rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF7300]/5 blur-[50px]" />
                <h4 className="text-[11px] font-bold text-[#FF7300] uppercase tracking-wider mb-4">Layer Selection</h4>
                <div className="flex flex-wrap gap-3 mb-4 text-[12px]">
                  <span className="px-3 py-1.5 rounded border border-[#222222] text-[#A3A3A3] bg-[#000000]">SPPF</span>
                  <span className="px-3 py-1.5 rounded bg-[#FF7300]/20 border border-[#FF7300] text-[#FFA751] font-bold shadow-sm">P3 — Selected</span>
                  <span className="px-3 py-1.5 rounded border border-[#222222] text-[#A3A3A3] bg-[#000000]">P5</span>
                </div>
                <p className="text-[12px] text-[#A3A3A3] leading-relaxed">
                  P3 menghasilkan visualisasi paling selaras dengan fragmen individual karena memiliki resolusi spasial lebih tinggi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HASIL EKSPERIMEN SECTION */}
      <section id="hasil-eksperimen" className="py-24 px-6 bg-gradient-to-b from-[#0A0A0A] to-[#000000] border-b border-[#222222]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">Perkembangan Model</h2>
            <p className="text-[15px] text-[#A3A3A3]">
              Model dikembangkan secara bertahap untuk meningkatkan kemampuan segmentasi pada scene fragmentasi yang padat.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-10 items-center">
            <div className="lg:col-span-2 h-[400px] bg-[#111111]/50 border border-[#222222] rounded-xl p-6 backdrop-blur-sm">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelProgressData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" vertical={false} />
                  <XAxis dataKey="name" stroke="#A3A3A3" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#A3A3A3" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    cursor={{fill: '#111111'}}
                    contentStyle={{backgroundColor: '#000000', borderColor: '#222222', borderRadius: '8px', color: '#F8FAFC'}}
                    itemStyle={{color: '#FF7300'}}
                  />
                  <Bar dataKey="map" name="Mask mAP50-95" radius={[4, 4, 0, 0]}>
                    {modelProgressData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 3 ? '#FF7300' : '#222222'} className="hover:opacity-80 transition-opacity" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-6">
              <div className="bg-[#111111] border border-[#FF7300]/30 rounded-xl p-6 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF7300]/20 blur-[40px]" />
                <div className="text-5xl font-bold text-[#FF7300] mb-2">0.341</div>
                <div className="text-[13px] font-semibold mb-2 text-white">Mask mAP50-95 (Final)</div>
                <p className="text-[11px] text-[#A3A3A3] leading-relaxed">
                  Nilai digunakan sebagai baseline eksperimen sistem dan bukan klaim state-of-the-art.
                </p>
              </div>

              <div className="bg-[#000000] border border-[#222222] rounded-xl p-6 text-[12px]">
                <h4 className="font-bold text-[#FFA751] mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">database</span> Dataset Context
                </h4>
                <div className="space-y-3 text-[#A3A3A3]">
                  <div><strong className="block text-white mb-0.5">Rock Blasting Benchmark</strong> Ural Federal University</div>
                  <div><strong className="block text-white mb-0.5">Domain</strong> Bucket Excavation + Open Pits</div>
                  <div><strong className="block text-white mb-0.5">Scene Complexity</strong> 258 fragmen rata-rata per gambar<br/>hingga lebih dari 358 fragmen pada scene terpadat</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. DECISION SUPPORT SECTION */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#000000] to-[#0A0A0A] border-b border-[#222222]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold mb-16 text-center text-white">Dari Segmentasi Menjadi Informasi Evaluasi</h2>
          
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Chart Area */}
            <div className="bg-[#111111]/50 border border-[#222222] rounded-xl overflow-hidden backdrop-blur-sm">
              <div 
                className="h-64 bg-cover bg-center relative"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1621504450181-5d356f61d307?q=80&w=800&auto=format&fit=crop')` }}
              >
                <div className="absolute inset-0 bg-black/60 mix-blend-multiply" />
                <div className="absolute top-4 left-4 bg-[#000000]/80 backdrop-blur border border-[#FF7300]/30 px-3 py-1 rounded text-[11px] font-semibold text-[#FFA751]">
                  Segmentation Result
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <h3 className="font-bold text-white text-[14px]">Open Pits — Relative Fragment Distribution</h3>
                  <span className="px-2 py-1 bg-[#000000] border border-[#222222] rounded text-[10px] font-bold tracking-wider uppercase text-[#A3A3A3]">
                    Contoh Tampilan
                  </span>
                </div>
                
                <div className="h-48 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cumulativeData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222222" vertical={false} />
                      <XAxis dataKey="size" stroke="#A3A3A3" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#A3A3A3" fontSize={10} tickLine={false} axisLine={false} />
                      <RechartsTooltip contentStyle={{backgroundColor: '#000000', borderColor: '#222222', borderRadius: '8px', fontSize: '12px', color: '#F8FAFC'}} />
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
                
                <div className="flex gap-4 border-t border-[#222222] pt-6">
                  <div className="flex-1 text-center bg-[#000000] p-3 rounded-lg border border-[#222222]">
                    <div className="text-[11px] text-[#A3A3A3] mb-1">D10</div>
                    <div className="font-bold font-mono text-white text-[14px]">68 px</div>
                  </div>
                  <div className="flex-1 text-center bg-[#FF7300]/5 p-3 rounded-lg border border-[#FF7300]/20">
                    <div className="text-[11px] text-[#A3A3A3] mb-1">D50</div>
                    <div className="font-bold font-mono text-[#FF7300] text-[14px]">142 px</div>
                  </div>
                  <div className="flex-1 text-center bg-[#EF4444]/5 p-3 rounded-lg border border-[#EF4444]/20">
                    <div className="text-[11px] text-[#A3A3A3] mb-1">D80</div>
                    <div className="font-bold font-mono text-[#EF4444] text-[14px]">218 px</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-[#111111] border border-[#FF7300]/30 rounded-xl p-8 relative shadow-lg">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF7300]/5 blur-[80px] pointer-events-none" />
              <div className="absolute top-8 right-8 px-3 py-1 bg-[#FF7300]/10 border border-[#FF7300] rounded text-[10px] font-bold tracking-wider uppercase text-[#FF7300]">
                Konsep Decision Support
              </div>
              
              <h3 className="text-xl font-bold mb-8 text-white">Ringkasan Evaluasi</h3>
              
              <div className="mb-8">
                <div className="text-[12px] text-[#A3A3A3] mb-2">Fragmentation Status</div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF7300]/10 border border-[#FF7300]/50 text-[#FF7300] font-bold text-[13px]">
                  <span className="material-symbols-outlined text-[18px]">warning</span>
                  Relatif Kasar
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-[#000000] p-4 rounded-lg border border-[#222222]">
                  <div className="text-[12px] text-[#A3A3A3] mb-3">Indikator</div>
                  <ul className="space-y-3 text-[12px] font-medium text-[#FFA751]">
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">trending_up</span> D50 relatif meningkat</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">trending_up</span> D80 relatif meningkat</li>
                  </ul>
                </div>
                <div className="bg-[#000000] p-4 rounded-lg border border-[#222222]">
                  <div className="text-[12px] text-[#A3A3A3] mb-3">Potensi Dampak</div>
                  <ul className="space-y-3 text-[12px] text-[#F8FAFC]">
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-gray-500">arrow_forward</span> Loading efficiency</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-gray-500">arrow_forward</span> Crusher workload</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-[#111111] rounded-lg p-5 border border-[#222222] mb-6">
                <div className="text-[13px] font-bold mb-4 text-white">Rekomendasi Evaluasi</div>
                <ul className="space-y-3 text-[12px] text-[#A3A3A3]">
                  <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[16px] text-[#FF7300]">check_circle</span> Review burden & spacing</li>
                  <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[16px] text-[#FF7300]">check_circle</span> Evaluasi distribusi energi</li>
                  <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[16px] text-[#FF7300]">check_circle</span> Bandingkan dengan kondisi geologi</li>
                </ul>
              </div>
              
              <p className="text-[11px] text-[#A3A3A3] flex items-start gap-2">
                <span className="material-symbols-outlined text-[14px]">info</span>
                Rekomendasi merupakan bahan evaluasi, bukan instruksi perubahan blast parameter secara otomatis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TRACKING SECTION */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0A0A0A] to-[#000000] border-b border-[#222222]">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded border border-[#FF7300]/30 bg-[#FF7300]/5 text-[11px] font-bold text-[#FFA751] uppercase tracking-wider">
            Konsep Pengembangan
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-white">Tracking Fragmentasi dari Waktu ke Waktu</h2>
          <p className="text-[#A3A3A3] max-w-2xl mx-auto mb-16 text-[14px]">
            Riwayat analisis dirancang untuk membantu engineer membandingkan kondisi fragmentasi antar kegiatan blasting. Tren dapat digunakan untuk melihat apakah fragmentasi relatif menjadi lebih kasar atau lebih halus.
          </p>
          
          <div className="bg-[#111111]/50 border border-[#222222] rounded-xl p-8 max-w-3xl mx-auto relative backdrop-blur-sm">
            <div className="absolute top-4 right-4 px-2 py-1 bg-[#000000] border border-[#222222] rounded text-[10px] font-bold tracking-wider uppercase text-[#A3A3A3]">
              Concept Visualization
            </div>
            <h3 className="text-[16px] font-bold mb-8 text-left text-white">Relative D80 Trend</h3>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trackingMockupData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" vertical={false} />
                  <XAxis dataKey="blast" stroke="#A3A3A3" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#A3A3A3" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{backgroundColor: '#000000', borderColor: '#222222', borderRadius: '8px', fontSize: '12px', color: '#F8FAFC'}}
                    itemStyle={{color: '#FF7300'}}
                  />
                  <Line type="monotone" dataKey="d80" name="Relative D80 (px)" stroke="#FF7300" strokeWidth={3} dot={{ r: 4, fill: '#000000', strokeWidth: 2, stroke: '#FF7300' }} activeDot={{ r: 6, fill: '#FF7300' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* 8. RESEARCH CONTEXT SECTION */}
      <section id="research-context" className="pt-24 pb-12 px-6 bg-gradient-to-b from-[#000000] to-[#050505]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-[#FF7300]">Research Context</h2>
          
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex gap-4 pb-4 border-b border-[#222222]">
                <div className="w-32 text-[13px] text-[#A3A3A3] font-medium">Project</div>
                <div className="font-bold text-white text-[14px]">BlastInsight-XAI</div>
              </div>
              <div className="flex gap-4 pb-4 border-b border-[#222222]">
                <div className="w-32 text-[13px] text-[#A3A3A3] font-medium">Competition</div>
                <div className="font-bold text-white text-[14px]">DBEST 2026</div>
              </div>
              <div className="flex gap-4 pb-4 border-b border-[#222222]">
                <div className="w-32 text-[13px] text-[#A3A3A3] font-medium">Category</div>
                <div className="font-bold text-white text-[14px]">Smart Blasting & Digital Mining Systems</div>
              </div>
              <div className="flex gap-4 pb-4 border-b border-[#222222]">
                <div className="w-32 text-[13px] text-[#A3A3A3] font-medium">Our Team</div>
                <div className="font-bold text-white text-[14px]">2in1 Team</div>
              </div>
            </div>
            
            <div className="bg-[#111111]/50 border border-[#222222] rounded-xl p-6">
              <h3 className="font-bold mb-6 text-white">Research Team</h3>
              <ul className="space-y-6">
                <li>
                  <div className="font-bold text-[#F8FAFC] mb-1">Annasya Maulafidatu Zahra</div>
                  <div className="text-[12px] text-[#FF7300] font-medium">AI / Machine Learning</div>
                </li>
                <li>
                  <div className="font-bold text-[#F8FAFC] mb-1">Muhammad Panca Nugraha</div>
                  <div className="text-[12px] text-[#FF7300] font-medium">Data & Analysis</div>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-[#000000] border border-[#222222] rounded-lg p-6 mb-12 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#FF7300] to-transparent opacity-50" />
            <h4 className="text-[13px] font-bold mb-4 text-[#A3A3A3] flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">info</span> Catatan Penelitian
            </h4>
            <ul className="grid md:grid-cols-2 gap-x-8 gap-y-3 text-[11px] text-[#555555] list-disc pl-5">
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
      <footer className="py-8 px-6 bg-[#000000] border-t border-[#222222]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          
          <div className="md:w-1/3">
            <div className="font-bold text-[#FFA751] mb-1 text-[15px]">BlastInsight-XAI</div>
            <div className="text-[#A3A3A3] text-[11px]">Explainable AI for Automated Rock Fragmentation Assessment in Surface Mining</div>
          </div>
          
          <div className="md:w-1/3 text-[#A3A3A3] font-medium text-[13px]">
            2in1 Team - Telkom University Purwokerto & Universitas Ahmad Dahlan
          </div>
          
          <div className="md:w-1/3 md:text-right">
            <div className="font-medium text-[#F8FAFC] mb-1 text-[12px]">DBEST 2026 Research Prototype</div>
            <div className="text-[#555555] text-[10px] space-y-1">
              <div>Dikembangkan sebagai prototype penelitian.</div>
              <div>Dataset benchmark: Ural Federal University.</div>
            </div>
          </div>
          
        </div>
      </footer>
    </div>
  );
}