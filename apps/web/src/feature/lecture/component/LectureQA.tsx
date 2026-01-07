import { Avatar, AvatarFallback } from "@workspace/ui/components/Avatar";
import { Button } from "@workspace/ui/components/Button";
import { Textarea } from "@workspace/ui/components/Textarea";
import { Loader2, MessageCircle, Send } from "lucide-react";
import type React from "react";
import { useState } from "react";
import CommentItem from "./CommentItem";
import { usePostComment, useRootComments } from "@/feature/course/queries/useInteraction";

interface LectureQAProps {
  lectureId: number;
}

const LectureQA: React.FC<LectureQAProps> = ({ lectureId }) => {
  const [newQuestion, setNewQuestion] = useState("");
  const [sortBy, setSortBy] = useState<"upVotes" | "createdAt">("upVotes");
  const [page, setPage] = useState(0);

  const { data, isLoading } = useRootComments(lectureId, page, 10, sortBy, "DESC");
  const { mutate: postComment, isPending: isPosting } = usePostComment();

  const handlePostQuestion = () => {
    if (!newQuestion.trim()) return;

    postComment(
      {
        content: newQuestion,
        videoTimestampSecond: 0,
        lectureId,
      },
      {
        onSuccess: () => {
          setNewQuestion("");
        },
      }
    );
  };

  const pageInfo = data?.page;
  const comments = data?.content || [];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h4 className="mb-3 font-semibold text-gray-900">Đặt câu hỏi mới</h4>
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback className="bg-blue-100 text-blue-700">U</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Bạn có thắc mắc gì về bài học này? Hãy đặt câu hỏi tại đây..."
              className="min-h-25 resize-none"
            />
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-gray-500">Hãy mô tả chi tiết vấn đề bạn gặp phải</p>
              <Button
                onClick={handlePostQuestion}
                isDisabled={!newQuestion.trim() || isPosting}
                className="bg-blue-700 text-white hover:bg-blue-800"
              >
                {isPosting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang đăng
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Đăng câu hỏi
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900">{pageInfo?.totalElements || 0} câu hỏi</h4>
        <div className="flex gap-2">
          <Button
            variant={sortBy === "upVotes" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setSortBy("upVotes");
              setPage(0);
            }}
            className={sortBy === "upVotes" ? "bg-blue-700 text-white" : ""}
          >
            Phổ biến nhất
          </Button>
          <Button
            variant={sortBy === "createdAt" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setSortBy("createdAt");
              setPage(0);
            }}
            className={sortBy === "createdAt" ? "bg-blue-700 text-white" : ""}
          >
            Mới nhất
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
          <MessageCircle className="mx-auto mb-3 h-12 w-12 text-gray-400" />
          <p className="text-gray-600">Chưa có câu hỏi nào. Hãy là người đầu tiên!</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} lectureId={lectureId} />
            ))}
          </div>

          {pageInfo && pageInfo.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                isDisabled={pageInfo.first}
              >
                Trang trước
              </Button>
              <div className="flex items-center gap-1">
                <span className="px-3 py-1 text-sm text-gray-600">
                  Trang {pageInfo.page + 1} / {pageInfo.totalPages}
                </span>
                <span className="text-sm text-gray-400">({pageInfo.totalElements} câu hỏi)</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} isDisabled={pageInfo.last}>
                Trang sau
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LectureQA;
