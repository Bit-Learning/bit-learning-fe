import React from "react";
import { X, Download, CheckCircle, FileText, Calendar, ExternalLink, Layers, AlertCircle } from "lucide-react";
import type { SlideGenerationResponse } from "../types/slide.type";

interface DetailModalProps {
  slide: SlideGenerationResponse;
  onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ slide, onClose }) => {
  const handleDownload = () => {
    if (slide.cloudinaryUrl) {
      window.open(slide.cloudinaryUrl, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div
        className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
        style={{ height: "90vh" }}
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Layers className="text-primary" size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 line-clamp-1">{slide.topic}</h2>
              <p className="text-md text-slate-500">
                {slide.templateName} · {slide.slideCount} slides
              </p>
            </div>
          </div>
          <button
            className="cursor-pointer w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-600  hover:text-red-600 transition-all group"
            onClick={onClose}
          >
            <X className="group-hover:rotate-90 transition-transform" size={24} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-hidden border-r border-slate-100">
            {slide.pdfCloudinaryUrl ? (
              <iframe
                src={slide.pdfCloudinaryUrl}
                title={`Preview - ${slide.topic}`}
                className="w-full h-full border-0"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                <AlertCircle size={40} className="opacity-40" />
                <p className="text-md">Không có file xem trước.</p>
              </div>
            )}
          </div>

          <div className="w-72 shrink-0 flex flex-col overflow-y-auto p-5 gap-5">
            <div>
              <h3 className="text-md font-semibold uppercase tracking-wider text-slate-400 mb-3">Thông tin</h3>
              <ul className="space-y-3">
                <li className="flex flex-col gap-0.5">
                  <span className="text-md text-slate-400 flex items-center gap-1.5">
                    <FileText size={12} />
                    Chủ đề
                  </span>
                  <span className="text-md font-medium text-slate-900">{slide.topic}</span>
                </li>
                <li className="flex flex-col gap-0.5">
                  <span className="text-md text-slate-400">Số lượng slide</span>
                  <span className="text-md font-medium text-slate-900">{slide.slideCount} slides</span>
                </li>
                <li className="flex flex-col gap-0.5">
                  <span className="text-md text-slate-400">Template</span>
                  <span className="text-md font-medium text-primary">{slide.templateName}</span>
                </li>
                <li className="flex flex-col gap-0.5">
                  <span className="text-md text-slate-400 flex items-center gap-1.5">
                    <Calendar size={12} />
                    Ngày tạo
                  </span>
                  <span className="text-md font-medium text-slate-900">
                    {new Date(slide.generatedAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </li>
                <li className="flex flex-col gap-0.5">
                  <span className="text-md text-slate-400">Tên file</span>
                  <span className="text-md text-slate-600 break-all">{slide.filename}</span>
                </li>
              </ul>
            </div>

            {slide.fromCache && (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg">
                <CheckCircle className="text-amber-500 shrink-0" size={14} />
                <div>
                  <span className="text-md font-medium text-amber-700 block">Tạo từ cache</span>
                  <span className="text-md text-amber-600">Thời gian xử lý nhanh hơn</span>
                </div>
              </div>
            )}

            <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-slate-100">
              {slide.pdfCloudinaryUrl && (
                <a
                  href={slide.pdfCloudinaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer flex items-center justify-center gap-2 px-4 py-3 rounded-md border border-blue-600 text-md font-medium text-slate-600 hover:bg-slate-50 transition-all"
                >
                  <ExternalLink size={15} />
                  Mở PDF trong tab mới
                </a>
              )}
              <button
                className="cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white text-md font-semibold rounded-md hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleDownload}
                disabled={!slide.cloudinaryUrl}
              >
                <Download size={15} />
                Tải xuống (.pptx)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
