"use client";

import { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEsc]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div
        className={cn(
          "relative bg-discord-dark-300 rounded-lg shadow-xl w-full max-w-md mx-4",
          "animate-in fade-in zoom-in-95 duration-200"
        )}
      >
        <div className="px-6 pt-6 pb-2">
          <h2 className="text-xl font-bold text-white text-center">{title}</h2>
        </div>
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  );
}
