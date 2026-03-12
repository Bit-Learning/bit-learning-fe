import React from "react";
import { X, Info, Download, CheckCircle, Code, FileText, Calendar } from "lucide-react";
import type { SlideGenerationResponse } from "../types/slide.type";

interface DetailModalProps {
  slide: SlideGenerationResponse;
  onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ slide, onClose }) => {
  const handleDownload = () => {
    if (slide.cloudinaryUrl) {
      window.open(slide.cloudinaryUrl, "_blank");
    } else {
      alert(`File không khả dụng`);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl border border-slate-200 flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Chi tiết Slide bài giảng</h2>
          <button
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100"
            onClick={onClose}
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <div className="aspect-video bg-linear-to-br from-blue-500 to-blue-700 rounded-xl overflow-hidden border border-slate-200 shadow-lg group relative flex items-center justify-center text-white">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Code size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-2">{slide.topic}</h3>
                <p className="text-blue-100 text-sm">{slide.slideCount} slides</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[...Array(Math.min(4, slide.slideCount))].map((_, idx) => (
                <div
                  key={idx}
                  className={`aspect-video bg-slate-200 rounded-md overflow-hidden ${idx === 0 ? "border-2 border-primary" : "opacity-50"}`}
                >
                  <div className="w-full h-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:w-1/2 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Info className="text-primary" size={20} />
                Thông tin chi tiết
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start justify-between text-sm py-2 border-b border-slate-100 gap-4">
                  <span className="text-slate-500 flex items-center gap-2 shrink-0">
                    <FileText size={16} />
                    Chủ đề
                  </span>
                  <span className="font-medium text-slate-900 text-right">{slide.topic}</span>
                </li>
                <li className="flex items-center justify-between text-sm py-2 border-b border-slate-100">
                  <span className="text-slate-500">Số lượng slide</span>
                  <span className="font-medium text-slate-900">{slide.slideCount} slide</span>
                </li>
                <li className="flex items-start justify-between text-sm py-2 border-b border-slate-100 gap-4">
                  <span className="text-slate-500 shrink-0">Template</span>
                  <span className="font-medium text-primary flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0"></span>
                    <span className="text-right">{slide.templateName}</span>
                  </span>
                </li>
                <li className="flex items-center justify-between text-sm py-2 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Calendar size={16} />
                    Ngày tạo
                  </span>
                  <span className="font-medium text-slate-900">
                    {new Date(slide.generatedAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </li>
                <li className="flex items-start justify-between text-sm py-2 border-b border-slate-100 gap-4">
                  <span className="text-slate-500 shrink-0">Tên file</span>
                  <span className="font-medium text-slate-600 text-xs text-right break-all">{slide.filename}</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              {slide.fromCache && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg">
                  <CheckCircle className="text-amber-500 shrink-0" size={16} />
                  <div>
                    <span className="text-sm font-medium text-amber-700 block">Tạo từ cache</span>
                    <span className="text-xs text-amber-600">Thời gian xử lý nhanh hơn</span>
                  </div>
                </div>
              )}

              {slide.cloudinaryUrl && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-100 rounded-lg">
                  <CheckCircle className="text-green-500 shrink-0" size={16} />
                  <span className="text-sm text-green-700">File đã sẵn sàng tải xuống</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            onClick={onClose}
          >
            Đóng
          </button>
          <button
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleDownload}
            disabled={!slide.cloudinaryUrl}
          >
            <Download size={16} />
            Tải xuống (.pptx)
          </button>
        </div>
      </div>
    </div>
  );
};
