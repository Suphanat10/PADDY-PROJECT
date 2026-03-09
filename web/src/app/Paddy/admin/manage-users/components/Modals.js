"use client";
import { AlertTriangle, Loader2 } from "lucide-react";

// Confirm Modal Component
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="text-red-600" size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
          <p className="text-slate-500 text-sm mb-6">{message}</p>
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
            >
              ยกเลิก
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "ยืนยันลบ"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Alert Modal Component
export const AlertModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 animate-in zoom-in-95 duration-200 max-w-sm w-full">
        <div className="text-center">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <AlertTriangle className="text-amber-600" size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">แจ้งเตือน</h3>
          <p className="text-slate-600 mb-6">{message}</p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium transition-colors"
          >
            ตกลง
          </button>
        </div>
      </div>
    </div>
  );
};
