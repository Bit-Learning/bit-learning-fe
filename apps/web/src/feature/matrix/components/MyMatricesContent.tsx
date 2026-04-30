import { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Search, Eye, Edit, Trash2, X } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { useMyMatrices, useDeleteMatrix } from "../queries/useMatrix";
import MatrixFormModal from "./MatrixFormModal";
import type { TMatrixResponse } from "../types/matrix.type";
import { Pagination } from "@/shared/components/Pagination";
import { cn } from "@workspace/ui/lib/utils";
import DeleteConfirmModal from "@/shared/components/DeleteConfirmModal";

const PAGE_SIZE = 20;

const normalize = (str: string) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const MyMatricesContent: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | undefined>(undefined);
  const [modal, setModal] = useState<{ open: boolean; data?: TMatrixResponse | null }>({ open: false });
  const [deletingMatrix, setDeletingMatrix] = useState<TMatrixResponse | null>(null);

  const { data: response, isLoading } = useMyMatrices(0, 1000);
  const deleteMatrix = useDeleteMatrix();

  const allMatrices = response?.data || [];

  const subjects = useMemo(() => {
    const seen = new Map<number, { id: number; name: string }>();
    allMatrices.forEach((m) => {
      if (m.subject && !seen.has(m.subject.id)) {
        seen.set(m.subject.id, { id: m.subject.id, name: m.subject.name });
      }
    });
    return Array.from(seen.values());
  }, [allMatrices]);

  const filteredMatrices = useMemo(() => {
    return allMatrices.filter((m) => {
      const matchSearch =
        !search || normalize(m.name).includes(normalize(search)) || normalize(m.code).includes(normalize(search));
      const matchSubject = !selectedSubjectId || m.subject?.id === selectedSubjectId;
      const matchActive =
        activeFilter === "all" ||
        (activeFilter === "active" && m.isActive) ||
        (activeFilter === "inactive" && !m.isActive);
      return matchSearch && matchSubject && matchActive;
    });
  }, [allMatrices, search, selectedSubjectId, activeFilter]);

  const totalPages = Math.ceil(filteredMatrices.length / PAGE_SIZE);
  const pagedMatrices = filteredMatrices.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const resetPage = () => setPage(0);

  const handleSubjectSelect = (id: number | undefined) => {
    setSelectedSubjectId(id);
    resetPage();
  };

  const handleFilterChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value);
    resetPage();
  };

  const handleConfirmDelete = () => {
    if (!deletingMatrix) return;
    deleteMatrix.mutate(deletingMatrix.id, {
      onSuccess: () => setDeletingMatrix(null),
    });
  };

  return (
    <main className="flex-1 p-8 min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-8xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Quản lý Ma trận đề thi</h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg mt-1">Ngân hàng ma trận đề thi</p>
          </div>
          <Button
            onClick={() => setModal({ open: true })}
            className="cursor-pointer bg-blue-700 hover:bg-white hover:text-blue-600 hover:border-blue-600 text-white text-md px-5 py-5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm shadow-blue-500/30"
          >
            <Plus className="h-5 w-5" />
            Tạo ma trận mới
          </Button>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              className="w-full pl-9 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm transition-all shadow-sm"
              type="text"
              placeholder="Tìm kiếm theo tên hoặc mã ma trận..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
            />
          </div>
          <select
            value={activeFilter}
            onChange={handleFilterChange(setActiveFilter)}
            className="px-3 py-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary shadow-sm min-w-35"
          >
            <option value="all">Trạng thái: Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
          <select
            value={selectedSubjectId?.toString() ?? "all"}
            onChange={(e) => handleSubjectSelect(e.target.value === "all" ? undefined : Number(e.target.value))}
            className="px-3 py-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary shadow-sm min-w-37.5"
          >
            <option value="all">Tất cả môn học</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : !filteredMatrices.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              onClick={() => setModal({ open: true })}
              className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center p-8 cursor-pointer hover:border-primary hover:bg-blue-50/30 transition-all group w-80"
            >
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <Plus className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-slate-700 dark:text-slate-200">Tạo ma trận mới</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {search || selectedSubjectId || activeFilter !== "all"
                  ? "Không tìm thấy ma trận phù hợp"
                  : "Xây dựng cấu trúc ma trận đề thi"}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-md border border-slate-300 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300 bg-gray-50">
                    <th className="text-left p-4 font-semibold text-md text-gray-800 uppercase tracking-wider">
                      TÊN MA TRẬN
                    </th>
                    <th className="text-center p-4 font-semibold text-md text-gray-800 uppercase tracking-wider w-36">
                      MÃ
                    </th>
                    <th className="text-left p-4 font-semibold text-md text-gray-800 uppercase tracking-wider w-80">
                      MÔN HỌC
                    </th>
                    <th className="text-left p-4 font-semibold text-md text-gray-800 uppercase tracking-wider w-35">
                      THỜI GIAN
                    </th>
                    <th className="text-left p-4 font-semibold text-md text-gray-800 uppercase tracking-wider w-35">
                      TỔNG ĐIỂM
                    </th>
                    <th className="text-left p-4 font-semibold text-md text-gray-800 uppercase tracking-wider w-36">
                      TRẠNG THÁI
                    </th>
                    <th className="text-center p-4 font-semibold text-md text-gray-800 uppercase tracking-wider w-36">
                      THAO TÁC
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {pagedMatrices.map((matrix: TMatrixResponse) => (
                    <tr
                      key={matrix.id}
                      onClick={() => navigate({ to: "/mentor/matrix/$id", params: { id: matrix.id.toString() } })}
                      className="cursor-pointer border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{matrix.name}</div>
                        {matrix.description && (
                          <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{matrix.description}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-sm text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                          {matrix.code}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-700">{matrix.subject?.name}</td>
                      <td className="p-4 text-sm text-gray-700">{matrix.duration} phút</td>
                      <td className="p-4 text-sm text-gray-700">{matrix.totalScore} điểm</td>
                      <td className="p-4">
                        <span
                          className={cn(
                            "px-2 py-1 rounded text-xs font-medium",
                            matrix.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600",
                          )}
                        >
                          {matrix.isActive ? "Hoạt động" : "Không hoạt động"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            className="cursor-pointer p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
                            title="Xem chi tiết"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate({ to: "/mentor/matrix/$id", params: { id: matrix.id.toString() } });
                            }}
                          >
                            <Eye className="h-6 w-6" />
                          </button>
                          <button
                            className="cursor-pointer p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
                            title="Chỉnh sửa"
                            onClick={(e) => {
                              e.stopPropagation();
                              setModal({ open: true, data: matrix });
                            }}
                          >
                            <Edit className="h-6 w-6" />
                          </button>
                          <button
                            className="cursor-pointer p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Xóa"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingMatrix(matrix);
                            }}
                          >
                            <Trash2 className="h-6 w-6" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Hiển thị{" "}
                <span className="font-semibold text-gray-900">
                  {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filteredMatrices.length)}
                </span>{" "}
                trong <span className="font-semibold text-gray-900">{filteredMatrices.length}</span> ma trận
              </p>
              {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
            </div>
          </>
        )}
      </div>

      <MatrixFormModal isOpen={modal.open} onClose={() => setModal({ open: false })} data={modal.data} />

      <DeleteConfirmModal
        open={!!deletingMatrix}
        onClose={() => setDeletingMatrix(null)}
        onConfirm={handleConfirmDelete}
        isPending={deleteMatrix.isPending}
        title="Xóa ma trận"
        itemName={deletingMatrix?.name}
      />
    </main>
  );
};

export default MyMatricesContent;
