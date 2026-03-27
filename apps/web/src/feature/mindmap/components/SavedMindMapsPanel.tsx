import { useState } from "react";
import { Loader2, BookMarked, Trash2, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { toast } from "@/shared/components/Sonner";
import { mindmapApi } from "../apis/mindmap.api";
import { useGetSavedMindMaps, useDeleteSavedMindMap } from "../queries/use-mindmap-queries";
import type { SavedMindMapDto } from "../types/mindmap.type";

interface SavedMindMapsPanelProps {
  onLoad: (detail: SavedMindMapDto) => void;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function SavedMindMapsPanel({ onLoad }: SavedMindMapsPanelProps) {
  const [page, setPage] = useState(0);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const { data, isLoading, isError } = useGetSavedMindMaps(page, 12);
  const { mutate: deleteMindMap, isPending: isDeleting } = useDeleteSavedMindMap();

  const items = data?.data?.data ?? [];
  const pagination = data?.data?.page;
  const totalPages = pagination?.totalPages ?? 1;

  const handleLoad = async (id: number) => {
    setLoadingId(id);
    try {
      const res = await mindmapApi.getById(id);
      const detail = res.data.data;
      if (detail) {
        onLoad(detail);
      }
    } catch {
      toast.error({ title: "Lỗi khi tải mindmap" });
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = (id: number) => {
    deleteMindMap(id, {
      onSuccess: () => {
        setConfirmDeleteId(null);
        toast.success({ title: "Đã xóa mindmap" });
        if (items.length === 1 && page > 0) {
          setPage((p) => p - 1);
        }
      },
      onError: () => {
        toast.error({ title: "Lỗi khi xóa mindmap" });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center text-slate-500">
        <p>Không thể tải danh sách mindmap đã lưu.</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-500">
        <BookMarked className="h-12 w-12 opacity-30" />
        <p className="text-lg font-medium">Chưa có mindmap nào được lưu</p>
        <p className="text-sm">Tạo mindmap và nhấn "Lưu" để lưu lại template.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden">
      <div className="grid flex-1 auto-rows-max grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => {
          const isConfirmingDelete = confirmDeleteId === item.id;
          const isLoadingThis = loadingId === item.id;

          return (
            <div
              key={item.id}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
            >
              {/* Name */}
              <p className="truncate text-base font-semibold text-slate-900 dark:text-white">{item.name}</p>

              {/* Title */}
              <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">{item.title}</p>

              {/* Chips */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {item.topic}
                </span>
              </div>

              {/* Date */}
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{formatDate(item.createdAt)}</p>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                {isConfirmingDelete ? (
                  <>
                    <Button
                      variant="outline"
                      onPress={() => setConfirmDeleteId(null)}
                      className="flex-1 text-xs"
                      isDisabled={isDeleting}
                    >
                      Hủy
                    </Button>
                    <Button
                      onPress={() => handleDelete(item.id)}
                      isDisabled={isDeleting}
                      className="flex-1 gap-1 bg-red-600 text-xs text-white hover:bg-red-700"
                    >
                      {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      Xác nhận xóa
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onPress={() => setConfirmDeleteId(item.id)}
                      className="shrink-0"
                      isDisabled={isLoadingThis}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    <Button
                      onPress={() => handleLoad(item.id)}
                      isDisabled={isLoadingThis}
                      className="flex flex-1 items-center justify-center gap-1.5 text-sm"
                    >
                      {isLoadingThis ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      Sử dụng
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            onPress={() => setPage((p) => Math.max(0, p - 1))}
            isDisabled={page === 0}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            onPress={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            isDisabled={page >= totalPages - 1}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
