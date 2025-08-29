"use client";
import { useEffect, useState } from "react";

export default function AlertBox({ title, message, type = "info", onClose }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      if (onClose) onClose();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!show) return null;

  // สีตาม type
  const styles = {
    success: {
      bg: "bg-green-100",
      border: "border-green-500",
      text: "text-green-900",
      icon: "text-green-500",
    },
    error: {
      bg: "bg-red-100",
      border: "border-red-500",
      text: "text-red-900",
      icon: "text-red-500",
    },
    warning: {
      bg: "bg-yellow-100",
      border: "border-yellow-500",
      text: "text-yellow-900",
      icon: "text-yellow-500",
    },
    info: {
      bg: "bg-teal-100",
      border: "border-teal-500",
      text: "text-teal-900",
      icon: "text-teal-500",
    },
  };

  const style = styles[type] || styles.info;

  return (
    <div className="fixed top-5 right-5 w-96 z-50">
      <div
        className={`${style.bg} border-t-4 ${style.border} rounded-b ${style.text} px-4 py-3 shadow-md`}
        role="alert"
      >
        <div className="flex">
          <div className="py-1">
            <svg
              className={`fill-current h-6 w-6 ${style.icon} mr-4`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/>
            </svg>
          </div>
          <div>
            <p className="font-bold">{title}</p>
            <p className="text-sm">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
