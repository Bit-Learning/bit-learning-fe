import { Bot } from "lucide-react";

const CodeEditorPreview = () => {
  return (
    <div className="relative">
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#ff8c42]/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#137fec]/10 rounded-full blur-3xl"></div>
      <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-slate-900 p-2 border-4 border-slate-800">
        <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 rounded-t-lg">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
          </div>
          <div className="ml-4 px-3 py-0.5 rounded bg-slate-700 text-[10px] text-slate-400 font-mono">
            Bitlearning-main.py
          </div>
        </div>
        <div className="p-6 font-mono text-sm leading-relaxed overflow-hidden">
          <p>
            <span className="text-purple-400">import</span> Bitlearning_core
          </p>
          <p className="mt-2 text-slate-400"># Khởi tạo robot AI hỗ trợ</p>
          <p>
            <span className="text-blue-400">bot</span> = Bitlearning_core.
            <span className="text-yellow-300">AIAssistant</span>(
            <span className="text-green-300">"Bitlearning Bot"</span>)
          </p>
          <p className="mt-4">
            <span className="text-purple-400">def</span> <span className="text-yellow-300">kham_pha_the_gioi</span>():
          </p>
          <p className="ml-4">
            <span className="text-blue-400">skill</span> = <span className="text-green-300">"Lập trình"</span>
          </p>
          <p className="ml-4">
            <span className="text-purple-400">for</span> level <span className="text-purple-400">in</span>{" "}
            <span className="text-yellow-300">range</span>(<span className="text-orange-300">1, 13</span>):
          </p>
          <p className="ml-8">
            <span className="text-blue-400">bot</span>.<span className="text-yellow-300">support</span>(student, level)
          </p>
          <p className="ml-8">
            <span className="text-yellow-300">print</span>(
            <span className="text-green-300">
              f"Bạn đang ở level {"{"}level{"}"}!"
            </span>
            )
          </p>
          <p className="mt-4 text-[#137fec] font-bold animate-pulse">_</p>
        </div>
        <div className="absolute bottom-4 right-4 bg-white p-3 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3">
          <div className="w-12 h-12 bg-[#137fec]/20 rounded-lg flex items-center justify-center">
            <Bot className="w-6 h-6 text-[#137fec]" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Trạng thái Bot</p>
            <p className="text-sm font-bold text-slate-800">Sẵn sàng hỗ trợ!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditorPreview;
