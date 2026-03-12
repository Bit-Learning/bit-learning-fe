import { Button } from "@workspace/ui/components/Button";
import { Card } from "@workspace/ui/components/Card";
import { Input } from "@workspace/ui/components/Input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/Textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, DollarSign, FileText, Globe, GraduationCap, Image, Save, Target, Users, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { type CourseDetail, CourseLevel, Language, type UpdateCourseRequest } from "@/feature/course/types/course.type";
import { useUpdateCourse, useUpdateThumbnail } from "../queries/useCourse";

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
  { value: CourseLevel.BEGINNING, label: "Cơ bản" },
  { value: CourseLevel.INTERMEDIATE, label: "Trung cấp" },
  { value: CourseLevel.ADVANCED, label: "Nâng cao" },
];
const LANGUAGES = [
  { value: Language.VIETNAMESE, label: "🇻🇳 Tiếng Việt" },
  { value: Language.ENGLISH, label: "🇺🇸 Tiếng Anh" },
];
const GRADES = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Lớp ${i + 1}` }));

export const EditCourseModal = ({ course, onClose, onSuccess }: EditCourseModalProps) => {
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(course.thumbnailUrl || null);
  const [activeTab, setActiveTab] = useState<"basic" | "detail" | "thumbnail">("basic");

  const updateCourseMutation = useUpdateCourse();
  const updateThumbnailMutation = useUpdateThumbnail();

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

  const tabs = [
    { id: "basic" as const, label: "Thông tin cơ bản", icon: BookOpen },
    { id: "detail" as const, label: "Chi tiết khóa học", icon: FileText },
    { id: "thumbnail" as const, label: "Ảnh bìa", icon: Image },
  ];

  const selectClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="max-h-[95vh] w-full max-w-4xl overflow-hidden">
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 flex items-center justify-between border-b p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Chỉnh sửa khóa học</h2>
              <p className="text-sm text-blue-100">Cập nhật thông tin khóa học của bạn</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex border-b bg-gray-50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-600 bg-white text-blue-600"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="max-h-[calc(95vh-220px)] overflow-y-auto p-6">
            {activeTab === "basic" && (
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
            )}

            {activeTab === "detail" && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-600" />
                    Kết quả đạt được
                  </Label>
                  <Textarea {...register("outcome")} rows={3} placeholder="Học viên sẽ đạt được gì sau khóa học?" />
                </div>
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-yellow-600" />
                    Yêu cầu
                  </Label>
                  <Textarea
                    {...register("requirement")}
                    rows={3}
                    placeholder="Học viên cần chuẩn bị gì trước khi học?"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    Đối tượng
                  </Label>
                  <Textarea {...register("audience")} rows={3} placeholder="Khóa học này phù hợp với ai?" />
                </div>
              </div>
            )}

            {activeTab === "thumbnail" && (
              <div className="space-y-5 text-center">
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
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t bg-gray-50 p-4">
            <Button type="button" variant="outline" onClick={onClose} className="gap-2">
              <X className="h-4 w-4" />
              Hủy
            </Button>
            <Button
              type="submit"
              isDisabled={isLoading}
              className="gap-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Save className="h-4 w-4" />
              {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
