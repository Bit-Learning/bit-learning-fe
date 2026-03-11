import { useState } from "react";
import { useParams, useNavigate, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Clock,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Sparkles,
  MoreVertical,
  Fingerprint,
  BookOpen,
  Award,
} from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { useMatrixDetail, useMatrixVersions, useDeleteMatrix, useToggleMatrixActive } from "../queries/useMatrix";
import MatrixFormModal from "./MatrixFormModal";
import VersionFormModal from "./VersionFormModal";

const MatrixDetailContent: React.FC = () => {
  const { id } = useParams({ from: "/mentor/matrix/$id/" });
  const navigate = useNavigate();
  const matrixId = parseInt(id);

  const [editModal, setEditModal] = useState(false);
  const [versionModal, setVersionModal] = useState(false);
  const [activeTab, setActiveTab] = useState("versions");

  const { data: matrix, isLoading } = useMatrixDetail(matrixId);
  const { data: versions } = useMatrixVersions(matrixId);
  const { mutate: deleteMatrix, isPending: deleting } = useDeleteMatrix();
  const { mutate: toggleActive } = useToggleMatrixActive();

  const handleDelete = () => {
    deleteMatrix(matrixId, { onSuccess: () => navigate({ to: "/mentor/matrix" }) });
  };

  if (isLoading) {
    return (
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-48 w-full mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </main>
    );
  }

  if (!matrix) {
    return (
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <p className="text-muted-foreground mb-4">Không tìm thấy ma trận</p>
              <Button variant="outline" onClick={() => navigate({ to: "/mentor/matrix" })}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const sortedVersions = [...(versions || [])].sort((a, b) => b.versionNo - a.versionNo);
  const latestVersion = sortedVersions[0];

  return (
    <main className="flex-1 p-8">
      <div className="mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 mb-2 border-gray-300 bg-white shadow-sm transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
              onClick={() => navigate({ to: "/mentor/matrix/my" })}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{matrix.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditModal(true)}
              className="px-4 py-2 text-sm font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-all"
            >
              <Pencil className="h-4 w-4" />
              Chỉnh sửa ma trận
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium border border-red-200 text-red-600 dark:border-red-900/30 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg flex items-center gap-2 transition-all"
            >
              <Trash2 className="h-4 w-4" />
              Xóa
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-800">
              <Fingerprint className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Mã ma trận
              </p>
              <p className="text-sm font-semibold">{matrix.code}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center text-orange-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Môn học
              </p>
              <p className="text-sm font-semibold">{matrix.subject?.name || "Chưa xác định"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center text-green-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Thời gian
              </p>
              <p className="text-sm font-semibold">{matrix.duration} phút</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center text-purple-600">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Tổng điểm
              </p>
              <p className="text-sm font-semibold">{matrix.totalScore}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-800 mb-8 flex items-center justify-between">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("versions")}
              className={`pb-4 text-sm font-bold transition-colors ${
                activeTab === "versions"
                  ? "text-blue-800 border-b-2 border-blue-800"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              Phiên bản ma trận
            </button>
            <button
              onClick={() => setActiveTab("exams")}
              className={`pb-4 text-sm font-medium transition-colors ${
                activeTab === "exams"
                  ? "text-blue-800 border-b-2 border-blue-800"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              Đề thi đã tạo
            </button>
          </div>
          <button
            onClick={() => setVersionModal(true)}
            className="mb-4 bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-sm shadow-blue-500/30"
          >
            <Plus className="h-4 w-4" />
            Tạo phiên bản mới
          </button>
        </div>

        {/* Tab Content - Versions */}
        {activeTab === "versions" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedVersions.map((version, index) => {
              const isLatest = index === 0;
              return (
                <div
                  key={version.id}
                  className={`bg-white dark:bg-slate-900 rounded-xl p-6 relative overflow-hidden group ${
                    isLatest
                      ? "border-2 border-blue-800 shadow-md"
                      : "border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  } transition-all`}
                >
                  {isLatest && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-blue-800 text-white text-[10px] font-bold px-4 py-1.5 uppercase tracking-widest">
                        Mới nhất
                      </div>
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                        Phiên bản {version.versionNo} - {version.name || "Không có tên"}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Cập nhật lúc: {new Date(version.updatedAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                    {!isLatest && (
                      <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Số câu hỏi</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">
                        {version.matrixDetails?.reduce(
                          (sum, d) =>
                            sum +
                            (d.easyMCQ || 0) +
                            (d.mediumMCQ || 0) +
                            (d.hardMCQ || 0) +
                            (d.easyEssay || 0) +
                            (d.mediumEssay || 0) +
                            (d.hardEssay || 0),
                          0,
                        ) || 0}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Điểm tính toán
                      </p>
                      <p
                        className={`text-xl font-bold ${isLatest ? "text-blue-800" : "text-slate-900 dark:text-white"}`}
                      >
                        {matrix.totalScore.toFixed(1) || "0.0"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      className={`cursor-pointer flex-1 px-4 py-5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        isLatest
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                          : "border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Eye className="h-4 w-4" />
                      Xem chi tiết
                    </Button>
                    <Button
                      className={`cursor-pointer flex-1 px-4 py-5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        isLatest
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                          : "border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Pencil className="h-4 w-4" />
                      Chỉnh sửa
                    </Button>
                    <Button
                      onClick={() =>
                        navigate({ to: "/mentor/matrix/$id/generate", params: { id: matrix.id.toString() } })
                      }
                      className={`cursor-pointer flex-1 px-4 py-5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        isLatest
                          ? "bg-blue-800 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20"
                          : "border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Sparkles className="h-4 w-4" />
                      Tạo đề thi
                    </Button>
                  </div>
                </div>
              );
            })}

            <div
              onClick={() => setVersionModal(true)}
              className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center p-8 text-center hover:border-blue-800 hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-800 group-hover:text-white transition-colors">
                <Plus className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-slate-700 dark:text-slate-200">Tạo phiên bản mới</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-60">
                Sao chép từ phiên bản hiện tại hoặc tạo mới từ đầu
              </p>
            </div>
          </div>
        )}

        {activeTab === "exams" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center">
            <p className="text-slate-500 dark:text-slate-400">Chức năng đang phát triển</p>
          </div>
        )}
      </div>

      <MatrixFormModal isOpen={editModal} onClose={() => setEditModal(false)} data={matrix} />
      <VersionFormModal
        isOpen={versionModal}
        onClose={() => setVersionModal(false)}
        matrixId={matrixId}
        totalScore={matrix.totalScore}
      />
    </main>
  );
};

export default MatrixDetailContent;
