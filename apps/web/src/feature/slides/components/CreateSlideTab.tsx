import React, { useState } from "react";
import {
  Eye,
  Sparkles,
  Lightbulb,
  FileEdit,
  BookOpen,
  List,
  X,
  CheckCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useGenerateSlide } from "../queries/useSlide";
import { useTemplates } from "../queries/useTemplate";
import { GRADE_OPTIONS } from "../types/slide.type";
import type { SlideRequest } from "../types/slide.type";
import { toast } from "@/shared/components/Sonner";

export const CreateSlideTab: React.FC = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [topic, setTopic] = useState("");
  const [grade, setGrade] = useState(6);
  const [slideCount, setSlideCount] = useState(10);
  const [includeExamples, setIncludeExamples] = useState(true);
  const [includeExercises, setIncludeExercises] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTemplateId, setPreviewTemplateId] = useState<number | null>(null);
  const [isIframeLoading, setIsIframeLoading] = useState(false);

  const { data: templatesData, isLoading: templatesLoading } = useTemplates();
  const generateSlide = useGenerateSlide();

  const templates = templatesData?.data || [];

  React.useEffect(() => {
    if (templates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(templates[0]?.id!);
    }
  }, [templates, selectedTemplateId]);

  const openPreviewModal = (templateId: number) => {
    setPreviewTemplateId(templateId);
    setIsIframeLoading(true);
    setShowPreviewModal(true);
  };

  const closePreviewModal = () => {
    setShowPreviewModal(false);
  };

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast.error({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập chủ đề bài giảng.",
      });
      return;
    }

    if (!selectedTemplateId) {
      toast.error({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn template.",
      });
      return;
    }

    const request: SlideRequest = {
      topic,
      grade,
      template_id: selectedTemplateId,
      slide_count: slideCount,
      include_examples: includeExamples,
      include_exercises: includeExercises,
    };

    generateSlide.mutate(request);
  };

  const currentTemplate = templates.find((t) => t.id === previewTemplateId);

  if (templatesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-slate-600">Đang tải templates...</span>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-md">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Chủ đề bài giảng</label>
                  <input
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none disabled:opacity-50"
                    placeholder="Ví dụ: Lập trình Pascal, Thuật toán sắp xếp..."
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={generateSlide.isPending}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Lớp học</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none disabled:opacity-50"
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value))}
                    disabled={generateSlide.isPending}
                  >
                    {GRADE_OPTIONS.filter((opt) => opt.value).map((option: any) => (
                      <option key={option.value} value={option.value.replace("Lớp ", "")}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-slate-700">Chọn mẫu bài giảng (Template)</label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {templates.map((tpl) => (
                    <div key={tpl.id} className="relative group">
                      <input
                        checked={selectedTemplateId === tpl.id}
                        className="hidden peer"
                        id={`tpl-${tpl.id}`}
                        name="template"
                        type="radio"
                        onChange={() => setSelectedTemplateId(tpl.id)}
                        disabled={generateSlide.isPending}
                      />
                      <label
                        className={`block cursor-pointer h-full border-2 rounded-xl overflow-hidden transition-all ${selectedTemplateId === tpl.id ? "border-primary ring-2 ring-primary shadow-lg" : "border-slate-200 hover:border-primary"}`}
                        htmlFor={`tpl-${tpl.id}`}
                      >
                        {tpl.thumbnailUrl ? (
                          <div className="relative h-32 overflow-hidden">
                            <img src={tpl.thumbnailUrl} alt={tpl.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                              <button
                                className="bg-white text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 transition-colors shadow-lg"
                                onClick={(e) => {
                                  e.preventDefault();
                                  openPreviewModal(tpl.id);
                                }}
                                type="button"
                              >
                                <Eye size={16} />
                                Xem trước
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="relative h-32 bg-linear-to-br from-blue-600 to-blue-700 overflow-hidden flex flex-col justify-center items-center text-white p-4">
                            <div className="relative z-10 text-center">
                              <div className="h-1 w-8 bg-white/40 mx-auto rounded mb-1"></div>
                              <div className="h-2 w-16 bg-white/80 mx-auto rounded mb-1"></div>
                              <div className="h-1 w-12 bg-white/40 mx-auto rounded"></div>
                            </div>
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                              <button
                                className="bg-white text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 transition-colors shadow-lg"
                                onClick={(e) => {
                                  e.preventDefault();
                                  openPreviewModal(tpl.id);
                                }}
                                type="button"
                              >
                                <Eye size={16} />
                                Xem trước
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="p-3 bg-white">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{tpl.name}</h4>
                          {tpl.description && (
                            <p className="text-xs text-slate-500 mt-0.5 truncate">{tpl.description}</p>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6 pt-4 border-t border-slate-100">
                <div className="max-w-xs">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Số lượng slide mong muốn</label>
                  <div className="relative flex items-center">
                    <List className="absolute left-3 text-slate-400" size={20} />
                    <input
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none disabled:opacity-50"
                      max="15"
                      min="1"
                      type="number"
                      value={slideCount}
                      onChange={(e) => setSlideCount(Number(e.target.value))}
                      disabled={generateSlide.isPending}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 italic">
                    * Đề xuất: 5 - 15 slides để đạt hiệu quả tốt nhất.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-all">
                    <div className="flex items-center gap-3">
                      <Lightbulb className="text-primary" size={20} />
                      <span className="text-sm font-medium text-slate-700">Thêm ví dụ minh họa</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        checked={includeExamples}
                        className="sr-only peer"
                        type="checkbox"
                        onChange={(e) => setIncludeExamples(e.target.checked)}
                        disabled={generateSlide.isPending}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary rounded-full"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-all">
                    <div className="flex items-center gap-3">
                      <FileEdit className="text-primary" size={20} />
                      <span className="text-sm font-medium text-slate-700">Thêm bài tập</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        checked={includeExercises}
                        className="sr-only peer"
                        type="checkbox"
                        onChange={(e) => setIncludeExercises(e.target.checked)}
                        disabled={generateSlide.isPending}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary rounded-full"></div>
                    </label>
                  </div>
                </div>
              </div>

              <button
                className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] shadow-xl shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                onClick={handleGenerate}
                disabled={generateSlide.isPending || !topic.trim() || !selectedTemplateId}
              >
                {generateSlide.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang tạo slide...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Tạo Slide với AI
                  </>
                )}
              </button>
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-xl p-6 h-full flex flex-col shadow-sm sticky top-8">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Eye className="text-slate-400" size={20} />
              Xem trước bản phác thảo
            </h3>
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <BookOpen className="text-slate-300" size={40} />
              </div>
              <p className="text-sm text-slate-500 mb-2">Chưa có nội dung để hiển thị</p>
              <p className="text-xs text-slate-400 max-w-50 mx-auto">
                Nhập chủ đề và nhấn "Tạo Slide với AI" để bắt đầu thiết kế bài giảng.
              </p>
            </div>
            <div className="mt-8 space-y-3 opacity-30 select-none pointer-events-none">
              <div className="h-24 bg-slate-100 rounded-lg"></div>
              <div className="h-24 bg-slate-100 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>

      {showPreviewModal && currentTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-md">
          <div
            className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200/20"
            style={{ height: "90vh" }}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-primary/10 rounded-lg">
                  <Eye className="text-primary" size={20} />
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900">{currentTemplate.name}</h2>
                  {currentTemplate.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{currentTemplate.description}</p>
                  )}
                </div>
              </div>
              <button
                className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-400 transition-all group"
                onClick={closePreviewModal}
              >
                <X className="group-hover:rotate-90 transition-transform" size={18} />
              </button>
            </div>

            {/* PDF viewer */}
            <div className="flex-1 relative overflow-hidden bg-slate-100">
              {isIframeLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-slate-500">Đang tải xem trước...</p>
                </div>
              )}
              {currentTemplate.previewPdfUrl ? (
                <iframe
                  key={currentTemplate.id}
                  src={currentTemplate.previewPdfUrl}
                  className="w-full h-full border-0"
                  title={`Preview: ${currentTemplate.name}`}
                  onLoad={() => setIsIframeLoading(false)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                  <BookOpen size={40} className="opacity-30" />
                  <p className="text-sm">Không có file xem trước cho template này.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between shrink-0">
              <a
                href={currentTemplate.previewPdfUrl || currentTemplate.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-primary transition-colors"
              >
                <ExternalLink size={15} />
                Mở trong tab mới
              </a>
              <div className="flex gap-3">
                <button
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all"
                  onClick={closePreviewModal}
                >
                  Đóng
                </button>
                <button
                  className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold shadow-md hover:bg-blue-700 transition-all flex items-center gap-2"
                  onClick={() => {
                    setSelectedTemplateId(previewTemplateId);
                    closePreviewModal();
                  }}
                >
                  <CheckCircle size={18} />
                  Sử dụng mẫu này
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
