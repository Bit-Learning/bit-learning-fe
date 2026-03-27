import React, { useState } from "react";
import {
  Search,
  Plus,
  Download,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Code,
  AlertTriangle,
  X,
} from "lucide-react";
import { useMySlides, useDeleteSlide } from "../queries/useSlide";
import type { SlideGenerationResponse } from "../types/slide.type";
import { Input } from "@workspace/ui/components/Input";

interface MySlidesTabProps {
  onViewDetail: (slide: SlideGenerationResponse) => void;
  onSwitchToCreate: () => void;
}

export const MySlidesTab: React.FC<MySlidesTabProps> = ({ onViewDetail, onSwitchToCreate }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; topic: string } | null>(null);
  const pageSize = 10;

  const { data, isLoading, isError } = useMySlides(page, pageSize);
  const deleteSlide = useDeleteSlide();

  const springPage = data?.data as any;
  const slides: SlideGenerationResponse[] = springPage?.content || [];
  const pageInfo = springPage;

  const filteredSlides = Array.isArray(slides)
    ? slides.filter((slide: SlideGenerationResponse) => {
        const matchesSearch = slide.topic.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
      })
    : [];

  const handleDelete = (id: number, topic: string) => {
    setDeleteTarget({ id, topic });
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteSlide.mutate(deleteTarget.id, {
        onSettled: () => setDeleteTarget(null),
      });
    }
  };

  const handleDownload = (slide: SlideGenerationResponse) => {
    if (slide.cloudinaryUrl) {
      window.open(slide.cloudinaryUrl, "_blank");
    } else {
      alert(`File không khả dụng`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-slate-600">Đang tải danh sách slide...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600">Không thể tải danh sách slide. Vui lòng thử lại.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="relative w-full md:w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
          <Input
            placeholder="Tìm kiếm nội dung câu hỏi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 py-5 border-2"
          />
        </div>
        <div className="flex gap-3 w-full md:w-36">
          <button
            className="flex items-center gap-2 px-4 py-3 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            onClick={onSwitchToCreate}
          >
            <Plus size={20} />
            Tạo mới
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Chủ đề</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">
                  Template
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">
                  Số Slide
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Ngày tạo</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSlides.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Search size={48} className="mb-3 opacity-30" />
                      <p className="text-sm font-medium">Không tìm thấy slide nào</p>
                      <p className="text-xs mt-1">Thử tìm kiếm với từ khóa khác hoặc tạo slide mới</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSlides.map((slide: SlideGenerationResponse) => (
                  <tr key={slide.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded flex items-center justify-center bg-blue-100 text-blue-600">
                          <Code size={20} />
                        </div>
                        <div>
                          <span className="font-medium text-slate-900 block">{slide.topic}</span>
                          {slide.fromCache && (
                            <span className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                              Từ cache
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-slate-700">{slide.templateName}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600">{slide.slideCount} slide</td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {new Date(slide.generatedAt).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-all"
                          title="Download PPTX"
                          onClick={() => handleDownload(slide)}
                        >
                          <Download size={20} />
                        </button>
                        <button
                          className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-all"
                          title="Xem chi tiết"
                          onClick={() => onViewDetail(slide)}
                        >
                          <Eye size={20} />
                        </button>
                        <button
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                          title="Xóa"
                          onClick={() => handleDelete(slide.id, slide.topic)}
                          disabled={deleteSlide.isPending}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredSlides.length > 0 && pageInfo && pageInfo.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            <ChevronLeft size={20} />
          </button>

          {[...Array(Math.min(pageInfo.totalPages, 10))].map((_, idx) => {
            // Show first 3, last 3, and current page neighbors
            const shouldShow = idx < 3 || idx >= pageInfo.totalPages - 3 || Math.abs(idx - page) <= 1;

            if (!shouldShow) {
              if (idx === 3) {
                return (
                  <span key={idx} className="px-2 text-slate-400">
                    ...
                  </span>
                );
              }
              return null;
            }

            return (
              <button
                key={idx}
                className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors ${
                  page === idx
                    ? "bg-primary text-white shadow-lg shadow-blue-500/30"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
                onClick={() => setPage(idx)}
              >
                {idx + 1}
              </button>
            );
          })}

          <button
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setPage((p) => Math.min(pageInfo.totalPages - 1, p + 1))}
            disabled={page === pageInfo.totalPages - 1}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="text-red-500" size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-900">Xóa slide</h3>
              </div>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                onClick={() => setDeleteTarget(null)}
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Bạn có chắc muốn xóa slide <span className="font-semibold text-slate-900">"{deleteTarget.topic}"</span>?{" "}
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3 justify-end pt-1">
              <button
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteSlide.isPending}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleConfirmDelete}
                disabled={deleteSlide.isPending}
              >
                {deleteSlide.isPending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
