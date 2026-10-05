import React, { useState } from 'react';
import { BlastRecord, ViewerLayer } from '../types';

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
  const [hoveredPolygon, setHoveredPolygon] = useState<string | null>(null);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div
      id="interactive-viewer-container"
      className="bg-[#1b2026] rounded-xl border border-[#30353c] overflow-hidden shadow-sm"
    >
      {/* Top Layer Control Bar */}
      <div className="p-3 sm:p-4 border-b border-[#30353c] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#171c22]">
        <div
          id="viewer-tabs"
          className="flex items-center gap-1 p-1 bg-[#0f141a] rounded-lg border border-[#30353c]"
        >
          <button
            id="tab-layer-segmentation"
            onClick={() => setLayer('segmentation')}
            className={`px-3 py-1 rounded font-medium text-[11px] sm:text-[12px] transition-all ${
              layer === 'segmentation'
                ? 'bg-[#1b2026] text-[#dee3eb] shadow-xs'
                : 'text-[#a08e7a] hover:text-[#dee3eb]'
            }`}
          >
            Segmentasi Mask
          </button>
          <button
            id="tab-layer-original"
            onClick={() => setLayer('original')}
            className={`px-3 py-1 rounded font-medium text-[11px] sm:text-[12px] transition-all ${
              layer === 'original'
                ? 'bg-[#1b2026] text-[#dee3eb] shadow-xs'
                : 'text-[#a08e7a] hover:text-[#dee3eb]'
            }`}
          >
            Gambar Asli
          </button>
          <button
            id="tab-layer-eigencam"
            onClick={() => setLayer('eigencam')}
            className={`px-3 py-1 rounded font-medium text-[11px] sm:text-[12px] transition-all ${
              layer === 'eigencam'
                ? 'bg-[#1b2026] text-[#dee3eb] shadow-xs'
                : 'text-[#a08e7a] hover:text-[#dee3eb]'
            }`}
          >
            EigenCAM Heatmap
          </button>
        </div>

        {/* Zoom & Viewport Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <span className="text-[10px] text-[#a08e7a] mr-1 hidden md:inline">
            Zoom: {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            id="viewer-zoom-in-btn"
            className="p-1.5 rounded bg-[#0f141a] hover:bg-[#252a31] text-[#a08e7a] hover:text-[#dee3eb] border border-[#30353c] transition-colors"
            title="Perbesar Tampilan"
          >
            <span className="material-symbols-outlined text-[18px]">zoom_in</span>
          </button>
          <button
            onClick={handleZoomOut}
            id="viewer-zoom-out-btn"
            className="p-1.5 rounded bg-[#0f141a] hover:bg-[#252a31] text-[#a08e7a] hover:text-[#dee3eb] border border-[#30353c] transition-colors"
            title="Perkecil Tampilan"
          >
            <span className="material-symbols-outlined text-[18px]">zoom_out</span>
          </button>
          <button
            onClick={handleResetZoom}
            id="viewer-reset-frame-btn"
            className="p-1.5 rounded bg-[#0f141a] hover:bg-[#252a31] text-[#a08e7a] hover:text-[#dee3eb] border border-[#30353c] transition-colors"
            title="Atur Ulang Bingkai"
          >
            <span className="material-symbols-outlined text-[18px]">fullscreen</span>
          </button>
        </div>
      </div>

      {/* Graphic Viewport with Synthetic Mask Overlay */}
      <div className="relative w-full aspect-[16/10] bg-[#0f141a] overflow-hidden group select-none flex items-center justify-center">
        <div
          className="w-full h-full relative transition-transform duration-200 ease-out origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Base Muckpile Image */}
          <img
            id="main-viewer-img"
            alt="Foto fragmentasi muckpile peledakan tambang"
            src={blast.imageUrl}
            className="w-full h-full object-cover pointer-events-none"
          />

          {/* Dynamic Polygons / Bounding Layer (YOLO11-Seg) */}
          <svg
            id="yolo-mask-layer"
            viewBox="0 0 1000 625"
            className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
              layer === 'segmentation'
                ? 'opacity-100'
                : layer === 'eigencam'
                ? 'opacity-30'
                : 'opacity-0 pointer-events-none'
            }`}
          >
            {blast.polygons.map((poly) => {
              const isHovered = hoveredPolygon === poly.id;
              if (poly.type === 'polygon' && poly.points) {
                return (
                  <g
                    key={poly.id}
                    onMouseEnter={() => setHoveredPolygon(poly.id)}
                    onMouseLeave={() => setHoveredPolygon(null)}
                    className="cursor-pointer"
                  >
                    <polygon
                      points={poly.points}
                      fill={isHovered ? poly.color : poly.fillColor}
                      fillOpacity={isHovered ? 0.6 : 0.35}
                      stroke={poly.color}
                      strokeWidth={isHovered ? 3.5 : poly.dashed ? 2.5 : 2}
                      strokeDasharray={poly.dashed ? '4,2' : undefined}
                      className="transition-all duration-150"
                    />
                    <rect
                      x={poly.labelX}
                      y={poly.labelY}
                      width={poly.labelText.length * 7.5 + 16}
                      height={20}
                      rx={3}
                      fill="#0F141A"
                      fillOpacity={0.9}
                      stroke={isHovered ? poly.color : 'none'}
                      strokeWidth={1}
                    />
                    <text
                      x={poly.labelX + 6}
                      y={poly.labelY + 14}
                      fill={poly.color}
                      fontFamily="Montserrat, sans-serif"
                      fontSize="11"
                      fontWeight="600"
                    >
                      {poly.labelText}
                    </text>
                  </g>
                );
              } else if (poly.type === 'circle' && poly.cx && poly.cy && poly.r) {
                return (
                  <g
                    key={poly.id}
                    onMouseEnter={() => setHoveredPolygon(poly.id)}
                    onMouseLeave={() => setHoveredPolygon(null)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={poly.cx}
                      cy={poly.cy}
                      r={poly.r}
                      fill={poly.fillColor}
                      stroke={poly.color}
                      strokeWidth={isHovered ? 2.5 : 1.5}
                      className="transition-all duration-150"
                    />
                    {isHovered && (
                      <>
                        <rect
                          x={poly.labelX}
                          y={poly.labelY - 14}
                          width={poly.labelText.length * 7 + 10}
                          height={18}
                          rx={3}
                          fill="#0F141A"
                          fillOpacity={0.9}
                        />
                        <text
                          x={poly.labelX + 5}
                          y={poly.labelY - 1}
                          fill={poly.color}
                          fontFamily="Montserrat, sans-serif"
                          fontSize="10"
                          fontWeight="600"
                        >
                          {poly.labelText}
                        </text>
                      </>
                    )}
                  </g>
                );
              }
              return null;
            })}
          </svg>

          {/* EigenCAM Explainable Heatmap Layer */}
          <div
            id="heatmap-overlay"
            className={`absolute inset-0 bg-gradient-to-tr from-blue-600/30 via-amber-500/45 to-red-600/55 mix-blend-color-dodge transition-opacity duration-300 pointer-events-none ${
              layer === 'eigencam' ? 'opacity-85' : 'opacity-0'
            }`}
          >
            {/* Visual activation hotspots for oversize boulders */}
            <div className="absolute top-[52%] left-[43%] w-40 h-32 rounded-full bg-red-500/40 blur-xl"></div>
            <div className="absolute top-[56%] left-[72%] w-44 h-36 rounded-full bg-red-600/40 blur-xl"></div>
            <div className="absolute top-[42%] left-[56%] w-28 h-28 rounded-full bg-emerald-500/30 blur-lg"></div>
          </div>
        </div>

        {/* Viewport Floating Status Pill */}
        <div className="absolute bottom-3 left-3 bg-[#0f141a]/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#30353c] flex items-center gap-2 text-[11px] text-[#dee3eb] shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>
          <span>
            {layer === 'segmentation'
              ? 'Visualisasi Instance Poligon Terarsir'
              : layer === 'eigencam'
              ? 'EigenCAM Visual Gradient Saliency Map'
              : 'Citra Orisinal Muckpile Lapangan'}
          </span>
        </div>

        {/* Active Hover Inspection Badge */}
        {hoveredPolygon && (
          <div className="absolute top-3 right-3 bg-[#0f141a]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#f59e0b] text-[11px] text-[#ffc174] flex items-center gap-1.5 shadow-md">
            <span className="material-symbols-outlined text-[16px]">info</span>
            <span>Target Diinspeksi: Partikel Batuan Terpilih</span>
          </div>
        )}
      </div>

      {/* Compact Metadata Telemetry Bar */}
      <div className="px-4 py-2.5 bg-[#171c22] border-t border-[#30353c] flex flex-wrap items-center justify-between text-[#a08e7a] text-[11px] gap-2">
        <div className="flex items-center gap-3 sm:gap-4">
          <span>
            Resolusi: <strong className="text-[#dee3eb]">{blast.dimensions}</strong>
          </span>
          <span>•</span>
          <span>
            Waktu Inferensi:{' '}
            <strong className="text-[#4ae176]">{blast.inferenceTimeMs}ms</strong>
          </span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <span>
            Confidence:{' '}
            <strong className="text-[#ffc174] font-bold">
              {blast.confidence.toFixed(2)}
            </strong>
          </span>
          <span>•</span>
          <span>
            Backbone: <span className="text-[#dee3eb]">{blast.backbone}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
