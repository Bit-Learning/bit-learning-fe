import React from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronDown, Plus, Trash2, X, Code2 } from "lucide-react";
import { ParamType, ParamTypeInfo } from "../types/coding.type";
import { useGenerateCodeTemplates } from "../queries/useCoding";

const generateTemplateSchema = z.object({
  functionName: z
    .string()
    .min(1, "Tên hàm không được để trống")
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Tên hàm không hợp lệ"),
  returnType: z.nativeEnum(ParamType),
  parameters: z
    .array(
      z.object({
        name: z.string().min(1, "Tên tham số không được để trống"),
        type: z.nativeEnum(ParamType),
      }),
    )
    .min(1, "Cần ít nhất 1 tham số"),
});

type GenerateTemplateFormData = z.infer<typeof generateTemplateSchema>;

const inputCls =
  "h-11 text-sm w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400 font-mono";

const selectCls =
  "h-11 text-sm block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none cursor-pointer";

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? <p className="text-sm text-red-500 mt-1.5">{message}</p> : null;

interface EditCodeTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  problemId: string;
  problemTitle?: string;
}

const EditCodeTemplateModal: React.FC<EditCodeTemplateModalProps> = ({ isOpen, onClose, problemId, problemTitle }) => {
  const generateTemplatesMutation = useGenerateCodeTemplates();

  const form = useForm<GenerateTemplateFormData>({
    resolver: zodResolver(generateTemplateSchema) as Resolver<GenerateTemplateFormData>,
    defaultValues: {
      functionName: "",
      returnType: ParamType.INT,
      parameters: [{ name: "", type: ParamType.INT }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "parameters",
  });

  const onSubmit = async (data: GenerateTemplateFormData) => {
    try {
      await generateTemplatesMutation.mutateAsync({ problemId, data });
      form.reset();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Chỉnh sửa Code Template</h2>
              {problemTitle && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-xs">{problemTitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Hệ thống sẽ tự động tạo lại template cho Python, Java, C++, JavaScript dựa trên cấu hình bên dưới.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Tên hàm <span className="text-red-500">*</span>
              </label>
              <input {...form.register("functionName")} placeholder="solution" className={inputCls} />
              <FieldError message={form.formState.errors.functionName?.message} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Kiểu trả về <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select {...form.register("returnType")} className={selectCls}>
                  {Object.values(ParamType).map((type) => (
                    <option key={type} value={type}>
                      {ParamTypeInfo[type].displayName} ({ParamTypeInfo[type].javaType})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Tham số đầu vào <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => append({ name: "", type: ParamType.INT })}
                className="cursor-pointer flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm tham số
              </button>
            </div>
            <div className="space-y-2.5">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2.5 items-start">
                  <span className="w-7 h-11 flex items-center justify-center text-xs font-mono text-slate-400 shrink-0">
                    {index + 1}.
                  </span>
                  <div className="flex-1">
                    <input
                      {...form.register(`parameters.${index}.name`)}
                      placeholder="Tên tham số (vd: nums)"
                      className={inputCls}
                    />
                    <FieldError message={form.formState.errors.parameters?.[index]?.name?.message} />
                  </div>
                  <div className="flex-1 relative">
                    <select {...form.register(`parameters.${index}.type`)} className={selectCls}>
                      {Object.values(ParamType).map((type) => (
                        <option key={type} value={type}>
                          {ParamTypeInfo[type].displayName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="h-11 w-11 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <FieldError message={form.formState.errors.parameters?.message} />
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={generateTemplatesMutation.isPending}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {generateTemplatesMutation.isPending ? "Đang tạo..." : "Tạo lại Template"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCodeTemplateModal;
