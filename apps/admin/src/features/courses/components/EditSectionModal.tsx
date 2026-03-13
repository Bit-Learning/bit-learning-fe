import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateSection } from "../queries/useSection";
import type { SectionDetail, UpdateSectionRequest } from "../types/section.type";

interface EditSectionModalProps {
  open: boolean;
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

const EditSectionModal: React.FC<EditSectionModalProps> = ({ open, section, onClose, onSuccess }) => {
  const updateSectionMutation = useUpdateSection();

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
      title: section.title,
      description: section.description || "",
      isPublished: section.isPublished,
    },
  });

  const isPublished = watch("isPublished");

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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa chương</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tên chương *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="VD: Chương 1: Giới thiệu"
              className={errors.title ? "border-red-500" : ""}
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={updateSectionMutation.isPending}>
              Hủy
            </Button>
            <Button type="submit" disabled={updateSectionMutation.isPending}>
              {updateSectionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {updateSectionMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSectionModal;
