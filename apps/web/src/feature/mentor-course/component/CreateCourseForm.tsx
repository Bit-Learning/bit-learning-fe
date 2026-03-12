import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { Card } from "@workspace/ui/components/Card";
import { Input } from "@workspace/ui/components/Input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/Textarea";
import { cn } from "@workspace/ui/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Upload, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { CourseLevel } from "@/feature/course/types/course.type";
import { useCreateCourse } from "../queries/useCourse";
import { type CreateCourseRequest, Language } from "../types/mcourse.type";

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

export const CreateCourseForm = () => {
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const createCourseMutation = useCreateCourse();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
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
      grade: 1,
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
      navigate({ to: "/mentor/course/list" });
    } catch (error) {
      console.error("Failed to create course:", error);
    }
  };

  return (
    <Card className="w-full p-8">
      <div className="mb-6">
        <Button
          variant="outline"
          size="lg"
          className="gap-2 border-gray-300 bg-white shadow-sm transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
          onClick={() => navigate({ to: "/mentor/course/list" })}
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Button>
        <h1 className="mt-4 text-3xl font-bold">Tạo khóa học mới</h1>
        <p className="mt-2 text-gray-600">Điền thông tin cơ bản cho khóa học của bạn</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="col-span-2">
            <Label className="text-md">Ảnh bìa khóa học *</Label>
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

          <div className="col-span-2 space-y-1">
            <Label className="text-md" htmlFor="title">
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

          <div className="col-span-2 space-y-1">
            <Label className="text-md" htmlFor="subtitle">
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

          <div className="col-span-2 space-y-1">
            <Label className="text-md" htmlFor="description">
              Mô tả chi tiết *
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              rows={4}
              placeholder="Mô tả chi tiết về khóa học..."
              className={cn(errors.description && "border-red-500")}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-md" htmlFor="price">
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

          <div className="space-y-1">
            <Label className="text-md" htmlFor="grade">
              Khối lớp *
            </Label>
            <select
              id="grade"
              {...register("grade")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                <option key={g} value={g}>
                  Lớp {g}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-md" htmlFor="language">
              Ngôn ngữ *
            </Label>
            <select
              id="language"
              {...register("language")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              <option value={Language.VIETNAMESE}>Tiếng Việt</option>
              <option value={Language.ENGLISH}>English</option>
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-md" htmlFor="level">
              Cấp độ *
            </Label>
            <select
              id="level"
              {...register("level")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              <option value={CourseLevel.BEGINNING}>Cơ bản</option>
              <option value={CourseLevel.INTERMEDIATE}>Trung cấp</option>
              <option value={CourseLevel.ADVANCED}>Nâng cao</option>
            </select>
          </div>

          <div className="col-span-2 space-y-1">
            <Label className="text-md" htmlFor="outcome">
              Học viên sẽ học được gì? *
            </Label>
            <Textarea
              id="outcome"
              {...register("outcome")}
              rows={3}
              className={cn(errors.outcome && "border-red-500")}
            />
            {errors.outcome && <p className="text-sm text-red-500">{errors.outcome.message}</p>}
          </div>

          <div className="col-span-2 space-y-1">
            <Label className="text-md" htmlFor="requirement">
              Yêu cầu *
            </Label>
            <Textarea
              id="requirement"
              {...register("requirement")}
              rows={3}
              className={cn(errors.requirement && "border-red-500")}
            />
            {errors.requirement && <p className="text-sm text-red-500">{errors.requirement.message}</p>}
          </div>

          <div className="col-span-2 space-y-1">
            <Label className="text-md" htmlFor="audience">
              Đối tượng học viên *
            </Label>
            <Textarea
              id="audience"
              {...register("audience")}
              rows={3}
              className={cn(errors.audience && "border-red-500")}
            />
            {errors.audience && <p className="text-sm text-red-500">{errors.audience.message}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-6">
          <Link to="/mentor/course/list">
            <Button type="button" size="xl" variant="outline">
              Hủy
            </Button>
          </Link>
          <Button
            type="submit"
            size="xl"
            isDisabled={createCourseMutation.isPending || !thumbnailFile}
            className="min-w-30"
          >
            {createCourseMutation.isPending ? "Đang tạo..." : "Tạo khóa học"}
          </Button>
        </div>
      </form>
    </Card>
  );
};
