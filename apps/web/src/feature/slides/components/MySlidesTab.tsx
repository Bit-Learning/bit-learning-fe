import React, { useState } from "react";
import {
  Search,
  Plus,
  Download,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Code,
  Database,
  Binary,
  Cpu,
} from "lucide-react";
import { Slide, FILTER_GRADE_OPTIONS, GRADE_COLOR_MAP } from "../types/slide.type";

interface MySlidesTabProps {
  instructorId: number;
  onViewDetail: (slide: Slide) => void;
  onSwitchToCreate: () => void;
}

const mockSlides: Slide[] = [
  {
    id: "1",
    topic: "Lập trình Pascal cơ bản",
    grade: "Lớp 8",
    slideCount: 12,
    createdDate: "01/12/2025",
    template: "Mẫu xanh dương",
    icon: <Code size={20} />,
    iconColor: "bg-blue-100 text-blue-600",
    hasExamples: true,
    hasExercises: true,
  },
  {
    id: "2",
    topic: "Cấu trúc dữ liệu Stack và Queue",
    grade: "Lớp 11",
    slideCount: 15,
    createdDate: "28/11/2025",
    template: "Mẫu giáo dục",
    icon: <Database size={20} />,
    iconColor: "bg-green-100 text-green-600",
    hasExamples: true,
    hasExercises: false,
  },
  {
    id: "3",
    topic: "Thuật toán sắp xếp",
    grade: "Lớp 10",
    slideCount: 18,
    createdDate: "25/11/2025",
    template: "Mẫu hiện đại",
    icon: <Binary size={20} />,
    iconColor: "bg-purple-100 text-purple-600",
    hasExamples: false,
    hasExercises: true,
  },
  {
    id: "4",
    topic: "Kiến trúc máy tính",
    grade: "Lớp 12",
    slideCount: 20,
    createdDate: "20/11/2025",
    template: "Mẫu sáng tạo",
    icon: <Cpu size={20} />,
    iconColor: "bg-orange-100 text-orange-600",
    hasExamples: true,
    hasExercises: true,
  },
  {
    id: "5",
    topic: "Giới thiệu về Scratch",
    grade: "Lớp 3",
    slideCount: 10,
    createdDate: "15/11/2025",
    template: "Mẫu giáo dục",
    icon: <Code size={20} />,
    iconColor: "bg-pink-100 text-pink-600",
    hasExamples: true,
    hasExercises: true,
  },
  {
    id: "6",
    topic: "Lập trình Python căn bản",
    grade: "Lớp 9",
    slideCount: 16,
    createdDate: "10/11/2025",
    template: "Mẫu xanh dương",
    icon: <Code size={20} />,
    iconColor: "bg-emerald-100 text-emerald-600",
    hasExamples: true,
    hasExercises: false,
  },
];

export const MySlidesTab: React.FC<MySlidesTabProps> = ({ instructorId, onViewDetail, onSwitchToCreate }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGrade, setFilterGrade] = useState("all");

  const filteredSlides = mockSlides.filter((slide) => {
    const matchesSearch = slide.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = filterGrade === "all" || slide.grade === filterGrade;
    return matchesSearch && matchesGrade;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all outline-none"
            placeholder="Tìm kiếm theo chủ đề..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select
            className="px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none min-w-30"
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
          >
            {FILTER_GRADE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            onClick={onSwitchToCreate}
          >
            <Plus size={20} />
            Tạo mới
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Chủ đề</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">
                  Lớp
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">
                  Số Slide
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Ngày tạo</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSlides.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Search size={48} className="mb-3 opacity-30" />
                      <p className="text-sm font-medium">Không tìm thấy slide nào</p>
                      <p className="text-xs mt-1">Thử tìm kiếm với từ khóa khác</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSlides.map((slide) => (
                  <tr key={slide.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded flex items-center justify-center ${slide.iconColor}`}>
                          {slide.icon}
                        </div>
                        <span className="font-medium text-slate-900">{slide.topic}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${GRADE_COLOR_MAP[slide.grade]}`}
                      >
                        {slide.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600">{slide.slideCount} slide</td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{slide.createdDate}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-all"
                          title="Download PPTX"
                          onClick={() => alert(`Downloading ${slide.topic}.pptx`)}
                        >
                          <Download size={20} />
                        </button>
                        <button
                          className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-all"
                          title="Xem chi tiết"
                          onClick={() => onViewDetail(slide)}
                        >
                          <Eye size={20} />
                        </button>
                        <button
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Xóa"
                          onClick={() => {
                            if (confirm(`Bạn có chắc muốn xóa slide "${slide.topic}"?`)) {
                              alert(`Đã xóa slide: ${slide.topic}`);
                            }
                          }}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredSlides.length > 0 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <ChevronLeft size={20} />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-white font-medium shadow-lg shadow-blue-500/30">
            1
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors">
            2
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors">
            3
          </button>
          <span className="px-2 text-slate-400">...</span>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors">
            10
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};
