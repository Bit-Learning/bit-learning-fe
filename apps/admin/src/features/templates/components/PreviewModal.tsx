import React, { useState } from "react";
import { Eye, X, ChevronLeft, ChevronRight, FileText, Database, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { slideImages } from "../data/templates";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateName?: string;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, templateName }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-slate-900/85 backdrop-blur-sm">
      <Card className="w-full max-w-7xl h-full max-h-225 flex flex-col overflow-hidden border-slate-200 shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Xem trước mẫu: <span className="text-blue-600">{templateName || "Mẫu slide"}</span>
            </h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-slate-100">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
          <div className="flex-1 relative flex items-center justify-center px-12">
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-6 z-10 w-12 h-12 rounded-full shadow-lg hover:bg-blue-600 hover:text-white border-slate-200"
              onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
              disabled={currentSlide === 0}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-6 z-10 w-12 h-12 rounded-full shadow-lg hover:bg-blue-600 hover:text-white border-slate-200"
              onClick={() => setCurrentSlide(Math.min(slideImages.length - 1, currentSlide + 1))}
              disabled={currentSlide === slideImages.length - 1}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
            <div className="w-full max-w-240 aspect-video bg-white rounded-xl overflow-hidden shadow-2xl border border-slate-200 relative">
              <img alt="Main Slide Preview" className="w-full h-full object-cover" src={slideImages[currentSlide]} />
              <Badge className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md text-white border-0">
                Slide {currentSlide + 1} / {slideImages.length}
              </Badge>
            </div>
          </div>

          <div className="h-32 bg-white border-t border-slate-200 px-6 flex items-center overflow-x-auto gap-4 py-4">
            {slideImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`shrink-0 w-40 aspect-video rounded-lg overflow-hidden border-2 cursor-pointer transition-all relative ${
                  idx === currentSlide
                    ? "border-blue-600 ring-2 ring-blue-600/20"
                    : "border-transparent hover:border-slate-300 opacity-60 hover:opacity-100"
                }`}
              >
                <img alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" src={img} />
                {idx === currentSlide && <div className="absolute inset-0 bg-blue-600/10" />}
              </button>
            ))}
          </div>
        </div>

        <div className="px-8 py-5 border-t border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Định dạng</p>
                <p className="text-sm font-semibold text-slate-900">Powerpoint (.pptx)</p>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Dung lượng</p>
                <p className="text-sm font-semibold text-slate-900">12.4 MB</p>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Số trang</p>
                <p className="text-sm font-semibold text-slate-900">24 layouts</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20">
              <CheckCircle className="w-4 h-4 mr-2" />
              Sử dụng mẫu này
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
