import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { useGenerateVersion } from "../queries/useMatrix";
import { useChaptersBySubject } from "../queries/useChapter";
import { useLessonsByChapter } from "../queries/useLesson";

interface NumericInputProps {
  value: number;
  onChange: (val: number) => void;
  onBlur?: () => void;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onChange,
  onBlur,
  min,
  max,
  step = 1,
  placeholder = "0",
  className = "",
}) => {
  const [display, setDisplay] = useState<string>(value === 0 ? "" : String(value));

  return (
    <input
      type="number"
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      className={className}
      value={display}
      onChange={(e) => {
        const raw = e.target.value;
        setDisplay(raw);
        const parsed = parseFloat(raw);
        onChange(isNaN(parsed) ? 0 : parsed);
      }}
      onBlur={() => {
        if (display !== "") {
          const parsed = parseFloat(display);
          setDisplay(isNaN(parsed) ? "" : String(parsed));
        }
        onBlur?.();
      }}
    />
  );
};

interface PercentInputProps {
  value: number;
  onChange: (val: number) => void;
  onBlur?: () => void;
  className?: string;
}

const PercentInput: React.FC<PercentInputProps> = ({ value, onChange, onBlur, className = "" }) => {
  const [display, setDisplay] = useState<string>(value === 0 ? "" : String(Math.round(value * 100)));

  return (
    <div className="relative flex-1">
      <input
        type="number"
        min={0}
        max={100}
        step={1}
        placeholder="0"
        className={className}
        value={display}
        onChange={(e) => {
          const raw = e.target.value;
          setDisplay(raw);
          const parsed = parseFloat(raw);
          onChange(isNaN(parsed) ? 0 : parseFloat((parsed / 100).toFixed(4)));
        }}
        onBlur={() => {
          if (display !== "") {
            const parsed = parseFloat(display);
            const clamped = Math.min(100, Math.max(0, isNaN(parsed) ? 0 : parsed));
            setDisplay(String(clamped));
            onChange(parseFloat((clamped / 100).toFixed(4)));
          }
          onBlur?.();
        }}
      />
      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">%</span>
    </div>
  );
};

const formSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên phiên bản"),
  notes: z.string().optional(),
  totalQuestionCount: z.number().int().positive("Số câu phải lớn hơn 0"),
  difficultyEasy: z.number().min(0).max(1),
  difficultyMedium: z.number().min(0).max(1),
  difficultyHard: z.number().min(0).max(1),
  typeMCQ: z.number().min(0).max(1),
  typeEssay: z.number().min(0).max(1),
  scoringMode: z.literal("UNIFORM"),
});

type FormValues = z.infer<typeof formSchema>;

type TLessonRow = { lessonId: number; chapterId: number; weight: number };

interface LessonSelectorProps {
  subjectId: number;
  value: TLessonRow;
  onChange: (val: TLessonRow) => void;
  onRemove: () => void;
  index: number;
}

const LessonSelector: React.FC<LessonSelectorProps> = ({ subjectId, value, onChange, onRemove, index }) => {
  const { data: chapters } = useChaptersBySubject(subjectId);
  const { data: lessons } = useLessonsByChapter(value.chapterId > 0 ? value.chapterId : undefined);

  return (
    <div className="grid grid-cols-12 gap-3 items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="col-span-1 text-center text-md font-bold text-slate-400">{index + 1}</div>
      <div className="col-span-4">
        <select
          value={value.chapterId}
          onChange={(e) => onChange({ ...value, chapterId: Number(e.target.value), lessonId: 0 })}
          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-md outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={0}>-- Chọn chương --</option>
          {chapters?.map((ch: any) => (
            <option key={ch.id} value={ch.id}>
              {ch.name}
            </option>
          ))}
        </select>
      </div>
      <div className="col-span-4">
        <select
          value={value.lessonId}
          onChange={(e) => onChange({ ...value, lessonId: Number(e.target.value) })}
          disabled={!value.chapterId}
          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-md outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <option value={0}>-- Chọn bài học --</option>
          {lessons?.map((l: any) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>
      <div className="col-span-2">
        <PercentInput
          value={value.weight}
          onChange={(val) => onChange({ ...value, weight: val })}
          className="w-full px-3 py-2 pr-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-md outline-none focus:ring-2 focus:ring-blue-500 text-center"
        />
      </div>
      <div className="col-span-1 flex justify-center">
        <button type="button" onClick={onRemove} className="text-red-500 hover:text-red-700 transition-colors p-1">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

interface Props {
  matrixId: number;
  totalScore: number;
  subjectId: number;
  onClose: () => void;
}

const AutoGenerateForm: React.FC<Props> = ({ matrixId, subjectId, onClose }) => {
  const [lessons, setLessons] = useState<TLessonRow[]>([{ lessonId: 0, chapterId: 0, weight: 1.0 }]);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      notes: "",
      totalQuestionCount: 10,
      difficultyEasy: 0.4,
      difficultyMedium: 0.4,
      difficultyHard: 0.2,
      typeMCQ: 0.9,
      typeEssay: 0.1,
      scoringMode: "UNIFORM",
    },
  });

  const diffEasy = watch("difficultyEasy") || 0;
  const diffMedium = watch("difficultyMedium") || 0;
  const diffHard = watch("difficultyHard") || 0;
  const typeMCQ = watch("typeMCQ") || 0;
  const typeEssay = watch("typeEssay") || 0;

  const diffSum = parseFloat((diffEasy + diffMedium + diffHard).toFixed(3));
  const typeSum = parseFloat((typeMCQ + typeEssay).toFixed(3));
  const weightSum = parseFloat(lessons.reduce((s, l) => s + (l.weight || 0), 0).toFixed(3));

  const isDiffValid = Math.abs(diffSum - 1.0) < 0.001;
  const isTypeValid = Math.abs(typeSum - 1.0) < 0.001;
  const isWeightValid = Math.abs(weightSum - 1.0) < 0.001;
  const hasValidLessons = lessons.length > 0 && lessons.every((l) => l.lessonId > 0);

  const canSubmit = isDiffValid && isTypeValid && isWeightValid && hasValidLessons;

  const { mutate: generateVersion, isPending } = useGenerateVersion();

  const addLesson = () => setLessons((prev) => [...prev, { lessonId: 0, chapterId: 0, weight: 0 }]);
  const removeLesson = (idx: number) => setLessons((prev) => prev.filter((_, i) => i !== idx));
  const updateLesson = (idx: number, val: TLessonRow) =>
    setLessons((prev) => prev.map((l, i) => (i === idx ? val : l)));

  const onSubmit = (values: FormValues) => {
    if (!canSubmit) return;

    generateVersion(
      {
        matrixId,
        name: values.name,
        notes: values.notes,
        totalQuestionCount: values.totalQuestionCount,
        lessons: lessons.map((l) => ({ lessonId: l.lessonId, weight: l.weight })),
        distribution: {
          difficulty: {
            EASY: values.difficultyEasy,
            MEDIUM: values.difficultyMedium,
            HARD: values.difficultyHard,
          },
          type: {
            MCQ: values.typeMCQ,
            ESSAY: values.typeEssay,
          },
        },
        scoring: { mode: "UNIFORM" as const },
      },
      { onSuccess: onClose },
    );
  };

  const SumBadge = ({ sum, valid }: { sum: number; valid: boolean }) => (
    <span
      className={`text-sm font-bold px-2 py-0.5 rounded-full ${
        valid
          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
      }`}
    >
      {valid ? "✓" : "✗"} Tổng: {Math.round(sum * 100)}%
    </span>
  );

  return (
    <div className="p-6">
      <form
        onSubmit={handleSubmit(onSubmit, (errs) => console.error("[AutoGenerateForm] validation errors", errs))}
        className="space-y-6"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-md font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tên phiên bản <span className="text-red-500">*</span>
            </label>
            <input
              {...register("name")}
              placeholder="Phiên bản tự động v1"
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-md font-medium text-slate-700 dark:text-slate-300 mb-2">Ghi chú</label>
            <input
              {...register("notes")}
              placeholder="Nhập ghi chú cho phiên bản này..."
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/50">
          <div className="flex-1">
            <label className="block text-md font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tổng số câu hỏi <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Hệ thống sẽ phân bổ tự động theo tỷ lệ đã cấu hình
            </p>
          </div>
          <Controller
            name="totalQuestionCount"
            control={control}
            render={({ field }) => (
              <NumericInput
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                min={1}
                step={1}
                className="w-24 px-4 py-3 text-center text-xl font-bold bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            )}
          />
          {errors.totalQuestionCount && <p className="text-sm text-red-500">{errors.totalQuestionCount.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-md font-semibold text-slate-900 dark:text-white">Bài học & trọng số</h3>
              <p className="text-sm text-slate-500 mt-0.5">Trọng số là tỷ lệ phân bổ câu hỏi cho bài học đó</p>
            </div>
            <SumBadge sum={weightSum} valid={isWeightValid} />
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-3 px-3 mb-1">
              <div className="col-span-1" />
              <div className="col-span-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Chương</div>
              <div className="col-span-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Bài học</div>
              <div className="col-span-2 text-sm font-bold text-slate-500 uppercase tracking-wider text-center">
                Trọng số
              </div>
              <div className="col-span-1" />
            </div>

            {lessons.map((lesson, idx) => (
              <LessonSelector
                key={idx}
                index={idx}
                subjectId={subjectId}
                value={lesson}
                onChange={(val) => updateLesson(idx, val)}
                onRemove={() => removeLesson(idx)}
              />
            ))}

            <button
              type="button"
              onClick={addLesson}
              className="cursor-pointer w-full py-2.5 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 rounded-lg text-md font-medium text-slate-500 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Thêm bài học
            </button>
          </div>

          {!isWeightValid && lessons.length > 0 && (
            <div className="flex items-center gap-2 mt-2 text-sm text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              Tổng trọng số phải bằng 100% (hiện tại: {Math.round(weightSum * 100)}%)
            </div>
          )}
          {!hasValidLessons && lessons.some((l) => l.chapterId > 0) && (
            <div className="flex items-center gap-2 mt-2 text-sm text-red-500 dark:text-red-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              Vui lòng chọn bài học cho tất cả các dòng
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-semibold text-slate-900 dark:text-white">Phân bổ độ khó</h3>
              <SumBadge sum={diffSum} valid={isDiffValid} />
            </div>
            <div className="space-y-3">
              {(
                [
                  { label: "Dễ", name: "difficultyEasy" },
                  { label: "Trung bình", name: "difficultyMedium" },
                  { label: "Khó", name: "difficultyHard" },
                ] as const
              ).map(({ label, name }) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-24 text-slate-600">{label}</span>
                  <Controller
                    name={name}
                    control={control}
                    render={({ field }) => (
                      <PercentInput
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        className="w-full px-3 py-1.5 pr-8 text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-md outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-semibold text-slate-900 dark:text-white">Phân bổ loại câu</h3>
              <SumBadge sum={typeSum} valid={isTypeValid} />
            </div>
            <div className="space-y-3">
              {(
                [
                  { label: "Trắc nghiệm", name: "typeMCQ" },
                  { label: "Tự luận", name: "typeEssay" },
                ] as const
              ).map(({ label, name }) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-24 text-slate-600">{label}</span>
                  <Controller
                    name={name}
                    control={control}
                    render={({ field }) => (
                      <PercentInput
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        className="w-full px-3 py-1.5 pr-8 text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-md outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            onClick={onClose}
            className="cursor-pointer px-6 py-5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 hover:border-blue-600 rounded-lg text-sm font-medium transition-all"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            isDisabled={isPending || !canSubmit}
            className="cursor-pointer px-6 py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-md font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/30"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>Tạo tự động</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AutoGenerateForm;
