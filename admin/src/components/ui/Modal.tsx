"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const MAX_WIDTH_MAP = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
};

const emptySubscribe = () => () => {};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  maxWidth = "2xl",
  children,
  footer,
}: ModalProps) {
  const isMounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Lock background body scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !isMounted) {
    return null;
  }

  const maxWidthClass = MAX_WIDTH_MAP[maxWidth] || "max-w-2xl";

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`glass-modal ${maxWidthClass} w-full max-h-[90vh] sm:max-h-[85vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-studio-200/80 dark:border-studio-700/80 relative z-[101]`}
      >
        {/* Pinned Header */}
        <div className="p-5 sm:px-7 border-b border-studio-200 dark:border-studio-800 flex items-center justify-between shrink-0 bg-studio-50/70 dark:bg-studio-900/70">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-9 h-9 rounded-xl bg-blueprint-500/10 text-blueprint-600 dark:text-blueprint-400 flex items-center justify-center shrink-0">
                {icon}
              </div>
            )}
            <div>
              <h3
                id="modal-title"
                className="font-bold text-lg text-studio-900 dark:text-studio-50"
              >
                {title}
              </h3>
              {description && (
                <p className="text-xs text-studio-500 dark:text-studio-400">
                  {description}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-studio-400 hover:text-studio-600 dark:hover:text-studio-200 p-1.5 rounded-xl hover:bg-studio-100 dark:hover:bg-studio-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-6 sm:p-7 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>

        {/* Optional Pinned Footer */}
        {footer && (
          <div className="p-4 sm:px-7 border-t border-studio-200 dark:border-studio-800 flex items-center justify-end gap-3 shrink-0 bg-studio-50/80 dark:bg-studio-900/80">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
