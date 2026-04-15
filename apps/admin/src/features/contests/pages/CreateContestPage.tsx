import React, { useState, useEffect } from "react";
import { Calendar, Timer, Plus, Loader2, Pencil, ArrowLeft, Trophy } from "lucide-react";
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
  prizeTopCount?: number | null;
  prizeCoinsPerRank?: number[] | null;
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
    prizeTopCount: null,
    prizeCoinsPerRank: null,
  });

  const [prizeEnabled, setPrizeEnabled] = useState(false);
  const [prizeCount, setPrizeCount] = useState(3);
  const [prizeCoins, setPrizeCoins] = useState<number[]>([500, 300, 100]);

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
        prizeTopCount: contest.prizeTopCount ?? null,
        prizeCoinsPerRank: contest.prizeCoinsPerRank ?? null,
      });
      if (contest.prizeTopCount && contest.prizeTopCount > 0 && contest.prizeCoinsPerRank?.length) {
        setPrizeEnabled(true);
        setPrizeCount(contest.prizeTopCount);
        setPrizeCoins([...contest.prizeCoinsPerRank]);
      }
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

    if (prizeEnabled) {
      for (let i = 0; i < prizeCount; i++) {
        const coin = prizeCoins[i];
        if (!coin || coin <= 0) {
          newErrors[`prize_${i}`] = `Xu thưởng Top ${i + 1} phải lớn hơn 0`;
        }
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

    const payload: ContestUpsertDTO = {
      ...formData,
      prizeTopCount: prizeEnabled ? prizeCount : null,
      prizeCoinsPerRank: prizeEnabled ? prizeCoins.slice(0, prizeCount) : null,
    };

    try {
      if (isEditMode && contestId) {
        await updateMutation.mutateAsync({ contestId, data: payload });
        navigate({ to: "/contests/$id", params: { id: contestId } });
      } else {
        await createMutation.mutateAsync(payload);
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
          <Button variant="link" onClick={handleBack} className="gap-2 border-gray-300">
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách
          </Button>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
          {isEditMode ? "Chỉnh sửa cuộc thi" : "Tạo cuộc thi mới"}
        </h2>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 rounded-md shadow-sm overflow-hidden p-0">
        <CardContent className="p-8 space-y-4">
          <div className="space-y-2">
            <label htmlFor="contest_name" className="block text-md font-semibold text-slate-700 dark:text-slate-300">
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
            <label className="block text-md font-semibold text-slate-700 dark:text-slate-300">Mô tả cuộc thi</label>
            <div className="border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden bg-white dark:bg-slate-800">
              <textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Mô tả cuộc thi...."
                rows={8}
                className="w-full px-4 py-3 border-none focus:ring-0 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="start_time" className="block text-md font-semibold text-slate-700 dark:text-slate-300">
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
              <label htmlFor="end_time" className="block text-md font-semibold text-slate-700 dark:text-slate-300">
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

          {/* Prize Configuration */}
          <div className="space-y-4 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800/30 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300">Cấu hình giải thưởng</h3>
                  <p className="text-xs text-slate-500">Thưởng xu cho người dẫn đầu khi cuộc thi kết thúc</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPrizeEnabled(!prizeEnabled);
                  if (!prizeEnabled && prizeCoins.length === 0) {
                    setPrizeCoins([500, 300, 100]);
                    setPrizeCount(3);
                  }
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  prizeEnabled ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    prizeEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {prizeEnabled && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Số lượng top nhận thưởng
                  </label>
                  <select
                    value={prizeCount}
                    onChange={(e) => {
                      const newCount = Number(e.target.value);
                      setPrizeCount(newCount);
                      setPrizeCoins((prev) => {
                        const updated = [...prev];
                        while (updated.length < newCount) updated.push(100);
                        return updated.slice(0, newCount);
                      });
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        Top {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Xu thưởng theo hạng
                  </label>
                  {Array.from({ length: prizeCount }, (_, i) => {
                    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏆";
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-lg w-8 text-center">{medal}</span>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-16">Top {i + 1}</span>
                        <div className="relative flex-1">
                          <input
                            type="number"
                            min={1}
                            value={prizeCoins[i] ?? ""}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setPrizeCoins((prev) => {
                                const updated = [...prev];
                                updated[i] = val;
                                return updated;
                              });
                              if (errors[`prize_${i}`]) {
                                setErrors((prev) => ({
                                  ...prev,
                                  [`prize_${i}`]: "",
                                }));
                              }
                            }}
                            placeholder="Số xu"
                            className={`w-full px-4 py-2.5 rounded-xl border ${
                              errors[`prize_${i}`]
                                ? "border-red-300 dark:border-red-700"
                                : "border-slate-200 dark:border-slate-700"
                            } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all`}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">
                            xu
                          </span>
                        </div>
                        {errors[`prize_${i}`] && (
                          <p className="text-xs text-red-500 min-w-30">{errors[`prize_${i}`]}</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-lg p-3">
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    💡 Nếu 2 người cùng hạng (ICPC), cả 2 sẽ nhận thưởng cùng mức. Chỉ người giải được ≥ 1 bài mới nhận
                    thưởng.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex items-center justify-end gap-4 border-t border-slate-200 dark:border-slate-800">
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
    </div>
  );
};
