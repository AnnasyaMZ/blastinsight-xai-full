import React, { useState } from 'react';
import type { BlastRecord, ViewerLayer } from '../types';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface ImageViewerProps {
  blast: BlastRecord;
  layer: ViewerLayer;
  setLayer: (layer: ViewerLayer) => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  blast,
  layer,
  setLayer
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="bg-[#000000] rounded-xl border border-[#111111] overflow-hidden shadow-[0_0_20px_rgba(255,115,0,0.05)] flex flex-col h-full">
      {/* Top Layer Control Bar */}
      <div className="p-3 sm:p-4 border-b border-[#111111] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111111]">
        <div className="flex items-center gap-1 p-1 bg-[#000000] rounded-lg border border-[#222222]">
          <button
            onClick={() => setLayer('segmentation')}
            className={`px-3 py-1.5 rounded font-bold text-[11px] sm:text-xs transition-all ${
              layer === 'segmentation' ? 'bg-[#FF7300]/15 text-[#FF7300] border border-[#FF7300]/30 shadow-[0_0_10px_rgba(255,115,0,0.1)]' : 'text-gray-400 hover:text-white border border-transparent'
            }`}
          >
            Segmentasi Mask
          </button>
          <button
            onClick={() => setLayer('original')}
            className={`px-3 py-1.5 rounded font-bold text-[11px] sm:text-xs transition-all ${
              layer === 'original' ? 'bg-[#FF7300]/15 text-[#FF7300] border border-[#FF7300]/30 shadow-[0_0_10px_rgba(255,115,0,0.1)]' : 'text-gray-400 hover:text-white border border-transparent'
            }`}
          >
            Gambar Asli
          </button>
          <button
            onClick={() => setLayer('eigencam')}
            className={`px-3 py-1.5 rounded font-bold text-[11px] sm:text-xs transition-all ${
              layer === 'eigencam' ? 'bg-[#FF7300]/15 text-[#FF7300] border border-[#FF7300]/30 shadow-[0_0_10px_rgba(255,115,0,0.1)]' : 'text-gray-400 hover:text-white border border-transparent'
            }`}
          >
            EigenCAM Heatmap
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <span className="text-[10px] text-gray-500 mr-2 hidden md:inline font-medium">Zoom: {Math.round(zoomLevel * 100)}%</span>
          <button onClick={handleZoomIn} className="p-1.5 rounded bg-[#000000] hover:bg-[#222222] text-gray-400 hover:text-white border border-[#222222] transition-colors"><ZoomIn size={16} /></button>
          <button onClick={handleZoomOut} className="p-1.5 rounded bg-[#000000] hover:bg-[#222222] text-gray-400 hover:text-white border border-[#222222] transition-colors"><ZoomOut size={16} /></button>
          <button onClick={handleResetZoom} className="p-1.5 rounded bg-[#000000] hover:bg-[#222222] text-gray-400 hover:text-white border border-[#222222] transition-colors"><Maximize size={16} /></button>
        </div>
      </div>

      {/* Graphic Viewport */}
      <div className="relative w-full aspect-[16/10] bg-[#000000] overflow-hidden group select-none flex items-center justify-center border-b border-[#111111]">
        <div className="w-full h-full relative transition-transform duration-300 ease-out origin-center" style={{ transform: `scale(${zoomLevel})` }}>
          
          {/* LAYER 1: Gambar Asli Lokal (Selalu dirender di paling bawah) */}
          <img 
            src={blast.imageUrl} 
            alt="Muckpile Original" 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 pointer-events-none ${
              layer === 'original' ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`} 
          />

          {/* LAYER 2: Gambar Segmentasi Mask (Dari Backend YOLO) */}
          {blast.segmentationImageBase64 && (
            <img 
              src={blast.segmentationImageBase64} 
              alt="Muckpile Segmentation" 
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 pointer-events-none ${
                layer === 'segmentation' ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`} 
            />
          )}

          {/* LAYER 3: Gambar EigenCAM Heatmap (Dari Backend Layer 16 / P3) */}
          {blast.eigenCamImageBase64 && (
            <img 
              src={blast.eigenCamImageBase64} 
              alt="Muckpile EigenCAM" 
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 pointer-events-none ${
                layer === 'eigencam' ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`} 
            />
          )}

          {/* FALLBACK: Jika gambar Base64 dari backend gagal termuat namun layer dipilih */}
          {((layer === 'segmentation' && !blast.segmentationImageBase64) || 
            (layer === 'eigencam' && !blast.eigenCamImageBase64)) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
              <span className="text-[#FF7300] text-xs font-bold animate-pulse">Menunggu render visual dari FastAPI...</span>
            </div>
          )}

        </div>
      </div>

      {/* Footer Info Bar */}
      <div className="px-5 py-3 bg-[#111111] flex flex-wrap items-center justify-between text-gray-400 text-xs gap-2 mt-auto">
        <div className="flex items-center gap-4">
          <span>Resolusi: <strong className="text-white">{blast.dimensions || '960x960 (YOLO Input)'}</strong></span>
          <span>Waktu Inferensi: <strong className="text-green-500">{blast.inferenceTimeMs}ms</strong></span>
        </div>
        <div className="flex items-center gap-4">
          <span>Threshold QC: <strong className="text-[#FF7300] font-bold text-sm">0.40</strong></span>
          <span>Model: <strong className="text-white">{blast.backbone || 'YOLO11s-Seg'}</strong></span>
        </div>
      </div>
    </div>
  );
};