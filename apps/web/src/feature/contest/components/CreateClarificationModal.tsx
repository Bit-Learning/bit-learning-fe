import React, { useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Textarea } from "@workspace/ui/components/Textarea";
import { Label } from "@workspace/ui/components/label";
// import { useCreateClarification } from "../queries/useContest";
// import type { CreateClarificationRequest } from "../types/contest.type";

interface Problem {
  contestProblemId: string;
  label: string;
  title: string;
}

interface CreateClarificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  contestId: string;
  problems?: Problem[];
}

const CreateClarificationModal: React.FC<CreateClarificationModalProps> = ({
  isOpen,
  onClose,
  contestId,
  problems = [],
}) => {
  const [selectedProblem, setSelectedProblem] = useState<string>("");
  const [questionContent, setQuestionContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // const createClarification = useCreateClarification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionContent.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // const request: CreateClarificationRequest = {
      //   contestProblemId: selectedProblem || undefined,
      //   question: questionContent,
      // };
      // await createClarification.mutateAsync({ contestId, request });

      console.log("Question submitted:", {
        contestId,
        problemId: selectedProblem,
        question: questionContent,
      });

      setSelectedProblem("");
      setQuestionContent("");
      onClose();
    } catch (error) {
      console.error("Failed to submit question:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedProblem("");
      setQuestionContent("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden mx-4 z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-blue-50 dark:bg-primary/10 rounded-xl text-primary">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Đặt câu hỏi cho Ban tổ chức</h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Problem Selection */}
          <div className="space-y-2">
            <Label htmlFor="problem-select" className="text-sm font-bold">
              Chọn bài tập liên quan
            </Label>
            <div className="relative">
              <select
                id="problem-select"
                value={selectedProblem}
                onChange={(e) => setSelectedProblem(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              >
                <option value="">Chung (Vấn đề khác)</option>
                {problems.map((problem) => (
                  <option key={problem.contestProblemId} value={problem.contestProblemId}>
                    Bài {problem.label}: {problem.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Question Content */}
          <div className="space-y-2">
            <Label htmlFor="question-content" className="text-sm font-bold">
              Nội dung câu hỏi <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="question-content"
              value={questionContent}
              onChange={(e) => setQuestionContent(e.target.value)}
              placeholder="Nhập thắc mắc của bạn về đề bài hoặc kỹ thuật..."
              rows={6}
              required
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none placeholder:text-slate-400"
            />
            <p className="text-xs text-slate-400 italic">
              Câu hỏi của bạn sẽ được gửi tới Ban tổ chức và có thể được công khai nếu mang tính đóng góp chung.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            isDisabled={isSubmitting}
            className="border-slate-200 dark:border-slate-700"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            isDisabled={isSubmitting || !questionContent.trim()}
            className="bg-primary hover:bg-blue-600 text-white shadow-md"
          >
            {isSubmitting ? (
              "Đang gửi..."
            ) : (
              <>
                Gửi câu hỏi
                <Send className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateClarificationModal;
