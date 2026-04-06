"use client";

import { useState, useRef, useEffect } from "react";
import { X, ZoomIn, ZoomOut, RotateCw, Check } from "lucide-react";
import Cropper from "react-easy-crop";

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

const getRadianAngle = (degreeValue) => (degreeValue * Math.PI) / 180;

const rotateSize = (width, height, rotation) => {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
};

const getCroppedImageBlob = async (imageSrc, pixelCrop, rotation = 0) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("ไม่สามารถสร้าง canvas ได้");
  }

  const rotRad = getRadianAngle(rotation);
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");

  if (!croppedCtx) {
    throw new Error("ไม่สามารถสร้าง cropped canvas ได้");
  }

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("ไม่สามารถแปลงภาพได้"));
      }
    }, "image/jpeg", 0.9);
  });
};

export default function ImagePreviewEditor({
  imageUrl,
  onCropComplete,
  onCancel,
  aspectRatio = 1,
}) {
  const imageRef = useRef(null);
  const previewUrlRef = useRef(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [croppedPreview, setCroppedPreview] = useState(null);
  const [croppedFile, setCroppedFile] = useState(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const handleZoom = (val) => setZoom((prev) => Math.min(3, Math.max(1, prev + val)));
  const handleRotate = () => setRotation((prev) => (prev + 45) % 360);

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const handleCrop = async () => {
    try {
      setIsCropping(true);

      if (!croppedAreaPixels) {
        throw new Error("crop ไม่สำเร็จ");
      }

      const blob = await getCroppedImageBlob(imageUrl, croppedAreaPixels, rotation);

      const file = new File([blob], "cropped.jpg", {
        type: "image/jpeg",
      });

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }

      const preview = URL.createObjectURL(blob);
      previewUrlRef.current = preview;

      setCroppedPreview(preview);
      setCroppedFile(file);
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setIsCropping(false);
    }
  };

  const handleConfirm = () => {
    onCropComplete({
      file: croppedFile,
      preview: croppedPreview,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-[1px] flex items-center justify-center z-50 p-0 sm:p-2 md:p-4">
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[95vh] sm:rounded-3xl rounded-none max-w-6xl overflow-hidden shadow-2xl sm:border border-emerald-100 flex flex-col">
        <div className="bg-linear-to-r from-emerald-500 to-emerald-600 text-white flex justify-between items-center px-3 sm:px-5 py-3 sm:py-3.5 border-b border-emerald-400">
          <div className="flex flex-col">
            <h2 className="font-bold text-base sm:text-lg">ปรับแต่งและครอปรูปภาพ</h2>
            <p className="text-[11px] text-emerald-50">เลือกพื้นที่รูปที่ต้องการส่งให้ AI วิเคราะห์</p>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {croppedPreview ? (
          <div className="p-3 sm:p-4 md:p-5 bg-gray-50 space-y-4 overflow-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">ผลลัพธ์ที่ได้</h3>
              <span className="text-xs text-gray-500">ตรวจสอบก่อนส่งวิเคราะห์</span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-3">
              <img
                ref={imageRef}
                src={croppedPreview}
                className="w-full h-[52dvh] sm:h-[64vh] max-h-[72vh] object-contain rounded-xl"
                alt="Cropped preview"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pb-[calc(env(safe-area-inset-bottom)+0.25rem)] sm:pb-0">
              <button
                onClick={() => {
                  setCroppedPreview(null);
                  setCroppedFile(null);
                }}
                className="flex-1 border border-gray-300 bg-white py-2.5 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                แก้ไขใหม่
              </button>

              <button
                onClick={handleConfirm}
                className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                ใช้รูปนี้
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="p-2 sm:p-3 md:p-4 bg-gray-50">
              <div
                className="relative h-[52dvh] sm:h-[68vh] max-h-[74vh] rounded-xl sm:rounded-2xl overflow-hidden border border-gray-300"
                style={{
                  backgroundColor: "#1f2937",
                  backgroundImage:
                    "linear-gradient(45deg, rgba(255,255,255,0.06) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.06) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.06) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.06) 75%)",
                  backgroundSize: "22px 22px",
                  backgroundPosition: "0 0, 0 11px, 11px -11px, -11px 0px",
                }}
              >
                <Cropper
                  image={imageUrl}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={aspectRatio || 1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                  onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
                />
              </div>
            </div>

            <div className="px-3 sm:px-4 md:px-5 py-3 border-t bg-white flex flex-col sm:flex-row justify-between gap-3 sm:gap-2 items-stretch sm:items-center pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:pb-3">
              <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 md:gap-3 w-full sm:w-auto">
                <button
                  onClick={() => handleZoom(-0.1)}
                  className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleZoom(0.1)}
                  className="px-3 py-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-sm font-medium"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                <div className="w-full sm:w-44 order-last sm:order-0">
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <span className="text-sm font-semibold text-gray-600 min-w-14 text-center">{Math.round(zoom * 100)}%</span>

                <button
                  onClick={handleRotate}
                  className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                <button
                  onClick={handleReset}
                  className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-medium"
                >
                  รีเซ็ต
                </button>
              </div>

              <button
                onClick={handleCrop}
                disabled={isCropping}
                className="w-full sm:w-auto bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isCropping ? "กำลังประมวลผล..." : "ครอป"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
