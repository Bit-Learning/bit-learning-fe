import React from "react";
import { useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { X } from "lucide-react";

interface AnswerRowProps {
  questionIndex: number;
  answerIndex: number;
  register: any;
  control: any;
  errors: any;
  setValue: any;
  answersLength: number;
  onRemove: () => void;
  canRemove: boolean;
}

export const AnswerRow: React.FC<AnswerRowProps> = ({
  questionIndex,
  answerIndex,
  register,
  control,
  errors,
  setValue,
  answersLength,
  onRemove,
  canRemove,
}) => {
  const answerError = errors?.questions?.[questionIndex]?.answers?.[answerIndex];
  const isCorrect = useWatch({ control, name: `questions.${questionIndex}.answers.${answerIndex}.isCorrect` });

  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center pt-3">
        <input
          type="radio"
          checked={!!isCorrect}
          onChange={() => {
            for (let i = 0; i < answersLength; i++) {
              setValue(`questions.${questionIndex}.answers.${i}.isCorrect`, i === answerIndex);
            }
          }}
          className="h-4 w-4 cursor-pointer accent-green-500"
        />
      </div>

      <div className="flex-1 space-y-1">
        <Input
          {...register(`questions.${questionIndex}.answers.${answerIndex}.answerText`)}
          placeholder={`Đáp án ${answerIndex + 1}`}
          className={cn("h-11 text-base", answerError?.answerText && "border-red-500")}
        />
        {answerError?.answerText && <p className="text-xs text-red-500">{answerError.answerText.message}</p>}
      </div>

      {canRemove && (
        <Button type="button" variant="destructive" size="sm" className="mt-2" onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
