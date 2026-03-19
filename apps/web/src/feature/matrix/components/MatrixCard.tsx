import { Clock, FileText, Play, MoreVertical, BookOpen, Award, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import type { TMatrixResponse } from "../types/matrix.type";

interface Props {
  matrix: TMatrixResponse;
  onEdit: () => void;
  onGenerate: () => void;
  onViewDetail: () => void;
}

const MatrixCard: React.FC<Props> = ({ matrix, onEdit, onGenerate: _onGenerate, onViewDetail }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-400 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              matrix.isActive
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            {matrix.isActive ? "Hoạt động" : "Bản nháp"}
          </span>
          <div className="flex gap-2 relative">
            <span
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="text-slate-800 hover:text-primary cursor-pointer transition-colors"
            >
              <MoreVertical className="h-5 w-5" />
            </span>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <div
                  className="absolute right-0 top-6 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onEdit();
                    }}
                  >
                    <Edit className="h-4 w-4" />
                    Chỉnh sửa
                  </button>
                  <button
                    className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onViewDetail();
                    }}
                  >
                    <FileText className="h-4 w-4" />
                    Xem chi tiết
                  </button>
                  <button
                    className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 dark:text-red-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Xóa
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <h3 className="font-bold text-lg mb-1 leading-tight text-slate-900 dark:text-white">{matrix.name}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Mã: {matrix.code}</p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <BookOpen className="h-4 w-4 text-slate-400" />
            <span>
              Môn: <strong>{matrix.subject?.name || "Chưa xác định"}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Clock className="h-4 w-4 text-slate-400" />
            <span>
              Thời gian: <strong>{matrix.duration} phút</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Award className="h-4 w-4 text-slate-400" />
            <span>
              Tổng điểm: <strong>{matrix.totalScore}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <FileText className="h-4 w-4 text-slate-400" />
            <span>
              Phiên bản: <strong>{matrix.versions?.length || 0}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <div className="flex gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail();
            }}
            className="cursor-pointer text-blue-600 hover:text-blue-700 text-md font-semibold flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Xem chi tiết
          </button>
        </div>
        <button className="text-red-500 hover:text-red-700 transition-colors">
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default MatrixCard;
