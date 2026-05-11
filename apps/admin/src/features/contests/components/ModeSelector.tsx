import { ArrowLeft, FilePlus2, Library } from "lucide-react";

interface ModeSelectorProps {
  onSelect: (mode: "existing" | "create") => void;
  onBack: () => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelect, onBack }) => (
  <div className="flex flex-col h-screen bg-gray-50">
    <div className="px-8 py-5 bg-white border-b border-gray-200 flex items-center gap-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại
      </button>
      <span className="text-gray-300">|</span>
      <h1 className="text-lg font-bold text-gray-900">Thêm bài tập vào kỳ thi</h1>
    </div>

    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bạn muốn thêm bài tập theo cách nào?</h2>
          <p className="text-gray-500 text-sm">Chọn từ ngân hàng bài tập sẵn có hoặc tạo bài toán mới cho kỳ thi này</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <button
            onClick={() => onSelect("existing")}
            className="group relative bg-white border-2 border-gray-200 hover:border-primary rounded-2xl p-8 text-left transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="w-14 h-14 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center mb-5 transition-colors">
              <Library className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Chọn bài có sẵn</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Tìm kiếm và thêm từ ngân hàng bài tập đã có trong hệ thống
            </p>
            <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-gray-100 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-all">
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </div>
          </button>

          <button
            onClick={() => onSelect("create")}
            className="group relative bg-white border-2 border-gray-200 hover:border-orange-400 rounded-2xl p-8 text-left transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="w-14 h-14 rounded-xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center mb-5 transition-colors">
              <FilePlus2 className="w-7 h-7 text-orange-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Tạo bài mới</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Soạn đề bài, thêm test case và tự động tạo code template cho bài toán mới
            </p>
            <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-gray-100 group-hover:bg-orange-400 group-hover:text-white flex items-center justify-center transition-all">
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
);
