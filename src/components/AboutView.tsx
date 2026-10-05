import React from 'react';

export const AboutView: React.FC = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-[#30353c] pb-6">
        <div className="flex items-center gap-2 text-[#ffc174] text-[11px] uppercase tracking-widest font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>
          Dokumentasi Ilmiah &amp; Arsitektur AI
        </div>
        <h1 className="text-[26px] sm:text-[32px] font-bold text-[#dee3eb] tracking-tight">
          Tentang Sistem BlastInsight-XAI
        </h1>
        <p className="text-[13px] text-[#d8c3ad] max-w-3xl">
          Decision Support System berbasis Explainable Artificial Intelligence (XAI)
          dan Computer Vision untuk analisis kurva fragmentasi batuan peledakan tambang
          terbuka (open-pit mining).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Technical Pillars */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Card 1: YOLO11-Seg Architecture */}
          <div className="bg-[#1b2026] rounded-xl border border-[#30353c] p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-[#ffc174]">
              <span className="material-symbols-outlined text-[24px]">
                memory
              </span>
              <h2 className="text-[18px] font-semibold text-[#dee3eb]">
                Model YOLO11-Seg-Mining-v1
              </h2>
            </div>
            <p className="text-[13px] text-[#d8c3ad] leading-relaxed">
              Arsitektur YOLO11-Seg menggabungkan backbone <strong className="text-[#dee3eb]">CSP-Darknet11</strong> dengan head segmentasi mask berbasis prototipe spasial berkecepatan tinggi (34ms per inferensi). Model dilatih secara khusus pada dataset batuan muckpile tambang terbuka dengan variasi pencahayaan ekstrem, bayangan tebing pit, dan debu peledakan.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0f141a] p-4 rounded-lg border border-[#30353c] text-[12px]">
              <div>
                <span className="text-[#a08e7a] block text-[10px] uppercase">Mean IoU (Mask)</span>
                <span className="text-[18px] font-bold text-[#4ae176]">88.6%</span>
              </div>
              <div>
                <span className="text-[#a08e7a] block text-[10px] uppercase">mAP@50</span>
                <span className="text-[18px] font-bold text-[#4ae176]">0.924</span>
              </div>
              <div>
                <span className="text-[#a08e7a] block text-[10px] uppercase">Latency</span>
                <span className="text-[18px] font-bold text-[#ffc174]">34ms (GPU)</span>
              </div>
            </div>
          </div>

          {/* Card 2: Explainable AI (XAI) & EigenCAM */}
          <div className="bg-[#1b2026] rounded-xl border border-[#30353c] p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-[#ffc174]">
              <span className="material-symbols-outlined text-[24px]">
                visibility
              </span>
              <h2 className="text-[18px] font-semibold text-[#dee3eb]">
                Explainability Menggunakan EigenCAM
              </h2>
            </div>
            <p className="text-[13px] text-[#d8c3ad] leading-relaxed">
              Untuk menjamin transparansi keputusan dalam operasi penambangan berisiko tinggi, sistem menggunakan metode <strong className="text-[#dee3eb]">EigenCAM</strong> (Eigen Class Activation Mapping). Teknik ini mengekstrak vektor eigen dominan dari aktivasi lapisan konvolusi terdalam untuk memvisualisasikan gradien atensi AI terhadap batas boulder, memastikan model tidak salah mengklasifikasikan bayangan atau lekukan tanah sebagai batuan oversize.
            </p>
          </div>

          {/* Card 3: Kuz-Ram Fragmentation Model */}
          <div className="bg-[#1b2026] rounded-xl border border-[#30353c] p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-[#ffc174]">
              <span className="material-symbols-outlined text-[24px]">
                functions
              </span>
              <h2 className="text-[18px] font-semibold text-[#dee3eb]">
                Model Empiris Kuz-Ram &amp; Rosin-Rammler
              </h2>
            </div>
            <p className="text-[13px] text-[#d8c3ad] leading-relaxed">
              Distribusi ukuran fragmen dimodelkan menggunakan persamaan fraksi kumulatif Rosin-Rammler:
            </p>
            <div className="bg-[#0f141a] p-3.5 rounded-lg border border-[#30353c] font-mono text-[13px] text-[#ffc174] text-center">
              R(x) = 1 - exp[ - (x / Xc)^n ]
            </div>
            <p className="text-[12px] text-[#a08e7a]">
              Di mana <em>Xc</em> adalah ukuran karakteristik partikel dan <em>n</em> adalah indeks keseragaman (Uniformity Index). Nilai <em>n</em> tipikal berada pada kisaran 1.0 — 1.5 untuk peledakan terkendali.
            </p>
          </div>
        </div>

        {/* Right 1 Col: Institutional & Research Credit */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#1b2026] rounded-xl border border-[#30353c] p-6 flex flex-col gap-4">
            <span className="text-[11px] uppercase tracking-wider text-[#a08e7a] font-semibold">
              Kredit Penelitian
            </span>
            <div className="text-[16px] font-bold text-[#dee3eb]">
              DBEST 2026 Research Project
            </div>
            <div className="text-[13px] text-[#d8c3ad]">
              Program Penelitian Unggulan Kolaboratif Geoteknik &amp; Informatika
            </div>
            <div className="p-3 bg-[#0f141a] rounded-lg border border-[#30353c] text-[12px] text-[#dee3eb] font-medium">
              Telkom University Purwokerto
            </div>
            <div className="text-[11px] text-[#a08e7a] space-y-2 leading-relaxed">
              <p>
                Platform ini dikembangkan untuk meningkatkan keselamatan kerja loading-hauling serta menghemat konsumsi energi penghancuran batuan di unit primary jaw crusher.
              </p>
              <p>
                Versi: Prototype v1.0 • Release 2026
              </p>
            </div>
          </div>

          <div className="bg-[#1b2026] rounded-xl border border-[#f59e0b]/30 p-6 flex flex-col gap-3">
            <span className="text-[11px] uppercase tracking-wider text-[#ffc174] font-semibold">
              Protokol Operasional Lapangan
            </span>
            <ul className="text-[12px] text-[#d8c3ad] space-y-2 list-disc pl-4">
              <li>Ambil foto muckpile dengan sudut elevasi 45°-60° dari crest bench aman.</li>
              <li>Sertakan objek skala kalibrasi (scaling balls / bucket teeth excavator) bila memungkinkan.</li>
              <li>Jangan mendekati area toe muckpile aktif saat pemuatan fleet sedang berlangsung.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
