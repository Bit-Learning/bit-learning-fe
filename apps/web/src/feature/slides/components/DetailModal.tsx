import React from "react";
import { X, Info, Download, CheckCircle } from "lucide-react";
import { GRADE_COLOR_MAP, Slide } from "../types/slide.type";

interface DetailModalProps {
  slide: Slide;
  onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ slide, onClose }) => {
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
              <div className="text-center">
                <h3 className="text-3xl font-bold mb-2">{slide.topic}</h3>
                <p className="text-blue-100">{slide.template}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((num) => (
                <div
                  key={num}
                  className={`aspect-video bg-slate-200 rounded-md overflow-hidden ${num === 1 ? "border-2 border-primary" : "opacity-50"}`}
                >
                  <div className="w-full h-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {num}
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
                <li className="flex items-center justify-between text-sm py-2 border-b border-slate-100">
                  <span className="text-slate-500">Chủ đề</span>
                  <span className="font-medium text-slate-900">{slide.topic}</span>
                </li>
                <li className="flex items-center justify-between text-sm py-2 border-b border-slate-100">
                  <span className="text-slate-500">Lớp</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${GRADE_COLOR_MAP[slide.grade]}`}>
                    {slide.grade}
                  </span>
                </li>
                <li className="flex items-center justify-between text-sm py-2 border-b border-slate-100">
                  <span className="text-slate-500">Số lượng</span>
                  <span className="font-medium text-slate-900">{slide.slideCount} slide</span>
                </li>
                <li className="flex items-center justify-between text-sm py-2 border-b border-slate-100">
                  <span className="text-slate-500">Ngày tạo</span>
                  <span className="font-medium text-slate-900">{slide.createdDate}</span>
                </li>
                <li className="flex items-center justify-between text-sm py-2 border-b border-slate-100">
                  <span className="text-slate-500">Template</span>
                  <span className="font-medium text-primary flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    {slide.template}
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Tính năng bao gồm</h3>
              <div className="grid grid-cols-2 gap-3">
                {slide.hasExamples && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <CheckCircle className="text-emerald-500" size={16} />
                    <span className="text-sm text-emerald-700">Ví dụ minh họa</span>
                  </div>
                )}
                {slide.hasExercises && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <CheckCircle className="text-emerald-500" size={16} />
                    <span className="text-sm text-emerald-700">Bài tập</span>
                  </div>
                )}
              </div>
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
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
            onClick={() => alert(`Downloading ${slide.topic}.pptx`)}
          >
            <Download size={16} />
            Tải xuống (.pptx)
          </button>
        </div>
      </div>
    </div>
  );
};
