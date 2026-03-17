import React, { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { Send, Code, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { useSubmitSolution } from "../queries/useContest";
import { Language } from "../types/contest.type";

interface ProblemSubmitTabProps {
  contestProblemId: string;
}

export const ProblemSubmitTab: React.FC<ProblemSubmitTabProps> = ({ contestProblemId }) => {
  const { id: contestId } = useParams({ strict: false });
  const [language, setLanguage] = useState<Language>(Language.PYTHON);
  const [sourceCode, setSourceCode] = useState("");

  const submitMutation = useSubmitSolution();

  const handleSubmit = () => {
    if (!sourceCode.trim() || !contestId) return;

    submitMutation.mutate({
      contestId,
      request: {
        contestProblemId,
        language,
        sourceCode,
      },
    });
  };

  const getLanguageLabel = (lang: Language): string => {
    const labels: Record<Language, string> = {
      [Language.PYTHON]: "Python 3.10",
      [Language.CPP]: "C++ 17",
      [Language.C]: "C 11",
      [Language.JAVA]: "Java 17",
      [Language.JAVASCRIPT]: "JavaScript (Node.js)",
    };
    return labels[lang];
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Ngôn ngữ lập trình</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.values(Language).map((lang) => (
                  <option key={lang} value={lang}>
                    {getLanguageLabel(lang)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Source Code</label>
              <textarea
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
                placeholder="Nhập code của bạn..."
                rows={20}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-500">{sourceCode.split("\n").length} dòng</span>
              </div>

              <Button
                onClick={handleSubmit}
                isDisabled={!sourceCode.trim() || submitMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang nộp bài...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Nộp bài
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Lưu ý khi nộp bài</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Đảm bảo code chạy đúng với tất cả test cases mẫu</li>
                <li>• Kiểm tra giới hạn thời gian và bộ nhớ</li>
                <li>• Bạn có thể nộp lại nhiều lần, bài nộp tốt nhất sẽ được tính điểm</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
