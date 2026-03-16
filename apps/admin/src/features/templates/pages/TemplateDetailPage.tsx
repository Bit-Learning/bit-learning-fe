import React, { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ChevronRight,
  Download,
  Users,
  Calendar,
  Database,
  FileText,
  CheckCircle,
  ZoomIn,
  Maximize,
  Sparkles,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { slideImages, sampleTemplates } from "../data/templates";
import { useTemplate, useDeleteTemplate } from "../queries/useTemplate";
import { PreviewModal } from "../components/PreviewModal";
import { formatDate } from "../components/TemplateCard";

export const TemplateDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams({ from: "/_authenticated/templates/$id/" });
  const templateId = parseInt(id);

  const [selectedSlide, setSelectedSlide] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // const { data: templateData, isLoading, isError } = useTemplate(templateId);
  const deleteTemplate = useDeleteTemplate();

  const template = {
    id: 6,
    name: "Marketing Strategy Deck",
    description: "Mẫu slide phân tích thị trường, chiến lược nội dung và KPI tracking.",
    url: "https://example.com/templates/template-6.pptx",
    thumbnailUrl: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=450&fit=crop",
    createdAt: "2024-02-25T00:00:00Z",
    updatedAt: "2024-02-25T00:00:00Z",
  };

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
  //         <p className="text-slate-600">Đang tải dữ liệu...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (isError || !template) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-center">
  //         <h2 className="text-2xl font-bold text-slate-900 mb-2">Template không tồn tại</h2>
  //         <Button onClick={() => navigate({ to: "/templates" })}>Quay lại danh sách</Button>
  //       </div>
  //     </div>
  //   );
  // }

  const handleDownload = () => {
    window.open(template.url, "_blank");
  };

  const handleDelete = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa mẫu slide này?")) {
      deleteTemplate.mutate(templateId, {
        onSuccess: () => {
          navigate({ to: "/templates" });
        },
      });
    }
  };

  return (
    <>
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-360 mx-auto px-10 py-8">
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-8">
            <div>
              <nav className="flex text-sm text-slate-500 mb-2 items-center gap-2">
                <button
                  onClick={() => navigate({ to: "/templates" })}
                  className="hover:text-blue-600 transition-colors"
                >
                  Quản lý Mẫu Slide
                </button>
                <ChevronRight className="w-4 h-4" />
                <span className="text-slate-900 font-semibold">Chi tiết mẫu</span>
              </nav>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Chi tiết mẫu slide</h2>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                className="bg-slate-100 hover:bg-slate-200 text-slate-600"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Tải file gốc
              </Button>
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleDelete}
                disabled={deleteTemplate.isPending}
              >
                {deleteTemplate.isPending ? "Đang xóa..." : "Xóa mẫu"}
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100"
                onClick={() => navigate({ to: "/templates/$id/edit", params: { id } })}
              >
                Cập nhật
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <Card className="overflow-hidden border-slate-200 shadow-sm">
                <div className="aspect-video w-full bg-slate-50 relative group">
                  <img
                    alt="Slide Main Preview"
                    className="w-full h-full object-cover"
                    src={slideImages[selectedSlide]}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-6 bg-linear-to-t from-black/50 to-transparent flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <Badge className="bg-black/30 backdrop-blur-md text-white border-0">
                      Slide {selectedSlide + 1}: Cover Layout
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-full backdrop-blur-md bg-white/20 hover:bg-white hover:text-slate-900 border-0"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-full backdrop-blur-md bg-white/20 hover:bg-white hover:text-slate-900 border-0"
                        onClick={() => setIsPreviewOpen(true)}
                      >
                        <Maximize className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-slate-50 overflow-x-auto">
                  <div className="flex gap-4 min-w-max pb-2">
                    {slideImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSlide(idx)}
                        className={`w-40 aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                          idx === selectedSlide
                            ? "border-blue-600 ring-4 ring-blue-50"
                            : "border-transparent hover:border-slate-300 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" src={img} />
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-6">
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4 text-slate-900 leading-tight">{template.name}</h3>
                  <p className="text-slate-600 leading-relaxed mb-8 font-medium">
                    {template.description || "Không có mô tả cho mẫu này."}
                  </p>
                  <div className="space-y-5 border-t border-slate-50 pt-8">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500 font-medium flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-slate-400" />
                        Ngày tạo
                      </span>
                      <span className="text-sm font-bold text-slate-900">{formatDate(template.createdAt)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500 font-medium flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-slate-400" />
                        Cập nhật
                      </span>
                      <span className="text-sm font-bold text-slate-900">{formatDate(template.updatedAt)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500 font-medium flex items-center gap-3">
                        <Database className="w-5 h-5 text-slate-400" />
                        Dung lượng
                      </span>
                      <span className="text-sm font-bold text-slate-900">4.2 MB</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500 font-medium flex items-center gap-3">
                        <FileText className="w-5 h-5 text-slate-400" />
                        Định dạng
                      </span>
                      <span className="text-sm font-bold text-slate-900">.pptx</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500 font-medium flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-slate-400" />
                        Trạng thái
                      </span>
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[11px] font-extrabold uppercase tracking-wider">
                        Đang kích hoạt
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-600 text-white border-0 shadow-sm relative overflow-hidden">
                <CardContent className="p-8 relative z-10">
                  <h4 className="text-xl font-bold mb-4">Tính năng đặc biệt</h4>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3 font-medium">
                      <div className="bg-white/20 p-1 rounded-lg">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      Hỗ trợ 20+ layouts đa dạng
                    </li>
                    <li className="flex items-center gap-3 font-medium">
                      <div className="bg-white/20 p-1 rounded-lg">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      Tùy chỉnh màu sắc linh hoạt
                    </li>
                    <li className="flex items-center gap-3 font-medium">
                      <div className="bg-white/20 p-1 rounded-lg">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      Độ phân giải 4K (3840x2160)
                    </li>
                  </ul>
                </CardContent>
                <FileText className="absolute -bottom-6 -right-6 w-36 h-36 opacity-10 rotate-12" />
              </Card>
            </div>
          </div>
        </div>
      </main>

      <PreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} templateName={template.name} />
    </>
  );
};
