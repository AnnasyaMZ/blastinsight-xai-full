import React, { useState, useRef } from 'react';

import type { BlastRecord, ViewerLayer } from '../types';

import { ImageViewer } from './ImageViewer';

import { SieveChart } from './SieveChart';

import { PdfReportModal } from './PdfReportModal';

import { DEMO_PRESETS } from '../data/blastData';

import { UploadCloud, CheckCircle2, FileText, Settings2, Hash, MapPin, Mountain, BookmarkPlus, Cpu, ChevronDown, X } from 'lucide-react';


interface AnalysisViewProps {

  currentBlast: BlastRecord;


  setCurrentBlast: React.Dispatch<

    React.SetStateAction<BlastRecord>

  >;


  onSaveToHistory: (

    blast: BlastRecord

  ) => void | Promise<void>;


  onSelectPresetRecord: (

    recordId: string

  ) => void;

}


type DssDetail = {
  status?: string;
  position?: string;
  deviationPx?: number | null;
  interpretation?: string;
  operationalImpacts: string[];
  businessImpacts: string[];
  recommendations: string[];
  disclaimer?: string;
};

const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://127.0.0.1:8000';

const getStatusLabel = (status?: string) => {
  const normalized = status?.toUpperCase() || '';

  if (
    normalized === 'NEEDS_TARGET' ||
    normalized === 'UNAVAILABLE' ||
    !normalized
  ) {
    return 'BELUM DIEVALUASI';
  }

  return normalized;
};

const getStatusClass = (status?: string) => {
  const normalized = status?.toUpperCase() || '';

  if (normalized === 'OPTIMAL') {
    return 'bg-green-500/10 text-green-500 border-green-500/30';
  }

  if (normalized === 'OVERSIZE') {
    return 'bg-[#FF7300]/10 text-[#FF7300] border-[#FF7300]/30';
  }

  if (normalized === 'OVER-BREAKING') {
    return 'bg-red-500/10 text-red-500 border-red-500/30';
  }

  return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
};


export const AnalysisView: React.FC<AnalysisViewProps> = ({

  currentBlast,

  setCurrentBlast,

  onSaveToHistory,

  onSelectPresetRecord

}) => {

  const [layer, setLayer] = useState<ViewerLayer>('segmentation');

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const [isSaved, setIsSaved] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const [isPdfOpen, setIsPdfOpen] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [dssDetail, setDssDetail] = useState<DssDetail | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);


  const [blastIdInput, setBlastIdInput] = useState(currentBlast.blastId);

  const [pitBenchInput, setPitBenchInput] = useState(currentBlast.pitBench);

  const [blastDateInput, setBlastDateInput] = useState(currentBlast.blastDate);

  const [geologyInput, setGeologyInput] = useState(currentBlast.geologyFormation);


  // STATE BARU UNTUK TARGET D50 (DSS)

  const [lowerTarget, setLowerTarget] = useState("30");

  const [upperTarget, setUpperTarget] = useState("45");


  const [customPitMode, setCustomPitMode] = useState(false);

  const [customGeoMode, setCustomGeoMode] = useState(false);


  const handleRunAnalysis = async () => {
    if (!selectedFile) {
      alert('Silakan unggah citra muckpile lapangan terlebih dahulu.');
      return;
    }

    const lower = Number(lowerTarget);
    const upper = Number(upperTarget);

    if (
      lowerTarget.trim() === '' ||
      upperTarget.trim() === '' ||
      !Number.isFinite(lower) ||
      !Number.isFinite(upper)
    ) {
      alert('Target D50 bawah dan atas harus diisi dengan angka yang valid.');
      return;
    }

    if (lower >= upper) {
      alert('Batas target D50 bawah harus lebih kecil dari batas atas.');
      return;
    }

    setIsAnalyzing(true);
    setIsSaved(false);
    setDssDetail(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('lower_target_d50', lowerTarget);
    formData.append('upper_target_d50', upperTarget);

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        let detail = '';

        try {
          const errorData = await response.json();
          detail = errorData?.detail || '';
        } catch {
          // Response error bukan JSON.
        }

        throw new Error(
          detail ||
            `FastAPI mengembalikan status ${response.status}.`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          'Backend memproses gambar, tetapi mengembalikan status tidak sukses.'
        );
      }

      setDssDetail({
        status: data.dss?.status,
        position: data.dss?.position,
        deviationPx:
          data.dss?.deviation_px ?? null,
        interpretation:
          data.dss?.interpretation ||
          data.dss?.recommendation ||
          '',
        operationalImpacts:
          data.dss?.operational_impacts ?? [],
        businessImpacts:
          data.dss?.business_impacts ?? [],
        recommendations:
          data.dss?.recommendations ?? [],
        disclaimer:
          data.dss?.disclaimer
      });

      setCurrentBlast(prev => ({
        ...prev,

        // Metadata
        blastId: blastIdInput,
        pitBench: pitBenchInput,
        blastDate: blastDateInput,
        geologyFormation: geologyInput,

        // Reset data prototype / legacy
        oversizePercentage: 0,
        oversizeCount: 0,
        oversizeTolerance: 0,
        dominantCategory: '',
        dominantPercentage: 0,
        dominantRange: '',
        operationalRisk: '',
        riskLevel: 1,
        alertDescription: '',
        geotechnicalNote: '',
        polygons: [],

        // Metadata model lama tidak digunakan sebagai hasil runtime
        inferenceTimeMs: 0,
        confidence: 0,
        backbone: 'YOLO11s-Seg',

        // Quality Control
        totalDetections:
          data.fragmentation.total_detections,
        detectedFragments:
          data.fragmentation.valid_fragments,
        excludedFragments:
          data.fragmentation.excluded_fragments,
        validPercentage:
          data.fragmentation.valid_percentage,

        qc: {
          confidence_threshold:
            data.qc?.confidence_threshold,
          edge_touching_excluded:
            data.qc?.edge_touching_excluded,
          low_confidence_excluded:
            data.qc?.low_confidence_excluded
        },

        // D10 / D50 / D80
        percentiles: {
          ...prev.percentiles,
          p10:
            data.fragmentation.d10_px ?? 0,
          p50:
            data.fragmentation.d50_px ?? 0,
          p80:
            data.fragmentation.d80_px ?? 0
        },

        // Target D50 operasional
        targetD50: {
          lower,
          upper
        },

        // DSS
        evaluationStatus:
          data.dss.status,

        recommendationQuote:
          data.dss.recommendation ||
          data.dss.interpretation ||
          'Belum tersedia rekomendasi evaluasi.',

        actionPoints:
          data.dss.recommendations ?? [],

        statusDetail:
          data.dss.status === 'NEEDS_TARGET'
            ? 'Target D50 operasi belum ditentukan.'
            : data.dss.status === 'UNAVAILABLE'
            ? 'Evaluasi DSS belum tersedia.'
            : data.fragmentation.d50_px !== null
            ? `Hasil evaluasi D50: ${Number(
                data.fragmentation.d50_px
              ).toFixed(2)} px`
            : 'Nilai D50 belum tersedia.',

        // Visual FastAPI
        segmentationImageBase64:
          data.images?.segmentation ?? undefined,
        eigenCamImageBase64:
          data.images?.eigencam ?? undefined,

        // Distribution curve
        distributionCurve:
          data.distribution_curve ?? []
      }));

      setHasAnalyzed(true);

      console.log('FASTAPI RESULT:', data);
    } catch (error) {
      console.error('Error saat inferensi YOLO:', error);

      alert(
        error instanceof Error
          ? error.message
          : 'Analisis gagal. Pastikan backend FastAPI aktif dan konfigurasi API benar.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };


  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);

    if (currentBlast.imageUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(currentBlast.imageUrl);
    }

    const url = URL.createObjectURL(file);

    setCurrentBlast(prev => ({
      ...prev,

      fileName: file.name,
      imageUrl: url,

      // Reset hasil analisis sebelumnya
      totalDetections: undefined,
      detectedFragments: 0,
      excludedFragments: undefined,
      validPercentage: undefined,

      percentiles: {
        ...prev.percentiles,
        p10: 0,
        p50: 0,
        p80: 0
      },

      qc: undefined,
      targetD50: undefined,

      segmentationImageBase64: undefined,
      eigenCamImageBase64: undefined,
      distributionCurve: [],

      oversizePercentage: 0,
      oversizeCount: 0,
      oversizeTolerance: 0,

      dominantCategory: '',
      dominantPercentage: 0,
      dominantRange: '',

      operationalRisk: '',
      riskLevel: 1,
      alertDescription: '',
      geotechnicalNote: '',
      recommendationQuote: '',
      actionPoints: [],
      polygons: []
    }));

    setDssDetail(null);
    setHasAnalyzed(false);
    setIsSaved(false);
  };

  const handleSelectPreset = (
    recordId: string,
    preset: any
  ) => {
    onSelectPresetRecord(recordId);

    setBlastIdInput(preset.blastId);
    setPitBenchInput(preset.pitBench);
    setGeologyInput(preset.formation);
    setBlastDateInput(preset.date);

    // Preset menggunakan data yang sudah tersimpan pada BlastRecord.
    setDssDetail(null);
    setHasAnalyzed(true);
    setIsSaved(false);
  };

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);

    try {
      console.log(
        'CURRENT BLAST SEBELUM SAVE:',
        currentBlast
      );

      await onSaveToHistory({
        ...currentBlast,
        blastId: blastIdInput,
        pitBench: pitBenchInput,
        blastDate: blastDateInput,
        geologyFormation: geologyInput
      });

      setIsSaved(true);
      setTimeout(
        () => setIsSaved(false),
        2500
      );
    } catch (error) {
      console.error(
        'Gagal menyimpan analisis:',
        error
      );

      alert(
        'Gagal menyimpan hasil analisis.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const d50Value =
    Number(currentBlast.percentiles?.p50 ?? 0);

  const d10Value =
    Number(currentBlast.percentiles?.p10 ?? 0);

  const d80Value =
    Number(currentBlast.percentiles?.p80 ?? 0);

  const targetLabel =
    currentBlast.targetD50
      ? `${currentBlast.targetD50.lower}–${currentBlast.targetD50.upper} px`
      : 'Belum diisi';

  const getPositionLabel = () => {
    const deviation =
      dssDetail?.deviationPx;

    if (
      dssDetail?.position ===
      'ABOVE_UPPER_TARGET'
    ) {
      return deviation !== null &&
        deviation !== undefined
        ? `${deviation.toFixed(2)} px di atas batas atas`
        : 'Di atas batas atas';
    }

    if (
      dssDetail?.position ===
      'BELOW_LOWER_TARGET'
    ) {
      return deviation !== null &&
        deviation !== undefined
        ? `${deviation.toFixed(2)} px di bawah batas bawah`
        : 'Di bawah batas bawah';
    }

    if (
      dssDetail?.position ===
      'WITHIN_TARGET'
    ) {
      return 'Dalam rentang target';
    }

    if (
      dssDetail?.position ===
      'TARGET_NOT_SET'
    ) {
      return 'Target belum lengkap';
    }

    return 'Belum dievaluasi';
  };

  const dssRecommendations =
    dssDetail?.recommendations?.length
      ? dssDetail.recommendations
      : currentBlast.actionPoints ?? [];

  return (

    <div className="flex flex-col w-full font-sans relative">

      <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto w-full flex flex-col gap-8 animate-fade-slide">


        {/* Header Section */}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#222222] pb-6">

          <div className="flex flex-col gap-2">

            <div className="flex items-center gap-2 text-[#FF7300] text-xs uppercase tracking-widest font-bold">

              <span className="w-2 h-2 rounded-full bg-[#FF7300] animate-pulse"></span>

              Modul Analisis Komputasi

            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">

              Ruang Analisis XAI

            </h1>

            <p className="text-sm text-gray-400 max-w-2xl">

              Unggah citra muckpile pascapeledakan untuk dievaluasi oleh YOLO11s-Seg. Sistem menghitung D10/D50/D80, menerapkan Quality Control, menampilkan Eigen-CAM, dan mengevaluasi status fragmentasi berdasarkan D50 terhadap target operasi.

            </p>

          </div>

          <div className="flex items-center gap-2 bg-[#111111] px-4 py-2 rounded-lg border border-[#222222] shadow-sm">

            <Cpu size={18} className="text-green-500" />

            <span className="text-xs text-white font-bold">Engine: <span className="text-[#FF7300]">YOLO11s-Seg</span></span>

          </div>

        </div>


        {/* Preset Selector */}

        <div className="flex flex-wrap items-center gap-3 text-xs">

          <span className="text-gray-500 uppercase tracking-widest font-bold">Muat Sampel Uji:</span>

          {DEMO_PRESETS.map((preset) => (

            <button

              key={preset.blastId}

              onClick={() => handleSelectPreset(preset.recordId, preset)}

              className={`px-4 py-2 rounded-lg border font-bold transition-all ${

                currentBlast.blastId === preset.blastId && hasAnalyzed

                  ? 'bg-[#FF7300]/15 border-[#FF7300]/40 text-[#FF7300]'

                  : 'bg-[#000000] border-[#222222] text-gray-500 hover:text-white hover:border-gray-600'

              }`}

            >

              {preset.name} ({preset.status})

            </button>

          ))}

        </div>


        {/* Panel Konfigurasi Input */}

        <div className="bg-[#111111]/80 backdrop-blur-md rounded-xl border border-[#222222] p-6 shadow-lg">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">


            {/* Metadata Input */}

            <div className="flex flex-col gap-5">

              <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-[#222222] pb-3">

                <Settings2 size={18} className="text-[#FF7300]" /> Metadata Parameter Peledakan

              </div>


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="flex flex-col gap-1.5">

                  <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Blast ID</label>

                  <div className="relative">

                    <input type="text" value={blastIdInput} onChange={(e) => setBlastIdInput(e.target.value)} className="w-full bg-[#000000] text-white text-sm px-4 py-2.5 rounded-lg border border-[#222222] focus:border-[#FF7300] outline-none transition-colors" />

                    <Hash size={16} className="absolute right-3 top-3 text-gray-600" />

                  </div>

                </div>


                <div className="flex flex-col gap-1.5">

                  <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Lokasi Pit & Bench</label>

                  {customPitMode ? (

                    <div className="relative flex items-center">

                      <input 

                        type="text" 

                        autoFocus

                        value={pitBenchInput} 

                        onChange={(e) => setPitBenchInput(e.target.value)} 

                        placeholder="Ketik lokasi baru..." 

                        className="w-full bg-[#000000] text-white text-sm pl-4 pr-10 py-2.5 rounded-lg border border-[#FF7300] focus:outline-none transition-colors" 

                      />

                      <button onClick={() => { setCustomPitMode(false); setPitBenchInput('Pit B - Bench 04'); }} className="absolute right-2 p-1.5 text-gray-500 hover:text-red-500 transition-colors">

                        <X size={16} />

                      </button>

                    </div>

                  ) : (

                    <div className="relative">

                      <select 

                        value={pitBenchInput} 

                        onChange={(e) => {

                          if (e.target.value === 'ADD_NEW') { setCustomPitMode(true); setPitBenchInput(''); }

                          else { setPitBenchInput(e.target.value); }

                        }} 

                        className="w-full bg-[#000000] text-white text-sm px-4 py-2.5 rounded-lg border border-[#222222] focus:border-[#FF7300] outline-none transition-colors appearance-none cursor-pointer"

                      >

                        <option value="Pit A - Bench 02">Pit A - Bench 02</option>

                        <option value="Pit B - Bench 04">Pit B - Bench 04</option>

                        <option value="Pit C - Bench 01">Pit C - Bench 01</option>

                        {!["Pit A - Bench 02", "Pit B - Bench 04", "Pit C - Bench 01"].includes(pitBenchInput) && pitBenchInput !== '' && (

                          <option value={pitBenchInput}>{pitBenchInput}</option>

                        )}

                        <option value="ADD_NEW" className="text-[#FF7300] font-bold">+ Tambah Lokasi Baru...</option>

                      </select>

                      <MapPin size={16} className="absolute right-3 top-3 text-gray-600 pointer-events-none" />

                    </div>

                  )}

                </div>


                <div className="flex flex-col gap-1.5">

                  <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Tanggal Peledakan</label>

                  <div className="relative">

                    <input type="date" value={blastDateInput} onChange={(e) => setBlastDateInput(e.target.value)} className="w-full bg-[#000000] text-white text-sm px-4 py-2.5 rounded-lg border border-[#222222] focus:border-[#FF7300] outline-none transition-colors" />

                  </div>

                </div>


                <div className="flex flex-col gap-1.5">

                  <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Formasi Geologi</label>

                  {customGeoMode ? (

                    <div className="relative flex items-center">

                      <input 

                        type="text" 

                        autoFocus

                        value={geologyInput} 

                        onChange={(e) => setGeologyInput(e.target.value)} 

                        placeholder="Ketik formasi geologi baru..." 

                        className="w-full bg-[#000000] text-white text-sm pl-4 pr-10 py-2.5 rounded-lg border border-[#FF7300] focus:outline-none transition-colors" 

                      />

                      <button onClick={() => { setCustomGeoMode(false); setGeologyInput('Formasi Andesit Keras'); }} className="absolute right-2 p-1.5 text-gray-500 hover:text-red-500 transition-colors">

                        <X size={16} />

                      </button>

                    </div>

                  ) : (

                    <div className="relative">

                      <select 

                        value={geologyInput} 

                        onChange={(e) => {

                          if (e.target.value === 'ADD_NEW') { setCustomGeoMode(true); setGeologyInput(''); }

                          else { setGeologyInput(e.target.value); }

                        }} 

                        className="w-full bg-[#000000] text-white text-sm px-4 py-2.5 rounded-lg border border-[#222222] focus:border-[#FF7300] outline-none transition-colors appearance-none cursor-pointer"

                      >

                        <option value="Formasi Andesit Keras">Formasi Andesit Keras</option>

                        <option value="Batugamping Terkristalisasi">Batugamping Terkristalisasi</option>

                        <option value="Formasi Diorit Masif">Formasi Diorit Masif</option>

                        <option value="Granit Lapuk (Weathered)">Granit Lapuk (Weathered)</option>

                        <option value="Sedimen Sandstone">Sedimen Sandstone</option>

                        {!["Formasi Andesit Keras", "Batugamping Terkristalisasi", "Formasi Diorit Masif", "Granit Lapuk (Weathered)", "Sedimen Sandstone"].includes(geologyInput) && geologyInput !== '' && (

                          <option value={geologyInput}>{geologyInput}</option>

                        )}

                        <option value="ADD_NEW" className="text-[#FF7300] font-bold">+ Tambah Formasi Baru...</option>

                      </select>

                      <Mountain size={16} className="absolute right-3 top-3 text-gray-600 pointer-events-none" />

                    </div>

                  )}

                </div>


                {/* --- INPUT TARGET BAWAH --- */}

                <div className="flex flex-col gap-1.5">

                  <label className="text-[10px] text-[#FF7300] uppercase font-bold tracking-wider">Batas Target D50 (Bawah)</label>

                  <div className="relative">

                    <input 

                      type="number" 

                      value={lowerTarget} 

                      onChange={(e) => setLowerTarget(e.target.value)} 

                      placeholder="Misal: 30"

                      className="w-full bg-[#000000] text-white text-sm px-4 py-2.5 rounded-lg border border-[#222222] focus:border-[#FF7300] outline-none transition-colors" 

                    />

                    <span className="absolute right-4 top-2.5 text-xs text-gray-500 font-bold">px</span>

                  </div>

                </div>


                {/* --- INPUT TARGET ATAS --- */}

                <div className="flex flex-col gap-1.5">

                  <label className="text-[10px] text-[#FF7300] uppercase font-bold tracking-wider">Batas Target D50 (Atas)</label>

                  <div className="relative">

                    <input 

                      type="number" 

                      value={upperTarget} 

                      onChange={(e) => setUpperTarget(e.target.value)} 

                      placeholder="Misal: 45"

                      className="w-full bg-[#000000] text-white text-sm px-4 py-2.5 rounded-lg border border-[#222222] focus:border-[#FF7300] outline-none transition-colors" 

                    />

                    <span className="absolute right-4 top-2.5 text-xs text-gray-500 font-bold">px</span>

                  </div>

                </div>


              </div>

            </div>


            {/* Upload Area */}

            <div className="flex flex-col gap-4">

              <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-[#222222] pb-3">

                <UploadCloud size={18} className="text-[#FF7300]" /> Berkas Citra Muckpile Lapangan

              </div>

              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png,image/jpeg,image/jpg" className="hidden" />


              <div onClick={() => fileInputRef.current?.click()} className="flex-1 border-2 border-dashed border-[#222222] hover:border-[#FF7300]/50 bg-[#000000] rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-center transition-colors cursor-pointer group relative overflow-hidden">

                <img src={currentBlast.imageUrl} alt="preview" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-10 transition-opacity" />

                <div className="w-12 h-12 rounded-full bg-[#111111] flex items-center justify-center text-[#FF7300] group-hover:scale-110 transition-transform relative z-10 border border-[#222222]">

                  <UploadCloud size={24} />

                </div>

                <div className="text-sm font-bold text-white relative z-10">{currentBlast.fileName || "Unggah Citra Fragmentasi"}</div>

                <div className="text-xs text-gray-500 relative z-10">Maks. resolusi 2000px (JPG/PNG)</div>

              </div>

            </div>

          </div>


          {/* Action CTA */}

          <div className="mt-8 pt-6 border-t border-[#222222] flex flex-col md:flex-row items-center justify-between gap-4">

            <div className="text-xs text-gray-400">

              Sistem akan menerapkan <strong className="text-white">Quality Control (QC)</strong> untuk mengeksklusi fragmen <em>edge-touching</em> dan <em>confidence</em> &lt; 0.40.

            </div>

            <button 

              onClick={handleRunAnalysis} 

              disabled={isAnalyzing || hasAnalyzed} 

              className={`w-full md:w-auto px-8 py-3.5 rounded-lg text-black text-sm font-bold flex items-center justify-center gap-2 transition-all ${

                hasAnalyzed 

                  ? 'bg-[#222222] text-gray-400 cursor-not-allowed'

                  : 'bg-gradient-to-r from-[#FF7300] to-[#E66800] hover:shadow-[0_0_20px_rgba(255,115,0,0.4)] active:scale-95'

              }`}

            >

              {isAnalyzing ? <Cpu size={20} className="animate-pulse" /> : <Cpu size={20} />}

              <span>{isAnalyzing ? 'Mengeksekusi YOLO11s-Seg...' : hasAnalyzed ? 'Analisis Selesai' : 'Mulai Analisis YOLO11s-Seg'}</span>

            </button>

          </div>

        </div>


        {/* ================= HASIL ANALISIS HANYA MUNCUL JIKA hasAnalyzed === true ================= */}

        {hasAnalyzed && (

          <div className="flex flex-col gap-8 animate-fade-slide mt-4">


            <div className="flex items-center gap-4">

              <div className="h-px bg-[#222222] flex-1"></div>

              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111111] border border-[#222222] text-white text-xs font-bold">

                <ChevronDown size={16} className="text-green-500 animate-bounce" />

                <span>Hasil Analisis Selesai Dihitung</span>

              </div>

              <div className="h-px bg-[#222222] flex-1"></div>

            </div>


            {/* Summary Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#111111]/80 backdrop-blur-md rounded-xl border border-[#222222] p-5 flex flex-col justify-between shadow-lg">
                <div className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2">
                  Fragmen Valid (QC)
                </div>

                <div className="flex items-baseline gap-2 my-1">
                  <span className="text-4xl font-bold text-white tabular-nums">
                    {currentBlast.detectedFragments}
                  </span>
                </div>

                <div className="text-xs text-green-500 font-bold flex items-center gap-1 mt-2">
                  <CheckCircle2 size={14} />
                  {currentBlast.validPercentage !== undefined
                    ? `${currentBlast.validPercentage.toFixed(2)}% lolos QC`
                    : 'Lolos filter kualitas'}
                </div>
              </div>

              <div className="bg-[#111111]/80 backdrop-blur-md rounded-xl border border-[#222222] p-5 flex flex-col justify-between shadow-lg">
                <div className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2">
                  D10
                </div>

                <div className="flex items-baseline gap-2 my-1">
                  <span className="text-3xl font-bold text-white tabular-nums">
                    {d10Value > 0
                      ? `${d10Value.toFixed(2)} px`
                      : '—'}
                  </span>
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  Konteks fraksi material halus
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#111111] to-[#FF7300]/10 rounded-xl border border-[#FF7300]/30 p-5 flex flex-col justify-between shadow-[0_0_15px_rgba(255,115,0,0.05)]">
                <div className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2">
                  D50 · Parameter DSS
                </div>

                <div className="flex items-baseline gap-2 my-1">
                  <span className="text-3xl font-bold text-[#FF7300] tabular-nums">
                    {d50Value > 0
                      ? `${d50Value.toFixed(2)} px`
                      : '—'}
                  </span>
                </div>

                <div className="text-xs text-[#FF7300] font-bold mt-2">
                  Ukuran sentral distribusi
                </div>
              </div>

              <div className="bg-[#111111]/80 backdrop-blur-md rounded-xl border border-[#222222] p-5 flex flex-col justify-between shadow-lg">
                <div className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2">
                  D80
                </div>

                <div className="flex items-baseline gap-2 my-1">
                  <span className="text-3xl font-bold text-white tabular-nums">
                    {d80Value > 0
                      ? `${d80Value.toFixed(2)} px`
                      : '—'}
                  </span>
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  Konteks fragmen berukuran besar
                </div>
              </div>
            </div>

            {/* Analytical Deep Dive (ImageViewer & Chart & DSS) */}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">


              <div className="lg:col-span-7 flex flex-col gap-6">

                <ImageViewer blast={currentBlast} layer={layer} setLayer={setLayer} />

                <SieveChart blast={currentBlast} />

              </div>


              <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="bg-[#111111] rounded-xl border border-[#222222] p-6 flex flex-col gap-5 shadow-lg flex-1">
                  {/* DSS Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222222] pb-4">
                    <div className="flex items-center gap-3 text-white">
                      <div className="w-8 h-8 rounded-lg bg-[#FF7300]/20 flex items-center justify-center text-[#FF7300]">
                        <FileText size={18} />
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                          Decision Support System
                        </span>
                        <span className="text-base font-bold">
                          Evaluasi Blasting Engineer
                        </span>
                      </div>
                    </div>

                    <span
                      className={`self-start sm:self-auto px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${getStatusClass(
                        currentBlast.evaluationStatus
                      )}`}
                    >
                      {getStatusLabel(
                        currentBlast.evaluationStatus
                      )}
                    </span>
                  </div>

                  {/* Dasar Keputusan */}
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3">
                      Dasar Keputusan DSS
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-2">
                      <DssMiniCard
                        label="D50 Aktual"
                        value={
                          d50Value > 0
                            ? `${d50Value.toFixed(2)} px`
                            : '—'
                        }
                        accent
                      />

                      <DssMiniCard
                        label="Target D50"
                        value={targetLabel}
                      />

                      <DssMiniCard
                        label="Posisi"
                        value={getPositionLabel()}
                      />
                    </div>
                  </div>

                  {/* Interpretasi */}
                  <div className="bg-black border border-[#222222] rounded-xl p-4">
                    <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">
                      Interpretasi
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed">
                      {dssDetail?.interpretation ||
                        currentBlast.recommendationQuote ||
                        'Belum tersedia interpretasi DSS.'}
                    </p>
                  </div>

                  {/* Dampak Operasional */}
                  {!!dssDetail?.operationalImpacts?.length && (
                    <DssListSection
                      title="Potensi Dampak Operasional"
                      items={dssDetail.operationalImpacts}
                    />
                  )}

                  {/* Implikasi Biaya */}
                  {!!dssDetail?.businessImpacts?.length && (
                    <DssListSection
                      title="Potensi Implikasi Biaya & Produktivitas"
                      items={dssDetail.businessImpacts}
                      tone="orange"
                    />
                  )}

                  {/* Rekomendasi */}
                  {!!dssRecommendations.length && (
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3">
                        Rekomendasi Evaluasi
                      </div>

                      <div className="space-y-2.5">
                        {dssRecommendations.map(
                          (action, idx) => (
                            <div
                              key={`${action}-${idx}`}
                              className="flex items-start gap-3 text-xs text-gray-300"
                            >
                              <CheckCircle2
                                size={15}
                                className="text-green-500 shrink-0 mt-0.5"
                              />
                              <span className="leading-relaxed">
                                {action}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div className="pt-4 border-t border-[#222222] text-[10px] text-gray-500 leading-relaxed">
                    ⓘ{' '}
                    {dssDetail?.disclaimer ||
                      'Rekomendasi merupakan bahan evaluasi bagi blasting engineer dan bukan instruksi perubahan parameter peledakan secara otomatis. Potensi implikasi biaya bersifat indikatif dan belum merupakan estimasi finansial kuantitatif.'}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 mt-auto border-t border-[#222222]">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 px-4 py-3 rounded-lg bg-[#000000] hover:bg-[#222222] text-white font-bold text-xs border border-[#222222] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <Cpu
                          size={16}
                          className="animate-spin text-green-500"
                        />
                      ) : (
                        <BookmarkPlus
                          size={16}
                          className={
                            isSaved
                              ? 'text-green-500'
                              : 'text-gray-400'
                          }
                        />
                      )}

                      <span
                        className={
                          isSaved
                            ? 'text-green-500'
                            : ''
                        }
                      >
                        {isSaved
                          ? 'Tersimpan'
                          : 'Simpan Analisis'}
                      </span>
                    </button>

                    <button
                      onClick={() =>
                        setIsPdfOpen(true)
                      }
                      className="flex-1 px-4 py-3 rounded-lg bg-[#000000] hover:bg-[#222222] text-white font-bold text-xs border border-[#222222] transition-colors flex items-center justify-center gap-2"
                    >
                      <FileText
                        size={16}
                        className="text-[#FF7300]"
                      />
                      <span>
                        Cetak PDF Laporan
                      </span>
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>

        )}

      </div>


      <PdfReportModal blast={currentBlast} isOpen={isPdfOpen} onClose={() => setIsPdfOpen(false)} />

    </div>

  );

};

const DssMiniCard: React.FC<{
  label: string;
  value: string;
  accent?: boolean;
}> = ({
  label,
  value,
  accent = false
}) => (
  <div
    className={`rounded-lg border p-3 ${
      accent
        ? 'bg-[#FF7300]/10 border-[#FF7300]/30'
        : 'bg-black border-[#222222]'
    }`}
  >
    <div className="text-[8px] uppercase tracking-wider text-gray-600 font-bold">
      {label}
    </div>

    <div
      className={`text-xs font-bold mt-1 leading-snug ${
        accent
          ? 'text-[#FF7300]'
          : 'text-white'
      }`}
    >
      {value}
    </div>
  </div>
);

const DssListSection: React.FC<{
  title: string;
  items: string[];
  tone?: 'default' | 'orange';
}> = ({
  title,
  items,
  tone = 'default'
}) => (
  <div>
    <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3">
      {title}
    </div>

    <div className="space-y-2">
      {items.map((item, idx) => (
        <div
          key={`${item}-${idx}`}
          className="flex items-start gap-3 text-xs text-gray-300"
        >
          <span
            className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
              tone === 'orange'
                ? 'bg-[#FF7300]'
                : 'bg-gray-500'
            }`}
          />
          <span className="leading-relaxed">
            {item}
          </span>
        </div>
      ))}
    </div>
  </div>
);

