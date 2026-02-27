import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Search, FileSpreadsheet, Upload, FileText } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Input } from "@workspace/ui/components/Input";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { useMatrices, useDeleteMatrix } from "../queries/useMatrix";
import type { TMatrixResponse } from "../types/matrix.type";
import MatrixCard from "./MatrixCard";
import MatrixFormModal from "./MatrixFormModal";
import { Pagination } from "@/shared/components/Pagination";

const MatrixListContent: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState<{ open: boolean; data?: TMatrixResponse | null }>({ open: false });

  const { data: response, isLoading } = useMatrices(page, 12);

  const matrices = response?.data || [];
  const pagination = response?.page;

  const filtered = matrices.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.code.toLowerCase().includes(search.toLowerCase()) ||
      m.subject?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Ma trận đề thi</h1>
          <p className="text-muted-foreground">Quản lý ma trận và tạo đề thi tự động</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setModal({ open: true })} className="gap-2">
            <Plus className="h-4 w-4" />
            Tạo ma trận
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => navigate({ to: "/mentor/matrix/my" })}>
            <FileText className="h-4 w-4" />
            Ma trận của tôi
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên, mã hoặc môn học..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => navigate({ to: "/mentor/exam/my" })}>
            <FileText className="h-4 w-4" />
            Đề thi của tôi
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      ) : !filtered.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileSpreadsheet className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">{search ? "Không tìm thấy ma trận" : "Chưa có ma trận nào"}</h3>
            <p className="text-muted-foreground mb-6">
              {search ? "Thử tìm kiếm với từ khóa khác" : "Bắt đầu bằng cách tạo ma trận đề thi đầu tiên"}
            </p>
            {!search && (
              <Button onClick={() => setModal({ open: true })} className="gap-2">
                <Plus className="h-4 w-4" />
                Tạo ma trận mới
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((matrix) => (
              <MatrixCard
                key={matrix.id}
                matrix={matrix}
                onEdit={() => setModal({ open: true, data: matrix })}
                onGenerate={() => navigate({ to: "/mentor/matrix/$id/generate", params: { id: matrix.id.toString() } })}
                onViewDetail={() => navigate({ to: "/mentor/matrix/$id", params: { id: matrix.id.toString() } })}
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <Pagination currentPage={page} totalPages={pagination.totalPages} onPageChange={setPage} />
          )}
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setModal({ open: true })}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-lg bg-primary/10">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Tạo ma trận mới</h3>
              <p className="text-sm text-muted-foreground">Tạo ma trận đề thi từ đầu</p>
            </div>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate({ to: "/mentor/matrix/import" })}
        >
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
              <Upload className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold">Import ngân hàng câu hỏi</h3>
              <p className="text-sm text-muted-foreground">Nhập câu hỏi từ file Excel</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <MatrixFormModal isOpen={modal.open} onClose={() => setModal({ open: false })} data={modal.data} />
    </div>
  );
};

export default MatrixListContent;
