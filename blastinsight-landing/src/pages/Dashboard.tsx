import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  History, 
  Settings, 
  LogOut, 
  UploadCloud,
  PlusCircle,
  Activity, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  Image as ImageIcon,
  Eye,
  ScanSearch
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip 
} from 'recharts';

// --- INTERFACE & DUMMY DATA ---
interface BlastRecord {
  id: string;
  blastId: string;
  pitBench: string;
  blastDate: string;
  detectedFragments: number;
  oversizePercentage: number;
  oversizeCount: number;
  percentiles: { p10: number; p50: number; p80: number };
  evaluationStatus: string;
}

const dummyHistory: BlastRecord[] = [
  { id: '1', blastId: 'BLAST-2026-001', pitBench: 'Pit A (Batugamping)', blastDate: '10 Okt 2026', detectedFragments: 1245, oversizePercentage: 8.4, oversizeCount: 104, percentiles: { p10: 25, p50: 42, p80: 85 }, evaluationStatus: 'Optimal' },
  { id: '2', blastId: 'BLAST-2026-002', pitBench: 'Pit B (Andesit Keras)', blastDate: '09 Okt 2026', detectedFragments: 980, oversizePercentage: 18.7, oversizeCount: 183, percentiles: { p10: 30, p50: 55, p80: 115 }, evaluationStatus: 'Perlu Evaluasi' },
  { id: '3', blastId: 'BLAST-2026-003', pitBench: 'Pit C (Diorit Masif)', blastDate: '08 Okt 2026', detectedFragments: 1560, oversizePercentage: 28.5, oversizeCount: 444, percentiles: { p10: 45, p50: 85, p80: 150 }, evaluationStatus: 'Kritis' }
];

const cumulativeData = [
  { size: 0, percentage: 0 }, { size: 50, percentage: 5 }, { size: 100, percentage: 15 },
  { size: 150, percentage: 40 }, { size: 200, percentage: 65 }, { size: 250, percentage: 85 },
  { size: 300, percentage: 95 }, { size: 350, percentage: 100 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  // State untuk berpindah antara 'overview' (Telemetri) dan 'analysis' (XAI)
  const [activeMenu, setActiveMenu] = useState('overview');
  const [historyData] = useState<BlastRecord[]>(dummyHistory);

  const handleLogout = () => navigate('/');
  const handleGoToAnalysis = () => setActiveMenu('analysis');

  // Kalkulasi KPI
  const totalBlasts = historyData.length + 18; 
  const avgP50 = (historyData.reduce((acc, b) => acc + b.percentiles.p50, 0) / historyData.length).toFixed(1);
  const totalBoulders = historyData.reduce((acc, b) => acc + b.oversizeCount, 0);

  return (
    <div className="flex h-screen bg-[#050505] text-text-main font-sans overflow-hidden selection:bg-accent selection:text-black relative">
      
      {/* CSS Keyframes (Langsung di-inject) */}
      <style>{`
        @keyframes fadeSlideUp {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-slide { animation: fadeSlideUp 0.4s ease-out forwards; }
      `}</style>

      {/* Global Ambient Background Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />

      {/* 1. SIDEBAR KIRI */}
      <aside className="w-64 bg-black/90 border-r border-border/50 flex flex-col hidden md:flex z-50 backdrop-blur-xl">
        <div className="h-20 flex items-center px-6 border-b border-border/50">
          <img src="/logo.png" alt="BlastInsight" className="h-8 object-contain cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/')} />
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          <button 
            onClick={() => setActiveMenu('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${activeMenu === 'overview' ? 'bg-accent/10 text-accent border border-accent/30 shadow-[0_0_15px_rgba(255,115,0,0.1)]' : 'text-text-secondary hover:bg-card hover:text-white border border-transparent'}`}
          >
            <LayoutDashboard size={18} /> Telemetri
          </button>
          <button 
            onClick={() => setActiveMenu('analysis')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${activeMenu === 'analysis' ? 'bg-accent/10 text-accent border border-accent/30 shadow-[0_0_15px_rgba(255,115,0,0.1)]' : 'text-text-secondary hover:bg-card hover:text-white border border-transparent'}`}
          >
            <ScanSearch size={18} /> Ruang Analisis XAI
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-text-secondary hover:bg-card hover:text-white transition-all border border-transparent">
            <Settings size={18} /> Pengaturan Model
          </button>
        </nav>

        <div className="p-4 border-t border-border/50">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-danger/80 hover:bg-danger/10 hover:text-danger transition-all">
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </aside>

      {/* 2. AREA KONTEN UTAMA */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative z-10">
        
        {/* HEADER KONTEN */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-border/30 bg-black/40 backdrop-blur-md sticky top-0 z-40">
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">
              {activeMenu === 'overview' ? 'Dashboard Telemetri' : 'Ruang Analisis Fragmentasi'}
            </h1>
            <p className="text-[11px] text-accent uppercase tracking-wider font-bold">DBEST 2026 Evaluation System</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleGoToAnalysis} className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-lg text-sm font-bold hover:border-accent/50 hover:text-accent transition-colors">
              <UploadCloud size={16} /> Upload Foto Baru
            </button>
            <div className="h-10 w-10 rounded-full bg-accent/20 border border-accent/50 flex items-center justify-center text-accent font-bold cursor-pointer hover:bg-accent/30 transition-colors shadow-[0_0_15px_rgba(255,115,0,0.2)]">
              AM
            </div>
          </div>
        </header>

        {/* ================= VIEW 1: TELEMETRI (OVERVIEW) ================= */}
        {activeMenu === 'overview' && (
          <div className="p-8 max-w-7xl mx-auto w-full flex flex-col gap-8 animate-fade-slide">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/50">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-accent text-xs uppercase tracking-widest font-bold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                  </span>
                  Monitoring Operasional Penambangan
                </div>
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-text-secondary bg-clip-text text-transparent tracking-tight">
                  Status Eksekusi Peledakan
                </h2>
                <p className="text-sm text-text-secondary max-w-xl">Ringkasan metrik fragmentasi batuan, efisiensi penggalian, dan mitigasi oversize boulder di seluruh pit aktif.</p>
              </div>
              <button onClick={handleGoToAnalysis} className="px-6 py-3 rounded-lg bg-gradient-to-r from-accent to-[#E66800] text-black font-bold text-sm hover:shadow-[0_0_20px_rgba(255,115,0,0.4)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center gap-2 group self-start md:self-auto">
                <PlusCircle size={18} className="transition-transform group-hover:rotate-90" />
                <span>Analisis Foto Baru</span>
              </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card/40 backdrop-blur-md rounded-xl border border-border/80 p-5 flex flex-col justify-between hover:border-accent/40 transition-colors group cursor-default shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-text-secondary font-bold">Total Peledakan</span>
                  <Activity size={16} className="text-accent opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-3xl font-bold text-white">{totalBlasts}</span>
                  <span className="text-xs font-medium text-green-500">Bulan Ini</span>
                </div>
                <span className="text-xs text-text-secondary">Cakupan: Pit A, Pit B, Pit C</span>
              </div>
              
              <div className="bg-card/40 backdrop-blur-md rounded-xl border border-border/80 p-5 flex flex-col justify-between hover:border-blue-500/40 transition-colors group cursor-default shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-text-secondary font-bold">Rata-rata P50</span>
                  <TrendingUp size={16} className="text-blue-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-3xl font-bold text-white">{avgP50}</span>
                  <span className="text-sm font-medium text-text-secondary">cm</span>
                </div>
                <span className="text-xs text-blue-400 font-medium">Dalam batas toleransi desain</span>
              </div>

              <div className="bg-card/40 backdrop-blur-md rounded-xl border border-border/80 p-5 flex flex-col justify-between hover:border-danger/40 transition-colors group cursor-default shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-text-secondary font-bold">Boulder Terdeteksi</span>
                  <AlertTriangle size={16} className="text-danger opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-3xl font-bold text-danger">{totalBoulders}</span>
                  <span className="text-xs font-medium text-text-secondary">partikel &gt;100 cm</span>
                </div>
                <span className="text-xs text-accent font-medium">Disposisi secondary breaking</span>
              </div>

              <div className="bg-card/40 backdrop-blur-md rounded-xl border border-border/80 p-5 flex flex-col justify-between hover:border-green-500/40 transition-colors group cursor-default shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-text-secondary font-bold">Crusher Uptime</span>
                  <CheckCircle2 size={16} className="text-green-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-3xl font-bold text-green-500">98.4%</span>
                  <span className="text-xs font-medium text-text-secondary">Indeks</span>
                </div>
                <span className="text-xs text-text-secondary">Zero bridging incidence (24h)</span>
              </div>
            </div>

            {/* Active Pits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black/60 border border-border/80 rounded-xl p-5 flex flex-col gap-4 hover:border-green-500/30 transition-colors shadow-lg">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <span className="font-bold text-sm text-white flex items-center gap-2"><Layers size={14} className="text-text-secondary"/> Pit A (Batugamping)</span>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/20">Optimal</span>
                </div>
                <div className="text-xs text-text-secondary space-y-2.5">
                  <div className="flex justify-between"><span className="text-muted">Oversize Rate:</span><span className="font-bold text-white">8.4%</span></div>
                  <div className="flex justify-between"><span className="text-muted">Powder Factor:</span><span className="font-bold text-white">0.42 kg/m³</span></div>
                  <div className="flex justify-between"><span className="text-muted">Excavator Fleet:</span><span className="font-medium text-white bg-card px-2 py-0.5 rounded border border-border">CAT 6020B</span></div>
                </div>
              </div>
              
              <div className="bg-black/60 border border-accent/30 rounded-xl p-5 flex flex-col gap-4 hover:border-accent/60 transition-colors shadow-[0_0_15px_rgba(255,115,0,0.05)]">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <span className="font-bold text-sm text-white flex items-center gap-2"><Layers size={14} className="text-text-secondary"/> Pit B (Andesit Keras)</span>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-accent/15 text-accent border border-accent/30">Perlu Evaluasi</span>
                </div>
                <div className="text-xs text-text-secondary space-y-2.5">
                  <div className="flex justify-between"><span className="text-muted">Oversize Rate:</span><span className="font-bold text-accent">18.7%</span></div>
                  <div className="flex justify-between"><span className="text-muted">Powder Factor:</span><span className="font-bold text-white">0.48 kg/m³</span></div>
                  <div className="flex justify-between"><span className="text-muted">Excavator Fleet:</span><span className="font-medium text-white bg-card px-2 py-0.5 rounded border border-border">Komatsu PC1250</span></div>
                </div>
              </div>

              <div className="bg-black/60 border border-border/80 rounded-xl p-5 flex flex-col gap-4 hover:border-danger/40 transition-colors shadow-lg">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <span className="font-bold text-sm text-white flex items-center gap-2"><Layers size={14} className="text-text-secondary"/> Pit C (Diorit Masif)</span>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-danger/10 text-danger border border-danger/30">Kritis</span>
                </div>
                <div className="text-xs text-text-secondary space-y-2.5">
                  <div className="flex justify-between"><span className="text-muted">Oversize Rate:</span><span className="font-bold text-danger">28.5%</span></div>
                  <div className="flex justify-between"><span className="text-muted">Powder Factor:</span><span className="font-bold text-white">0.38 kg/m³</span></div>
                  <div className="flex justify-between"><span className="text-muted">Excavator Fleet:</span><span className="font-medium text-white bg-card px-2 py-0.5 rounded border border-border">Hitachi EX1200</span></div>
                </div>
              </div>
            </div>

            {/* Riwayat Table */}
            <div className="bg-card/40 backdrop-blur-md rounded-xl border border-border/80 p-6 flex flex-col gap-6 shadow-xl hover:border-accent/30 transition-colors duration-500">
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg text-white">Riwayat Peledakan Terbaru</span>
                <span className="text-[10px] text-text-secondary uppercase tracking-wider font-bold bg-black/50 px-3 py-1.5 rounded-full border border-border/50">Klik baris untuk analisis</span>
              </div>
              <div className="overflow-x-auto rounded-lg border border-border/50">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-black/80">
                    <tr className="text-text-secondary uppercase text-[10px] font-bold tracking-wider">
                      <th className="py-4 px-4 border-b border-border/50">Blast ID</th>
                      <th className="py-4 px-4 border-b border-border/50">Lokasi Pit</th>
                      <th className="py-4 px-4 border-b border-border/50">Tanggal</th>
                      <th className="py-4 px-4 border-b border-border/50">Fragmen</th>
                      <th className="py-4 px-4 border-b border-border/50">Oversize</th>
                      <th className="py-4 px-4 border-b border-border/50">P50</th>
                      <th className="py-4 px-4 border-b border-border/50">Status</th>
                      <th className="py-4 px-4 border-b border-border/50 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 bg-black/30">
                    {historyData.map((item) => (
                      <tr key={item.id} onClick={handleGoToAnalysis} className="hover:bg-accent/10 cursor-pointer transition-colors duration-300 group">
                        <td className="py-4 px-4 font-bold text-white group-hover:text-accent transition-colors">{item.blastId}</td>
                        <td className="py-4 px-4 text-text-secondary font-medium">{item.pitBench}</td>
                        <td className="py-4 px-4 text-muted text-xs">{item.blastDate}</td>
                        <td className="py-4 px-4 text-text-secondary tabular-nums">{item.detectedFragments} partikel</td>
                        <td className="py-4 px-4 tabular-nums font-bold">
                          <span className={item.oversizePercentage > 15 ? 'text-accent' : 'text-green-500'}>{item.oversizePercentage}%</span>
                        </td>
                        <td className="py-4 px-4 text-white tabular-nums">{item.percentiles.p50} cm</td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${item.evaluationStatus === 'Optimal' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : item.evaluationStatus === 'Perlu Evaluasi' ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>
                            {item.evaluationStatus}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button className="text-text-secondary group-hover:text-accent font-bold text-xs flex items-center gap-1 justify-end w-full transition-colors">
                            Buka <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ================= VIEW 2: RUANG ANALISIS XAI (ANALYSIS) ================= */}
        {activeMenu === 'analysis' && (
          <div className="p-8 max-w-7xl mx-auto w-full space-y-6 animate-fade-slide">
            
            {/* Action Bar */}
            <div className="flex items-center justify-between bg-card/40 p-5 rounded-xl border border-border/80 backdrop-blur-md shadow-lg">
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 bg-accent/10 rounded-lg border border-accent/30 flex items-center justify-center">
                   <ScanSearch size={20} className="text-accent" />
                 </div>
                 <div>
                   <h3 className="text-white font-bold text-sm">Simulasi Proses Prediksi YOLO11</h3>
                   <p className="text-xs text-text-secondary">Unggah foto muckpile untuk dianalisis oleh model XAI.</p>
                 </div>
               </div>
               <button className="flex items-center gap-2 bg-black border border-border/80 px-4 py-2.5 rounded-lg text-sm font-bold text-white hover:border-accent/50 hover:text-accent transition-colors shadow-md">
                <UploadCloud size={16} /> Upload Citra Mentah Baru
              </button>
            </div>

            {/* Alert Banner */}
            <div className="bg-accent/10 border border-accent/30 rounded-xl p-5 flex items-start gap-4 shadow-[0_0_15px_rgba(255,115,0,0.05)]">
              <AlertTriangle className="text-accent shrink-0 mt-0.5" size={24} />
              <div>
                <h4 className="text-sm font-bold text-accent mb-1 uppercase tracking-wide">Indikasi: Distribusi Fragmentasi Relatif Kasar (Oversize)</h4>
                <p className="text-sm text-text-secondary leading-relaxed">Berdasarkan inferensi model, persentase fragmen berukuran besar mendominasi area muckpile, mengindikasikan distribusi energi peledakan yang kurang optimal.</p>
              </div>
            </div>

            {/* Panel Visualisasi 3 Kolom */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-card/40 border border-border/80 rounded-xl p-5 flex flex-col shadow-lg">
                <div className="flex items-center gap-2 mb-4 text-sm font-bold text-white"><ImageIcon size={16} className="text-muted" /> Foto Input (Raw)</div>
                <div className="flex-1 bg-black rounded-lg border border-border/50 overflow-hidden relative min-h-[250px]">
                  <img src="https://images.unsplash.com/photo-1542382156828-59cbb147e8b2?q=80&w=600&auto=format&fit=crop" alt="Raw" className="w-full h-full object-cover opacity-80" />
                </div>
              </div>

              <div className="bg-card/40 border border-accent/40 rounded-xl p-5 flex flex-col shadow-[0_0_20px_rgba(255,115,0,0.1)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-[40px] pointer-events-none" />
                <div className="flex items-center gap-2 mb-4 text-sm font-bold text-white relative z-10"><Layers size={16} className="text-accent" /> YOLO11-Seg (Instance)</div>
                <div className="flex-1 bg-black rounded-lg border border-accent/30 overflow-hidden relative min-h-[250px] z-10">
                   <img src="https://images.unsplash.com/photo-1542382156828-59cbb147e8b2?q=80&w=600&auto=format&fit=crop" alt="Seg" className="w-full h-full object-cover mix-blend-luminosity opacity-50" />
                   <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPgo8cGF0aCBkPSJNMTAgMTBoNTB2NTBIMTB6IiBmaWxsPSJyZ2JhKDI1NSwgMTE1LCAwLCAwLjQpIiBzdHJva2U9IiNmZjczMDAiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=')] opacity-40 group-hover:opacity-60 transition-opacity" />
                </div>
              </div>

              <div className="bg-card/40 border border-border/80 rounded-xl p-5 flex flex-col shadow-lg group">
                <div className="flex items-center gap-2 mb-4 text-sm font-bold text-white"><Eye size={16} className="text-blue-500" /> EigenCAM Heatmap</div>
                <div className="flex-1 bg-black rounded-lg border border-blue-500/30 overflow-hidden relative min-h-[250px]">
                  <img src="https://images.unsplash.com/photo-1542382156828-59cbb147e8b2?q=80&w=600&auto=format&fit=crop" alt="CAM" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/60 via-transparent to-red-600/60 mix-blend-overlay group-hover:opacity-80 transition-opacity" />
                </div>
              </div>
            </div>

            {/* Panel Analitik & DSS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-card/40 border border-border/80 rounded-xl p-6 shadow-lg">
                <h3 className="text-sm font-bold text-white mb-6">Kurva Distribusi Persentil Fragmentasi (S-Curve)</h3>
                <div className="h-64 cursor-crosshair">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cumulativeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222222" vertical={false} />
                      <XAxis dataKey="size" stroke="#A3A3A3" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#A3A3A3" fontSize={10} tickLine={false} axisLine={false} />
                      <RechartsTooltip contentStyle={{backgroundColor: '#0A0A0A', borderColor: '#222222', borderRadius: '8px', fontSize: '12px', color: '#FFF'}} />
                      <Area type="monotone" dataKey="percentage" stroke="#FF7300" strokeWidth={2} fillOpacity={1} fill="url(#colorOrange)" />
                      <defs>
                        <linearGradient id="colorOrange" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF7300" stopOpacity={0.4}/><stop offset="95%" stopColor="#FF7300" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-card/40 border border-accent/40 rounded-xl p-6 shadow-[0_0_30px_rgba(255,115,0,0.1)] flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 blur-[50px] pointer-events-none" />
                <h3 className="text-sm font-bold text-white mb-6 relative z-10">Decision Support System</h3>
                
                <div className="flex gap-2 mb-8 relative z-10">
                  <div className="flex-1 bg-black/60 p-3 rounded-lg border border-border/80 text-center"><div className="text-[10px] text-text-secondary uppercase font-bold mb-1">D10</div><div className="text-sm font-bold text-white tabular-nums">68 px</div></div>
                  <div className="flex-1 bg-accent/15 p-3 rounded-lg border border-accent/50 text-center shadow-[0_0_15px_rgba(255,115,0,0.1)]"><div className="text-[10px] text-accent uppercase font-bold mb-1">D50 (Central)</div><div className="text-sm font-bold text-accent tabular-nums">142 px</div></div>
                  <div className="flex-1 bg-black/60 p-3 rounded-lg border border-border/80 text-center"><div className="text-[10px] text-text-secondary uppercase font-bold mb-1">D80</div><div className="text-sm font-bold text-white tabular-nums">218 px</div></div>
                </div>
                
                <div className="flex-1 relative z-10">
                  <div className="text-xs font-bold text-text-secondary mb-3 uppercase tracking-widest border-b border-border/50 pb-2">Rekomendasi Tindakan</div>
                  <ul className="space-y-4 text-sm text-text-main">
                    <li className="flex items-start gap-3"><CheckCircle2 size={16} className="text-accent shrink-0 mt-0.5" /> <span>Kurangi jarak <strong>Burden & Spacing</strong> untuk meningkatkan distribusi energi.</span></li>
                    <li className="flex items-start gap-3"><CheckCircle2 size={16} className="text-accent shrink-0 mt-0.5" /> <span>Tinjau ulang spesifikasi bahan peledak pada lubang basah.</span></li>
                  </ul>
                </div>
                
                <button className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-lg border border-border/80 transition-all hover:border-accent/50 relative z-10">
                  Unduh Laporan PDF
                </button>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}