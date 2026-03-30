import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateSection, useSectionsByCourse, useUpdateSection } from "../queries/useSection";
import type { SectionDetail, UpdateSectionRequest } from "../types/section.type";

interface SectionModalProps {
  mode: "create" | "edit";
  section?: SectionDetail;
  courseId?: number;
  onClose: () => void;
  onSuccess?: () => void;
}

const sectionSchema = z.object({
  title: z.string().min(1, "Tên chương là bắt buộc").max(100, "Tối đa 100 ký tự"),
  description: z.string().optional(),
  isPublished: z.boolean(),
});

type SectionFormValues = z.infer<typeof sectionSchema>;

const SectionModal: React.FC<SectionModalProps> = ({ mode, section, courseId, onClose, onSuccess }) => {
  const updateSectionMutation = useUpdateSection();
  const createSectionMutation = useCreateSection();
  const { data: sections } = useSectionsByCourse(courseId!);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      title: section?.title || "",
      description: section?.description || "",
      isPublished: section?.isPublished ?? true,
    },
  });

  const isPublished = watch("isPublished");

  useEffect(() => {
    if (mode === "edit" && section) {
      reset({
        title: section.title,
        description: section.description || "",
        isPublished: section.isPublished,
      });
    }
  }, [section, reset, mode]);

  const onSubmit = async (data: SectionFormValues) => {
    try {
      if (mode === "edit" && section) {
        const updateData: UpdateSectionRequest = {
          title: data.title,
          description: data.description || undefined,
          isPublished: data.isPublished,
          orderIndex: section.orderIndex,
        };
        await updateSectionMutation.mutateAsync({
          id: section.id,
          courseId: courseId ?? 0,
          data: updateData,
        });
      } else if (mode === "create" && courseId) {
        await createSectionMutation.mutateAsync({
          courseId,
          title: data.title,
          description: data.description,
          isPublished: data.isPublished,
          orderIndex: (sections?.length || 0) + 1,
        });
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(`Failed to ${mode} section:`, error);
    }
  };

  const isPending = updateSectionMutation.isPending || createSectionMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-bold">{mode === "create" ? "Thêm chương mới" : "Chỉnh sửa chương"}</h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tên chương *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="VD: Chương 1: Giới thiệu"
                className={errors.title ? "border-red-500" : ""}
                autoFocus
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea id="description" {...register("description")} rows={3} placeholder="Mô tả chương (tùy chọn)" />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublished"
                checked={isPublished}
                onCheckedChange={(checked) => setValue("isPublished", !!checked)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="isPublished"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Công khai chương
                </label>
                <p className="text-sm text-muted-foreground">Học viên có thể xem chương này khi được công khai</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <Button type="button" size="lg" variant="outline" onClick={onClose} disabled={isPending}>
                Hủy
              </Button>
              <Button type="submit" size="lg" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "Đang lưu..." : mode === "create" ? "Thêm chương" : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default SectionModal;
