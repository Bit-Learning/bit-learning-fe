import { Button } from "@workspace/ui/components/Button";
import { Card } from "@workspace/ui/components/Card";
import { Input } from "@workspace/ui/components/Input";
import { Label } from "@workspace/ui/components/label";
import { cn } from "@workspace/ui/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { AnswerRow } from "./AnswerRow";

interface QuestionCardProps {
  questionIndex: number;
  control: any;
  register: any;
  errors: any;
  onRemove: () => void;
  canRemove: boolean;
}

export const QuestionCard = ({ questionIndex, control, register, errors, onRemove, canRemove }: QuestionCardProps) => {
  const {
    fields: answerFields,
    append: appendAnswer,
    remove: removeAnswer,
  } = useFieldArray({
    control,
    name: `questions.${questionIndex}.answers` as const,
  });

  const addAnswer = () => {
    appendAnswer({
      answerText: "",
      isCorrect: false,
      orderIndex: answerFields.length + 1,
    });
  };

  const questionError = errors?.questions?.[questionIndex];

  return (
    <Card className="p-6">
      <div className="mb-2 flex items-start justify-between">
        <h4 className="text-lg font-semibold">Câu hỏi {questionIndex + 1}</h4>
        {canRemove && (
          <Button type="button" variant="outline" size="sm" onClick={onRemove}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        )}
      </div>

      <div className="mb-2 space-y-2">
        <Label htmlFor={`question-${questionIndex}`} className="text-sm font-medium">
          Nội dung câu hỏi *
        </Label>
        <Input
          id={`question-${questionIndex}`}
          {...register(`questions.${questionIndex}.questionText`, {
            required: "Nội dung câu hỏi là bắt buộc",
          })}
          placeholder="Nhập câu hỏi..."
          className={cn("h-11 w-full text-base", questionError?.questionText && "border-red-500")}
        />
        {questionError?.questionText && <p className="text-sm text-red-500">{questionError.questionText.message}</p>}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Đáp án ({answerFields.length})</Label>
          <Button type="button" onClick={addAnswer} size="lg" variant="outline">
            <Plus className="mr-1 h-3 w-3" />
            Thêm đáp án
          </Button>
        </div>

        <div className="space-y-3 pt-1">
          {answerFields.map((answer, answerIndex) => (
            <AnswerRow
              key={answer.id}
              questionIndex={questionIndex}
              answerIndex={answerIndex}
              register={register}
              errors={errors}
              onRemove={() => removeAnswer(answerIndex)}
              canRemove={answerFields.length > 2}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};
