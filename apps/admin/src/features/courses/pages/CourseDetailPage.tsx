import React, { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useGetCourseDetail, useGetSections, useValidateCourse } from "../queries/useCourse";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Star,
  Users,
  BookOpen,
  Globe,
  Target,
  GraduationCap,
  AlertTriangle,
} from "lucide-react";
import { SectionItem } from "../components/SectionItem";
import { Skeleton } from "@/components/ui/skeleton";

export const CourseDetailPage: React.FC = () => {
  const { id } = useParams({ strict: false });
  const navigate = useNavigate();
  const courseId = parseInt(id || "0");

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "publish" | "unpublish" | null;
  }>({ open: false, action: null });

  const { data: course, isLoading: courseLoading } = useGetCourseDetail(courseId);
  const { data: sections, isLoading: sectionsLoading } = useGetSections(courseId);
  const { mutate: validateCourse, isPending } = useValidateCourse();

  const handleOpenConfirm = (action: "publish" | "unpublish") => {
    setConfirmDialog({ open: true, action });
  };

  const handleConfirm = () => {
    if (confirmDialog.action === "publish") {
      validateCourse({ id: courseId, isAccepted: true });
    } else if (confirmDialog.action === "unpublish") {
      validateCourse({ id: courseId, isAccepted: false });
    }
    setConfirmDialog({ open: false, action: null });
  };

  const handleCancel = () => {
    setConfirmDialog({ open: false, action: null });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (courseLoading || sectionsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-destructive">Không tìm thấy khóa học</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-6" onClick={() => navigate({ to: "/courses" })}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại danh sách
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-mono mb-2">{course.code}</p>
                  <CardTitle className="text-3xl mb-2">{course.title}</CardTitle>
                  <p className="text-lg text-muted-foreground">{course.subtitle}</p>
                </div>
                <Badge variant={course.isPublished ? "default" : "secondary"} className="text-sm">
                  {course.isPublished ? "Đã xuất bản" : "Chờ duyệt"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <img src={course.thumbnailUrl} alt={course.title} className="w-full h-64 object-cover rounded-lg" />

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{course.ratingStar}</span>
                  <span className="text-muted-foreground">({course.ratingCount} đánh giá)</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{course.instructorName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>{course.language === "VIETNAMESE" ? "Tiếng Việt" : "English"}</span>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-2">Mô tả khóa học</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{course.description}</p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Bạn sẽ học được gì
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{course.outcome}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Yêu cầu
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{course.requirement}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Đối tượng học viên
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{course.audience}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nội dung khóa học</CardTitle>
              <p className="text-sm text-muted-foreground">
                {course.totalSections} chương • {course.totalLectures} bài học • {formatDuration(course.totalDuration)}
              </p>
            </CardHeader>
            <CardContent>
              {sections && sections.length > 0 ? (
                <div className="space-y-4">
                  {sections.map((section, index) => (
                    <SectionItem key={section.id} section={section} index={index} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Chưa có nội dung nào</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Giá</span>
                <span className="font-bold text-lg text-primary">{course.price.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cấp độ</span>
                <Badge>
                  {course.level === "BEGINNER" ? "Cơ bản" : course.level === "INTERMEDIATE" ? "Trung cấp" : "Nâng cao"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Khối</span>
                <span className="font-semibold">Khối {course.grade}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số chương</span>
                <span className="font-semibold">{course.totalSections}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số bài học</span>
                <span className="font-semibold">{course.totalLectures}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Thời lượng</span>
                <span className="font-semibold">{formatDuration(course.totalDuration)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hành động</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!course.isPublished ? (
                <Button className="w-full" onClick={() => handleOpenConfirm("publish")} disabled={isPending}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Phê duyệt & Xuất bản
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => handleOpenConfirm("unpublish")}
                  disabled={isPending}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Hủy xuất bản
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && handleCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {confirmDialog.action === "publish" ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Xác nhận phê duyệt & xuất bản
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Xác nhận hủy xuất bản
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-2">
              {confirmDialog.action === "publish" ? (
                <>
                  <p>
                    Bạn có chắc chắn muốn <strong className="text-green-600">phê duyệt và xuất bản</strong> khóa học
                    này?
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                    <p className="font-medium mb-1">Sau khi xuất bản:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Khóa học sẽ hiển thị công khai trên hệ thống</li>
                      <li>Học viên có thể đăng ký và học khóa học</li>
                      <li>Giảng viên sẽ nhận được thông báo</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    Bạn có chắc chắn muốn <strong className="text-amber-600">hủy xuất bản</strong> khóa học này?
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                    <p className="font-medium mb-1">Sau khi hủy xuất bản:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Khóa học sẽ không còn hiển thị công khai</li>
                      <li>Học viên mới không thể đăng ký</li>
                      <li>Học viên hiện tại vẫn có thể tiếp tục học</li>
                      <li>Giảng viên sẽ nhận được thông báo</li>
                    </ul>
                  </div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={confirmDialog.action === "publish" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {confirmDialog.action === "publish" ? "Phê duyệt & Xuất bản" : "Hủy xuất bản"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
