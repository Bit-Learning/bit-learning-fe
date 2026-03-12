import React from "react";
import { Button } from "@workspace/ui/components/Button";
import { CheckCircle } from "lucide-react";
import OnlineCodeEditor from "./OnlineCodeEditor";

const CodingPracticeSection: React.FC = () => {
  return (
    <section className="py-16 grid lg:grid-cols-5 gap-12 items-center">
      <div className="lg:col-span-2 space-y-6">
        <h3 className="text-4xl font-extrabold text-slate-900">Môi trường luyện Code chuyên nghiệp</h3>
        <p className="text-slate-600 leading-relaxed">
          Trình soạn thảo trực quan, hỗ trợ nhiều ngôn ngữ lập trình như Python, JavaScript, C++ và Scratch. Hệ thống
          chấm điểm tự động thông minh giúp bạn nhận kết quả ngay lập tức.
        </p>
        <ul className="space-y-4">
          <li className="flex items-center gap-3 font-semibold text-slate-700">
            <div className="bg-green-100 text-green-600 p-1 rounded-full">
              <CheckCircle className="w-4 h-4" />
            </div>
            Gợi ý code thông minh
          </li>
          <li className="flex items-center gap-3 font-semibold text-slate-700">
            <div className="bg-green-100 text-green-600 p-1 rounded-full">
              <CheckCircle className="w-4 h-4" />
            </div>
            Thư viện bài tập phong phú
          </li>
          <li className="flex items-center gap-3 font-semibold text-slate-700">
            <div className="bg-green-100 text-green-600 p-1 rounded-full">
              <CheckCircle className="w-4 h-4" />
            </div>
            Chạy code trực tiếp trên trình duyệt
          </li>
        </ul>
        <Button className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-xl">
          Mở AI Lab ngay
        </Button>
      </div>
      <div className="lg:col-span-3">
        <OnlineCodeEditor />
      </div>
    </section>
  );
};

export default CodingPracticeSection;
