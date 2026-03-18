import React, { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Search, Eye, Edit, Trash2, Trophy, PlayCircle, Clock, History, TrendingUp, Filter } from "lucide-react";
import { useContestList, useDeleteContest } from "../queries/useContest";
import { ContestStatus, type ContestListDTO } from "../types/contest.type";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

const ContestListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContestStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contestToDelete, setContestToDelete] = useState<ContestListDTO | null>(null);

  const { data: contestsData } = useContestList();
  const { mutate: deleteContest, isPending: isDeleting } = useDeleteContest();

  const contestsList = contestsData?.data || [];

  const isLoading = false;

  const filteredContests = useMemo(() => {
    return contestsList?.filter((contest) => {
      const matchesSearch =
        !searchQuery ||
        contest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contest.contestId.includes(searchQuery);

      const matchesStatus = statusFilter === "all" || contest.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, contestsList]);

  const pageSize = 10;
  const contests = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredContests?.slice(start, start + pageSize);
  }, [filteredContests, page]);

  const stats = useMemo(() => {
    return {
      total: contestsList?.length,
      running: contestsList?.filter((c) => c.status === ContestStatus.RUNNING).length,
      upcoming: contestsList?.filter((c) => c.status === ContestStatus.UPCOMING).length,
      ended: contestsList?.filter((c) => c.status === ContestStatus.ENDED).length,
    };
  }, [contestsList]);

  const getStatusBadge = (status: ContestStatus) => {
    const classes = {
      [ContestStatus.RUNNING]: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
      [ContestStatus.UPCOMING]: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      [ContestStatus.ENDED]: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400",
    };
    const labels = {
      [ContestStatus.RUNNING]: "Đang diễn ra",
      [ContestStatus.UPCOMING]: "Sắp tới",
      [ContestStatus.ENDED]: "Đã kết thúc",
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      time: date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      date: date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }),
    };
  };

  const getParticipantText = (status: ContestStatus) => {
    return status === ContestStatus.UPCOMING
      ? "đã đăng ký"
      : status === ContestStatus.RUNNING
        ? "thí sinh"
        : "hoàn thành";
  };

  const handleDeleteClick = (contest: ContestListDTO) => {
    setContestToDelete(contest);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (contestToDelete) {
      deleteContest(contestToDelete.contestId, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setContestToDelete(null);
        },
        onError: (error) => {
          console.error("Error deleting contest:", error);
        },
      });
    }
  };

  const handleCloseDeleteDialog = () => {
    if (!isDeleting) {
      setDeleteDialogOpen(false);
      setContestToDelete(null);
    }
  };

  const totalPages = contestsData?.page?.totalPages || 1;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold">Quản lý cuộc thi</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Theo dõi và quản lý các cuộc thi Tin học trên hệ thống
          </p>
        </div>
        <Button
          onClick={() => navigate({ to: "/contests/create" })}
          className="bg-primary hover:bg-blue-700 text-white px-5 py-5 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Tạo cuộc thi mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
              <Trophy className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +12%
            </span>
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Tổng số cuộc thi</h3>
          <p className="text-2xl font-bold mt-1">{stats.total}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg">
              <PlayCircle className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Đang diễn ra</h3>
          <p className="text-2xl font-bold mt-1">{stats.running}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Sắp tới</h3>
          <p className="text-2xl font-bold mt-1">{stats.upcoming}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-600 rounded-lg">
              <History className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Đã kết thúc</h3>
          <p className="text-2xl font-bold mt-1">{stats.ended}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="font-bold">Danh sách cuộc thi</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Tìm kiếm cuộc thi..."
                className="pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary w-64 transition-all"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as ContestStatus | "all");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-37.5">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value={ContestStatus.RUNNING}>Đang diễn ra</SelectItem>
                <SelectItem value={ContestStatus.UPCOMING}>Sắp tới</SelectItem>
                <SelectItem value={ContestStatus.ENDED}>Đã kết thúc</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : contests?.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Không có cuộc thi nào</h3>
            <p className="text-slate-500 mb-4">
              {searchQuery || statusFilter !== "all"
                ? "Không tìm thấy cuộc thi phù hợp với bộ lọc của bạn"
                : "Bắt đầu bằng cách tạo cuộc thi đầu tiên"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Tiêu đề cuộc thi</th>
                  <th className="px-6 py-4">Thời gian</th>
                  <th className="px-6 py-4">Số người tham gia</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {contests.map((contest) => {
                  const startTime = formatDateTime(contest.startTime);
                  const endTime = formatDateTime(contest.endTime);
                  return (
                    <tr
                      key={contest.contestId}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">{getStatusBadge(contest.status)}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{contest.title}</div>
                        <div className="text-xs text-slate-500">Mã: {contest.contestId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {startTime.time} - {endTime.time}
                        </div>
                        <div className="text-xs text-slate-500">{startTime.date}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="font-semibold text-sm">{contest.participantCount.toLocaleString()}</span>
                          <span className="text-xs text-slate-400 ml-1">{getParticipantText(contest.status)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => navigate({ to: "/contests/$id", params: { id: contest.contestId } })}
                            className="p-3 text-slate-100 hover:text-white transition-colors"
                            title="Xem"
                          >
                            <Eye className="w-5 h-5" />
                          </Button>
                          <Button
                            onClick={() => navigate({ to: "/contests/$id/edit", params: { id: contest.contestId } })}
                            className="p-3 text-slate-100 hover:text-white transition-colors"
                            title="Sửa"
                          >
                            <Edit className="w-5 h-5" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteClick(contest)}
                            className="p-3 text-slate-100 hover:text-white  transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {contests.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Hiển thị {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filteredContests.length)} của{" "}
              {filteredContests.length} cuộc thi
            </span>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Trước
              </button>
              <button className="px-3 py-1 text-sm bg-primary text-white rounded">{page}</button>
              {totalPages > 1 && page < totalPages && (
                <>
                  {page + 1 <= totalPages && (
                    <button
                      className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800"
                      onClick={() => setPage(page + 1)}
                    >
                      {page + 1}
                    </button>
                  )}
                  {page + 2 <= totalPages && (
                    <button
                      className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800"
                      onClick={() => setPage(page + 2)}
                    >
                      {page + 2}
                    </button>
                  )}
                  {page + 3 < totalPages && <span className="px-2">...</span>}
                </>
              )}
              <button
                className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      <DeleteConfirmModal
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa cuộc thi"
        description="Bạn có chắc chắn muốn xóa cuộc thi này? Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan đến cuộc thi."
        itemName={contestToDelete?.title}
        isPending={isDeleting}
      />
    </div>
  );
};

export default ContestListPage;
