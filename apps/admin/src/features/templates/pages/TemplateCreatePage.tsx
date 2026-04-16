import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FileText, Upload, ImageIcon, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCreateTemplate } from "../queries/useTemplate";

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
  const [pptxFile, setPdfFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
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
        if (!value.name.match(/\.(pptx)$/i)) return "File phải có định dạng PPTX";
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

    const fileError = validateField("templateFile", pptxFile);
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
        if (pptxFile) error = validateField("templateFile", pptxFile);
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

    if (!pptxFile) {
      return;
    }

    createTemplate.mutate(
      {
        name: templateName,
        description: description || undefined,
        templateFile: pptxFile,
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
            <nav className="flex text-md text-slate-500 mb-1">
              <button onClick={() => navigate({ to: "/templates" })} className="hover:text-blue-600 transition-colors">
                Quản lý Mẫu Slide
              </button>
              <span className="mx-2">/</span>
              <span className="text-slate-900 font-medium">Tạo mẫu mới</span>
            </nav>
            <h2 className="text-xl font-bold text-slate-900">Thêm Mẫu Bài Giảng</h2>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className=" space-y-6">
              {hasErrors && touched.name && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Vui lòng kiểm tra lại các trường thông tin bị lỗi bên dưới.</AlertDescription>
                </Alert>
              )}

              <Card className="border-slate-200 shadow-sm py-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-lg text-slate-900">Thông tin mẫu</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-md font-semibold mb-2 text-slate-900">
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
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-md font-semibold mb-2 text-slate-900">Mô tả chi tiết</label>
                      <Textarea
                        value={description}
                        onChange={(e) => handleDescriptionChange(e.target.value)}
                        onBlur={() => handleBlur("description")}
                        placeholder="Nhập mô tả về cấu trúc hoặc nội dung của mẫu slide này..."
                        className={`min-h-37.5 resize-y border-slate-300 focus-visible:ring-blue-500/20 focus-visible:border-blue-600 ${
                          errors.description && touched.description ? "border-red-500 focus-visible:border-red-500" : ""
                        }`}
                      />
                      {errors.description && touched.description && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm py-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Upload className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-lg text-slate-900">Tải lên tệp tin</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-md font-semibold mb-3 text-slate-900">
                        Tệp tin PPTX<span className="text-red-500">*</span>
                      </label>
                      <div
                        className={`relative group border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                          errors.templateFile && touched.templateFile
                            ? "border-red-500 bg-red-50/50"
                            : "border-slate-300 hover:border-blue-600 hover:bg-blue-50/50"
                        }`}
                      >
                        <input
                          accept=".pptx,.pptx"
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
                        <p className="text-md font-medium text-slate-900">
                          {pptxFile ? pptxFile.name : "Kéo thả hoặc bấm để tải lên"}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">Hỗ trợ PPTX (Max 50MB)</p>
                        {pptxFile && (
                          <p className="text-sm text-green-600 mt-2 font-medium">
                            ✓ File đã chọn: {(pptxFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        )}
                      </div>
                      {errors.templateFile && touched.templateFile && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.templateFile}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-md font-semibold mb-3 text-slate-900">Ảnh thu nhỏ (Thumbnail)</label>
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
                        <p className="text-md font-medium text-slate-900">
                          {thumbnailFile ? thumbnailFile.name : "Tải lên hình ảnh xem trước"}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">PNG, JPG tỉ lệ 16:9 (Max 5MB)</p>
                        {thumbnailFile && (
                          <p className="text-sm text-green-600 mt-2 font-medium">
                            ✓ Ảnh đã chọn: {(thumbnailFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        )}
                      </div>
                      {errors.thumbnailFile && touched.thumbnailFile && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.thumbnailFile}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm py-0">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base leading-tight text-slate-900">Trạng thái kích hoạt</h3>
                      <p className="text-md text-slate-500">Cho phép sử dụng mẫu này ngay lập tức</p>
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
                  className="bg-primary hover:bg-blue-700 shadow-lg shadow-blue-500/40"
                  onClick={handleSubmit}
                  disabled={createTemplate.isPending}
                >
                  {createTemplate.isPending ? "Đang tạo..." : "Tạo template"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};
