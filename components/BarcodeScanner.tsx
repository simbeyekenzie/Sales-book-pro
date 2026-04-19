"use client";

import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

type Props = {
  onScan: (barcode: string) => void;
  onClose: () => void;
};

export default function BarcodeScanner({ onScan, onClose }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const regionId = "scanner-region";

  useEffect(() => {
    const scanner = new Html5Qrcode(regionId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        (decodedText) => {
          handleStop();
          onScan(decodedText);
        },
        () => {}
      )
      .catch(() => {
        alert("Camera access denied or not supported.");
        onClose();
      });

    return () => {
      handleStop();
    };
  }, []);

  const handleStop = () => {
    if (scannerRef.current) {
      scannerRef.current
        .stop()
        .then(() => {
          scannerRef.current?.clear();
          onClose();
        })
        .catch(() => {
          onClose();
        });
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
      <div id={regionId} className="flex-1" />

      <button
        onClick={handleStop}
        className="bg-white py-4 text-center font-semibold"
      >
        Close Scanner
      </button>
    </div>
  );
}