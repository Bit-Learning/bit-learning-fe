import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { FileText, HelpCircle, Loader2, Trash2, Upload, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateLectureText,
  useCreateLectureVideo,
  useDeleteLecture,
  useLectureText,
  useUpdateLecture,
  useUpdateLectureText,
  useUpdateLectureVideo,
} from "../queries/useLecture";
import { LectureDetail } from "../types/course.type";
import { UpdateLectureRequest, UpdateLectureTextRequest } from "../types/lecture.type";
import { HtmlPasteButton } from "@/components/HtmlPasteButton";

interface LectureModalProps {
  mode: "create" | "edit";
  lecture?: LectureDetail;
  courseId?: number;
  sectionId?: number;
  existingLectures?: Array<{ orderIndex: number }>;
  onClose: () => void;
  onSuccess?: () => void;
}

type LectureType = "VIDEO" | "TEXT" | "QUIZ";

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

const LectureModal: React.FC<LectureModalProps> = ({
  mode,
  lecture,
  courseId,
  sectionId,
  existingLectures = [],
  onClose,
  onSuccess,
}) => {
  const getInitialLectureType = (): LectureType | null => {
    if (mode === "edit" && lecture) {
      const type = lecture.type;
      if (type === "VIDEO" || type === "TEXT" || type === "QUIZ") {
        return type;
      }
    }
    return null;
  };

  const [lectureType, setLectureType] = useState<LectureType | null>(getInitialLectureType());
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const textContentRef = useRef<any>(null);

  const { data: textData, isLoading: textLoading } = useLectureText(
    mode === "edit" && lecture && lecture.type === "TEXT" ? lecture.id : 0,
  );

  const createVideoMutation = useCreateLectureVideo();
  const createTextMutation = useCreateLectureText();
  const updateLectureMutation = useUpdateLecture();
  const updateTextMutation = useUpdateLectureText();
  const updateVideoMutation = useUpdateLectureVideo();
  const deleteLectureMutation = useDeleteLecture();

  const videoForm = useForm<VideoFormValues>({
    resolver: zodResolver(lectureBaseSchema),
    defaultValues: {
      title: lecture?.title || "",
      description: lecture?.description || "",
      isPreviewable: lecture?.isPreviewable || false,
    },
  });

  const textForm = useForm<TextFormValues>({
    resolver: zodResolver(textLectureSchema),
    defaultValues: {
      title: lecture?.title || "",
      description: lecture?.description || "",
      isPreviewable: lecture?.isPreviewable || false,
      content: "",
    },
  });

  const videoIsPreviewable = videoForm.watch("isPreviewable");
  const textIsPreviewable = textForm.watch("isPreviewable");

  const quillModules = useMemo(
    () => ({
      toolbar: [
        ["bold", "italic", "underline", "strike"],
        ["code", "blockquote", "code-block"],
        [{ header: [1, 2, 3, false] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ color: [] }, { background: [] }],
        ["link", "image", "video"],
        ["clean"],
      ],
      clipboard: {
        matchVisual: false,
      },
    }),
    [],
  );

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "code",
    "blockquote",
    "code-block",
    "list",
    "bullet",
    "indent",
    "color",
    "background",
    "link",
    "image",
    "video",
  ];

  useEffect(() => {
    if (textData?.content) {
      textForm.setValue("content", textData.content);
    }
  }, [textData, textForm]);

  const getNextOrderIndex = () => {
    if (existingLectures.length === 0) return 1;
    return Math.max(...existingLectures.map((l) => l.orderIndex)) + 1;
  };

  const handleInsertHtml = (ref: any, setValue: any, fieldName: string) => (html: string) => {
    if (ref.current) {
      const editor = ref.current.getEditor();
      const range = editor.getSelection();
      if (range) {
        editor.clipboard.dangerouslyPasteHTML(range.index, html);
      } else {
        const length = editor.getLength();
        editor.clipboard.dangerouslyPasteHTML(length, html);
      }
      setValue(fieldName, editor.root.innerHTML);
    }
  };

  const handleQuizClick = () => {
    onClose();
    navigate({
      to: "/courses/quiz",
      search: {
        mode: "create",
        sectionId: sectionId!,
        courseId: courseId!,
        orderIndex: getNextOrderIndex(),
      },
    });
  };

  const handleBack = () => {
    setLectureType(null);
    setVideoFile(null);
    videoForm.reset();
    textForm.reset();
  };

  const handleVideoSubmit = async (data: VideoFormValues) => {
    try {
      if (mode === "edit" && lecture) {
        const updateData: UpdateLectureRequest = {
          sectionId: lecture.sectionId,
          title: data.title,
          description: data.description || undefined,
          isPreviewable: data.isPreviewable,
          orderIndex: lecture.orderIndex,
        };
        await updateLectureMutation.mutateAsync({ id: lecture.id, data: updateData });
        if (videoFile) {
          await updateVideoMutation.mutateAsync({ id: lecture.id, video: videoFile });
        }
      } else if (mode === "create" && sectionId) {
        if (!videoFile) return;
        const request = JSON.stringify({
          sectionId,
          title: data.title,
          description: data.description,
          isPreviewable: data.isPreviewable,
          orderIndex: getNextOrderIndex(),
        });
        await createVideoMutation.mutateAsync({ request, video: videoFile });
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to save video lecture:", error);
    }
  };

  const handleTextSubmit = async (data: TextFormValues) => {
    try {
      if (mode === "edit" && lecture) {
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
      } else if (mode === "create" && sectionId) {
        await createTextMutation.mutateAsync({
          lecture: {
            sectionId,
            title: data.title,
            description: data.description,
            isPreviewable: data.isPreviewable,
            orderIndex: getNextOrderIndex(),
          },
          content: data.content,
        });
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to save text lecture:", error);
    }
  };

  const handleDelete = async () => {
    if (!lecture) return;
    if (!confirm("Bạn có chắc muốn xóa bài học này?")) return;
    try {
      await deleteLectureMutation.mutateAsync(lecture.id);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to delete lecture:", error);
    }
  };

  const isLoading =
    createVideoMutation.isPending ||
    createTextMutation.isPending ||
    updateLectureMutation.isPending ||
    updateTextMutation.isPending ||
    updateVideoMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-bold">{mode === "create" ? "Thêm bài học mới" : "Chỉnh sửa bài học"}</h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {mode === "create" && !lectureType && (
            <div className="grid grid-cols-3 gap-4">
              <Card
                className="cursor-pointer p-6 text-center transition-all hover:border-blue-400 hover:shadow-lg"
                onClick={() => setLectureType("VIDEO")}
              >
                <Video className="mx-auto mb-3 h-12 w-12 text-blue-600" />
                <h3 className="mb-1 font-semibold">Video</h3>
                <p className="text-sm text-gray-600">Tải lên video bài giảng</p>
              </Card>
              <Card
                className="cursor-pointer p-6 text-center transition-all hover:border-green-400 hover:shadow-lg"
                onClick={() => setLectureType("TEXT")}
              >
                <FileText className="mx-auto mb-3 h-12 w-12 text-green-600" />
                <h3 className="mb-1 font-semibold">Văn bản</h3>
                <p className="text-sm text-gray-600">Thêm nội dung văn bản</p>
              </Card>
              <Card
                className="cursor-pointer p-6 text-center transition-all hover:border-purple-400 hover:shadow-lg"
                onClick={handleQuizClick}
              >
                <HelpCircle className="mx-auto mb-3 h-12 w-12 text-purple-600" />
                <h3 className="mb-1 font-semibold">Bài kiểm tra</h3>
                <p className="text-sm text-gray-600">Tạo bài kiểm tra</p>
              </Card>
            </div>
          )}

          {lectureType === "VIDEO" && (
            <form id="lecture-form" onSubmit={videoForm.handleSubmit(handleVideoSubmit)} className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Video className="h-5 w-5" />
                <span className="font-medium">
                  {mode === "create" ? "Tạo bài học Video" : "Chỉnh sửa bài học Video"}
                </span>
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
                  rows={3}
                  placeholder="Mô tả ngắn về bài học"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="video">{mode === "create" ? "Upload video *" : "Thay đổi video (tùy chọn)"}</Label>
                <div className="rounded-lg border-2 border-dashed p-4 text-center">
                  <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-600">
                    {videoFile
                      ? videoFile.name
                      : mode === "create"
                        ? "Chọn file video"
                        : "Chọn file video mới để thay thế"}
                  </p>
                  <Input
                    id="video"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  />
                </div>
                {mode === "create" && !videoFile && <p className="text-sm text-red-500">Vui lòng chọn file video</p>}
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

              {mode === "edit" && (
                <div className="flex justify-between border-t pt-4">
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
                </div>
              )}
            </form>
          )}

          {lectureType === "TEXT" &&
            (mode === "edit" && textLoading ? (
              <div className="py-8 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-green-600" />
                <p className="mt-2 text-gray-600">Đang tải nội dung...</p>
              </div>
            ) : (
              <form id="lecture-form" onSubmit={textForm.handleSubmit(handleTextSubmit)} className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <FileText className="h-5 w-5" />
                  <span className="font-medium">
                    {mode === "create" ? "Tạo bài học Văn bản" : "Chỉnh sửa bài học Văn bản"}
                  </span>
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
                    rows={3}
                    placeholder="Mô tả ngắn về bài học"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Nội dung *</Label>
                    <HtmlPasteButton onInsert={handleInsertHtml(textContentRef, textForm.setValue, "content")} />
                  </div>
                  <div className={textForm.formState.errors.content ? "rounded-lg border-2 border-red-500" : ""}>
                    <ReactQuill
                      ref={textContentRef as any}
                      theme="snow"
                      value={textForm.watch("content") || ""}
                      onChange={(value) => textForm.setValue("content", value)}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Nhập nội dung bài học"
                      style={{ height: "400px", marginBottom: "50px" }}
                    />
                  </div>
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

                {mode === "edit" && (
                  <div className="flex justify-between border-t pt-4">
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
                  </div>
                )}
              </form>
            ))}
        </div>

        {mode === "create" && lectureType && (
          <div className="flex justify-end gap-3 border-t bg-gray-50 p-4">
            <Button type="button" size="lg" variant="outline" onClick={handleBack} disabled={isLoading}>
              Quay lại
            </Button>
            <Button
              type="submit"
              size="lg"
              form="lecture-form"
              disabled={isLoading || (lectureType === "VIDEO" && !videoFile)}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Đang thêm..." : "Thêm bài học"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LectureModal;
