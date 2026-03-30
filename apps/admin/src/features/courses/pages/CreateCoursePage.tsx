import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCourse } from "../queries/useCourse";
import { CourseLevel, type CreateCourseRequest, Language } from "../types/course.type";
import { cn } from "@/shared/lib/utils";

const createCourseSchema = z.object({
  title: z.string().min(1, "Tên khóa học là bắt buộc").max(100, "Tối đa 100 ký tự"),
  subtitle: z.string().min(1, "Mô tả ngắn là bắt buộc").max(100, "Tối đa 100 ký tự"),
  description: z.string().min(1, "Mô tả chi tiết là bắt buộc"),
  price: z.coerce.number().min(0, "Giá không thể âm"),
  language: z.nativeEnum(Language),
  outcome: z.string().min(1, "Trường này là bắt buộc"),
  requirement: z.string().min(1, "Trường này là bắt buộc"),
  audience: z.string().min(1, "Trường này là bắt buộc"),
  level: z.nativeEnum(CourseLevel),
  grade: z.coerce.number().min(1).max(12),
});

type CreateCourseFormValues = z.infer<typeof createCourseSchema>;

export const CreateCoursePage: React.FC = () => {
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const createCourseMutation = useCreateCourse();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateCourseFormValues>({
    resolver: zodResolver(createCourseSchema) as Resolver<CreateCourseFormValues>,
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      price: 0,
      language: Language.VIETNAMESE,
      outcome: "",
      requirement: "",
      audience: "",
      level: CourseLevel.BEGINNING,
      grade: 3,
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

  const onSubmit = async (data: CreateCourseFormValues) => {
    if (!thumbnailFile) return;
    try {
      await createCourseMutation.mutateAsync({ data: data as CreateCourseRequest, thumbnail: thumbnailFile });
      navigate({ to: "/courses" });
    } catch (error) {
      console.error("Failed to create course:", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-4xl p-8">
        <div className="mb-6">
          <Button variant="outline" size="lg" className="gap-2" onClick={() => navigate({ to: "/courses" })}>
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Button>
          <h1 className="mt-4 text-3xl font-bold">Tạo khóa học mới</h1>
          <p className="mt-2 text-gray-600">Điền thông tin cơ bản cho khóa học của bạn</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="col-span-2">
              <Label className="text-base font-semibold">Ảnh bìa khóa học *</Label>
              <div
                className={cn(
                  "relative mt-2 cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors hover:border-blue-400",
                  thumbnailPreview ? "border-blue-400" : "border-gray-300",
                  !thumbnailFile && "border-red-300",
                )}
              >
                {thumbnailPreview ? (
                  <div className="relative">
                    <img src={thumbnailPreview} alt="Preview" className="mx-auto max-h-48 rounded-lg" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={() => {
                        setThumbnailPreview("");
                        setThumbnailFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <p className="text-sm text-gray-600">Kéo thả ảnh hoặc click để chọn</p>
                    <p className="mt-2 text-xs text-gray-400">PNG, JPG (tối đa 5MB)</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </div>
              {!thumbnailFile && <p className="mt-1 text-sm text-red-500">Vui lòng chọn ảnh bìa</p>}
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="title" className="text-base font-semibold">
                Tên khóa học *
              </Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="VD: Lập trình Python cho người mới bắt đầu"
                className={cn(errors.title && "border-red-500")}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="subtitle" className="text-base font-semibold">
                Mô tả ngắn *
              </Label>
              <Input
                id="subtitle"
                {...register("subtitle")}
                placeholder="VD: Học Python từ cơ bản đến nâng cao trong 30 ngày"
                className={cn(errors.subtitle && "border-red-500")}
              />
              {errors.subtitle && <p className="text-sm text-red-500">{errors.subtitle.message}</p>}
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description" className="text-base font-semibold">
                Mô tả chi tiết *
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                rows={6}
                placeholder="Mô tả chi tiết về khóa học..."
                className={cn(errors.description && "border-red-500")}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-base font-semibold">
                Giá khóa học (VNĐ) *
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                {...register("price")}
                placeholder="0"
                className={cn(errors.price && "border-red-500")}
              />
              {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade" className="text-base font-semibold">
                Khối lớp *
              </Label>
              <select
                id="grade"
                defaultValue="3"
                onChange={(e) => setValue("grade", Number(e.target.value))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                  <option key={g} value={String(g)}>
                    Lớp {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language" className="text-base font-semibold">
                Ngôn ngữ *
              </Label>
              <select
                id="language"
                defaultValue={Language.VIETNAMESE}
                onChange={(e) => setValue("language", e.target.value as Language)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value={Language.VIETNAMESE}>Tiếng Việt</option>
                <option value={Language.ENGLISH}>English</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level" className="text-base font-semibold">
                Cấp độ *
              </Label>
              <select
                id="level"
                defaultValue={CourseLevel.BEGINNING}
                onChange={(e) => setValue("level", e.target.value as CourseLevel)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value={CourseLevel.BEGINNING}>Cơ bản</option>
                <option value={CourseLevel.INTERMEDIATE}>Trung cấp</option>
                <option value={CourseLevel.ADVANCED}>Nâng cao</option>
              </select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="outcome" className="text-base font-semibold">
                Học viên sẽ học được gì? *
              </Label>
              <Textarea
                id="outcome"
                {...register("outcome")}
                rows={5}
                className={cn(errors.outcome && "border-red-500")}
              />
              {errors.outcome && <p className="text-sm text-red-500">{errors.outcome.message}</p>}
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="requirement" className="text-base font-semibold">
                Yêu cầu *
              </Label>
              <Textarea
                id="requirement"
                {...register("requirement")}
                rows={5}
                className={cn(errors.requirement && "border-red-500")}
              />
              {errors.requirement && <p className="text-sm text-red-500">{errors.requirement.message}</p>}
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="audience" className="text-base font-semibold">
                Đối tượng học viên *
              </Label>
              <Textarea
                id="audience"
                {...register("audience")}
                rows={5}
                className={cn(errors.audience && "border-red-500")}
              />
              {errors.audience && <p className="text-sm text-red-500">{errors.audience.message}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-6">
            <Button type="button" size="lg" variant="outline" onClick={() => navigate({ to: "/courses" })}>
              Hủy
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={createCourseMutation.isPending || !thumbnailFile}
              className="min-w-30"
            >
              {createCourseMutation.isPending ? "Đang tạo..." : "Tạo khóa học"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
