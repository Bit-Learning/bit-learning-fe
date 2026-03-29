import { Button } from "@workspace/ui/components/Button";
import { CheckCircle } from "lucide-react";
import type React from "react";
import { useRef } from "react";
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

  const contentRef = useRef<HTMLDivElement>(null);

  const handleMarkComplete = () => {
    markAsCompleted(lectureId, {
      onSuccess: () => {
        onComplete?.();
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="mt-4 text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="rounded-lg bg-red-900/20 p-6 text-center">
          <div className="text-red-400">⚠️ Lỗi khi tải nội dung bài giảng</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-gray-400">Không có nội dung</div>
      </div>
    );
  }

  const { lecture, content } = data;

  return (
    <div
      ref={contentRef}
      className="h-full overflow-y-auto bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-xl bg-white shadow-2xl">
          <div className="border-b border-gray-200 bg-linear-to-r from-blue-50 to-indigo-50 p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">{lecture.title}</h1>
              {isCompleted && (
                <span className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  Đã hoàn thành
                </span>
              )}
            </div>
            {lecture.description && <p className="mt-2 text-gray-600">{lecture.description}</p>}
          </div>

          <div className="px-8">
            <style
              dangerouslySetInnerHTML={{
                __html: `
              .lecture-content {
                color: #1e293b;
                line-height: 1.7;
                word-wrap: break-word;
                overflow-wrap: break-word;
              }
              .lecture-content h1, .lecture-content h2, .lecture-content h3 {
                font-weight: bold;
                margin-top: 1.5rem;
                margin-bottom: 0.75rem;
                color: #0f172a;
                word-wrap: break-word;
              }
              .lecture-content h2 {
                font-size: 1.5rem;
                border-bottom: 2px solid #e2e8f0;
                padding-bottom: 0.5rem;
              }
              .lecture-content h3 {
                font-size: 1.25rem;
                color: #334155;
              }
              .lecture-content p {
                margin: 0.75rem 0;
                word-wrap: break-word;
                overflow-wrap: break-word;
              }
              .lecture-content ul, .lecture-content ol {
                margin: 1rem 0;
                padding-left: 1.5rem;
              }
              .lecture-content li {
                margin: 0.5rem 0;
                word-wrap: break-word;
              }
              .lecture-content strong {
                font-weight: 600;
                color: #0f172a;
              }
              .lecture-content code {
                background-color: #f1f5f9;
                color: #3b82f6;
                padding: 0.2rem 0.4rem;
                border-radius: 0.25rem;
                font-size: 0.9em;
                font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
                word-break: break-all;
              }
              .lecture-content pre {
                background-color: #1e293b;
                color: #f1f5f9;
                padding: 1rem;
                border-radius: 0.5rem;
                overflow-x: auto;
                margin: 1rem 0;
                font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
                font-size: 0.875rem;
                line-height: 1.6;
                white-space: pre-wrap;
                word-wrap: break-word;
              }
              .lecture-content pre code {
                background: none;
                color: inherit;
                padding: 0;
                word-break: normal;
              }
              .lecture-content blockquote {
                border-left: 4px solid #3b82f6;
                padding-left: 1rem;
                margin: 1rem 0;
                color: #475569;
                font-style: italic;
                background-color: #f8fafc;
                padding: 1rem;
                border-radius: 0.25rem;
                word-wrap: break-word;
              }
              .lecture-content table {
                width: 100%;
                border-collapse: collapse;
                margin: 1rem 0;
                font-size: 0.9rem;
                display: block;
                overflow-x: auto;
              }
              .lecture-content table th, .lecture-content table td {
                border: 1px solid #e2e8f0;
                padding: 0.75rem;
                text-align: left;
                word-wrap: break-word;
              }
              .lecture-content table th {
                background-color: #f8fafc;
                font-weight: 600;
                color: #0f172a;
              }
              .lecture-content table tbody tr:hover {
                background-color: #f8fafc;
              }
              .lecture-content img {
                max-width: 100%;
                height: auto;
                border-radius: 0.5rem;
                margin: 1rem 0;
              }
              .lecture-content a {
                color: #3b82f6;
                text-decoration: underline;
                word-wrap: break-word;
              }
              .lecture-content a:hover {
                color: #2563eb;
              }
            `,
              }}
            />
            <div className="lecture-content" dangerouslySetInnerHTML={{ __html: content }} />
          </div>

          {!isCompleted && (
            <div className="border-t border-gray-200 bg-gray-50 p-6">
              <Button
                onPress={handleMarkComplete}
                size="xl"
                isDisabled={isPending}
                className="w-full rounded-lg bg-linear-to-r from-green-600 to-emerald-600 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:opacity-60"
              >
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Đang xử lý...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-6 w-6" />
                    Đánh dấu hoàn thành
                  </span>
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
