import React, { useState } from "react";
import { Search, Plus, Download, Eye, Trash2, ChevronLeft, ChevronRight, Loader2, Code } from "lucide-react";
import { useMySlides, useDeleteSlide } from "../queries/useSlide";
import type { SlideGenerationResponse } from "../types/slide.type";
import { Button } from "@workspace/ui/components/Button";
import DeleteConfirmModal from "@/shared/components/DeleteConfirmModal";

interface MySlidesTabProps {
  onViewDetail: (slide: SlideGenerationResponse) => void;
  onSwitchToCreate: () => void;
}

export const MySlidesTab: React.FC<MySlidesTabProps> = ({ onViewDetail, onSwitchToCreate }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [deletingSlide, setDeletingSlide] = useState<SlideGenerationResponse | null>(null);
  const pageSize = 10;

  const { data, isLoading, isError } = useMySlides(page, pageSize);
  const deleteSlide = useDeleteSlide();

  const springPage = data?.data as any;
  const slides: SlideGenerationResponse[] = springPage?.content || [];
  const pageInfo = springPage;

  const filteredSlides = Array.isArray(slides)
    ? slides.filter((slide: SlideGenerationResponse) => slide.topic.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleConfirmDelete = () => {
    if (!deletingSlide) return;
    deleteSlide.mutate(deletingSlide.id, {
      onSettled: () => setDeletingSlide(null),
    });
  };

  const handleDownload = (slide: SlideGenerationResponse) => {
    if (slide.cloudinaryUrl) {
      window.open(slide.cloudinaryUrl, "_blank");
    } else {
      alert("File không khả dụng");
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
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="Tìm kiếm slide..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-3 w-full md:w-36">
          <Button
            className="cursor-pointer bg-blue-700 hover:bg-white hover:text-blue-600 hover:border-blue-600 text-white text-md px-5 py-6 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm shadow-blue-500/30"
            onClick={onSwitchToCreate}
          >
            <Plus size={20} />
            Tạo mới
          </Button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-md border border-slate-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-md font-semibold uppercase tracking-wider text-slate-800">Chủ đề</th>
                <th className="px-6 py-4 text-md font-semibold uppercase tracking-wider text-slate-800 text-center">
                  Template
                </th>
                <th className="px-6 py-4 text-md font-semibold uppercase tracking-wider text-slate-800 text-center">
                  Số Slide
                </th>
                <th className="px-6 py-4 text-md font-semibold uppercase tracking-wider text-slate-800">Ngày tạo</th>
                <th className="px-6 py-4 text-md font-semibold uppercase tracking-wider text-slate-800 text-center">
                  Thao tác
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
                  <tr key={slide.id} className="cursor-pointer hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded flex items-center justify-center bg-blue-100 text-blue-600">
                          <Code size={20} />
                        </div>
                        <div>
                          <span className="font-medium text-slate-900 block">{slide.topic}</span>
                          {slide.fromCache && (
                            <span className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
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
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="cursor-pointer p-2 text-slate-800 hover:text-primary hover:bg-slate-100 rounded-lg transition-all"
                          title="Download PPTX"
                          onClick={() => handleDownload(slide)}
                        >
                          <Download size={20} />
                        </button>
                        <button
                          className="cursor-pointer p-2 text-slate-800 hover:text-primary hover:bg-slate-100 rounded-lg transition-all"
                          title="Xem chi tiết"
                          onClick={() => onViewDetail(slide)}
                        >
                          <Eye size={20} />
                        </button>
                        <button
                          className="cursor-pointer p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                          title="Xóa"
                          onClick={() => setDeletingSlide(slide)}
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
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-800 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            <ChevronLeft size={20} />
          </button>
          {[...Array(Math.min(pageInfo.totalPages, 10))].map((_, idx) => {
            const shouldShow = idx < 3 || idx >= pageInfo.totalPages - 3 || Math.abs(idx - page) <= 1;
            if (!shouldShow) {
              if (idx === 3)
                return (
                  <span key={idx} className="px-2 text-slate-400">
                    ...
                  </span>
                );
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
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-800 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setPage((p) => Math.min(pageInfo.totalPages - 1, p + 1))}
            disabled={page === pageInfo.totalPages - 1}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      <DeleteConfirmModal
        open={!!deletingSlide}
        onClose={() => setDeletingSlide(null)}
        onConfirm={handleConfirmDelete}
        isPending={deleteSlide.isPending}
        title="Xóa slide"
        itemName={deletingSlide?.topic}
      />
    </div>
  );
};
