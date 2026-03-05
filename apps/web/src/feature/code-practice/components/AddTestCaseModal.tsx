import React, { useState } from "react";
import { Plus, X, Eye, EyeOff } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Textarea } from "@workspace/ui/components/Textarea";
import { Label } from "@workspace/ui/components/label";
import { cn } from "@workspace/ui/lib/utils";

interface AddTestCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { input: string; expectedOutput: string; isSample: boolean }) => void;
  isLoading?: boolean;
  problemTitle?: string;
}

const AddTestCaseModal: React.FC<AddTestCaseModalProps> = ({ isOpen, onClose, onSubmit, isLoading, problemTitle }) => {
  const [formData, setFormData] = useState({ input: "", expectedOutput: "", isSample: true });

  const handleSubmit = () => {
    if (!formData.input || !formData.expectedOutput) return;
    onSubmit(formData);
    setFormData({ input: "", expectedOutput: "", isSample: true });
  };

  const handleClose = () => {
    setFormData({ input: "", expectedOutput: "", isSample: true });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <Card className="relative max-w-2xl w-full mx-4 z-50 bg-white dark:bg-slate-900">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Thêm Test Case mới</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Tạo mới một kiểm thử cho bài tập {problemTitle || ""}
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
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            isDisabled={!formData.input || !formData.expectedOutput || isLoading}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            <Plus className="w-4 h-4" />
            {isLoading ? "Đang thêm..." : "Thêm mới"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AddTestCaseModal;
