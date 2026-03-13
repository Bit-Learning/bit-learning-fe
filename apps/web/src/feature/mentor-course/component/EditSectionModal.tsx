import { Button } from "@workspace/ui/components/Button";
import { Card } from "@workspace/ui/components/Card";
import { Input } from "@workspace/ui/components/Input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/Textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { useUpdateSection } from "../queries/useSection";
import type { SectionDetail, UpdateSectionRequest } from "../types/msection.api";

interface EditSectionModalProps {
  section: SectionDetail;
  onClose: () => void;
  onSuccess?: () => void;
}

const sectionSchema = z.object({
  title: z.string().min(1, "Tên chương là bắt buộc").max(100, "Tối đa 100 ký tự"),
  description: z.string().optional(),
  isPublished: z.boolean(),
});

type SectionFormValues = z.infer<typeof sectionSchema>;

export const EditSectionModal = ({ section, onClose, onSuccess }: EditSectionModalProps) => {
  const updateSectionMutation = useUpdateSection();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema) as Resolver<SectionFormValues>,
    defaultValues: {
      title: section.title,
      description: section.description || "",
      isPublished: section.isPublished,
    },
  });

  useEffect(() => {
    reset({
      title: section.title,
      description: section.description || "",
      isPublished: section.isPublished,
    });
  }, [section, reset]);

  const onSubmit = async (data: SectionFormValues) => {
    try {
      const updateData: UpdateSectionRequest = {
        title: data.title,
        description: data.description || undefined,
        isPublished: data.isPublished,
        orderIndex: section.orderIndex,
      };
      await updateSectionMutation.mutateAsync({ id: section.id, data: updateData });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to update section:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-lg">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-bold">Chỉnh sửa chương</h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="title">Tên chương *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="VD: Chương 1: Giới thiệu"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea id="description" {...register("description")} rows={3} placeholder="Mô tả chương (tùy chọn)" />
            </div>

            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" {...register("isPublished")} className="mt-1 h-4 w-4 rounded border-gray-300" />
              <div>
                <span className="font-medium">Công khai chương</span>
                <p className="text-sm text-gray-500">Học viên có thể xem chương này khi được công khai</p>
              </div>
            </label>

            <div className="flex justify-end gap-3 border-t pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" isDisabled={updateSectionMutation.isPending}>
                {updateSectionMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};
