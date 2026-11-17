"use client";

import React, { useState, useRef, useCallback } from "react";
import { Plus, Trash2, Eye, EyeOff, ZoomIn, Layers, Check, Move } from "lucide-react";

export interface HotspotItem {
  id: string;
  stepIndex: number;
  title: string;
  description?: string;
  xPercent: number;     // 0 to 100
  yPercent: number;     // 0 to 100
  widthPercent: number; // 0 to 100
  heightPercent: number;// 0 to 100
  zoomScale?: number;   // e.g. 2.0 to 3.5
  isOccluded?: boolean; // For flashcards: hides answer under mask
}

export interface ImageHotspotDrawerProps {
  imageUrl: string;
  hotspots: HotspotItem[];
  onChange: (hotspots: HotspotItem[]) => void;
  isFlashcardMode?: boolean;
}

export function ImageHotspotDrawer({
  imageUrl,
  hotspots,
  onChange,
  isFlashcardMode = false,
}: ImageHotspotDrawerProps) {
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentDraftBox, setCurrentDraftBox] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  const [previewStep, setPreviewStep] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse interaction to draw bounding box
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setIsDrawing(true);
    setDrawStart({ x, y });
    setCurrentDraftBox({ x, y, w: 0, h: 0 });
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDrawing || !drawStart || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
      const currentY = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));

      const x = Math.min(drawStart.x, currentX);
      const y = Math.min(drawStart.y, currentY);
      const w = Math.abs(currentX - drawStart.x);
      const h = Math.abs(currentY - drawStart.y);

      setCurrentDraftBox({ x, y, w, h });
    },
    [isDrawing, drawStart]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !currentDraftBox) {
      setIsDrawing(false);
      return;
    }

    // Min dimensions (at least 3% width & height)
    if (currentDraftBox.w > 3 && currentDraftBox.h > 3) {
      const newHotspot: HotspotItem = {
        id: "hs_" + Date.now().toString(36),
        stepIndex: hotspots.length + 1,
        title: `Point ${hotspots.length + 1}`,
        description: "",
        xPercent: Math.round(currentDraftBox.x * 10) / 10,
        yPercent: Math.round(currentDraftBox.y * 10) / 10,
        widthPercent: Math.round(currentDraftBox.w * 10) / 10,
        heightPercent: Math.round(currentDraftBox.h * 10) / 10,
        zoomScale: 2.5,
        isOccluded: isFlashcardMode,
      };

      const updated = [...hotspots, newHotspot];
      onChange(updated);
      setSelectedHotspotId(newHotspot.id);
    }

    setIsDrawing(false);
    setDrawStart(null);
    setCurrentDraftBox(null);
  }, [isDrawing, currentDraftBox, hotspots, isFlashcardMode, onChange]);

  const updateHotspot = (id: string, updates: Partial<HotspotItem>) => {
    const updated = hotspots.map((h) => (h.id === id ? { ...h, ...updates } : h));
    onChange(updated);
  };

  const removeHotspot = (id: string) => {
    const updated = hotspots
      .filter((h) => h.id !== id)
      .map((h, idx) => ({ ...h, stepIndex: idx + 1 }));
    onChange(updated);
    if (selectedHotspotId === id) setSelectedHotspotId(null);
  };

  const selectedHotspot = hotspots.find((h) => h.id === selectedHotspotId);

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 rounded-xl border border-studio-200 dark:border-studio-700 bg-studio-50 dark:bg-studio-900/60">
      {/* Left Pane: Interactive Image Canvas */}
      <div className="flex-1 flex flex-col items-center">
        <div className="flex items-center justify-between w-full mb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span className="text-xs font-bold text-studio-900 dark:text-studio-100">
              Interactive Hotspot Canvas
            </span>
          </div>
          <span className="text-[11px] text-studio-500 dark:text-studio-400">
            Click & drag on the picture to draw a highlight zone
          </span>
        </div>

        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="relative w-full max-w-[600px] aspect-[4/3] rounded-lg overflow-hidden border border-studio-200 dark:border-studio-700 select-none cursor-crosshair bg-studio-100 dark:bg-studio-950 flex items-center justify-center shadow-inner"
        >
          {/* Base Diagram Image */}
          <img
            src={imageUrl}
            alt="Base diagram"
            className="w-full h-full object-contain pointer-events-none"
            draggable={false}
          />

          {/* Render Existing Hotspots */}
          {hotspots.map((hs) => {
            const isSelected = hs.id === selectedHotspotId;
            const isPreviewActive = previewStep === hs.stepIndex;

            return (
              <div
                key={hs.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedHotspotId(hs.id);
                  setPreviewStep(hs.stepIndex);
                }}
                style={{
                  left: `${hs.xPercent}%`,
                  top: `${hs.yPercent}%`,
                  width: `${hs.widthPercent}%`,
                  height: `${hs.heightPercent}%`,
                }}
                className={`absolute rounded transition-all cursor-pointer flex items-center justify-center border-2 ${
                  isSelected || isPreviewActive
                    ? "border-brand-500 bg-brand-500/25 ring-2 ring-brand-500/50"
                    : hs.isOccluded
                    ? "border-amber-500 bg-amber-500/30"
                    : "border-emerald-500 bg-emerald-500/20"
                }`}
              >
                {/* Step Badge */}
                <div
                  className={`absolute -top-3 -left-3 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md ${
                    isSelected
                      ? "bg-brand-500 text-white ring-2 ring-white dark:ring-studio-900"
                      : "bg-studio-900 dark:bg-white text-white dark:text-studio-900"
                  }`}
                >
                  {hs.stepIndex}
                </div>

                {/* Occlusion Mask Indicator */}
                {hs.isOccluded && (
                  <span className="text-[10px] font-semibold text-amber-900 dark:text-amber-200 bg-amber-500/80 px-1 py-0.5 rounded shadow-sm">
                    [Masked]
                  </span>
                )}
              </div>
            );
          })}

          {/* Currently Drawing Box Preview */}
          {currentDraftBox && (
            <div
              style={{
                left: `${currentDraftBox.x}%`,
                top: `${currentDraftBox.y}%`,
                width: `${currentDraftBox.w}%`,
                height: `${currentDraftBox.h}%`,
              }}
              className="absolute border-2 border-dashed border-brand-500 bg-brand-500/20 pointer-events-none"
            />
          )}
        </div>

        {/* Step Preview Player */}
        {hotspots.length > 0 && (
          <div className="flex items-center gap-1.5 mt-3 text-xs">
            <span className="text-studio-500 dark:text-studio-400 font-medium">Test Tour:</span>
            {hotspots.map((hs) => (
              <button
                key={hs.id}
                type="button"
                onClick={() => {
                  setPreviewStep(hs.stepIndex);
                  setSelectedHotspotId(hs.id);
                }}
                className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${
                  previewStep === hs.stepIndex
                    ? "bg-brand-500 text-white"
                    : "bg-studio-200 dark:bg-studio-800 text-studio-700 dark:text-studio-300 hover:bg-studio-300"
                }`}
              >
                Step {hs.stepIndex}
              </button>
            ))}
            {previewStep !== null && (
              <button
                type="button"
                onClick={() => setPreviewStep(null)}
                className="text-xs text-studio-400 hover:text-studio-600 underline ml-1"
              >
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right Pane: Hotspot Inspector & List */}
      <div className="w-full lg:w-72 flex flex-col space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-studio-700 dark:text-studio-300 border-b border-studio-200 dark:border-studio-700 pb-1.5">
          Hotspots ({hotspots.length})
        </h4>

        {selectedHotspot ? (
          <div className="p-3 rounded-lg bg-white dark:bg-studio-850 border border-brand-500/30 space-y-2.5 text-xs shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-brand-600 dark:text-brand-400">
                Editing Step #{selectedHotspot.stepIndex}
              </span>
              <button
                type="button"
                onClick={() => removeHotspot(selectedHotspot.id)}
                className="p-1 text-studio-400 hover:text-rose-500 transition-colors"
                title="Delete this hotspot"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-studio-500 uppercase mb-1">
                Label / Answer Name
              </label>
              <input
                type="text"
                value={selectedHotspot.title}
                onChange={(e) => updateHotspot(selectedHotspot.id, { title: e.target.value })}
                placeholder="e.g. Ionic Volute, Footing..."
                className="w-full px-2.5 py-1.5 rounded bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-xs focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-studio-500 uppercase mb-1">
                Description / Question
              </label>
              <textarea
                value={selectedHotspot.description || ""}
                onChange={(e) => updateHotspot(selectedHotspot.id, { description: e.target.value })}
                placeholder="Details to show upon zoom..."
                rows={2}
                className="w-full px-2.5 py-1.5 rounded bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-xs focus:ring-1 focus:ring-brand-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-studio-500 uppercase mb-1">
                  Zoom Factor
                </label>
                <select
                  value={selectedHotspot.zoomScale || 2.5}
                  onChange={(e) =>
                    updateHotspot(selectedHotspot.id, { zoomScale: parseFloat(e.target.value) })
                  }
                  className="w-full px-2 py-1 rounded bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-xs"
                >
                  <option value={1.5}>1.5x (Wide)</option>
                  <option value={2.0}>2.0x (Standard)</option>
                  <option value={2.5}>2.5x (Close)</option>
                  <option value={3.5}>3.5x (Detail)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-studio-500 uppercase mb-1">
                  Flashcard Mask
                </label>
                <button
                  type="button"
                  onClick={() =>
                    updateHotspot(selectedHotspot.id, { isOccluded: !selectedHotspot.isOccluded })
                  }
                  className={`w-full py-1 px-2 rounded font-medium text-xs flex items-center justify-center gap-1 border transition-colors ${
                    selectedHotspot.isOccluded
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold"
                      : "bg-studio-100 dark:bg-studio-800 text-studio-500 border-studio-200 dark:border-studio-700"
                  }`}
                >
                  {selectedHotspot.isOccluded ? (
                    <>
                      <EyeOff className="w-3 h-3" />
                      <span>Masked</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3" />
                      <span>Visible</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg border border-dashed border-studio-200 dark:border-studio-700 text-center text-xs text-studio-400">
            Click on any highlighted box or draw a new one on the diagram.
          </div>
        )}

        {/* Hotspot List Overview */}
        <div className="space-y-1.5 overflow-y-auto max-h-48 pr-1">
          {hotspots.map((h) => (
            <div
              key={h.id}
              onClick={() => {
                setSelectedHotspotId(h.id);
                setPreviewStep(h.stepIndex);
              }}
              className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors text-xs border ${
                h.id === selectedHotspotId
                  ? "bg-brand-500/10 border-brand-500/40 text-brand-700 dark:text-brand-300 font-semibold"
                  : "bg-white dark:bg-studio-800/80 border-studio-200 dark:border-studio-750 text-studio-700 dark:text-studio-300 hover:bg-studio-100 dark:hover:bg-studio-750"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="w-4 h-4 rounded-full bg-studio-200 dark:bg-studio-700 flex items-center justify-center text-[10px] font-bold">
                  {h.stepIndex}
                </span>
                <span className="truncate">{h.title || "Untitled Point"}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeHotspot(h.id);
                }}
                className="text-studio-400 hover:text-rose-500 p-1"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
