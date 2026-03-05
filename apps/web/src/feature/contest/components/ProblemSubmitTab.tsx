import React, { useState } from "react";
import {
  FileCode,
  Upload,
  Play,
  Rocket,
  X,
  Settings,
  Maximize2,
  Terminal,
  Trash2,
  Info,
  ChevronDown,
} from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { Language } from "../types/contest.type";
import { useSubmitSolution } from "../queries/useContest";
import { useParams } from "@tanstack/react-router";

type SubmitMode = "editor" | "file";

interface ProblemSubmitTabProps {
  contestProblemId: string;
}

export const ProblemSubmitTab: React.FC<ProblemSubmitTabProps> = ({ contestProblemId }) => {
  const { id } = useParams({ strict: false });
  const { mutate: submitSolution, isPending } = useSubmitSolution();

  const [mode, setMode] = useState<SubmitMode>("editor");
  const [language, setLanguage] = useState<Language>(Language.PYTHON);
  const [code, setCode] = useState(`def two_sum(nums, target):
    # Dùng hash map để tối ưu thời gian tìm kiếm O(n)
    hash_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in hash_map:
            return [hash_map[complement], i]
        hash_map[num] = i
    return []

# Đọc input từ stdin
line1 = input().split()
n, target = int(line1[0]), int(line1[1])
nums = list(map(int, input().split()))
result = two_sum(nums, target)
print(f"{result[0]} {result[1]}")`);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showTestResult, setShowTestResult] = useState(false);

  const languageOptions = [
    { value: Language.PYTHON, label: "Python 3.10" },
    { value: Language.CPP, label: "C++ 17 (G++ 9.2)" },
    { value: Language.JAVA, label: "Java 11 (OpenJDK)" },
    { value: Language.JAVASCRIPT, label: "JavaScript (Node.js 16)" },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  const handleSubmit = () => {
    if (!id) return;

    if (mode === "editor") {
      submitSolution({
        contestId: id,
        request: {
          contestProblemId,
          language,
          sourceCode: code,
        },
      });
    } else if (uploadedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        submitSolution({
          contestId: id,
          request: {
            contestProblemId,
            language,
            sourceCode: content,
          },
        });
      };
      reader.readAsText(uploadedFile);
    }
  };

  const handleRunTest = () => {
    setShowTestResult(true);
  };

  const getFileExtension = (lang: Language) => {
    switch (lang) {
      case Language.PYTHON:
        return ".py";
      case Language.CPP:
        return ".cpp";
      case Language.JAVA:
        return ".java";
      case Language.JAVASCRIPT:
        return ".js";
      case Language.C:
        return ".c";
      default:
        return ".txt";
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-200/80 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setMode("editor")}
              className={`flex items-center cursor-pointer gap-2 py-2 px-4 rounded-md font-bold text-xs transition-all ${
                mode === "editor"
                  ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
              }`}
            >
              <FileCode className="w-4 h-4" />
              Soạn thảo
            </button>
            <button
              onClick={() => setMode("file")}
              className={`flex items-center cursor-pointer gap-2 py-2 px-4 rounded-md font-bold text-xs transition-all ${
                mode === "file"
                  ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
              }`}
            >
              <Upload className="w-4 h-4" />
              Nộp file
            </button>
          </div>

          <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />

          <div className="relative group">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 pr-8 text-xs font-bold focus:ring-2 focus:ring-primary outline-none cursor-pointer"
            >
              {languageOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 w-4 h-4" />
          </div>
        </div>

        {mode === "editor" && (
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Đã lưu tự động
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden px-4 pb-4">
        {mode === "editor" ? (
          <div className="flex-1 flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl bg-[#0d1117] overflow-hidden shadow-2xl">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <span className="ml-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <FileCode className="w-3 h-3" />
                  solution{getFileExtension(language)}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button className="text-slate-500 hover:text-white transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
                <button className="text-slate-500 hover:text-white transition-colors">
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 relative font-mono text-sm overflow-hidden flex">
              <div className="w-12 bg-slate-900/50 text-slate-600 text-right pr-3 py-4 select-none border-r border-slate-800/50 text-xs leading-5">
                {Array.from({ length: 20 }, (_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <div className="flex-1 relative">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="absolute inset-0 w-full h-full bg-transparent text-slate-300 p-4 resize-none outline-none focus:ring-0 placeholder-slate-600 caret-primary leading-5"
                  spellCheck={false}
                  placeholder="// Viết code của bạn ở đây..."
                />
              </div>
            </div>

            {showTestResult && (
              <div className="h-1/3 min-h-30 bg-[#090c10] border-t border-slate-800 flex flex-col shrink-0">
                <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <Terminal className="w-4 h-4" />
                    Kết quả chạy thử
                  </div>
                  <button onClick={() => setShowTestResult(false)} className="text-slate-500 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2">
                  <div className="flex gap-4">
                    <span className="text-green-500 font-bold">CASE 1:</span>
                    <span className="text-slate-400">Input: 4 9 [2, 7, 11, 15]</span>
                    <span className="text-green-400">Output: 0 1 (Chính xác)</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-green-500 font-bold">CASE 2:</span>
                    <span className="text-slate-400">Input: 3 6 [3, 2, 4]</span>
                    <span className="text-green-400">Output: 1 2 (Chính xác)</span>
                  </div>
                  <div className="pt-2 text-slate-500">&gt; Execution time: 12ms | Memory: 4.2MB</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <label
                htmlFor="file-upload"
                className="w-full max-w-2xl aspect-video border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-4 bg-slate-50/50 dark:bg-slate-800/20 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    Kéo thả file code tại đây hoặc click để chọn
                  </p>
                  <p className="text-sm text-slate-500 mt-1">Dung lượng tối đa: 10MB</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  <Badge className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {getFileExtension(language)}
                  </Badge>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept={getFileExtension(language)}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {uploadedFile && (
                <div className="w-full max-w-2xl mt-6">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                        <FileCode className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {uploadedFile.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {(uploadedFile.size / 1024).toFixed(1)} KB • Code File
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="h-48 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900/50">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <Terminal className="w-4 h-4" />
                  Kết quả chạy thử
                </div>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2">
                <div className="text-slate-400 italic">
                  Sẵn sàng nộp bài. Vui lòng chọn file và nhấn "Chạy thử" hoặc "Gửi bài làm".
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
            {mode === "editor" ? (
              <></>
            ) : (
              <span className="flex items-center gap-1">
                <Info className="w-4 h-4" />
                File nộp phải thuộc định dạng {getFileExtension(language)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleRunTest}
              isDisabled={isPending}
              className="flex-1 sm:flex-none px-6 py-5 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-sm bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 text-slate-500" />
              Chạy thử
            </Button>
            <Button
              onClick={handleSubmit}
              isDisabled={isPending || (mode === "file" && !uploadedFile)}
              className="flex-1 sm:flex-none px-8 py-5 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Rocket className="w-5 h-5" />
              {isPending ? "Đang gửi..." : "Gửi bài làm"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
