import React from "react";
import { CheckCircle, Loader2, X } from "lucide-react";
import { convertLevelToVietnamese } from "../utils/courses.utils";

interface PublishConfirmModalProps {
  course: {
    title: string;
    subtitle?: string;
    price: number;
    level: string;
    grade: number;
  };
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const PublishConfirmModal: React.FC<PublishConfirmModalProps> = ({ course, isPending, onConfirm, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isPending && onClose()} />
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Xuất bản khóa học</h2>
        <button
          onClick={onClose}
          disabled={isPending}
          className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-4 p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
        <p className="font-semibold text-gray-900 text-md">{course.title}</p>
        <div className="flex items-center gap-3 pt-1 flex-wrap">
          <span className="text-sm text-gray-500">
            Cấp độ: <span className="font-medium text-gray-700">{convertLevelToVietnamese(course.level)}</span>
          </span>
          <span className="text-gray-300">·</span>
          <span className="text-sm text-gray-500">
            Lớp: <span className="font-medium text-gray-700">{course.grade}</span>
          </span>
          <span className="text-gray-300">·</span>
          <span className="text-sm text-gray-500">
            Giá:{" "}
            <span className="font-medium text-blue-600">
              {course.price === 0 ? "Miễn phí" : `${course.price.toLocaleString("vi-VN")} ₫`}
            </span>
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-5">Sau khi xuất bản, khóa học sẽ hiển thị công khai với học viên.</p>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          disabled={isPending}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Huỷ
        </button>
        <button
          onClick={onConfirm}
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Xác nhận xuất bản
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);

export default PublishConfirmModal;
