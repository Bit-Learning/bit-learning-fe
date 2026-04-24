import React, { useState } from "react";
import { FolderOpen, Sparkles } from "lucide-react";
import { CreateSlideTabV2 } from "./CreateSlideTabV2";
import { MySlidesTabV2 } from "./MySlidesTabV2";
import { DetailModalV2 } from "./DetailModalV2";
import type { SlideGenerationResponse } from "../types/slide.type";
import BitCoinIcon from "@/shared/components/BitCoinIcon";

type TabType = "create" | "my-slides";

export const SlideManagementViewV2: React.FC = () => {
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto p-8">
        <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.14),transparent_38%),linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-6 py-6 md:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                  <Sparkles size={14} />
                  Slide workspace
                </div>
                <h1 className="text-3xl font-bold text-slate-900">Quản lý slide bài giảng</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600 md:text-base">
                  Tạo deck mới với AI hoặc quay lại các bộ slide đã sinh trước đó. Với mỗi thao tác slide được tạo sẽ
                  tốn
                  <span className="ms-1 inline-flex items-center gap-0.5 font-semibold text-amber-700 dark:text-gray-100 whitespace-nowrap">
                    3000
                    <BitCoinIcon size={20} />
                  </span>
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  {activeTab === "create" ? (
                    <>
                      <Sparkles size={16} />
                      Đang ở chế độ tạo mới
                    </>
                  ) : (
                    <>
                      <FolderOpen size={16} />
                      Đang ở thư viện slide
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-8 px-6 pt-5 md:px-8">
            <button
              className={`cursor-pointer border-b-2 pb-4 text-md font-semibold transition-colors ${
                activeTab === "my-slides"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setActiveTab("my-slides")}
            >
              Slide của tôi
            </button>
            <button
              className={`cursor-pointer border-b-2 pb-4 text-md font-semibold transition-colors ${
                activeTab === "create"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setActiveTab("create")}
            >
              Tạo slide mới
            </button>
          </div>
        </div>

        {activeTab === "create" ? (
          <CreateSlideTabV2 />
        ) : (
          <MySlidesTabV2 onViewDetail={openDetailModal} onSwitchToCreate={() => setActiveTab("create")} />
        )}
      </div>

      {showDetailModal && selectedSlide && <DetailModalV2 slide={selectedSlide} onClose={closeDetailModal} />}
    </div>
  );
};
