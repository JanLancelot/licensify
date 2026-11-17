"use client";

import React, { useEffect, useState } from "react";
import { Box, RotateCw, ZoomIn, Loader2, Maximize2, AlertCircle } from "lucide-react";

export interface Model3DViewerProps {
  modelUrl: string;
  title?: string;
  className?: string;
  autoRotate?: boolean;
}

export function Model3DViewer({
  modelUrl,
  title = "3D Architectural Model",
  className = "",
  autoRotate = true,
}: Model3DViewerProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isRotating, setIsRotating] = useState(autoRotate);

  useEffect(() => {
    // Check if model-viewer custom element script is already injected
    if (typeof window !== "undefined" && !customElements.get("model-viewer")) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js";
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => setLoadError(true);
      document.head.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, []);

  return (
    <div
      className={`rounded-xl border border-studio-200 dark:border-studio-700 bg-studio-950 text-white overflow-hidden flex flex-col shadow-lg ${className}`}
    >
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-studio-900 border-b border-studio-800 text-xs">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-brand-400" />
          <span className="font-semibold text-studio-200 truncate">{title}</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-brand-500/20 text-brand-300 border border-brand-500/30">
            .GLB / glTF
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsRotating(!isRotating)}
            className={`px-2 py-1 rounded text-[11px] flex items-center gap-1 transition-colors ${
              isRotating
                ? "bg-brand-500 text-white font-semibold"
                : "bg-studio-800 text-studio-400 hover:text-white"
            }`}
            title="Toggle Auto Rotation"
          >
            <RotateCw className="w-3 h-3" />
            <span>Auto Rotate</span>
          </button>
        </div>
      </div>

      {/* 3D Canvas / Model Viewer Surface */}
      <div className="relative w-full h-[320px] bg-studio-950 flex items-center justify-center">
        {loadError ? (
          <div className="p-4 text-center text-xs text-rose-400 flex flex-col items-center gap-1.5">
            <AlertCircle className="w-6 h-6" />
            <span>Could not load 3D engine or .glb model file.</span>
          </div>
        ) : !scriptLoaded ? (
          <div className="flex flex-col items-center gap-2 text-xs text-studio-400">
            <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
            <span>Initializing 3D viewport...</span>
          </div>
        ) : (
          React.createElement("model-viewer", {
            src: modelUrl,
            alt: title,
            "camera-controls": true,
            "auto-rotate": isRotating ? true : undefined,
            "touch-action": "pan-y",
            "shadow-intensity": "1",
            exposure: "1",
            style: { width: "100%", height: "100%", backgroundColor: "#09090b" },
          })
        )}

        {/* User Interaction Guide */}
        <div className="absolute bottom-2 left-3 pointer-events-none text-[10px] text-studio-400 bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
          Drag to rotate 360° • Scroll / Pinch to zoom
        </div>
      </div>
    </div>
  );
}
