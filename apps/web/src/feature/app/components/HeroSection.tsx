import React from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { ArrowRight } from "lucide-react";
import CodeEditorPreview from "./CodeEditorPreview";

const HeroSection: React.FC = () => {
  return (
    <section className="py-12 lg:py-20 grid lg:grid-cols-2 gap-12 items-center">
      <div className="space-y-8">
        <Badge className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#137fec]/10 text-[#137fec] text-xs font-bold uppercase tracking-wider border-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#137fec] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#137fec]" />
          </span>
          Nền tảng học lập trình số 1 cho K-12
        </Badge>
        <h2 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] text-slate-900">
          Khám Phá Thế Giới <span className="text-[#137fec] italic">Lập Trình</span>
        </h2>
        <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
          Xây dựng kỹ năng tương lai cùng lộ trình học tập được cá nhân hóa, kết hợp giữa tư duy logic, trò chơi và trí
          tuệ nhân tạo.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link to="/courses">
            <Button className="px-8 py-4 bg-[#137fec] hover:bg-[#137fec]/90 text-white rounded-xl font-bold text-lg flex items-center gap-2 group transition-all transform hover:-translate-y-1">
              Bắt đầu học ngay
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-4 pt-4">
          <div className="flex -space-x-3">
            <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
              <img
                className="w-full h-full object-cover"
                alt="Student avatar"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-1jf0tv3n3b_laS8jbXy_mzNbi6zdUUO3P6H-TQ8NdCSI0ClNr2T9TUgekKxQY8cc8sZ79cR_rhldDZQiBXSpPdC47sVrBAOJD9AklM3FRUOn8n8jquUBkdmJS7UGB6xrKs2yENeXyCkkguKlE5DBXovrq27ytIbo-27vKpR1R_2rXkJOjRBxHeYVmcQEqPy-N6OCvrnV75rlckB0Mta2cay8QkoGpFdzb-EK4IXWdDR1DmY2sOwWxA6ABvrFFCIck3Pj_IVoRmM"
              />
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
              <img
                className="w-full h-full object-cover"
                alt="Student avatar"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDilz3TUdy-dz42VEusSZzAd00KdjdeumMxXMImHQSrwk_x6ysT-S63vuI3qEju3MaLp_DBD7yxcBFpbvxOjmVA_S2zRxPYMmsH-fpsqIJfpLebPtiUNTiCJBWKFS064Ih41D5yObDO3mmA27N2edR-BN-YrS2gopJmPldOM5a_KUQvKPCVG5yOBIU7lSwh4cr79bFIgCJm2DKmqvH2Zoqycg-R4ki85ctQ51UpGXECWrpxND_N_qJRZlVFVy_xHg4iETOjW4Y_y3A"
              />
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
              <img
                className="w-full h-full object-cover"
                alt="Student avatar"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBiSePN4-jkTXmBTM2QHOwpn2pgQsv96Pae8vSkYYQguVY6zu1kPfDk6q1rpb915r8a5--_ym1gZFuOEWwpCJzWzd2VvBt_qGZeIueGMOtV4UuhLEBfHg-Bu34q9xrUcOTuQ73xUBUNijG0gKDh0SOTZx_GGdzY3v1TgAfBVWQ6EFtKdSt6Jm_KnXtbeDqHcfPOnvlMnwdgGv-L8H1NVTixat0FSvgiSDm7N_i8GSuaCbuHI5WzOija796W5SEtwVIChhKn2Dek-I"
              />
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-white bg-[#137fec] flex items-center justify-center text-white text-[10px] font-bold">
              +10k
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium">Hơn 10,000 học sinh đang tham gia mỗi ngày</p>
        </div>
      </div>
      <CodeEditorPreview />
    </section>
  );
};

export default HeroSection;
