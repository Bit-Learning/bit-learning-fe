import { Clock, FileText, Play, MoreVertical, BookOpen, Award } from "lucide-react";
import type { TMatrixResponse } from "../types/matrix.type";

interface Props {
  matrix: TMatrixResponse;
  onEdit: () => void;
  onGenerate: () => void;
  onViewDetail: () => void;
}

const MatrixCard: React.FC<Props> = ({ matrix, onGenerate }) => {
  return (
    <div className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-xl overflow-hidden bg-linear-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border border-gray-200 dark:border-gray-800 hover:border-primary/50">
      <div className="h-1.5 bg-linear-to-r from-primary via-primary/80 to-primary/60" />

      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  matrix.isActive
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                }`}
              >
                {matrix.isActive ? "✓ Hoạt động" : "⏸ Tạm dừng"}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                {matrix.code}
              </span>
            </div>

            <h3
              className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors"
              title={matrix.name}
            >
              {matrix.name}
            </h3>

            {matrix.subject?.name && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <BookOpen className="h-3.5 w-3.5" />
                <span className="truncate">{matrix.subject.name}</span>
              </div>
            )}
          </div>

          <button
            className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/10 rounded-md flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-5 pb-5 space-y-4">
        {matrix.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{matrix.description}</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
            <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Thời gian</span>
              <span className="text-sm font-semibold">{matrix.duration} phút</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900">
            <div className="p-1.5 rounded-md bg-amber-100 dark:bg-amber-900">
              <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Tổng điểm</span>
              <span className="text-sm font-semibold">{matrix.totalScore} điểm</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">{matrix.versions?.length || 0} phiên bản</span>
          </div>

          <button
            onClick={onGenerate}
            className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md transition-all"
          >
            <Play className="h-3.5 w-3.5" />
            Tạo đề thi
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatrixCard;
