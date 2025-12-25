import { Button } from '@workspace/ui/components/Button'
import { Input } from '@workspace/ui/components/Input'
import { cn } from '@workspace/ui/lib/utils'
import { X } from 'lucide-react'

interface AnswerRowProps {
    questionIndex: number
    answerIndex: number
    register: any
    errors: any
    onRemove: () => void
    canRemove: boolean
}

export const AnswerRow = ({ questionIndex, answerIndex, register, errors, onRemove, canRemove }: AnswerRowProps) => {
    const answerError = errors?.questions?.[questionIndex]?.answers?.[answerIndex]

    return (
        <div className="flex items-start gap-2">
            <div className="flex items-center pt-2">
                <input
                    type="radio"
                    {...register(`questions.${questionIndex}.correctAnswer`)}
                    value={answerIndex}
                    className="h-4 w-4 cursor-pointer text-green-600"
                />
                <input type="hidden" {...register(`questions.${questionIndex}.answers.${answerIndex}.isCorrect`)} />
            </div>

            <div className="flex-1">
                <Input
                    {...register(`questions.${questionIndex}.answers.${answerIndex}.answerText`, {
                        required: 'Đáp án không được trống',
                    })}
                    placeholder={`Đáp án ${answerIndex + 1}`}
                    className={cn(answerError?.answerText && 'border-red-500')}
                />
                {answerError?.answerText && (
                    <p className="mt-1 text-xs text-red-500">{answerError.answerText.message}</p>
                )}
            </div>

            {canRemove && (
                <Button type="button" variant="outline" size="sm" onClick={onRemove}>
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    )
}
