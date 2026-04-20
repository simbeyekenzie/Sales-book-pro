"use client";

import { AnimatePresence, motion } from "motion/react";

type AppToastProps = {
  message: string;
  type?: "success" | "error" | "info";
  isOpen: boolean;
  onClose: () => void;
};

export default function AppToast({
  message,
  type = "info",
  isOpen,
  onClose,
}: AppToastProps) {
  const tone =
    type === "success"
      ? "bg-emerald-600 text-white"
      : type === "error"
      ? "bg-red-600 text-white"
      : "bg-slate-900 text-white";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.22 }}
          className={`fixed left-1/2 top-24 z-[140] w-[92%] max-w-sm -translate-x-1/2 rounded-2xl px-4 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.22)] ${tone}`}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">{message}</p>

            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-full px-2 py-1 text-xs font-semibold text-white/90 hover:bg-white/10"
            >
              Close
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}