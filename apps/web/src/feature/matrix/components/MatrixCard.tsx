import { Clock, FileText, Pencil, Trash2, Play, MoreVertical } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/Card";
import { Badge } from "@workspace/ui/components/Badge";
import { Menu as DropdownMenu, MenuItem, MenuPopover, MenuSeparator, MenuTrigger } from "@workspace/ui/components/Menu";
import type { TMatrixResponse } from "../types/matrix.type";

interface Props {
  matrix: TMatrixResponse;
  onEdit: () => void;
  onGenerate: () => void;
  onViewDetail: () => void;
}

const MatrixCard: React.FC<Props> = ({ matrix, onEdit, onGenerate, onViewDetail }) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:border-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={matrix.isActive ? "default" : "secondary"} className="shrink-0">
                {matrix.isActive ? "Hoạt động" : "Tạm dừng"}
              </Badge>
              <Badge variant="outline" className="shrink-0">
                {matrix.code}
              </Badge>
            </div>
            <h3 className="font-semibold text-lg truncate" title={matrix.name}>
              {matrix.name}
            </h3>
            <p className="text-sm text-muted-foreground truncate">{matrix.subject?.name}</p>
          </div>
          <DropdownMenu>
            <MenuTrigger>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </MenuTrigger>
            <MenuPopover>
              <MenuItem onAction={onViewDetail}>
                <FileText className="h-4 w-4 mr-2" />
                Xem chi tiết
              </MenuItem>
              <MenuItem onAction={onEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </MenuItem>
              <MenuSeparator />
              <MenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa
              </MenuItem>
            </MenuPopover>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {matrix.description && <p className="text-sm text-muted-foreground line-clamp-2">{matrix.description}</p>}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{matrix.duration} phút</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{matrix.totalScore} điểm</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">{matrix.versions?.length || 0} versions</span>
          <Button size="sm" onClick={onGenerate} className="gap-2">
            <Play className="h-3.5 w-3.5" />
            Tạo đề thi
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatrixCard;
