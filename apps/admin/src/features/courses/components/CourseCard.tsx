import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Eye } from "lucide-react";
import { CoursePreview } from "../types/course.type";
import { useNavigate } from "@tanstack/react-router";

interface CourseCardProps {
  course: CoursePreview;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const navigate = useNavigate();

  const getLevelBadge = (level: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      BEGINNER: { variant: "secondary", label: "Cơ bản" },
      INTERMEDIATE: { variant: "default", label: "Trung cấp" },
      ADVANCED: { variant: "destructive", label: "Nâng cao" },
    };
    return variants[level] || variants.BEGINNER;
  };

  const levelInfo = getLevelBadge(course.level)!;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={course.thumbnailUrl}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* <div className="absolute top-3 right-3">
          <Badge variant={course.isPublished ? "default" : "secondary"}>
            {course.isPublished ? "Đã xuất bản" : "Chờ duyệt"}
          </Badge>
        </div> */}
        <div className="absolute top-3 left-3">
          <Badge variant={levelInfo.variant as any}>{levelInfo.label}</Badge>
        </div>
      </div>
      <CardContent>
        <div className="">
          <p className="text-xs text-muted-foreground font-mono">{course.code}</p>
          <h3 className="font-semibold text-lg line-clamp-2 mt-1 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <BookOpen className="w-4 h-4" />
          <span>{course.instructorName}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={() => navigate({ to: "/courses/$id", params: { id: course.id.toString() } })}
        >
          <Eye className="w-4 h-4 mr-2" />
          Xem chi tiết
        </Button>
      </CardFooter>
    </Card>
  );
};
