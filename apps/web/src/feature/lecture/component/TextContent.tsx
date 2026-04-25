import { Button } from "@workspace/ui/components/Button";
import { BookOpen, CheckCircle, Code2 } from "lucide-react";
import type React from "react";
import { useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useLectureText } from "../queries/useLecture";
import { useIsLectureCompleted, useMarkAsCompleted } from "../queries/useLearning";
import { useProblemDetail } from "@/feature/code-practice/queries/useCoding";
import { DifficultyBadge } from "@/feature/code-practice/components/DifficultyBadge";

interface TextContentProps {
  lectureId: number;
  onComplete?: () => void;
  hasAccess?: boolean;
}

const LinkedProblemCard: React.FC<{ problemId: string }> = ({ problemId }) => {
  const { data: problem, isLoading } = useProblemDetail(problemId);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="animate-pulse rounded-xl border border-blue-100 bg-blue-50 p-4">
        <div className="mb-2 h-3 w-32 rounded bg-blue-100" />
        <div className="h-5 w-64 rounded bg-blue-100" />
      </div>
    );
  }

  if (!problem) return null;

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-400">Bài tập thực hành</p>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-gray-800">{problem.title}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <DifficultyBadge difficulty={problem.difficulty} />
            {problem.classLevel && (
              <span className="flex items-center gap-1 rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600">
                <BookOpen className="h-3 w-3" />
                Lớp {problem.classLevel}
              </span>
            )}
            {problem.tags?.slice(0, 3).map((t) => (
              <span key={t.id} className="rounded border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-500">
                {t.name}
              </span>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate({ to: "/problem/$id", params: { id: problem.id } })}
          className="cursor-pointer flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Làm bài
        </button>
      </div>
    </div>
  );
};

const TextContent: React.FC<TextContentProps> = ({ lectureId, onComplete, hasAccess }) => {
  const { data, isLoading, error } = useLectureText(lectureId);
  const { data: isCompleted } = useIsLectureCompleted(lectureId);
  const { mutate: markAsCompleted, isPending } = useMarkAsCompleted();

  const contentRef = useRef<HTMLDivElement>(null);

  const handleMarkComplete = () => {
    markAsCompleted(lectureId, {
      onSuccess: () => onComplete?.(),
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="mt-3 text-sm text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-red-500">⚠️ Lỗi khi tải nội dung bài giảng</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-400">Không có nội dung</p>
      </div>
    );
  }

  const { lecture, content, problemId } = data;

  return (
    <div ref={contentRef} className="min-h-full bg-white">
      <div className="mx-auto px-8 py-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lecture.title}</h1>
            {lecture.description && <p className="mt-1 text-gray-500">{lecture.description}</p>}
          </div>
          {isCompleted && (
            <span className="flex shrink-0 items-center gap-1.5 bg-green-100 px-3 py-1.5 text-md font-bold text-green-800">
              <CheckCircle className="h-4 w-4" />
              Đã hoàn thành
            </span>
          )}
        </div>

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
          }
          .lecture-content ul, .lecture-content ol {
            margin: 1rem 0;
            padding-left: 1.5rem;
          }
          .lecture-content li {
            margin: 0.5rem 0;
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
            padding: 1rem;
            margin: 1rem 0;
            color: #475569;
            font-style: italic;
            background-color: #f8fafc;
            border-radius: 0.25rem;
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
          }
          .lecture-content table th {
            background-color: #f8fafc;
            font-weight: 600;
            color: #0f172a;
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
          }
        `,
          }}
        />

        <div className="lecture-content" dangerouslySetInnerHTML={{ __html: content }} />

        {problemId && (
          <div className="mt-8">
            <LinkedProblemCard problemId={problemId} />
          </div>
        )}

        {!isCompleted && hasAccess && (
          <div className="mt-10 border-t border-gray-200 pt-6 text-right">
            <Button
              onPress={handleMarkComplete}
              isDisabled={isPending}
              className="rounded-md bg-green-600 py-5 text-base font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Đang xử lý...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Đánh dấu hoàn thành
                </span>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextContent;
