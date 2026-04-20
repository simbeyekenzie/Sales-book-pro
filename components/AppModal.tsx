"use client";

import { motion, AnimatePresence } from "motion/react";
import { ReactNode } from "react";

type AppModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export default function AppModal({
  isOpen,
  onClose,
  title,
  children,
}: AppModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
          <motion.button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-md rounded-[28px] border border-white/15 bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
          >
            {title && (
              <div className="mb-4">
                <h3 className="text-lg font-bold tracking-tight text-slate-900">
                  {title}
                </h3>
              </div>
            )}

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}