import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus, Search, FileSpreadsheet } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Input } from "@workspace/ui/components/Input";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { useMyMatrices } from "../queries/useMatrix";
import MatrixCard from "./MatrixCard";
import MatrixFormModal from "./MatrixFormModal";
import type { TMatrixResponse } from "../types/matrix.type";
import { Pagination } from "@/shared/components/Pagination";

const MyMatricesContent: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState<{ open: boolean; data?: TMatrixResponse | null }>({ open: false });

  const { data: response, isLoading } = useMyMatrices(page, 12);

  const matrices = response?.data || [];
  const pagination = response?.page;

  const filtered = matrices.filter(
    (m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate({ to: "/mentor/matrix" })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Ma trận của tôi</h1>
            <p className="text-muted-foreground">Các ma trận đề thi do bạn tạo</p>
          </div>
          <Button onClick={() => setModal({ open: true })} className="gap-2">
            <Plus className="h-4 w-4" />
            Tạo ma trận
          </Button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm ma trận..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      ) : !filtered.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileSpreadsheet className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Chưa có ma trận nào</h3>
            <p className="text-muted-foreground mb-6">Bắt đầu tạo ma trận đề thi đầu tiên của bạn</p>
            <Button onClick={() => setModal({ open: true })} className="gap-2">
              <Plus className="h-4 w-4" />
              Tạo ma trận mới
            </Button>
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

      <MatrixFormModal isOpen={modal.open} onClose={() => setModal({ open: false })} data={modal.data} />
    </div>
  );
};

export default MyMatricesContent;
