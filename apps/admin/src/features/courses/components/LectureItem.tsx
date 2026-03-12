import React from "react";
import { Badge } from "@/components/ui/badge";
import { Video, FileText, HelpCircle, Eye, Lock } from "lucide-react";
import { LectureDetail, LectureType } from "../types/course.type";

interface LectureItemProps {
  lecture: LectureDetail;
  index: number;
}

export const LectureItem: React.FC<LectureItemProps> = ({ lecture, index }) => {
  const getLectureIcon = (type: LectureType) => {
    const icons = {
      VIDEO: <Video className="w-4 h-4" />,
      TEXT: <FileText className="w-4 h-4" />,
      QUIZ: <HelpCircle className="w-4 h-4" />,
      EMPTY: <FileText className="w-4 h-4" />,
    };
    return icons[type] || icons.EMPTY;
  };

  const getLectureTypeBadge = (type: LectureType) => {
    const badges = {
      VIDEO: { label: "Video", variant: "default" },
      TEXT: { label: "Văn bản", variant: "secondary" },
      QUIZ: { label: "Bài kiểm tra", variant: "outline" },
      EMPTY: { label: "Trống", variant: "destructive" },
    };
    return badges[type] || badges.EMPTY;
  };

  const typeInfo = getLectureTypeBadge(lecture.type);

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <span className="text-sm text-muted-foreground font-medium w-6">{index + 1}</span>
        <div className="text-muted-foreground">{getLectureIcon(lecture.type)}</div>
        <div className="flex-1">
          <p className="font-medium text-sm">{lecture.title}</p>
          {lecture.description && <p className="text-xs text-muted-foreground mt-1">{lecture.description}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={typeInfo.variant as any}>{typeInfo.label}</Badge>
        {lecture.isPreviewable ? (
          <Badge variant="outline" className="gap-1">
            <Eye className="w-3 h-3" />
            Xem trước
          </Badge>
        ) : (
          <Badge variant="secondary" className="gap-1">
            <Lock className="w-3 h-3" />
            Khóa
          </Badge>
        )}
      </div>
    </div>
  );
};
