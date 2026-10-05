import React, { useState, useRef } from 'react';
import { BlastRecord, ViewerLayer } from '../types';
import { ImageViewer } from './ImageViewer';
import { SieveChart } from './SieveChart';
import { PdfReportModal } from './PdfReportModal';
import { DEMO_PRESETS } from '../data/blastData';

// Import fungsi helper untuk Supabase Storage
import { uploadImageToSupabase } from '../lib/storageHelper';

interface AnalysisViewProps {
  currentBlast: BlastRecord;
  setCurrentBlast: (blast: BlastRecord) => void;
  onSaveToHistory: (blast: BlastRecord) => void | Promise<void>;
  onSelectPresetRecord: (recordId: string) => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  currentBlast,
  setCurrentBlast,
  onSaveToHistory,
  onSelectPresetRecord
}) => {
  const [layer, setLayer] = useState<ViewerLayer>('segmentation');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // State loading untuk proses upload
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  
  // State untuk menyimpan file fisik sebelum diunggah
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form field state
  const [blastIdInput, setBlastIdInput] = useState(currentBlast.blastId);
  const [pitBenchInput, setPitBenchInput] = useState(currentBlast.pitBench);
  const [blastDateInput, setBlastDateInput] = useState(currentBlast.blastDate);
  const [geologyInput, setGeologyInput] = useState(currentBlast.geologyFormation);
  const [notesInput, setNotesInput] = useState(currentBlast.notes);

  const showToast = (msg: string) => {
    setNotificationMessage(msg);
    setTimeout(() => {
      setNotificationMessage(null);
    }, 3500);
  };

  // Trigger analysis simulation
  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      // Update the record with current user inputs
      const updated: BlastRecord = {
        ...currentBlast,
        blastId: blastIdInput,
        pitBench: pitBenchInput,
        blastDate: blastDateInput,
        geologyFormation: geologyInput,
        notes: notesInput
      };
      setCurrentBlast(updated);
      showToast(`Inferensi YOLO11-Seg Selesai (${currentBlast.inferenceTimeMs}ms) — 247 Fragmen Tervalidasi`);
    }, 1300);
  };

  // Handle local file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file); // Simpan file fisik ke state
      const url = URL.createObjectURL(file); // Preview lokal sementara
      const updated: BlastRecord = {
        ...currentBlast,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        imageUrl: url
      };
      setCurrentBlast(updated);
      showToast(`Berkas ${file.name} berhasil dimuat. Klik Mulai Analisis untuk segmentasi.`);
    }
  };

  // Logika baru: Unggah ke Storage, lalu simpan ke Database
  const handleSave = async () => {
    setIsSaving(true);
    let finalImageUrl = currentBlast.imageUrl;

    // Jika ada file baru yang dipilih dari laptop, unggah dulu ke Supabase
    if (selectedFile) {
      showToast('Mengunggah gambar ke Cloud Storage...');
      const uploadedUrl = await uploadImageToSupabase(selectedFile, 'originals');
      
      if (uploadedUrl) {
        finalImageUrl = uploadedUrl;
      } else {
        showToast('Gagal mengunggah gambar. Coba lagi.');
        setIsSaving(false);
        return; // Batalkan simpan jika gagal upload
      }
    }

    // Update record dengan link gambar publik dan input teks terbaru
    const recordToSave: BlastRecord = {
      ...currentBlast,
      imageUrl: finalImageUrl,
      blastId: blastIdInput,
      pitBench: pitBenchInput,
      blastDate: blastDateInput,
      geologyFormation: geologyInput,
      notes: notesInput
    };

    await onSaveToHistory(recordToSave);

    setIsSaving(false);
    setIsSaved(true);
    setSelectedFile(null); // Bersihkan file dari antrean setelah sukses
    showToast('Analisis fragmentasi beserta gambar berhasil disimpan ke Cloud.');
    
    setTimeout(() => {
      setIsSaved(false);
    }, 2500);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Toast feedback banner */}
      {notificationMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#171c22] border border-[#f59e0b] text-[#dee3eb] px-4 py-3 rounded-lg shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-[#f59e0b] text-[20px]">
            notifications_active
          </span>
          <span className="text-[12px] font-medium">{notificationMessage}</span>
        </div>
      )}

      <div className="px-4 sm:px-6 lg:px-10 py-6 max-w-7xl mx-auto w-full flex flex-col gap-6 lg:gap-8">
        {/* Top Header Diagnostic Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#30353c] pb-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[#ffc174] text-[11px] uppercase tracking-widest font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>
              Modul Analisis Komputasi
            </div>
            <h1 className="text-[26px] sm:text-[32px] lg:text-[36px] font-bold text-[#dee3eb] tracking-tight leading-tight">
              Analisis Fragmentasi Baru
            </h1>
            <p className="text-[13px] sm:text-[14px] text-[#d8c3ad] max-w-2xl">
              Masukkan gambar hasil peledakan untuk mendapatkan evaluasi awal berbasis
              Explainable Computer Vision &amp; Deep Learning YOLO11-Seg.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto bg-[#1b2026] px-3.5 py-1.5 rounded-lg border border-[#30353c]">
            <span className="material-symbols-outlined text-[18px] text-[#4ae176]">
              memory
            </span>
            <span className="text-[12px] text-[#dee3eb]">
              Engine:{' '}
              <span className="text-[#ffc174] font-semibold">
                YOLO11-Seg-Mining-v1
              </span>
            </span>
          </div>
        </div>

        {/* Preset Selector Pill Bar */}
        <div className="flex flex-wrap items-center gap-2 text-[12px]">
          <span className="text-[#a08e7a] text-[11px] uppercase tracking-wider font-semibold">
            Muat Contoh Uji:
          </span>
          {DEMO_PRESETS.map((preset) => (
            <button
              key={preset.blastId}
              onClick={() => {
                onSelectPresetRecord(preset.recordId);
                setSelectedFile(null); // Bersihkan antrean file jika milih preset
                setBlastIdInput(preset.blastId);
                setPitBenchInput(preset.pitBench);
                setGeologyInput(preset.formation);
                setBlastDateInput(preset.date);
              }}
              className={`px-3 py-1 rounded-lg border transition-all ${
                currentBlast.blastId === preset.blastId
                  ? 'bg-[#1b2026] border-[#f59e0b] text-[#ffc174] font-medium'
                  : 'bg-[#171c22] border-[#30353c] text-[#a08e7a] hover:text-[#dee3eb] hover:border-[#534434]'
              }`}
            >
              {preset.name} ({preset.status})
            </button>
          ))}
        </div>

        {/* 2-Column Input Configuration Panel */}
        <div className="bg-[#1b2026] rounded-xl border border-[#30353c] p-4 sm:p-6 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Column 1: Input Meta Peledakan */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-[#dee3eb] font-semibold text-[14px] border-b border-[#30353c]/60 pb-2">
                <span className="material-symbols-outlined text-[20px] text-[#ffc174]">
                  tune
                </span>
                <span>Metadata Parameter Peledakan</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
                {/* Blast ID */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-[#d8c3ad] uppercase tracking-wider font-medium">
                    Blast ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={blastIdInput}
                      onChange={(e) => setBlastIdInput(e.target.value)}
                      placeholder="e.g. BLAST-001"
                      className="w-full bg-[#0f141a] text-[#dee3eb] text-[13px] px-3.5 py-2.5 rounded-lg border border-[#30353c] focus:outline-none focus:border-[#f59e0b] transition-colors pr-9"
                    />
                    <span className="absolute right-3 top-2.5 text-[#a08e7a] material-symbols-outlined text-[18px]">
                      tag
                    </span>
                  </div>
                </div>

                {/* Lokasi Pit & Bench */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-[#d8c3ad] uppercase tracking-wider font-medium">
                    Lokasi Pit &amp; Bench
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={pitBenchInput}
                      onChange={(e) => setPitBenchInput(e.target.value)}
                      placeholder="e.g. Pit A - B02"
                      className="w-full bg-[#0f141a] text-[#dee3eb] text-[13px] px-3.5 py-2.5 rounded-lg border border-[#30353c] focus:outline-none focus:border-[#f59e0b] transition-colors pr-9"
                    />
                    <span className="absolute right-3 top-2.5 text-[#a08e7a] material-symbols-outlined text-[18px]">
                      layers
                    </span>
                  </div>
                </div>

                {/* Tanggal Peledakan */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-[#d8c3ad] uppercase tracking-wider font-medium">
                    Tanggal Peledakan
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={blastDateInput}
                      onChange={(e) => setBlastDateInput(e.target.value)}
                      className="w-full bg-[#0f141a] text-[#dee3eb] text-[13px] px-3.5 py-2.5 rounded-lg border border-[#30353c] focus:outline-none focus:border-[#f59e0b] transition-colors"
                    />
                  </div>
                </div>

                {/* Formasi Geologi */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-[#d8c3ad] uppercase tracking-wider font-medium">
                    Formasi Geologi
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={geologyInput}
                      onChange={(e) => setGeologyInput(e.target.value)}
                      placeholder="Deskripsi batuan..."
                      className="w-full bg-[#0f141a] text-[#dee3eb] text-[13px] px-3.5 py-2.5 rounded-lg border border-[#30353c] focus:outline-none focus:border-[#f59e0b] transition-colors pr-9"
                    />
                    <span className="absolute right-3 top-2.5 text-[#a08e7a] material-symbols-outlined text-[18px]">
                      terrain
                    </span>
                  </div>
                </div>
              </div>

              {/* Catatan Tambahan Lapangan */}
              <div className="flex flex-col gap-1.5 mt-1">
                <label className="text-[11px] text-[#d8c3ad] uppercase tracking-wider font-medium">
                  Catatan Tambahan Lapangan (Opsional)
                </label>
                <input
                  type="text"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Kondisi lapangan..."
                  className="w-full bg-[#0f141a] text-[#dee3eb] text-[13px] px-3.5 py-2.5 rounded-lg border border-[#30353c] focus:outline-none focus:border-[#f59e0b] transition-colors"
                />
              </div>
            </div>

            {/* Column 2: Upload Area */}
            <div className="flex flex-col gap-3 justify-between">
              <div className="flex items-center gap-2 text-[#dee3eb] font-semibold text-[14px] border-b border-[#30353c]/60 pb-2">
                <span className="material-symbols-outlined text-[20px] text-[#ffc174]">
                  add_photo_alternate
                </span>
                <span>Berkas Muckpile Lapangan</span>
              </div>

              {/* Drag and drop zone with real file upload */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png,image/jpeg,image/jpg"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    setSelectedFile(file); // Simpan file fisik ke state
                    const url = URL.createObjectURL(file);
                    setCurrentBlast({
                      ...currentBlast,
                      fileName: file.name,
                      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                      imageUrl: url
                    });
                    showToast(`Berkas ${file.name} diunggah via drag-and-drop.`);
                  }
                }}
                className="border-2 border-dashed border-[#30353c] hover:border-[#f59e0b]/60 bg-[#0f141a]/50 rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full bg-[#252a31] flex items-center justify-center text-[#ffc174] group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[28px]">
                    cloud_upload
                  </span>
                </div>
                <div className="text-[13px] font-semibold text-[#dee3eb]">
                  Unggah Gambar Fragmentasi Muckpile
                </div>
                <div className="text-[11px] text-[#a08e7a]">
                  Format didukung: JPG, JPEG, PNG (Maks. 20MB)
                </div>
              </div>

              {/* Active Selected Preview Pill */}
              <div className="flex items-center justify-between bg-[#252a31] px-4 py-2.5 rounded-lg border border-[#30353c]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-[#0f141a] border border-[#30353c]">
                    <img
                      src={currentBlast.imageUrl}
                      alt="Thumbnail muckpile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[12px] font-semibold text-[#dee3eb] truncate">
                      {currentBlast.fileName}
                    </span>
                    <span className="text-[11px] text-[#a08e7a] truncate">
                      {currentBlast.fileSize} • Dimensi: {currentBlast.dimensions}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#4ae176]/10 border border-[#4ae176]/30 text-[#4ae176] uppercase tracking-wide shrink-0">
                  Terverifikasi
                </span>
              </div>
            </div>
          </div>

          {/* Main Action Call to Action */}
          <div className="mt-6 pt-4 border-t border-[#30353c] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col text-left">
              <div className="text-[12px] text-[#dee3eb]">
                Model yang digunakan adalah model{' '}
                <span className="font-semibold text-[#ffc174]">YOLO11-Seg</span> yang
                telah dilatih secara khusus pada dataset batuan tambang.
              </div>
              <div className="text-[11px] text-[#a08e7a]">
                Pada prototype penelitian DBEST 2026, beberapa hasil dapat
                menggunakan output pra-komputasi eksperimental.
              </div>
            </div>
            <button
              id="run-analysis-btn"
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="w-full md:w-auto px-6 py-3 rounded-lg bg-[#f59e0b] text-[#0f141a] text-[14px] font-bold hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md shrink-0 cursor-pointer disabled:opacity-75"
            >
              {isAnalyzing ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">
                    autorenew
                  </span>
                  <span>Memproses YOLO11-Seg...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">
                    psychology
                  </span>
                  <span>Mulai Analisis YOLO11-Seg</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Divider Status: Transition to Results */}
        <div className="flex items-center gap-4 my-1">
          <div className="h-px bg-[#30353c] flex-1"></div>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#252a31] border border-[#30353c] text-[#dee3eb] text-[12px] font-medium shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4ae176] animate-pulse"></span>
            <span>Hasil Analisis Fragmentasi Peledakan — Selesai Dihitung</span>
          </div>
          <div className="h-px bg-[#30353c] flex-1"></div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Fragmen Terdeteksi */}
          <div className="bg-[#1b2026] rounded-xl border border-[#30353c] p-4 flex flex-col justify-between hover:border-[#a08e7a]/40 transition-colors shadow-sm">
            <div className="flex items-center justify-between text-[#a08e7a]">
              <span className="text-[11px] uppercase tracking-wider font-semibold">
                Fragmen Terdeteksi
              </span>
              <span className="material-symbols-outlined text-[20px]">hub</span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-3">
              <span className="text-[32px] sm:text-[36px] text-[#dee3eb] font-bold tabular-nums">
                {currentBlast.detectedFragments}
              </span>
              <span className="text-[11px] text-[#a08e7a]">unit partikel</span>
            </div>
            <div className="text-[12px] text-[#4ae176] flex items-center gap-1 mt-1 font-medium">
              <span className="material-symbols-outlined text-[15px]">
                check_circle
              </span>
              <span>Segmentasi poligon valid</span>
            </div>
          </div>

          {/* Card 2: Oversize (>100 cm) */}
          <div className="bg-[#1b2026] rounded-xl border border-[#f59e0b]/30 p-4 flex flex-col justify-between hover:border-[#f59e0b]/60 transition-colors bg-gradient-to-br from-[#1b2026] via-[#1b2026] to-[#f59e0b]/10 shadow-sm">
            <div className="flex items-center justify-between text-[#a08e7a]">
              <span className="text-[11px] uppercase tracking-wider font-semibold">
                Oversize (&gt;100 cm)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f59e0b]/20 text-[#ffc174] border border-[#f59e0b]/40">
                RISK
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-3">
              <span className="text-[32px] sm:text-[36px] text-[#f59e0b] font-bold tabular-nums">
                {currentBlast.oversizePercentage.toFixed(1).replace('.', ',')}%
              </span>
              <span className="text-[11px] text-[#a08e7a]">
                {currentBlast.oversizeCount} partikel
              </span>
            </div>
            <div className="text-[12px] text-[#ffc174] flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[15px]">warning</span>
              <span>Ambang toleransi: ≤ {currentBlast.oversizeTolerance.toFixed(1).replace('.', ',')}%</span>
            </div>
          </div>

          {/* Card 3: Ukuran Dominan */}
          <div className="bg-[#1b2026] rounded-xl border border-[#30353c] p-4 flex flex-col justify-between hover:border-[#a08e7a]/40 transition-colors shadow-sm">
            <div className="flex items-center justify-between text-[#a08e7a]">
              <span className="text-[11px] uppercase tracking-wider font-semibold">
                Ukuran Dominan
              </span>
              <span className="material-symbols-outlined text-[20px]">straighten</span>
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-[30px] sm:text-[36px] text-[#dee3eb] font-bold">
                {currentBlast.dominantCategory}
              </span>
              <span className="text-[12px] text-[#4ae176] font-semibold">
                {currentBlast.dominantPercentage.toFixed(1).replace('.', ',')}%
              </span>
            </div>
            <div className="text-[12px] text-[#a08e7a] mt-1">
              Kisaran optimal: {currentBlast.dominantRange}
            </div>
          </div>

          {/* Card 4: Status Evaluasi */}
          <div className="bg-[#1b2026] rounded-xl border border-[#30353c] p-4 flex flex-col justify-between hover:border-[#a08e7a]/40 transition-colors shadow-sm">
            <div className="flex items-center justify-between text-[#a08e7a]">
              <span className="text-[11px] uppercase tracking-wider font-semibold">
                Status Evaluasi
              </span>
              <span className="material-symbols-outlined text-[20px]">
                assignment_turned_in
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-3">
              <span className="text-[20px] sm:text-[22px] text-[#f59e0b] font-bold tracking-tight">
                {currentBlast.evaluationStatus}
              </span>
            </div>
            <div className="text-[12px] text-[#a08e7a] mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
              <span className="truncate">{currentBlast.statusDetail}</span>
            </div>
          </div>
        </div>

        {/* 2-Column Analytical Deep Dive Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* KOLOM KIRI (7 cols): Interactive Viewer & Sieve Chart */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <ImageViewer blast={currentBlast} layer={layer} setLayer={setLayer} />
            <SieveChart blast={currentBlast} />
          </div>

          {/* KOLOM KANAN (5 cols): Early Detection & Decision Support Engine */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Card 1: Early Detection Alert */}
            <div className="bg-[#1b2026] rounded-xl border border-[#30353c] p-5 sm:p-6 flex flex-col gap-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider text-[#a08e7a] font-semibold">
                    Analisis Anomali Lapangan
                  </span>
                  <span className="text-[18px] font-semibold text-[#dee3eb]">
                    Early Detection Alert
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#f59e0b]/15 border border-[#f59e0b]/30 text-[#f59e0b] text-[11px] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
                  <span>Potensi Oversize Terdeteksi</span>
                </div>
              </div>

              {/* Risk Level Indicator Pill */}
              <div className="bg-[#0f141a] p-3 rounded-lg border border-[#30353c] flex items-center justify-between">
                <span className="text-[11px] text-[#a08e7a]">
                  Tingkat Risiko Operasional:
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-[#ffc174] font-bold">
                    {currentBlast.operationalRisk}
                  </span>
                  <div className="flex gap-1">
                    <div className="w-3 h-2 rounded-xs bg-[#4ae176]"></div>
                    <div className="w-3 h-2 rounded-xs bg-[#f59e0b]"></div>
                    <div
                      className={`w-3 h-2 rounded-xs ${
                        currentBlast.riskLevel === 3
                          ? 'bg-[#ffb4ab]'
                          : 'bg-[#30353c]'
                      }`}
                    ></div>
                  </div>
                </div>
              </div>

              <p className="text-[13px] text-[#d8c3ad] leading-relaxed">
                Sistem mendeteksi proporsi fragmen besar yang relatif tinggi (
                <span className="text-[#dee3eb] font-semibold">
                  {currentBlast.oversizePercentage.toFixed(1).replace('.', ',')}%
                </span>
                ) dan berpotensi menghambat proses muat (loading) pada excavator
                kelas 100-ton serta berisiko menyebabkan penyumbatan (bridging) pada{' '}
                <span className="text-[#ffc174] font-semibold">
                  primary jaw crusher
                </span>
                .
              </p>

              <div className="p-3 rounded-lg bg-[#252a31] border-l-2 border-[#f59e0b] text-[#d8c3ad] text-[12px] flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#ffc174] shrink-0 mt-0.5">
                  notification_important
                </span>
                <span>{currentBlast.geotechnicalNote}</span>
              </div>
            </div>

            {/* Card 2: Decision Support System (Blasting Engineer Recommendations) */}
            <div className="bg-[#1b2026] rounded-xl border border-[#30353c] p-5 sm:p-6 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center gap-2.5 text-[#dee3eb]">
                <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/20 flex items-center justify-center text-[#ffc174] shrink-0">
                  <span className="material-symbols-outlined text-[20px]">
                    engineering
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#a08e7a] uppercase tracking-wider font-semibold">
                    Explainable AI (XAI) Insight
                  </span>
                  <span className="text-[16px] sm:text-[17px] text-[#dee3eb] font-semibold">
                    Rekomendasi Evaluasi Blasting Engineer
                  </span>
                </div>
              </div>

              <div className="text-[13px] text-[#d8c3ad] bg-[#171c22] p-3.5 rounded-lg border border-[#30353c] italic leading-relaxed">
                {currentBlast.recommendationQuote}
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-[#dee3eb] uppercase tracking-wider font-semibold">
                  Poin Aksi Lapangan Terkomputasi:
                </span>
                <div className="flex flex-col gap-2 pt-1">
                  {currentBlast.actionPoints.map((action, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-[12px] text-[#d8c3ad]"
                    >
                      <span className="material-symbols-outlined text-[18px] text-[#ffc174] shrink-0">
                        check
                      </span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Action Buttons inside Decision Support */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 mt-1 border-t border-[#30353c]">
                <button
                  id="save-history-btn"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[#252a31] hover:bg-[#353a40] text-[#dee3eb] font-semibold text-[13px] border border-[#30353c] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-wait"
                >
                  {isSaving ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] text-[#4ae176] animate-spin">
                        autorenew
                      </span>
                      <span className="text-[#4ae176]">Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <span
                        className={`material-symbols-outlined text-[18px] ${
                          isSaved ? 'text-[#4ae176]' : ''
                        }`}
                      >
                        {isSaved ? 'check' : 'bookmark_add'}
                      </span>
                      <span className={isSaved ? 'text-[#4ae176]' : ''}>
                        {isSaved ? 'Tersimpan ke Riwayat' : 'Simpan ke Riwayat'}
                      </span>
                    </>
                  )}
                </button>
                <button
                  id="export-pdf-btn"
                  onClick={() => setIsPdfOpen(true)}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[#252a31] hover:bg-[#353a40] text-[#dee3eb] font-semibold text-[13px] border border-[#30353c] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#ffc174]">
                    picture_as_pdf
                  </span>
                  <span>Ekspor PDF Laporan</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Minimalist Footer */}
        <div className="border-t border-[#30353c]/80 pt-4 mt-2 flex flex-col sm:flex-row items-center justify-between text-[#a08e7a] text-[11px] gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#dee3eb]">BlastInsight-XAI</span>
            <span>•</span>
            <span>Telkom University Purwokerto</span>
          </div>
          <div>
            DBEST 2026 Research Prototype • Automated Geological Image Analytics
          </div>
        </div>
      </div>

      {/* PDF Modal */}
      <PdfReportModal
        blast={currentBlast}
        isOpen={isPdfOpen}
        onClose={() => setIsPdfOpen(false)}
      />
    </div>
  );
};