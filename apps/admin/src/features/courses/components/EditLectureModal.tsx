import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileText, Loader2, Trash2, Upload, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  useDeleteLecture,
  useLectureText,
  useUpdateLecture,
  useUpdateLectureText,
  useUpdateLectureVideo,
} from "../queries/useLecture";
import { LectureDetail } from "../types/course.type";
import { UpdateLectureRequest, UpdateLectureTextRequest } from "../types/lecture.type";

interface EditLectureModalProps {
  open: boolean;
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

const EditLectureModal: React.FC<EditLectureModalProps> = ({ open, lecture, onClose, onSuccess }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const { data: textData, isLoading: textLoading } = useLectureText(lecture.type === "TEXT" ? lecture.id : 0);

  const updateLectureMutation = useUpdateLecture();
  const updateTextMutation = useUpdateLectureText();
  const updateVideoMutation = useUpdateLectureVideo();
  const deleteLectureMutation = useDeleteLecture();

  const videoForm = useForm<VideoFormValues>({
    resolver: zodResolver(lectureBaseSchema),
    defaultValues: {
      title: lecture.title,
      description: lecture.description || "",
      isPreviewable: lecture.isPreviewable,
    },
  });

  const textForm = useForm<TextFormValues>({
    resolver: zodResolver(textLectureSchema),
    defaultValues: {
      title: lecture.title,
      description: lecture.description || "",
      isPreviewable: lecture.isPreviewable,
      content: "",
    },
  });

  const videoIsPreviewable = videoForm.watch("isPreviewable");
  const textIsPreviewable = textForm.watch("isPreviewable");

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa bài học</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {lecture.type === "VIDEO" && (
            <form onSubmit={videoForm.handleSubmit(handleVideoSubmit)} className="space-y-4 p-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Video className="h-5 w-5" />
                <span className="font-medium">Chỉnh sửa bài học Video</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Tên bài học *</Label>
                <Input
                  id="title"
                  {...videoForm.register("title")}
                  placeholder="VD: Bài 1: Giới thiệu"
                  className={videoForm.formState.errors.title ? "border-red-500" : ""}
                />
                {videoForm.formState.errors.title && (
                  <p className="text-sm text-red-500">{videoForm.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  {...videoForm.register("description")}
                  rows={2}
                  placeholder="Mô tả ngắn về bài học"
                />
              </div>

              <div className="space-y-2">
                <Label>Thay đổi video (tùy chọn)</Label>
                <div className="rounded-lg border-2 border-dashed p-4 text-center">
                  <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-600">
                    {videoFile ? videoFile.name : "Chọn file video mới để thay thế"}
                  </p>
                  <Input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPreviewable"
                  checked={videoIsPreviewable}
                  onCheckedChange={(checked) => videoForm.setValue("isPreviewable", !!checked)}
                />
                <Label htmlFor="isPreviewable" className="font-medium">
                  Cho phép xem trước
                </Label>
              </div>

              <DialogFooter className="sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={deleteLectureMutation.isPending}
                  className="text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  {deleteLectureMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa bài học
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          )}

          {lecture.type === "TEXT" &&
            (textLoading ? (
              <div className="py-8 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-green-600" />
                <p className="mt-2 text-gray-600">Đang tải nội dung...</p>
              </div>
            ) : (
              <form onSubmit={textForm.handleSubmit(handleTextSubmit)} className="space-y-4 p-4">
                <div className="flex items-center gap-2 text-green-600">
                  <FileText className="h-5 w-5" />
                  <span className="font-medium">Chỉnh sửa bài học Văn bản</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Tên bài học *</Label>
                  <Input
                    id="title"
                    {...textForm.register("title")}
                    placeholder="VD: Bài 1: Giới thiệu"
                    className={textForm.formState.errors.title ? "border-red-500" : ""}
                  />
                  {textForm.formState.errors.title && (
                    <p className="text-sm text-red-500">{textForm.formState.errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    {...textForm.register("description")}
                    rows={2}
                    placeholder="Mô tả ngắn về bài học"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Nội dung *</Label>
                  <Textarea
                    id="content"
                    {...textForm.register("content")}
                    rows={10}
                    placeholder="Nhập nội dung bài học..."
                    className={textForm.formState.errors.content ? "border-red-500" : ""}
                  />
                  {textForm.formState.errors.content && (
                    <p className="text-sm text-red-500">{textForm.formState.errors.content.message}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPreviewable"
                    checked={textIsPreviewable}
                    onCheckedChange={(checked) => textForm.setValue("isPreviewable", !!checked)}
                  />
                  <Label htmlFor="isPreviewable" className="font-medium">
                    Cho phép xem trước
                  </Label>
                </div>

                <DialogFooter className="sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDelete}
                    disabled={deleteLectureMutation.isPending}
                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                  >
                    {deleteLectureMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa bài học
                  </Button>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                      Hủy
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditLectureModal;
