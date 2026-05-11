import React, { useState, useEffect } from "react";
import { Plus, X, Eye, EyeOff, Edit } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Textarea } from "@workspace/ui/components/Textarea";
import { Label } from "@workspace/ui/components/label";
import { cn } from "@workspace/ui/lib/utils";
import type { TestCaseResponse } from "../types/coding.type";

interface TestCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { input: string; expectedOutput: string; isSample: boolean }) => void;
  isLoading?: boolean;
  mode: "add" | "edit";
  problemTitle?: string;
  testCase?: TestCaseResponse | null;
}

const TestCaseModal: React.FC<TestCaseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  mode,
  problemTitle,
  testCase,
}) => {
  const isEdit = mode === "edit";

  const [formData, setFormData] = useState({
    input: "",
    expectedOutput: "",
    isSample: true,
  });

  useEffect(() => {
    if (isEdit && testCase) {
      setFormData({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        isSample: testCase.isSample,
      });
    } else if (!isEdit) {
      setFormData({ input: "", expectedOutput: "", isSample: true });
    }
  }, [isEdit, testCase, isOpen]);

  const handleSubmit = () => {
    if (!formData.input || !formData.expectedOutput) return;
    onSubmit(formData);
    if (!isEdit) setFormData({ input: "", expectedOutput: "", isSample: true });
  };

  const handleClose = () => {
    if (!isEdit) setFormData({ input: "", expectedOutput: "", isSample: true });
    onClose();
  };

  if (!isOpen) return null;
  if (isEdit && !testCase) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <Card className="relative max-w-2xl w-full mx-4 z-50 bg-white dark:bg-slate-900">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                {isEdit ? "Chỉnh sửa Test Case" : "Thêm Test Case mới"}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isEdit ? "Cập nhật nội dung kiểm thử" : `Tạo mới một kiểm thử cho bài tập ${problemTitle || ""}`}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose} className="h-auto p-1">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Dữ liệu đầu vào (Input) <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={formData.input}
              onChange={(e) => setFormData({ ...formData, input: e.target.value })}
              rows={4}
              className="font-mono text-sm bg-white dark:bg-slate-800"
              placeholder="VD: [2, 7, 11, 15], 9"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Kết quả mong đợi (Output) <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={formData.expectedOutput}
              onChange={(e) => setFormData({ ...formData, expectedOutput: e.target.value })}
              rows={4}
              className="font-mono text-sm bg-white dark:bg-slate-800"
              placeholder="VD: [0, 1]"
            />
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 block">
              Phân loại Test Case
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={cn(
                  "flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all",
                  formData.isSample
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300",
                )}
              >
                <input
                  type="radio"
                  checked={formData.isSample}
                  onChange={() => setFormData({ ...formData, isSample: true })}
                  className="w-5 h-5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-sm text-slate-800 dark:text-white">Công khai</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Hiển thị ở ví dụ mẫu hoặc thử</p>
                </div>
              </label>

              <label
                className={cn(
                  "flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all",
                  !formData.isSample
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300",
                )}
              >
                <input
                  type="radio"
                  checked={!formData.isSample}
                  onChange={() => setFormData({ ...formData, isSample: false })}
                  className="w-5 h-5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <EyeOff className="w-4 h-4 text-slate-600" />
                    <span className="font-bold text-sm text-slate-800 dark:text-white">Ẩn</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Chỉ dùng để chấm điểm kỹ thuật</p>
                </div>
              </label>
            </div>
          </div>
        </CardContent>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={handleClose} className="py-5">
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            isDisabled={!formData.input || !formData.expectedOutput || isLoading}
            className={cn("gap-2 py-5", isEdit ? "bg-blue-500 hover:bg-blue-600" : "bg-blue-600 hover:bg-blue-700")}
          >
            {isEdit ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isLoading ? (isEdit ? "Đang lưu..." : "Đang thêm...") : isEdit ? "Lưu thay đổi" : "Thêm mới"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TestCaseModal;
