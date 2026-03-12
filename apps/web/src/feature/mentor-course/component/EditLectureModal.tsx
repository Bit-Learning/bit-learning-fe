import { Button } from "@workspace/ui/components/Button";
import { Card } from "@workspace/ui/components/Card";
import { Input } from "@workspace/ui/components/Input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/Textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Trash2, Upload, Video, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { useLectureText } from "@/feature/lecture/queries/useLecture";
import type { LectureDetail } from "@/feature/lecture/types/lecture.type";
import { useDeleteLecture, useUpdateLecture, useUpdateLectureText, useUpdateLectureVideo } from "../queries/useLecture";
import type { UpdateLectureRequest, UpdateLectureTextRequest } from "../types/mlecture.api";

interface EditLectureModalProps {
  lecture: LectureDetail;
  onClose: () => void;
  onSuccess?: () => void;
}

const lectureBaseSchema = z.object({
  title: z.string().min(1, "Tên bài học là bắt buộc"),
  description: z.string().optional(),
  isPreviewable: z.boolean(),
});

const textLectureSchema = lectureBaseSchema.extend({
  content: z.string().min(1, "Nội dung là bắt buộc"),
});

type VideoFormValues = z.infer<typeof lectureBaseSchema>;
type TextFormValues = z.infer<typeof textLectureSchema>;

export const EditLectureModal = ({ lecture, onClose, onSuccess }: EditLectureModalProps) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const { data: textData, isLoading: textLoading } = useLectureText(lecture.type === "TEXT" ? lecture.id : 0);

  const updateLectureMutation = useUpdateLecture();
  const updateTextMutation = useUpdateLectureText();
  const updateVideoMutation = useUpdateLectureVideo();
  const deleteLectureMutation = useDeleteLecture();

  const videoForm = useForm<VideoFormValues>({
    resolver: zodResolver(lectureBaseSchema) as Resolver<VideoFormValues>,
    defaultValues: {
      title: lecture.title,
      description: lecture.description || "",
      isPreviewable: lecture.isPreviewable,
    },
  });

  const textForm = useForm<TextFormValues>({
    resolver: zodResolver(textLectureSchema) as Resolver<TextFormValues>,
    defaultValues: {
      title: lecture.title,
      description: lecture.description || "",
      isPreviewable: lecture.isPreviewable,
      content: "",
    },
  });

  useEffect(() => {
    if (textData?.content) textForm.setValue("content", textData.content);
  }, [textData, textForm]);

  const handleVideoSubmit = async (data: VideoFormValues) => {
    try {
      const updateData: UpdateLectureRequest = {
        sectionId: lecture.sectionId,
        title: data.title,
        description: data.description || undefined,
        isPreviewable: data.isPreviewable,
        orderIndex: lecture.orderIndex,
      };
      await updateLectureMutation.mutateAsync({ id: lecture.id, data: updateData });
      if (videoFile) await updateVideoMutation.mutateAsync({ id: lecture.id, video: videoFile });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to update video lecture:", error);
    }
  };

  const handleTextSubmit = async (data: TextFormValues) => {
    try {
      const updateData: UpdateLectureRequest = {
        sectionId: lecture.sectionId,
        title: data.title,
        description: data.description || undefined,
        isPreviewable: data.isPreviewable,
        orderIndex: lecture.orderIndex,
      };
      await updateLectureMutation.mutateAsync({ id: lecture.id, data: updateData });
      await updateTextMutation.mutateAsync({
        id: lecture.id,
        data: { content: data.content } as UpdateLectureTextRequest,
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to update text lecture:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xóa bài học này?")) return;
    try {
      await deleteLectureMutation.mutateAsync(lecture.id);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to delete lecture:", error);
    }
  };

  const isLoading = updateLectureMutation.isPending || updateTextMutation.isPending || updateVideoMutation.isPending;

  const FormActions = () => (
    <div className="flex justify-between border-t pt-4">
      <Button type="button" variant="outline" onClick={handleDelete} isDisabled={deleteLectureMutation.isPending}>
        <Trash2 className="mr-2 h-4 w-4 text-red-500" />
        Xóa bài học
      </Button>
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button type="submit" isDisabled={isLoading}>
          {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="max-h-[90vh] w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-bold">Chỉnh sửa bài học</h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-6">
          {lecture.type === "VIDEO" && (
            <form onSubmit={videoForm.handleSubmit(handleVideoSubmit)} className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Video className="h-5 w-5" />
                <span className="font-medium">Chỉnh sửa bài học Video</span>
              </div>

              <div className="space-y-1">
                <Label>Tên bài học *</Label>
                <Input
                  {...videoForm.register("title")}
                  placeholder="VD: Bài 1: Giới thiệu"
                  className={videoForm.formState.errors.title ? "border-red-500" : ""}
                />
                {videoForm.formState.errors.title && (
                  <p className="text-sm text-red-500">{videoForm.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Mô tả</Label>
                <Textarea {...videoForm.register("description")} rows={2} placeholder="Mô tả ngắn về bài học" />
              </div>

              <div>
                <Label>Thay đổi video (tùy chọn)</Label>
                <div className="mt-2 rounded-lg border-2 border-dashed p-4 text-center">
                  <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-600">
                    {videoFile ? videoFile.name : "Chọn file video mới để thay thế"}
                  </p>
                  <Input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  {...videoForm.register("isPreviewable")}
                  className="mt-1 h-4 w-4 rounded border-gray-300"
                />
                <span className="font-medium">Cho phép xem trước</span>
              </label>

              <FormActions />
            </form>
          )}

          {lecture.type === "TEXT" &&
            (textLoading ? (
              <div className="py-8 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-green-600" />
                <p className="mt-2 text-gray-600">Đang tải nội dung...</p>
              </div>
            ) : (
              <form onSubmit={textForm.handleSubmit(handleTextSubmit)} className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <FileText className="h-5 w-5" />
                  <span className="font-medium">Chỉnh sửa bài học Văn bản</span>
                </div>

                <div className="space-y-1">
                  <Label>Tên bài học *</Label>
                  <Input
                    {...textForm.register("title")}
                    placeholder="VD: Bài 1: Giới thiệu"
                    className={textForm.formState.errors.title ? "border-red-500" : ""}
                  />
                  {textForm.formState.errors.title && (
                    <p className="text-sm text-red-500">{textForm.formState.errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label>Mô tả</Label>
                  <Textarea {...textForm.register("description")} rows={2} placeholder="Mô tả ngắn về bài học" />
                </div>

                <div className="space-y-1">
                  <Label>Nội dung *</Label>
                  <Textarea
                    {...textForm.register("content")}
                    rows={10}
                    placeholder="Nhập nội dung bài học..."
                    className={textForm.formState.errors.content ? "border-red-500" : ""}
                  />
                  {textForm.formState.errors.content && (
                    <p className="text-sm text-red-500">{textForm.formState.errors.content.message}</p>
                  )}
                </div>

                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    {...textForm.register("isPreviewable")}
                    className="mt-1 h-4 w-4 rounded border-gray-300"
                  />
                  <span className="font-medium">Cho phép xem trước</span>
                </label>

                <FormActions />
              </form>
            ))}
        </div>
      </Card>
    </div>
  );
};
