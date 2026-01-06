import { Button } from "@workspace/ui/components/Button";
import { CheckCircle } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useLectureText } from "../queries/useLecture";
import { useMarkAsCompleted, useIsLectureCompleted } from "../queries/useLearning";

interface TextContentProps {
  lectureId: number;
  onComplete?: () => void;
}

const TextContent: React.FC<TextContentProps> = ({ lectureId, onComplete }) => {
  const { data, isLoading, error } = useLectureText(lectureId);
  const { data: isCompleted } = useIsLectureCompleted(lectureId);
  const { mutate: markAsCompleted, isPending } = useMarkAsCompleted();

  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50;
      if (isAtBottom && !hasScrolledToBottom) {
        setHasScrolledToBottom(true);
      }
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => container.removeEventListener("scroll", handleScroll);
  }, [data, hasScrolledToBottom]);

  useEffect(() => {
    setHasScrolledToBottom(false);
  }, [lectureId]);

  const handleMarkComplete = () => {
    markAsCompleted(lectureId, {
      onSuccess: () => {
        onComplete?.();
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-900">
        <div className="text-gray-400">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-900">
        <div className="text-red-400">Lỗi khi tải nội dung bài giảng</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-900">
        <div className="text-gray-400">Không có nội dung</div>
      </div>
    );
  }

  const { lecture, content } = data;

  return (
    <div ref={contentRef} className="h-full overflow-y-auto bg-gray-900 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg bg-gray-800 p-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">{lecture.title}</h1>
            {isCompleted && (
              <span className="flex items-center gap-1 text-sm text-green-400">
                <CheckCircle className="h-4 w-4" />
                Đã hoàn thành
              </span>
            )}
          </div>

          <div className="prose prose-invert max-w-none">
            <div className="space-y-4 text-gray-300">
              {content.split("\n").map(
                (paragraph, index) =>
                  paragraph.trim() && (
                    <p key={index} className="leading-relaxed">
                      {paragraph}
                    </p>
                  )
              )}
            </div>
          </div>

          {!isCompleted && (
            <div className="mt-8 border-t border-gray-700 pt-6">
              <Button
                onPress={handleMarkComplete}
                isDisabled={!hasScrolledToBottom || isPending}
                className="w-full bg-green-600 py-3 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {isPending ? (
                  "Đang xử lý..."
                ) : hasScrolledToBottom ? (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Đánh dấu hoàn thành
                  </>
                ) : (
                  "Cuộn xuống để hoàn thành bài học"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextContent;
