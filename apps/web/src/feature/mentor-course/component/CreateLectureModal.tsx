import { useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { Card } from "@workspace/ui/components/Card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/Form";
import { Input } from "@workspace/ui/components/Input";
import { Textarea } from "@workspace/ui/components/Textarea";
import { FileText, HelpCircle, Upload, Video, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
    const maxOrder = Math.max(...existingLectures.map((l) => l.orderIndex));
    return maxOrder + 1;
  };

  const handleQuizClick = () => {
    dispatch(
      setCreateQuizContextAction({
        sectionId,
        courseId,
        orderIndex: getNextOrderIndex(),
      }),
    );
    navigate({ to: "/mentor/course/quiz" });
    onClose();
  };

  const form = useForm<{
    title: string;
    description: string;
    textContent?: string;
  }>({
    defaultValues: { title: "", description: "", textContent: "" },
  });

  const handleSubmit = async (data: any) => {
    try {
      const nextOrderIndex = getNextOrderIndex();

      if (lectureType === "VIDEO" && videoFile) {
        await createVideoMutation.mutateAsync({
          request: {
            sectionId,
            title: data.title,
            description: data.description,
            isPreviewable: false,
            orderIndex: nextOrderIndex,
          },
          video: videoFile,
        });
      } else if (lectureType === "TEXT") {
        await createTextMutation.mutateAsync({
          lecture: {
            sectionId,
            title: data.title,
            description: data.description,
            isPreviewable: false,
            orderIndex: nextOrderIndex,
          },
          content: data.textContent || "",
        });
      }
      onClose();
    } catch (error) {
      console.error("Failed to create lecture:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Thêm bài học mới</h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

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
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                rules={{ required: "Tên bài học là bắt buộc" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên bài học *</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Bài 1: Giới thiệu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea rows={2} placeholder="Mô tả ngắn về bài học" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {lectureType === "VIDEO" && (
                <div>
                  <FormLabel>Upload video *</FormLabel>
                  <div className="mt-2 rounded-lg border-2 border-dashed p-6 text-center">
                    <Upload className="mx-auto mb-2 h-10 w-10 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-600">{videoFile ? videoFile.name : "Chọn file video"}</p>
                    <Input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
                  </div>
                </div>
              )}

              {lectureType === "TEXT" && (
                <FormField
                  control={form.control}
                  name="textContent"
                  rules={{ required: "Nội dung là bắt buộc" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nội dung *</FormLabel>
                      <FormControl>
                        <Textarea rows={10} placeholder="Nhập nội dung bài học..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setLectureType(null);
                    form.reset();
                    setVideoFile(null);
                  }}
                >
                  Quay lại
                </Button>
                <Button type="submit" isDisabled={createVideoMutation.isPending || createTextMutation.isPending}>
                  {createVideoMutation.isPending || createTextMutation.isPending ? "Đang thêm..." : "Thêm bài học"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </Card>
    </div>
  );
};
