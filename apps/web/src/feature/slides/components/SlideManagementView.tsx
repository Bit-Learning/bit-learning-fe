import React, { useState } from "react";
import { CreateSlideTab } from "./CreateSlideTab";
import { MySlidesTab } from "./MySlidesTab";
import { DetailModal } from "./DetailModal";
import type { SlideGenerationResponse } from "../types/slide.type";

type TabType = "create" | "my-slides";

export const SlideManagementView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("my-slides");
  const [selectedSlide, setSelectedSlide] = useState<SlideGenerationResponse | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const openDetailModal = (slide: SlideGenerationResponse) => {
    setSelectedSlide(slide);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedSlide(null);
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      <div className="p-8 mx-auto">
        <div className="mb-8 border-b border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Quản lý Slide bài giảng</h1>
          </div>
          <div className="flex gap-8">
            <button
              className={`cursor-pointer pb-4 border-b-2 font-semibold text-md transition-colors ${
                activeTab === "my-slides"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setActiveTab("my-slides")}
            >
              Slide của tôi
            </button>
            <button
              className={`cursor-pointer pb-4 border-b-2 font-semibold text-md transition-colors ${
                activeTab === "create"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setActiveTab("create")}
            >
              Tạo Slide mới
            </button>
          </div>
        </div>

        {activeTab === "create" ? (
          <CreateSlideTab />
        ) : (
          <MySlidesTab onViewDetail={openDetailModal} onSwitchToCreate={() => setActiveTab("create")} />
        )}
      </div>

      {showDetailModal && selectedSlide && <DetailModal slide={selectedSlide} onClose={closeDetailModal} />}
    </div>
  );
};
