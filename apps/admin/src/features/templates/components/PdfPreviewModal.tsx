import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, FileText, Database, Loader2, AlertCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
  templateName?: string;
}

interface PageInfo {
  image: string;
  pageNumber: number;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({ isOpen, onClose, file, templateName }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (!isOpen || !file) {
      setPages([]);
      setError(null);
      setCurrentPage(0);
      setLoadingProgress(0);
      return;
    }

    loadPdfPreview();
  }, [isOpen, file]);

  const loadPdfPreview = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setLoadingProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();

      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      const pageImages: PageInfo[] = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        setLoadingProgress(Math.round((pageNum / numPages) * 100));

        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        }).promise;

        const imageDataUrl = canvas.toDataURL("image/png");

        pageImages.push({
          image: imageDataUrl,
          pageNumber: pageNum,
        });
      }

      setPages(pageImages);
      setLoadingProgress(100);
    } catch (err) {
      console.error("Error loading PDF:", err);
      setError("Không thể tải preview. Vui lòng kiểm tra lại file PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(pages.length - 1, prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrevPage();
    if (e.key === "ArrowRight") handleNextPage();
    if (e.key === "Escape") onClose();
  };

  if (!isOpen) return null;

  const fileSize = file ? (file.size / (1024 * 1024)).toFixed(1) : "0";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-slate-900/85 backdrop-blur-sm"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <Card className="w-full max-w-7xl h-full max-h-225 flex flex-col overflow-hidden border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Xem trước mẫu: <span className="text-blue-600">{templateName || file?.name || "Mẫu slide"}</span>
              </h3>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-900/50">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-300 font-medium">Đang tải preview...</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Đang xử lý file PDF ({loadingProgress}%)
                </p>
                {loadingProgress > 0 && (
                  <div className="w-64 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-3 mx-auto">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${loadingProgress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <Alert variant="destructive" className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          ) : pages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-300 font-medium">Chưa có preview</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">File PDF sẽ được hiển thị tại đây</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 relative flex items-center justify-center px-12 pb-4">
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-6 z-10 w-12 h-12 rounded-full shadow-lg hover:bg-blue-600 hover:text-white border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>

                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-6 z-10 w-12 h-12 rounded-full shadow-lg hover:bg-blue-600 hover:text-white border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleNextPage}
                  disabled={currentPage === pages.length - 1}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>

                <div className="w-full max-w-240 aspect-video bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 relative flex items-center justify-center">
                  <img
                    alt={`Page ${currentPage + 1}`}
                    className="max-w-full max-h-full object-contain"
                    src={pages[currentPage]?.image}
                  />
                  <Badge className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md text-white border-0 px-4 py-1.5 text-xs font-medium">
                    Trang {currentPage + 1} / {pages.length}
                  </Badge>
                </div>
              </div>

              <div className="h-28 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 flex items-center overflow-x-auto gap-2.5 py-3 custom-scrollbar mt-2">
                {pages.map((page, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx)}
                    className={`shrink-0 w-36 aspect-video rounded-lg overflow-hidden border-2 cursor-pointer transition-all relative group ${
                      idx === currentPage
                        ? "border-blue-600 ring-2 ring-blue-600/20 shadow-lg"
                        : "border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md"
                    }`}
                  >
                    <img
                      alt={`Thumb ${idx + 1}`}
                      className={`w-full h-full object-contain bg-slate-50 dark:bg-slate-800 transition-all ${
                        idx === currentPage ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                      }`}
                      src={page.image}
                    />
                    {idx === currentPage && <div className="absolute inset-0 bg-blue-600/5 pointer-events-none" />}
                    <div
                      className={`absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        idx === currentPage
                          ? "bg-blue-600 text-white"
                          : "bg-black/60 text-white group-hover:bg-blue-600"
                      }`}
                    >
                      {idx + 1}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="px-8 py-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                  Định dạng
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">PDF Document</p>
              </div>
            </div>

            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />

            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                  Dung lượng
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{fileSize} MB</p>
              </div>
            </div>

            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />

            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                  Số trang
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{pages.length} trang</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onClose} className="px-6 py-2.5 text-sm font-semibold">
              Đóng
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
