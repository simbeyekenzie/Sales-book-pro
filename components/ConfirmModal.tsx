"use client";

import AppModal from "@/components/AppModal";

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmClassName?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmClassName = "app-button app-button-danger w-full",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <AppModal isOpen={isOpen} onClose={onCancel} title={title}>
      <p className="text-sm text-slate-600">{message}</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="app-button app-button-muted w-full"
        >
          {cancelText}
        </button>

        <button type="button" onClick={onConfirm} className={confirmClassName}>
          {confirmText}
        </button>
      </div>
    </AppModal>
  );
}