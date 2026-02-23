import { Clock, FileText, Play, MoreVertical, BookOpen, Award, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/Card";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import type { TMatrixResponse } from "../types/matrix.type";

interface Props {
  matrix: TMatrixResponse;
  onEdit: () => void;
  onGenerate: () => void;
  onViewDetail: () => void;
}

const MatrixCard: React.FC<Props> = ({ matrix, onEdit, onGenerate, onViewDetail }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] relative"
      onClick={onViewDetail}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={matrix.isActive ? "default" : "secondary"} className="text-xs">
                {matrix.isActive ? "✓ Hoạt động" : "⏸ Tạm dừng"}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">{matrix.code}</span>
            </div>
            <h3 className="font-semibold text-lg line-clamp-2 mb-1">{matrix.name}</h3>
            {matrix.subject?.name && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <BookOpen className="h-3 w-3" />
                <span>{matrix.subject.name}</span>
              </div>
            )}
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>

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
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20"
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
                      // Add onDelete function here if needed
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
      </CardHeader>

      <CardContent className="space-y-4">
        {matrix.description && <p className="text-sm text-muted-foreground line-clamp-2">{matrix.description}</p>}

        <div className="grid grid-cols-2 gap-3 py-3 border-y">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Thời gian</p>
              <p className="text-sm font-semibold">{matrix.duration} phút</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-green-100 dark:bg-green-900">
              <Award className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tổng điểm</p>
              <p className="text-sm font-semibold">{matrix.totalScore} điểm</p>
            </div>
          </div>

          <div className="flex items-center gap-2 col-span-2">
            <div className="p-2 rounded-md bg-purple-100 dark:bg-purple-900">
              <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phiên bản</p>
              <p className="text-sm font-semibold">{matrix.versions?.length || 0} phiên bản</p>
            </div>
          </div>
        </div>

        <Button
          className="w-full gap-2"
          onClick={(e) => {
            e.stopPropagation();
            onGenerate();
          }}
        >
          <Play className="h-4 w-4" />
          Tạo đề thi
        </Button>
      </CardContent>
    </Card>
  );
};

export default MatrixCard;
