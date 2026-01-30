import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Clock, FileText } from "lucide-react";
import { SectionDetail } from "../types/course.type";
import { LectureItem } from "./LectureItem";

interface SectionItemProps {
  section: SectionDetail;
  index: number;
}

export const SectionItem: React.FC<SectionItemProps> = ({ section, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <Card className="mb-4">
      <CardHeader
        className="cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
              {index + 1}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-base">{section.title}</h4>
              {section.description && <p className="text-sm text-muted-foreground mt-1">{section.description}</p>}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>{section.totalLectures} bài học</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(section.totalDuration)}</span>
              </div>
            </div>

            <Badge variant={section.isPublished ? "default" : "secondary"}>
              {section.isPublished ? "Đã xuất bản" : "Nháp"}
            </Badge>

            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-2 ml-11">
            {section.lectures.map((lecture, idx) => (
              <LectureItem key={lecture.id} lecture={lecture} index={idx} />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
