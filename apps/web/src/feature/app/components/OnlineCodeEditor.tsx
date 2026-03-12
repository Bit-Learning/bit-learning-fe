import React from "react";
import { Button } from "@workspace/ui/components/Button";
import { Play, Save, Folder, Code, Settings } from "lucide-react";

const OnlineCodeEditor: React.FC = () => {
  return (
    <div className="bg-[#1e1e1e] rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
      <div className="bg-[#2d2d2d] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-xs text-slate-400 font-mono tracking-wider ml-2 uppercase">Online Code Editor</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="p-1.5 bg-[#137fec] text-white rounded hover:bg-[#137fec]/90 h-auto">
            <Play className="w-4 h-4" />
          </Button>
          <Button size="sm" className="p-1.5 bg-slate-600 text-white rounded hover:bg-slate-500 h-auto">
            <Save className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-12 h-87.5">
        <div className="col-span-1 border-r border-slate-800 flex flex-col items-center py-4 gap-4 text-slate-500">
          <Folder className="w-5 h-5" />
          <Code className="w-5 h-5 text-[#137fec]" />
          <Settings className="w-5 h-5" />
        </div>
        <div className="col-span-11 p-6 font-mono text-sm leading-relaxed overflow-hidden">
          <div className="flex gap-4 mb-1">
            <span className="text-slate-600">1</span>
            <span className="text-slate-300"># Thử thách: Vẽ hình vuông bằng Python</span>
          </div>
          <div className="flex gap-4 mb-1">
            <span className="text-slate-600">2</span>
            <span>
              <span className="text-purple-400">import</span> turtle
            </span>
          </div>
          <div className="flex gap-4 mb-1">
            <span className="text-slate-600">3</span>
            <span>
              <span className="text-blue-400">t</span> = turtle.<span className="text-yellow-300">Turtle</span>()
            </span>
          </div>
          <div className="flex gap-4 mb-1">
            <span className="text-slate-600">4</span>
            <span>
              <span className="text-blue-400">t</span>.<span className="text-yellow-300">color</span>(
              <span className="text-green-300">"blue"</span>)
            </span>
          </div>
          <div className="flex gap-4 mb-1">
            <span className="text-slate-600">5</span>
            <span></span>
          </div>
          <div className="flex gap-4 mb-1">
            <span className="text-slate-600">6</span>
            <span>
              <span className="text-purple-400">for</span> _ <span className="text-purple-400">in</span>{" "}
              <span className="text-yellow-300">range</span>(<span className="text-orange-300">4</span>):
            </span>
          </div>
          <div className="flex gap-4 mb-1">
            <span className="text-slate-600">7</span>
            <span className="ml-4">
              <span className="text-blue-400">t</span>.<span className="text-yellow-300">forward</span>(
              <span className="text-orange-300">100</span>)
            </span>
          </div>
          <div className="flex gap-4 mb-1">
            <span className="text-slate-600">8</span>
            <span className="ml-4">
              <span className="text-blue-400">t</span>.<span className="text-yellow-300">right</span>(
              <span className="text-orange-300">90</span>)
            </span>
          </div>
          <div className="flex gap-4">
            <span className="text-slate-600">9</span>
            <span className="animate-pulse bg-[#137fec]/40 w-2 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineCodeEditor;
