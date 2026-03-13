import React, { useState } from "react";
import { BookOpen, DollarSign, FileText, Globe, GraduationCap, Image, Loader2, Save, Target, X } from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  const selectClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="max-h-[95vh] w-full max-w-4xl overflow-hidden">
        <div className="shrink-0 bg-linear-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Chỉnh sửa khóa học</h2>
                <p className="text-sm text-blue-100">Cập nhật thông tin khóa học của bạn</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onClose} className="bg-white/20 text-white hover:bg-white/30">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
          <Tabs defaultValue="basic" className="flex flex-1 flex-col overflow-hidden">
            <TabsList className="mx-6 mt-4 grid w-auto shrink-0 grid-cols-3">
              <TabsTrigger value="basic" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Thông tin cơ bản
              </TabsTrigger>
              <TabsTrigger value="detail" className="gap-2">
                <FileText className="h-4 w-4" />
                Chi tiết
              </TabsTrigger>
              <TabsTrigger value="thumbnail" className="gap-2">
                <Image className="h-4 w-4" />
                Ảnh bìa
              </TabsTrigger>
            </TabsList>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Tab: Thông tin cơ bản */}
              <TabsContent value="basic" className="mt-0 space-y-6">
                <div className="space-y-5">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      Tên khóa học *
                    </Label>
                    <Input
                      {...register("title")}
                      placeholder="VD: Toán học lớp 10 - Từ cơ bản đến nâng cao"
                      className={errors.title ? "border-red-500" : ""}
                    />
                    {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <Label>Tiêu đề phụ</Label>
                    <Input {...register("subtitle")} placeholder="Mô tả ngắn gọn về khóa học" />
                  </div>

                  <div className="space-y-1">
                    <Label>Mô tả khóa học *</Label>
                    <Textarea
                      {...register("description")}
                      rows={4}
                      placeholder="Mô tả chi tiết về nội dung khóa học..."
                      className={errors.description ? "border-red-500" : ""}
                    />
                    {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        Giá (VNĐ) *
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        {...register("price")}
                        placeholder="0 = Miễn phí"
                        className={errors.price ? "border-red-500" : ""}
                      />
                      {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-indigo-600" />
                        Ngôn ngữ
                      </Label>
                      <select {...register("language")} className={selectClass}>
                        {LANGUAGES.map((l) => (
                          <option key={l.value} value={l.value}>
                            {l.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-orange-600" />
                        Cấp độ
                      </Label>
                      <select {...register("level")} className={selectClass}>
                        {LEVELS.map((l) => (
                          <option key={l.value} value={l.value}>
                            {l.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-purple-600" />
                        Khối lớp
                      </Label>
                      <select {...register("grade")} className={selectClass}>
                        {GRADES.map((g) => (
                          <option key={g.value} value={g.value}>
                            {g.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab: Chi tiết */}
              <TabsContent value="detail" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="outcome">Kết quả đạt được</Label>
                  <Textarea
                    id="outcome"
                    {...register("outcome")}
                    rows={5}
                    placeholder="Học viên sẽ đạt được những gì sau khóa học..."
                  />
                  <p className="text-sm text-gray-500">Mô tả những kỹ năng và kiến thức học viên sẽ có được</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requirement">Yêu cầu</Label>
                  <Textarea
                    id="requirement"
                    {...register("requirement")}
                    rows={5}
                    placeholder="Yêu cầu đầu vào cho học viên..."
                  />
                  <p className="text-sm text-gray-500">Kiến thức hoặc công cụ cần có trước khi bắt đầu</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audience">Đối tượng</Label>
                  <Textarea id="audience" {...register("audience")} rows={5} placeholder="Khóa học phù hợp với ai..." />
                  <p className="text-sm text-gray-500">Đối tượng mục tiêu của khóa học</p>
                </div>
              </TabsContent>

              {/* Tab: Ảnh bìa */}
              <TabsContent value="thumbnail" className="mt-0">
                <div className="flex flex-col items-center space-y-6">
                  <div className="w-full max-w-2xl">
                    <div className="aspect-video w-full overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
                      {thumbnailPreview ? (
                        <img src={thumbnailPreview} alt="Thumbnail" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center text-gray-400">
                          <Image className="mb-4 h-16 w-16" />
                          <p className="text-lg font-medium">Chưa có ảnh bìa</p>
                          <p className="text-sm">Tải lên ảnh bìa cho khóa học</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-full max-w-md space-y-2">
                    <Input type="file" accept="image/*" onChange={handleThumbnailChange} />
                    <div className="text-center text-sm text-gray-500">
                      <p>Khuyến nghị: 1280x720px (tỉ lệ 16:9)</p>
                      <p>Dung lượng tối đa: 2MB</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <div className="shrink-0 border-t bg-gray-50 p-6">
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                <X className="mr-2 h-4 w-4" />
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditCourseModal;
