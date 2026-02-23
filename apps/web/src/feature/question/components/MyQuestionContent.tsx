import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Search, FileText, ArrowLeft, Filter, BookOpen, FileQuestionIcon } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Input } from "@workspace/ui/components/Input";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { useMyQuestions, useDeleteQuestion } from "../queries/useQuestion";
import QuestionCard from "./QuestionCard";

const MyQuestionsContent: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(20);

  const { data: response, isLoading } = useMyQuestions({ page, size });
  const deleteQuestion = useDeleteQuestion();

  const questions = response?.data || [];
  const pagination = response?.page;

  const filteredQuestions = questions.filter((q) => q.content.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (id: number, content: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa câu hỏi:\n"${content.substring(0, 50)}..."?`)) {
      deleteQuestion.mutate(id);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate({ to: "/mentor/question" })} className="gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Câu hỏi của tôi</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate({ to: "/questions/generate-from-questions" })} className="gap-2">
            <FileText className="h-4 w-4" />
            Tạo đề thi
          </Button>
          <Button onClick={() => navigate({ to: "/mentor/question/create" })} className="gap-2">
            <FileQuestionIcon className="h-4 w-4" />
            Tạo câu hỏi
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm câu hỏi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Bộ lọc
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      ) : !filteredQuestions.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">{search ? "Không tìm thấy câu hỏi" : "Chưa có câu hỏi nào"}</h3>
            <p className="text-muted-foreground mb-6">
              {search ? "Thử tìm kiếm với từ khóa khác" : "Bắt đầu bằng cách import câu hỏi đầu tiên của bạn"}
            </p>
            {!search && (
              <Button onClick={() => navigate({ to: "/matrices/import" })} className="gap-2">
                <Plus className="h-4 w-4" />
                Import câu hỏi
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Tìm thấy <span className="font-semibold">{filteredQuestions.length}</span> câu hỏi
            </p>
          </div>

          <div className="space-y-4">
            {filteredQuestions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onView={() => navigate({ to: "/mentor/question/$id", params: { id: question.id.toString() } })}
                onEdit={() => navigate({ to: "/mentor/question/$id/edit", params: { id: question.id.toString() } })}
                onDelete={() => handleDelete(question.id, question.content)}
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button variant="outline" onClick={() => setPage((p) => Math.max(0, p - 1))} isDisabled={page === 0}>
                Trước
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {page + 1} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                isDisabled={page >= pagination.totalPages - 1}
              >
                Sau
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyQuestionsContent;
