import { useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { Card } from "@workspace/ui/components/Card";
import { Input } from "@workspace/ui/components/Input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/Textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, HelpCircle, Upload, Video, X } from "lucide-react";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { useAppDispatch } from "@/shared/redux/store";
import { useCreateLectureText, useCreateLectureVideo } from "../queries/useLecture";
import { setCreateQuizContextAction } from "../stores/mlecture.store";

interface CreateLectureModalProps {
  courseId: number;
  sectionId: number;
  onClose: () => void;
  existingLectures?: Array<{ orderIndex: number }>;
}

type LectureType = "VIDEO" | "TEXT" | "QUIZ";

const videoLectureSchema = z.object({
  title: z.string().min(1, "Tên bài học là bắt buộc"),
  description: z.string().optional(),
});

const textLectureSchema = z.object({
  title: z.string().min(1, "Tên bài học là bắt buộc"),
  description: z.string().optional(),
  textContent: z.string().min(1, "Nội dung là bắt buộc"),
});

type VideoLectureFormValues = z.infer<typeof videoLectureSchema>;
type TextLectureFormValues = z.infer<typeof textLectureSchema>;

export const CreateLectureModal = ({
  sectionId,
  courseId,
  onClose,
  existingLectures = [],
}: CreateLectureModalProps) => {
  const [lectureType, setLectureType] = useState<LectureType | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const createVideoMutation = useCreateLectureVideo();
  const createTextMutation = useCreateLectureText();

  const getNextOrderIndex = () => {
    if (existingLectures.length === 0) return 1;
    return Math.max(...existingLectures.map((l) => l.orderIndex)) + 1;
  };

  const videoForm = useForm<VideoLectureFormValues>({
    resolver: zodResolver(videoLectureSchema) as Resolver<VideoLectureFormValues>,
    defaultValues: { title: "", description: "" },
  });

  const textForm = useForm<TextLectureFormValues>({
    resolver: zodResolver(textLectureSchema) as Resolver<TextLectureFormValues>,
    defaultValues: { title: "", description: "", textContent: "" },
  });

  const handleQuizClick = () => {
    dispatch(setCreateQuizContextAction({ sectionId, courseId, orderIndex: getNextOrderIndex() }));
    onClose();
    navigate({ to: "/mentor/course/quiz" });
  };

  const handleBack = () => {
    setLectureType(null);
    setVideoFile(null);
    videoForm.reset();
    textForm.reset();
  };

  const onSubmitVideo = async (data: VideoLectureFormValues) => {
    if (!videoFile) return;
    try {
      const base = {
        sectionId,
        title: data.title,
        description: data.description,
        isPreviewable: false,
        orderIndex: getNextOrderIndex(),
      };
      await createVideoMutation.mutateAsync({ request: base, video: videoFile });
      onClose();
    } catch (error) {
      console.error("Failed to create video lecture:", error);
    }
  };

  const onSubmitText = async (data: TextLectureFormValues) => {
    try {
      const base = {
        sectionId,
        title: data.title,
        description: data.description,
        isPreviewable: false,
        orderIndex: getNextOrderIndex(),
      };
      await createTextMutation.mutateAsync({ lecture: base, content: data.textContent });
      onClose();
    } catch (error) {
      console.error("Failed to create text lecture:", error);
    }
  };

  const isPending = createVideoMutation.isPending || createTextMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="flex w-full max-w-2xl flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-2xl font-bold">Thêm bài học mới</h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!lectureType ? (
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
          ) : lectureType === "VIDEO" ? (
            <form id="create-lecture-form" onSubmit={videoForm.handleSubmit(onSubmitVideo)} className="space-y-4">
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
                <Textarea {...videoForm.register("description")} rows={3} placeholder="Mô tả ngắn về bài học" />
              </div>

              <div className="space-y-1">
                <Label>Upload video *</Label>
                <div className="mt-2 rounded-lg border-2 border-dashed p-6 text-center">
                  <Upload className="mx-auto mb-2 h-10 w-10 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-600">{videoFile ? videoFile.name : "Chọn file video"}</p>
                  <Input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
                </div>
                {!videoFile && <p className="text-sm text-red-500">Vui lòng chọn file video</p>}
              </div>
            </form>
          ) : (
            <form id="create-lecture-form" onSubmit={textForm.handleSubmit(onSubmitText)} className="space-y-4">
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
                <Textarea {...textForm.register("description")} rows={3} placeholder="Mô tả ngắn về bài học" />
              </div>

              <div className="space-y-1">
                <Label>Nội dung *</Label>
                <Textarea
                  {...textForm.register("textContent")}
                  rows={10}
                  placeholder="Nhập nội dung bài học..."
                  className={textForm.formState.errors.textContent ? "border-red-500" : ""}
                />
                {textForm.formState.errors.textContent && (
                  <p className="text-sm text-red-500">{textForm.formState.errors.textContent.message}</p>
                )}
              </div>
            </form>
          )}
        </div>

        {lectureType && (
          <div className="flex justify-end gap-3 border-t px-6 py-4">
            <Button type="button" variant="outline" onClick={handleBack}>
              Quay lại
            </Button>
            <Button
              type="submit"
              form="create-lecture-form"
              isDisabled={isPending || (lectureType === "VIDEO" && !videoFile)}
            >
              {isPending ? "Đang thêm..." : "Thêm bài học"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
