import React, { useState, useEffect } from "react";
import {
  Calendar,
  Timer,
  Eye,
  Bold,
  Italic,
  List,
  Link2,
  Image,
  Plus,
  Shield,
  TrendingUp,
  Users,
  Loader2,
  Pencil,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useParams } from "@tanstack/react-router";
import { useContestDetail, useCreateContest, useUpdateContest } from "../queries/useContest";
import { useNavigate } from "@tanstack/react-router";

interface ContestUpsertDTO {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
}

export const CreateContestPage: React.FC = () => {
  const { id: contestId } = useParams({ strict: false });
  const navigate = useNavigate();
  const { data: contest, isLoading } = useContestDetail(contestId!);
  const createMutation = useCreateContest();
  const updateMutation = useUpdateContest();

  const isEditMode = !!contestId;

  const [formData, setFormData] = useState<ContestUpsertDTO>({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
  });

  const [isPreview, setIsPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toLocalInputValue = (isoString: string) => {
    const d = new Date(isoString);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (contest) {
      setFormData({
        title: contest.title ?? "",
        description: contest.description ?? "",
        startTime: contest.startTime ? toLocalInputValue(contest.startTime) : "",
        endTime: contest.endTime ? toLocalInputValue(contest.endTime) : "",
      });
    } else if (!isEditMode) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      const endTime = new Date(tomorrow);
      endTime.setHours(12, 0, 0, 0);
      setFormData((prev) => ({
        ...prev,
        startTime: tomorrow.toISOString().slice(0, 16),
        endTime: endTime.toISOString().slice(0, 16),
      }));
    }
  }, [contest]);

  const calculateDuration = () => {
    if (!formData.startTime || !formData.endTime) return "0 giờ 0 phút";

    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    const diffMs = end.getTime() - start.getTime();

    if (diffMs < 0) return "Thời gian không hợp lệ";

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours} giờ ${minutes} phút`;
  };

  const handleChange = (field: keyof ContestUpsertDTO, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Tên cuộc thi không được để trống";
    }

    if (!formData.startTime) {
      newErrors.startTime = "Vui lòng chọn thời gian bắt đầu";
    }

    if (!formData.endTime) {
      newErrors.endTime = "Vui lòng chọn thời gian kết thúc";
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);

      if (end <= start) {
        newErrors.endTime = "Thời gian kết thúc phải sau thời gian bắt đầu";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }
    if (createMutation.isPending || updateMutation.isPending) return;

    try {
      if (isEditMode && contestId) {
        await updateMutation.mutateAsync({ contestId, data: formData });
        navigate({ to: "/contests/$id", params: { id: contestId } });
      } else {
        await createMutation.mutateAsync(formData);
        navigate({ to: "/contests" });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCancel = () => {
    navigate({ to: "/contests" });
  };

  const handleBack = () => {
    navigate({
      to: isEditMode ? `/contests/${contestId}` : "/contests",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải cuộc thi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <div className="mb-4">
          <Button variant="outline" onClick={handleBack} className="gap-2 border-gray-300">
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách
          </Button>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
          {isEditMode ? "Chỉnh sửa cuộc thi" : "Tạo cuộc thi mới"}
        </h2>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <CardContent className="p-8 space-y-8">
          <div className="space-y-2">
            <label htmlFor="contest_name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Tên cuộc thi <span className="text-red-500">*</span>
            </label>
            <input
              id="contest_name"
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Ví dụ: Spring Code Challenge 2026"
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.title
                  ? "border-red-300 dark:border-red-700 focus:ring-red-500/20 focus:border-red-500"
                  : "border-slate-200 dark:border-slate-700 focus:ring-blue-500/20 focus:border-blue-500"
              } bg-white dark:bg-slate-800 focus:ring-2 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500`}
            />
            {errors.title && <p className="text-sm text-red-600 dark:text-red-400">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Mô tả cuộc thi</label>
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
              <div className="flex items-center gap-1 p-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400 transition-colors"
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400 transition-colors"
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400 transition-colors"
                  title="List"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400 transition-colors"
                  title="Link"
                >
                  <Link2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400 transition-colors"
                  title="Image"
                >
                  <Image className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreview(!isPreview)}
                  className={`p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors ml-auto ${
                    isPreview ? "text-blue-600" : "text-slate-600 dark:text-slate-400"
                  }`}
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              {!isPreview ? (
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Viết mô tả bằng Markdown ở đây..."
                  rows={8}
                  className="w-full px-4 py-3 border-none focus:ring-0 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none outline-none"
                />
              ) : (
                <div className="px-4 py-3 min-h-50 prose prose-slate dark:prose-invert max-w-none">
                  {formData.description ? (
                    <div className="whitespace-pre-wrap">{formData.description}</div>
                  ) : (
                    <p className="text-slate-400 italic">Chưa có nội dung...</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="start_time" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Thời gian bắt đầu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                <input
                  id="start_time"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => handleChange("startTime", e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                    errors.startTime
                      ? "border-red-300 dark:border-red-700 focus:ring-red-500/20 focus:border-red-500"
                      : "border-slate-200 dark:border-slate-700 focus:ring-blue-500/20 focus:border-blue-500"
                  } bg-white dark:bg-slate-800 focus:ring-2 transition-all text-slate-900 dark:text-white`}
                />
              </div>
              {errors.startTime && <p className="text-sm text-red-600 dark:text-red-400">{errors.startTime}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="end_time" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Thời gian kết thúc <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                <input
                  id="end_time"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => handleChange("endTime", e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                    errors.endTime
                      ? "border-red-300 dark:border-red-700 focus:ring-red-500/20 focus:border-red-500"
                      : "border-slate-200 dark:border-slate-700 focus:ring-blue-500/20 focus:border-blue-500"
                  } bg-white dark:bg-slate-800 focus:ring-2 transition-all text-slate-900 dark:text-white`}
                />
              </div>
              {errors.endTime && <p className="text-sm text-red-600 dark:text-red-400">{errors.endTime}</p>}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800/50 rounded-lg flex items-center justify-center text-blue-600">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Thời lượng dự kiến
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{calculateDuration()}</p>
            </div>
            <div className="ml-auto hidden md:block">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Tự động tính từ thời gian bắt đầu và kết thúc
              </span>
            </div>
          </div>
        </CardContent>

        <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-6 flex items-center justify-end gap-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={handleCancel} className="px-6">
            Hủy
          </Button>
          <Button type="button" onClick={handleSubmit} className="px-8 py-5 gap-2 shadow-lg">
            {isEditMode ? (
              <>
                <Pencil className="w-4 h-4" />
                Cập nhật cuộc thi
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Tạo cuộc thi
              </>
            )}
          </Button>
        </div>
      </Card>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3">
          <Shield className="w-5 h-5 text-slate-400" />
          <p className="text-xs text-slate-500 dark:text-slate-400">An toàn & Bảo mật tuyệt đối</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-slate-400" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Báo cáo kết quả thời gian thực</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3">
          <Users className="w-5 h-5 text-slate-400" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Không giới hạn thí sinh</p>
        </div>
      </div>
    </div>
  );
};
