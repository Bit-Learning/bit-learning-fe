import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { useMyMatrices } from "../queries/useMatrix";
import MatrixCard from "./MatrixCard";
import MatrixFormModal from "./MatrixFormModal";
import type { TMatrixResponse } from "../types/matrix.type";
import { Pagination } from "@/shared/components/Pagination";
import { Input } from "@workspace/ui/components/Input";

const MyMatricesContent: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [gradeFilter, setGradeFilter] = useState("all");
  const [modal, setModal] = useState<{
    open: boolean;
    data?: TMatrixResponse | null;
  }>({ open: false });

  const { data: response, isLoading } = useMyMatrices(page, 12);

  const matrices = response?.data || [];
  const pagination = response?.page;

  const filtered = matrices.filter(
    (m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <main className="flex-1 p-8 min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-8xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Quản lý Ma trận đề thi</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Ngân hàng ma trận đề thi</p>
          </div>
          <Button
            onClick={() => setModal({ open: true })}
            className="cursor-pointer bg-blue-700 hover:bg-blue-500 text-white px-5 py-5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm shadow-blue-500/30"
          >
            <Plus className="h-5 w-5" />
            Tạo ma trận mới
          </Button>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
            <Input
              placeholder="Tìm kiếm nội dung câu hỏi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 py-5 border-2"
            />
          </div>
          <select
            className="bg-white dark:bg-slate-900 border border-slate-400 dark:border-slate-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
          >
            <option value="all">Tất cả lớp học</option>
            <option value="tin3">Tin học 3</option>
            <option value="tin6">Tin học 6</option>
            <option value="tin12">Tin học 12</option>
          </select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-96 w-full rounded-xl" />
            ))}
          </div>
        ) : !filtered.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              onClick={() => setModal({ open: true })}
              className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center p-8 text-center hover:border-primary hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <Plus className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-slate-700 dark:text-slate-200">Tạo ma trận mới</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-50">
                Xây dựng cấu trúc ma trận đề thi cho khối lớp mới
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((matrix) => (
              <MatrixCard
                key={matrix.id}
                matrix={matrix}
                onEdit={() => setModal({ open: true, data: matrix })}
                onViewDetail={() =>
                  navigate({
                    to: "/mentor/matrix/$id",
                    params: { id: matrix.id.toString() },
                  })
                }
              />
            ))}

            <div
              onClick={() => setModal({ open: true })}
              className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center p-8 text-center hover:border-primary hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <Plus className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-slate-700 dark:text-slate-200">Tạo ma trận mới</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-50">
                Xây dựng cấu trúc ma trận đề thi cho khối lớp mới
              </p>
            </div>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <Pagination currentPage={page} totalPages={pagination.totalPages} onPageChange={setPage} />
        )}
      </div>

      <MatrixFormModal isOpen={modal.open} onClose={() => setModal({ open: false })} data={modal.data} />
    </main>
  );
};

export default MyMatricesContent;
