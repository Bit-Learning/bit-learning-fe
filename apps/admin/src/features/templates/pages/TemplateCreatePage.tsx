import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  FileText,
  Upload,
  ImageIcon,
  CheckCircle,
  Eye,
  Lightbulb,
  Database,
  Users,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCreateTemplate } from "../queries/useTemplate";
import { PdfPreviewModal } from "../components/PdfPreviewModal";

interface ValidationErrors {
  name?: string;
  description?: string;
  templateFile?: string;
  thumbnailFile?: string;
}

export const TemplateCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const createTemplate = useCreateTemplate();

  const validateField = (fieldName: keyof ValidationErrors, value: string | File | null): string | undefined => {
    switch (fieldName) {
      case "name":
        if (!value || typeof value !== "string") return "Tên không được để trống";
        if (value.length > 200) return "Tên không được vượt quá 200 ký tự";
        return undefined;

      case "description":
        if (value && typeof value === "string" && value.length > 2000) {
          return "Mô tả không được vượt quá 2000 ký tự";
        }
        return undefined;

      case "templateFile":
        if (!value || !(value instanceof File)) return "File mẫu là bắt buộc";
        if (value.size > 50 * 1024 * 1024) return "File không được vượt quá 50MB";
        if (!value.name.endsWith(".pdf")) return "File phải có định dạng .pdf";
        return undefined;

      case "thumbnailFile":
        if (value && value instanceof File) {
          if (value.size > 5 * 1024 * 1024) return "Ảnh không được vượt quá 5MB";
          if (!["image/png", "image/jpeg", "image/jpg"].includes(value.type)) {
            return "Ảnh phải có định dạng PNG hoặc JPG";
          }
        }
        return undefined;

      default:
        return undefined;
    }
  };

  const validateAll = (): boolean => {
    const newErrors: ValidationErrors = {};

    const nameError = validateField("name", templateName);
    if (nameError) newErrors.name = nameError;

    const descError = validateField("description", description || null);
    if (descError) newErrors.description = descError;

    const fileError = validateField("templateFile", pdfFile);
    if (fileError) newErrors.templateFile = fileError;

    const thumbError = validateField("thumbnailFile", thumbnailFile);
    if (thumbError) newErrors.thumbnailFile = thumbError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNameChange = (value: string) => {
    setTemplateName(value);
    if (touched.name) {
      const error = validateField("name", value);
      setErrors((prev) => ({ ...prev, name: error }));
    }
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    if (touched.description) {
      const error = validateField("description", value || null);
      setErrors((prev) => ({ ...prev, description: error }));
    }
  };

  const handlePdfFileChange = (file: File | null) => {
    setPdfFile(file);
    if (touched.templateFile && file) {
      const error = validateField("templateFile", file);
      setErrors((prev) => ({ ...prev, templateFile: error }));
    }
  };

  const handleThumbnailFileChange = (file: File | null) => {
    setThumbnailFile(file);
    if (touched.thumbnailFile && file) {
      const error = validateField("thumbnailFile", file);
      setErrors((prev) => ({ ...prev, thumbnailFile: error }));
    }
  };

  const handleBlur = (fieldName: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));

    let error: string | undefined;
    switch (fieldName) {
      case "name":
        error = validateField("name", templateName);
        break;
      case "description":
        error = validateField("description", description || null);
        break;
      case "templateFile":
        if (pdfFile) error = validateField("templateFile", pdfFile);
        break;
      case "thumbnailFile":
        if (thumbnailFile) error = validateField("thumbnailFile", thumbnailFile);
        break;
    }

    if (error !== undefined) {
      setErrors((prev) => ({ ...prev, [fieldName]: error }));
    }
  };

  const handleSubmit = () => {
    setTouched({
      name: true,
      description: true,
      templateFile: true,
      thumbnailFile: true,
    });

    if (!validateAll()) {
      return;
    }

    if (!pdfFile) {
      return;
    }

    createTemplate.mutate(
      {
        name: templateName,
        description: description || undefined,
        templateFile: pdfFile,
        thumbnailFile: thumbnailFile || undefined,
      },
      {
        onSuccess: (response) => {
          const newTemplateId = response.data.data?.id;
          if (newTemplateId) {
            navigate({ to: `/templates/${newTemplateId}` });
          } else {
            navigate({ to: "/templates" });
          }
        },
      },
    );
  };

  const hasErrors = Object.values(errors).some((err) => err !== undefined);

  return (
    <>
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex flex-col">
            <nav className="flex text-sm text-slate-500 mb-1">
              <button onClick={() => navigate({ to: "/templates" })} className="hover:text-blue-600 transition-colors">
                Quản lý Mẫu Slide
              </button>
              <span className="mx-2">/</span>
              <span className="text-slate-900 font-medium">Tạo mẫu mới</span>
            </nav>
            <h2 className="text-xl font-bold text-slate-900">Thêm Mẫu Bài Giảng PDF</h2>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="text-slate-700" onClick={() => navigate({ to: "/templates" })}>
              Hủy
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/40"
              onClick={handleSubmit}
              disabled={createTemplate.isPending}
            >
              {createTemplate.isPending ? "Đang tạo..." : "Lưu thay đổi"}
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {hasErrors && touched.name && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Vui lòng kiểm tra lại các trường thông tin bị lỗi bên dưới.</AlertDescription>
                  </Alert>
                )}

                <Card className="border-slate-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h3 className="font-bold text-lg text-slate-900">Thông tin mẫu</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-900">
                          Tên mẫu <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={templateName}
                          onChange={(e) => handleNameChange(e.target.value)}
                          onBlur={() => handleBlur("name")}
                          placeholder="Ví dụ: Slide Bài Giảng Chuyên Sâu UI/UX"
                          className={`border-slate-300 focus-visible:ring-blue-500/20 focus-visible:border-blue-600 ${
                            errors.name && touched.name ? "border-red-500 focus-visible:border-red-500" : ""
                          }`}
                        />
                        {errors.name && touched.name && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-900">Mô tả chi tiết</label>
                        <Textarea
                          value={description}
                          onChange={(e) => handleDescriptionChange(e.target.value)}
                          onBlur={() => handleBlur("description")}
                          placeholder="Nhập mô tả về cấu trúc hoặc nội dung của mẫu slide này..."
                          rows={4}
                          className={`resize-none border-slate-300 focus-visible:ring-blue-500/20 focus-visible:border-blue-600 ${
                            errors.description && touched.description
                              ? "border-red-500 focus-visible:border-red-500"
                              : ""
                          }`}
                        />
                        {errors.description && touched.description && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.description}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-1">{description.length}/2000 ký tự</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Upload className="w-5 h-5 text-blue-600" />
                      <h3 className="font-bold text-lg text-slate-900">Tải lên tệp tin</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-3 text-slate-900">
                          Tệp tin PDF <span className="text-red-500">*</span>
                        </label>
                        <div
                          className={`relative group border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                            errors.templateFile && touched.templateFile
                              ? "border-red-500 bg-red-50/50"
                              : "border-slate-300 hover:border-blue-600 hover:bg-blue-50/50"
                          }`}
                        >
                          <input
                            accept=".pdf"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              handlePdfFileChange(file);
                              handleBlur("templateFile");
                            }}
                          />
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${
                              errors.templateFile && touched.templateFile
                                ? "bg-red-100 text-red-600"
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            <FileText className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-medium text-slate-900">
                            {pdfFile ? pdfFile.name : "Kéo thả hoặc bấm để tải lên"}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">Chỉ hỗ trợ định dạng PDF (Max 50MB)</p>
                          {pdfFile && (
                            <p className="text-xs text-green-600 mt-2 font-medium">
                              ✓ File đã chọn: {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          )}
                        </div>
                        {errors.templateFile && touched.templateFile && (
                          <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.templateFile}
                          </p>
                        )}
                        {pdfFile && !errors.templateFile && (
                          <Button variant="outline" className="w-full mt-3" onClick={() => setIsPreviewOpen(true)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Xem trước file PDF
                          </Button>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-3 text-slate-900">
                          Ảnh thu nhỏ (Thumbnail)
                        </label>
                        <div
                          className={`relative group border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                            errors.thumbnailFile && touched.thumbnailFile
                              ? "border-red-500 bg-red-50/50"
                              : "border-slate-300 hover:border-blue-600 hover:bg-blue-50/50"
                          }`}
                        >
                          <input
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              handleThumbnailFileChange(file);
                              handleBlur("thumbnailFile");
                            }}
                          />
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${
                              errors.thumbnailFile && touched.thumbnailFile
                                ? "bg-red-100 text-red-600"
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            <ImageIcon className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-medium text-slate-900">
                            {thumbnailFile ? thumbnailFile.name : "Tải lên hình ảnh xem trước"}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">PNG, JPG tỉ lệ 16:9 (Max 5MB)</p>
                          {thumbnailFile && (
                            <p className="text-xs text-green-600 mt-2 font-medium">
                              ✓ Ảnh đã chọn: {(thumbnailFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          )}
                        </div>
                        {errors.thumbnailFile && touched.thumbnailFile && (
                          <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.thumbnailFile}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base leading-tight text-slate-900">Trạng thái kích hoạt</h3>
                        <p className="text-sm text-slate-500">Cho phép Mentors sử dụng mẫu này ngay lập tức</p>
                      </div>
                    </div>
                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                  </CardContent>
                </Card>

                <div className="flex items-center justify-end gap-4 pt-4">
                  <Button variant="outline" onClick={() => navigate({ to: "/templates" })} className="text-slate-600">
                    Hủy
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/40"
                    onClick={handleSubmit}
                    disabled={createTemplate.isPending}
                  >
                    {createTemplate.isPending ? "Đang tạo..." : "Tạo template"}
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Preview (Xem trước thư viện)
                  </h4>
                  <Card className="overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-lg border-slate-200">
                    <div className="relative aspect-video bg-slate-100 overflow-hidden">
                      {thumbnailFile ? (
                        <img
                          alt="Template Preview"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          src={URL.createObjectURL(thumbnailFile)}
                        />
                      ) : (
                        <img
                          alt="Template Preview"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=450&fit=crop"
                        />
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <Badge className="bg-white/20 backdrop-blur-md text-white text-xs border-0">
                          1920 x 1080px
                        </Badge>
                      </div>
                      <Badge className="absolute top-3 left-3 bg-blue-600 text-white border-0">Mới</Badge>
                      <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-blue-600">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full py-3.5 border-y border-slate-100 hover:bg-blue-600 hover:text-white group/btn"
                      onClick={() => pdfFile && setIsPreviewOpen(true)}
                      disabled={!pdfFile}
                    >
                      <Eye className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                      <span className="text-xs font-bold uppercase tracking-wide">Xem chi tiết tất cả các trang</span>
                    </Button>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="secondary"
                            className="text-[10px] bg-red-50 text-red-600 border-red-100 font-bold uppercase"
                          >
                            PDF
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="text-[10px] bg-slate-50 text-slate-500 font-bold uppercase"
                          >
                            {pdfFile ? "DOCUMENT" : "24 PAGES"}
                          </Badge>
                        </div>
                        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                          <Database className="w-3 h-3" />{" "}
                          {pdfFile ? `${(pdfFile.size / (1024 * 1024)).toFixed(1)} MB` : "12.4 MB"}
                        </span>
                      </div>
                      <h5 className="font-bold text-slate-900 mb-2 leading-snug group-hover:text-blue-600 transition-colors">
                        {templateName || "Tên mẫu slide sẽ hiển thị tại đây"}
                      </h5>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                        {description ||
                          "Mô tả chi tiết về slide giúp mentor dễ dàng lựa chọn bộ khung phù hợp cho bài giảng của mình."}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2">
                            <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center">
                              <Users className="w-3 h-3 text-slate-400" />
                            </div>
                            <div className="w-7 h-7 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                              <span className="text-[10px] font-bold text-blue-600">+8</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">
                            Lượt tải: 0
                          </span>
                        </div>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-blue-600 text-xs font-bold p-0 h-auto hover:no-underline"
                        >
                          Sử dụng ngay
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="mt-6 bg-linear-to-br from-blue-50 to-white border-blue-100">
                    <CardContent className="p-6">
                      <h5 className="text-sm font-bold text-blue-800 mb-4 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Mẹo thiết kế chuyên nghiệp
                      </h5>
                      <ul className="space-y-4">
                        <li className="flex gap-3">
                          <div className="shrink-0 w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                            <ImageIcon className="w-3 h-3" />
                          </div>
                          <p className="text-[11px] text-blue-700 leading-normal">
                            <strong className="block text-slate-900">Ảnh thu nhỏ chất lượng</strong>
                            Sử dụng ảnh 16:9 với độ phân giải cao để tăng tỷ lệ chuyển đổi.
                          </p>
                        </li>
                        <li className="flex gap-3">
                          <div className="shrink-0 w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                            <FileText className="w-3 h-3" />
                          </div>
                          <p className="text-[11px] text-blue-700 leading-normal">
                            <strong className="block text-slate-900">File PDF tối ưu</strong>
                            Nén file PDF để đạt tốc độ tải tốt nhất mà không giảm chất lượng.
                          </p>
                        </li>
                        <li className="flex gap-3">
                          <div className="shrink-0 w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                            <Database className="w-3 h-3" />
                          </div>
                          <p className="text-[11px] text-blue-700 leading-normal">
                            <strong className="block text-slate-900">Kích thước phù hợp</strong>
                            Khuyến nghị file dưới 20MB để tải nhanh và tiết kiệm băng thông.
                          </p>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Preview Modal */}
      <PdfPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        file={pdfFile}
        templateName={templateName}
      />
    </>
  );
};
