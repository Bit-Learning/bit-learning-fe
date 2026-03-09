import React, { useState } from "react";
import { CreateSlideTab } from "./CreateSlideTab";
import { Slide, TabType } from "../types/slide.type";
import { MySlidesTab } from "./MySlidesTab";
import { DetailModal } from "./DetailModal";

interface SlideManagementViewProps {
  instructorId: number;
}

export const SlideManagementView: React.FC<SlideManagementViewProps> = ({ instructorId }) => {
  const [activeTab, setActiveTab] = useState<TabType>("create");
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const openDetailModal = (slide: Slide) => {
    setSelectedSlide(slide);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedSlide(null);
  };

  const handleGenerateSlide = (data: any) => {
    console.log("Generating slides for instructor:", instructorId);
    console.log("Slide data:", data);
  };

  return (
    <div className="bg-background-light text-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 border-b border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Quản lý Slide bài giảng</h1>
          </div>
          <div className="flex gap-8">
            <button
              className={`pb-4 border-b-2 font-semibold text-sm transition-colors ${
                activeTab === "create"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setActiveTab("create")}
            >
              Tạo Slide mới
            </button>
            <button
              className={`pb-4 border-b-2 font-semibold text-sm transition-colors ${
                activeTab === "my-slides"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setActiveTab("my-slides")}
            >
              Slide của tôi
            </button>
          </div>
        </div>

        {activeTab === "create" ? (
          <CreateSlideTab instructorId={instructorId} onGenerateSlide={handleGenerateSlide} />
        ) : (
          <MySlidesTab
            instructorId={instructorId}
            onViewDetail={openDetailModal}
            onSwitchToCreate={() => setActiveTab("create")}
          />
        )}
      </div>

      {showDetailModal && selectedSlide && <DetailModal slide={selectedSlide} onClose={closeDetailModal} />}
    </div>
  );
};
