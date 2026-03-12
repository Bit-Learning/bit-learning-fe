import React, { useState } from "react";
import {
  Eye,
  Sparkles,
  Lightbulb,
  FileEdit,
  BookOpen,
  List,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Image,
  Brain,
  Loader2,
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
  const [previewCarouselIndex, setPreviewCarouselIndex] = useState(0);

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
    setShowPreviewModal(true);
    setPreviewCarouselIndex(0);
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
      templateId: selectedTemplateId,
      slideCount,
      includeExamples,
      includeExercises,
    };

    generateSlide.mutate(request);
  };

  const currentTemplate = templates.find((t) => t.id === previewTemplateId);

  const slideExamples = currentTemplate
    ? [
        {
          title: "Trang Tiêu Đề",
          subtitle: "Title Slide",
          content: (
            <div className="w-full max-w-4xl aspect-video bg-linear-to-br from-blue-600 to-blue-700 rounded-2xl shadow-2xl flex flex-col justify-center items-center text-white p-16 border-12 border-white/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
              <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
              <div className="h-1.5 w-32 bg-white/40 rounded-full mb-10"></div>
              <h3 className="text-5xl font-black text-center mb-8 leading-tight tracking-tight uppercase">
                Tin Học Lớp {grade}
                <br />
                <span className="text-white/80">Lập trình cơ bản</span>
              </h3>
              <div className="flex items-center gap-4">
                <div className="h-0.5 w-16 bg-white/30"></div>
                <p className="text-xl font-medium text-white/80">MentorHub Academy</p>
                <div className="h-0.5 w-16 bg-white/30"></div>
              </div>
            </div>
          ),
        },
        {
          title: "Trang Nội Dung",
          subtitle: "Content Slide",
          content: (
            <div className="w-full max-w-4xl aspect-video bg-white rounded-2xl shadow-2xl p-12 border-12 border-slate-100 flex flex-col">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-3xl font-bold text-blue-600 border-l-8 border-blue-600 pl-6">
                  Các khái niệm cơ bản
                </h3>
                <div className="text-slate-300 text-5xl font-black opacity-40">01</div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-1">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">Biến và kiểu dữ liệu</h4>
                    <p className="text-slate-500 mt-1 leading-relaxed">
                      Hiểu về cách khai báo biến và các kiểu dữ liệu cơ bản trong lập trình.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-1">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">Cấu trúc điều kiện</h4>
                    <p className="text-slate-500 mt-1 leading-relaxed">
                      Sử dụng if-else để kiểm soát luồng chương trình.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ),
        },
        {
          title: "Trang Hình Ảnh & Chữ",
          subtitle: "Image & Text",
          content: (
            <div className="w-full max-w-4xl aspect-video bg-white rounded-2xl shadow-2xl p-10 border-12 border-slate-100 grid grid-cols-5 gap-10">
              <div className="col-span-3 flex flex-col justify-center">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-full w-fit mb-4">
                  VÍ DỤ CODE
                </span>
                <h3 className="text-3xl font-bold text-slate-900 mb-6 leading-tight">
                  Chương trình
                  <br />
                  Hello World
                </h3>
                <p className="text-slate-600 leading-relaxed italic border-l-4 border-slate-200 pl-4">
                  "Chương trình đầu tiên của mọi lập trình viên"
                </p>
              </div>
              <div className="col-span-2 relative">
                <div className="w-full h-full bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-200">
                  <Image className="text-slate-300" size={80} />
                </div>
              </div>
            </div>
          ),
        },
        {
          title: "Trang Câu Hỏi/Bài Tập",
          subtitle: "Quiz Slide",
          content: (
            <div className="w-full max-w-4xl aspect-video bg-white rounded-2xl shadow-2xl p-12 border-12 border-slate-100">
              <div className="bg-blue-600 text-white px-8 py-6 rounded-2xl shadow-lg shadow-blue-600/20 mb-10 flex items-center gap-6">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <Brain size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Kiểm tra kiến thức</h3>
                  <p className="text-blue-100 text-sm opacity-80 mt-0.5">Lựa chọn đáp án đúng nhất</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 border-2 border-slate-100 rounded-2xl flex items-center gap-5 bg-slate-50/50">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center font-bold text-slate-400">
                    A
                  </div>
                  <div className="h-3 w-40 bg-slate-200 rounded-full"></div>
                </div>
                <div className="p-6 border-2 border-slate-100 rounded-2xl flex items-center gap-5 bg-slate-50/50">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center font-bold text-slate-400">
                    B
                  </div>
                  <div className="h-3 w-32 bg-slate-200 rounded-full"></div>
                </div>
                <div className="p-6 border-2 border-blue-600/30 bg-blue-50/50 rounded-2xl flex items-center gap-5 relative">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-600/30">
                    C
                  </div>
                  <div className="h-3 w-48 bg-blue-600/30 rounded-full"></div>
                  <div className="absolute right-6 text-blue-600">
                    <CheckCircle size={20} />
                  </div>
                </div>
                <div className="p-6 border-2 border-slate-100 rounded-2xl flex items-center gap-5 bg-slate-50/50">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center font-bold text-slate-400">
                    D
                  </div>
                  <div className="h-3 w-36 bg-slate-200 rounded-full"></div>
                </div>
              </div>
            </div>
          ),
        },
      ]
    : [];

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
          <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden relative border border-slate-200/20">
            <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <span className="p-2 bg-primary/10 rounded-lg">
                    <Eye className="text-primary" size={24} />
                  </span>
                  Xem trước Mẫu: <span className="text-primary">{currentTemplate.name}</span>
                </h2>
                <p className="text-sm text-slate-500 mt-1">Khám phá các bố cục slide có sẵn</p>
              </div>
              <button
                className="w-12 h-12 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-500 transition-all group"
                onClick={closePreviewModal}
              >
                <X className="group-hover:rotate-90 transition-transform" size={24} />
              </button>
            </div>

            <div className="flex-1 relative flex items-center bg-slate-50 p-12 overflow-hidden">
              <button
                className="absolute left-6 z-20 w-14 h-14 rounded-full bg-white shadow-xl border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-primary hover:text-white transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setPreviewCarouselIndex((prev) => Math.max(0, prev - 1))}
                disabled={previewCarouselIndex === 0}
              >
                <ChevronLeft size={24} />
              </button>
              <button
                className="absolute right-6 z-20 w-14 h-14 rounded-full bg-white shadow-xl border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-primary hover:text-white transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setPreviewCarouselIndex((prev) => Math.min(slideExamples.length - 1, prev + 1))}
                disabled={previewCarouselIndex === slideExamples.length - 1}
              >
                <ChevronRight size={24} />
              </button>

              <div className="w-full h-full flex items-center justify-center">
                <div className="flex flex-col items-center">
                  {slideExamples[previewCarouselIndex]?.content}
                  <p className="mt-6 text-sm font-semibold text-slate-500 uppercase tracking-widest">
                    {slideExamples[previewCarouselIndex]?.title} ({slideExamples[previewCarouselIndex]?.subtitle})
                  </p>
                </div>
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                {slideExamples.map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx === previewCarouselIndex
                        ? "bg-primary ring-4 ring-primary/20"
                        : "bg-slate-300 hover:bg-slate-400"
                    }`}
                    onClick={() => setPreviewCarouselIndex(idx)}
                  />
                ))}
              </div>
            </div>

            <div className="px-8 py-6 border-t border-slate-200 flex items-center justify-end gap-4">
              <button
                className="px-8 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
                onClick={closePreviewModal}
              >
                Đóng
              </button>
              <button
                className="px-10 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg hover:bg-blue-700 transition-all transform hover:scale-[1.02] flex items-center gap-2"
                onClick={() => {
                  setSelectedTemplateId(previewTemplateId);
                  closePreviewModal();
                }}
              >
                <CheckCircle size={20} />
                Sử dụng mẫu này
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
