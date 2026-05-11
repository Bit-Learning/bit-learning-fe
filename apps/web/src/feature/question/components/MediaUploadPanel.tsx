import { useRef, useState } from "react";
import { Upload, ImageIcon, Video, X, Trash2 } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/Card";
import { toast } from "@/shared/components/Sonner";
import { useUploadQuestionMedia, useDeleteQuestionMedia } from "../queries/useQuestion";
import { QuestionMediaType } from "../types/question.type";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/x-m4v"];
const ACCEPTED_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES];

interface MediaUploadPanelProps {
  questionId?: number;
  currentMediaUrl: string | null;
  currentMediaType: QuestionMediaType | null;
  onDeleteConfirm?: () => boolean;
  onFileSelect?: (file: File | null) => void;
  variant?: "form" | "inline";
  readonly?: boolean;
}

const MediaUploadPanel: React.FC<MediaUploadPanelProps> = ({
  questionId,
  currentMediaUrl,
  currentMediaType,
  onDeleteConfirm,
  onFileSelect,
  variant = "form",
  readonly = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<{ url: string; type: "IMAGE" | "VIDEO" } | null>(null);

  const uploadMedia = useUploadQuestionMedia();
  const deleteMedia = useDeleteQuestionMedia();

  const isCreateMode = !questionId;

  const displayUrl = localPreview?.url ?? currentMediaUrl;
  const displayType = localPreview?.type ?? currentMediaType;
  const hasMedia = !!displayUrl;
  const isBusy = !isCreateMode && (uploadMedia.isPending || deleteMedia.isPending);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error({
        title: "Lỗi",
        description: "Chỉ chấp nhận file ảnh (.jpg, .png, .gif, .webp) hoặc video (.mp4, .mov, .m4v)",
      });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type);
    setLocalPreview({ url: objectUrl, type: isImage ? "IMAGE" : "VIDEO" });

    if (isCreateMode) {
      onFileSelect?.(file);
    } else {
      uploadMedia.mutate(
        { id: questionId!, file },
        {
          onError: () => {
            setLocalPreview(null);
            URL.revokeObjectURL(objectUrl);
          },
        },
      );
    }

    e.target.value = "";
  };

  const handleDelete = () => {
    if (isCreateMode) {
      setLocalPreview(null);
      onFileSelect?.(null);
      return;
    }
    if (onDeleteConfirm && !onDeleteConfirm()) return;
    deleteMedia.mutate(questionId!, {
      onSuccess: () => setLocalPreview(null),
    });
  };

  const input = (
    <input
      ref={fileInputRef}
      type="file"
      accept={ACCEPTED_TYPES.join(",")}
      onChange={handleFileChange}
      className="hidden"
    />
  );

  if (readonly) {
    if (!currentMediaUrl) return null;
    return currentMediaType === "IMAGE" ? (
      <img src={currentMediaUrl} alt="Question media" className="w-full rounded-xl object-contain max-h-80" />
    ) : (
      <video src={currentMediaUrl} controls className="w-full rounded-xl max-h-80" />
    );
  }

  if (variant === "inline") {
    if (isBusy) {
      return (
        <div className="flex items-center justify-center py-8 rounded-xl border border-dashed border-slate-300">
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <span className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">{uploadMedia.isPending ? "Đang upload..." : "Đang xóa..."}</p>
          </div>
        </div>
      );
    }

    if (!hasMedia || !displayUrl) {
      return (
        <>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all text-slate-400 hover:text-blue-600 text-sm"
          >
            <Upload className="h-4 w-4" />
            Thêm ảnh / video minh họa
          </button>
          {input}
        </>
      );
    }

    return (
      <>
        <div className="relative group rounded-xl overflow-hidden">
          {displayType === "IMAGE" ? (
            <img src={displayUrl} alt="Question media" className="w-full object-contain max-h-96 rounded-xl" />
          ) : (
            <video src={displayUrl} controls className="w-full max-h-96 rounded-xl" />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all rounded-xl flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 bg-white text-slate-800 rounded-lg text-sm font-medium shadow hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Thay thế
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 bg-white text-red-600 rounded-lg text-sm font-medium shadow hover:bg-red-50 transition-colors"
            >
              <X className="h-4 w-4" />
              Xóa
            </button>
          </div>
          <span className="absolute top-2 left-2 flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-black/50 text-white">
            {displayType === "IMAGE" ? <ImageIcon className="h-3 w-3" /> : <Video className="h-3 w-3" />}
            {displayType === "IMAGE" ? "Ảnh" : "Video"}
          </span>
        </div>
        {input}
      </>
    );
  }

  return (
    <Card className="border-2 border-slate-300 rounded-md">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {displayType === "IMAGE" ? "Hình ảnh" : displayType === "VIDEO" ? "Video" : "Media đính kèm (tùy chọn)"}
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">Đính kèm ảnh hoặc video minh họa</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {isBusy && (
          <div className="flex items-center justify-center py-10 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <span className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">{uploadMedia.isPending ? "Đang upload..." : "Đang xóa..."}</p>
            </div>
          </div>
        )}

        {hasMedia && displayUrl && !isBusy && (
          <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            {displayType === "IMAGE" ? (
              <img src={displayUrl} alt="Question media" className="w-full max-h-96 object-contain" />
            ) : (
              <video src={displayUrl} controls className="w-full max-h-96" />
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 bg-white text-slate-800 rounded-lg text-sm font-medium shadow hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <Upload className="h-4 w-4" />
                Thay thế
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 bg-white text-red-600 rounded-lg text-sm font-medium shadow hover:bg-red-50 transition-colors"
              >
                <X className="h-4 w-4" />
                Xóa
              </button>
            </div>
            <span className="absolute top-2 left-2 flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-black/50 text-white">
              {displayType === "IMAGE" ? <ImageIcon className="h-3 w-3" /> : <Video className="h-3 w-3" />}
              {displayType === "IMAGE" ? "Ảnh" : "Video"}
            </span>
          </div>
        )}

        {!hasMedia && !isBusy && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-3 py-10 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all text-slate-500 hover:text-blue-600 group"
          >
            <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
              <Upload className="h-6 w-6" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Nhấn để chọn file</p>
              <p className="text-xs text-slate-400 mt-1">JPG, PNG, GIF, WEBP, MP4, MOV, M4V</p>
            </div>
          </button>
        )}

        {hasMedia && !isBusy && (
          <div className="flex items-center gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2 text-slate-600"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload mới
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleDelete}
              className="gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Xóa
            </Button>
          </div>
        )}

        {input}
      </CardContent>
    </Card>
  );
};

export default MediaUploadPanel;
