import React, { useState } from "react";
import { BookOpen, FileText, GraduationCap, Image, Save, X } from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { type CourseDetail, CourseLevel, Language, type UpdateCourseRequest } from "../types/course.type";
import { useUpdateCourse, useUpdateCourseThumbnail } from "../queries/useCourse";

interface EditCourseModalProps {
  course: CourseDetail;
  onClose: () => void;
  onSuccess?: () => void;
}

const updateCourseSchema = z.object({
  title: z.string().min(1, "Tên khóa học là bắt buộc"),
  subtitle: z.string().optional(),
  description: z.string().min(1, "Mô tả là bắt buộc"),
  price: z.coerce.number().min(0, "Giá không được âm"),
  language: z.nativeEnum(Language),
  outcome: z.string().optional(),
  requirement: z.string().optional(),
  audience: z.string().optional(),
  level: z.nativeEnum(CourseLevel),
  grade: z.coerce.number().min(1).max(12),
});

type UpdateCourseFormValues = z.infer<typeof updateCourseSchema>;

const LEVELS = [
  { value: CourseLevel.BEGINNER, label: "Cơ bản" },
  { value: CourseLevel.INTERMEDIATE, label: "Trung cấp" },
  { value: CourseLevel.ADVANCED, label: "Nâng cao" },
];
const LANGUAGES = [
  { value: Language.VIETNAMESE, label: "🇻🇳 Tiếng Việt" },
  { value: Language.ENGLISH, label: "🇺🇸 Tiếng Anh" },
];
const GRADES = Array.from({ length: 10 }, (_, i) => ({ value: i + 3, label: `Lớp ${i + 3}` }));

export const EditCourseModal: React.FC<EditCourseModalProps> = ({ course, onClose, onSuccess }) => {
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(course.thumbnailUrl || null);

  const updateCourseMutation = useUpdateCourse();
  const updateThumbnailMutation = useUpdateCourseThumbnail();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateCourseFormValues>({
    resolver: zodResolver(updateCourseSchema) as Resolver<UpdateCourseFormValues>,
    defaultValues: {
      title: course.title,
      subtitle: course.subtitle,
      description: course.description,
      price: course.price,
      language: course.language,
      outcome: course.outcome,
      requirement: course.requirement,
      audience: course.audience,
      level: course.level,
      grade: course.grade,
    },
  });

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: UpdateCourseFormValues) => {
    try {
      await updateCourseMutation.mutateAsync({ id: course.id, data: data as UpdateCourseRequest });
      if (thumbnailFile) {
        await updateThumbnailMutation.mutateAsync({ id: course.id, thumbnail: thumbnailFile });
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to update course:", error);
    }
  };

  const isLoading = updateCourseMutation.isPending || updateThumbnailMutation.isPending;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[95vh] max-w-4xl overflow-hidden">
        <DialogHeader className="bg-linear-to-r from-blue-600 to-indigo-600 p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Chỉnh sửa khóa học</DialogTitle>
              <p className="text-sm text-blue-100">Cập nhật thông tin khóa học của bạn</p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">
                <BookOpen className="mr-2 h-4 w-4" />
                Thông tin cơ bản
              </TabsTrigger>
              <TabsTrigger value="detail">
                <FileText className="mr-2 h-4 w-4" />
                Chi tiết
              </TabsTrigger>
              <TabsTrigger value="thumbnail">
                <Image className="mr-2 h-4 w-4" />
                Ảnh bìa
              </TabsTrigger>
            </TabsList>

            <div className="max-h-[calc(95vh-280px)] overflow-y-auto p-6">
              <TabsContent value="basic" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Tên khóa học *</Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="VD: Toán học lớp 10"
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle">Tiêu đề phụ</Label>
                  <Input id="subtitle" {...register("subtitle")} placeholder="Mô tả ngắn gọn" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả khóa học *</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    rows={4}
                    className={errors.description ? "border-red-500" : ""}
                  />
                  {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Giá (VNĐ) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      {...register("price")}
                      className={errors.price ? "border-red-500" : ""}
                    />
                    {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Ngôn ngữ</Label>
                    <Select
                      defaultValue={course.language}
                      onValueChange={(value) => setValue("language", value as Language)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((l) => (
                          <SelectItem key={l.value} value={l.value}>
                            {l.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="level">Cấp độ</Label>
                    <Select
                      defaultValue={course.level}
                      onValueChange={(value) => setValue("level", value as CourseLevel)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEVELS.map((l) => (
                          <SelectItem key={l.value} value={l.value}>
                            {l.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade">Khối lớp</Label>
                    <Select
                      defaultValue={String(course.grade)}
                      onValueChange={(value) => setValue("grade", Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADES.map((g) => (
                          <SelectItem key={g.value} value={String(g.value)}>
                            {g.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="detail" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="outcome">Kết quả đạt được</Label>
                  <Textarea id="outcome" {...register("outcome")} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requirement">Yêu cầu</Label>
                  <Textarea id="requirement" {...register("requirement")} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audience">Đối tượng</Label>
                  <Textarea id="audience" {...register("audience")} rows={3} />
                </div>
              </TabsContent>

              <TabsContent value="thumbnail" className="space-y-4 text-center">
                <div className="mx-auto aspect-video w-full max-w-md overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
                  {thumbnailPreview ? (
                    <img src={thumbnailPreview} alt="Thumbnail" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-gray-400">
                      <Image className="mb-2 h-12 w-12" />
                      <p>Chưa có ảnh bìa</p>
                    </div>
                  )}
                </div>
                <Input type="file" accept="image/*" onChange={handleThumbnailChange} className="mx-auto max-w-xs" />
                <p className="text-sm text-gray-500">Khuyến nghị: 1280x720px, tối đa 2MB</p>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="border-t bg-gray-50 p-4">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="mr-2 h-4 w-4" />
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-linear-to-r from-blue-600 to-indigo-600">
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
