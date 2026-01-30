import { Eye, Pencil, Trash2, BookOpen, GraduationCap, Tag } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent } from "@workspace/ui/components/Card";
import type { QuestionResponse, QuestionType, QuestionLevel } from "../types/question.type";

interface Props {
  question: QuestionResponse;
  onView: () => void;
  onEdit: () => void;
  onDelete?: () => void;
}

const QuestionCard: React.FC<Props> = ({ question, onView, onEdit, onDelete }) => {
  const getQuestionTypeLabel = (type: QuestionType) => {
    return type === "MCQ" ? "Trắc nghiệm" : "Tự luận";
  };

  const getQuestionTypeColor = (type: QuestionType) => {
    return type === "MCQ"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
  };

  const getLevelLabel = (level: QuestionLevel) => {
    const labels = { EASY: "Dễ", MEDIUM: "Trung bình", HARD: "Khó" };
    return labels[level];
  };

  const getLevelColor = (level: QuestionLevel) => {
    const colors = {
      EASY: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      HARD: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return colors[level];
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:border-primary/50">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getQuestionTypeColor(question.questionType)}`}
              >
                {getQuestionTypeLabel(question.questionType)}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(question.questionLevel)}`}
              >
                {getLevelLabel(question.questionLevel)}
              </span>
              {question.isActive && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                  Hoạt động
                </span>
              )}
            </div>

            <div
              className="text-base leading-relaxed line-clamp-2 cursor-pointer hover:text-primary transition-colors"
              onClick={onView}
            >
              {question.content}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              {question.subject && (
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{question.subject.name}</span>
                </div>
              )}
              {question.lesson && (
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>{question.lesson.name}</span>
                </div>
              )}
              {question.tags && question.tags.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  <div className="flex gap-1">
                    {question.tags.slice(0, 2).map((tag) => (
                      <span key={tag.id} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                        {tag.name}
                      </span>
                    ))}
                    {question.tags.length > 2 && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                        +{question.tags.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {question.options && question.options.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">{question.options.length} đáp án</p>
                <div className="space-y-1">
                  {question.options.slice(0, 2).map((option) => (
                    <div key={option.id} className="flex items-start gap-2 text-sm">
                      <span className={`font-medium ${option.isCorrect ? "text-green-600" : "text-gray-500"}`}>
                        {option.label || "•"}
                      </span>
                      <span className="line-clamp-1 text-gray-600 dark:text-gray-400">{option.content}</span>
                    </div>
                  ))}
                  {question.options.length > 2 && (
                    <p className="text-xs text-muted-foreground">+{question.options.length - 2} đáp án khác</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onView}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
