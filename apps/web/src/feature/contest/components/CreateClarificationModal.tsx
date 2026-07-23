import React, { useState } from "react";
import { MessageCircle, Send, X, Loader2 } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Textarea } from "@workspace/ui/components/Textarea";
import { Label } from "@workspace/ui/components/label";
import { useCreateClarification } from "../queries/useContest";
import type { CreateClarificationRequest } from "../types/contest.type";

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

	const createClarification = useCreateClarification();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!questionContent.trim()) {
			return;
		}

		try {
			const request: CreateClarificationRequest = {
				contestProblemId: selectedProblem || undefined,
				question: questionContent,
			};
			await createClarification.mutateAsync({ contestId, request });

			setSelectedProblem("");
			setQuestionContent("");
			onClose();
		} catch (error) {
			console.log("Không thể gửi câu hỏi. Vui lòng thử lại!");
		}
	};

	const handleClose = () => {
		if (!createClarification.isPending) {
			setSelectedProblem("");
			setQuestionContent("");
			onClose();
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div
				className="fixed inset-0 bg-black/50 backdrop-blur-sm"
				onClick={handleClose}
			/>

			<div className="relative bg-white w-full max-w-xl rounded-lg shadow-xl overflow-hidden mx-4 z-10">
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
					<div className="flex items-center gap-3">
						<h3 className="text-lg font-bold text-gray-900">
							Đặt câu hỏi cho Ban tổ chức
						</h3>
					</div>
					<button
						onClick={handleClose}
						disabled={createClarification.isPending}
						className="text-gray-600 hover:text-gray-600 transition-colors disabled:opacity-50"
					>
						<X className="w-6 h-6" />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="p-6 space-y-5">
					<div className="space-y-2">
						<Label htmlFor="problem-select" className="text-md font-semibold">
							Chọn bài tập liên quan
						</Label>
						<div className="relative">
							<select
								id="problem-select"
								value={selectedProblem}
								onChange={(e) => setSelectedProblem(e.target.value)}
								className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
							>
								<option value="">Chung (Vấn đề khác)</option>
								{problems.map((problem) => (
									<option
										key={problem.contestProblemId}
										value={problem.contestProblemId}
									>
										Bài {problem.label}: {problem.title}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="question-content" className="text-md font-semibold">
							Nội dung câu hỏi <span className="text-red-500">*</span>
						</Label>
						<Textarea
							id="question-content"
							value={questionContent}
							onChange={(e) => setQuestionContent(e.target.value)}
							placeholder="Nhập thắc mắc của bạn về đề bài hoặc kỹ thuật..."
							rows={6}
							required
							className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none placeholder:text-gray-400"
						/>
						<p className="text-sm text-gray-500 italic">
							Câu hỏi của bạn sẽ được gửi tới Ban tổ chức và có thể được công
							khai.
						</p>
					</div>
				</form>

				<div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-200">
					<Button
						type="button"
						variant="outline"
						onClick={handleClose}
						isDisabled={createClarification.isPending}
						className="cursor-pointer border-gray-400 p-5"
					>
						Hủy
					</Button>
					<Button
						type="button"
						onClick={handleSubmit}
						isDisabled={
							createClarification.isPending || !questionContent.trim()
						}
						className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white p-5"
					>
						{createClarification.isPending ? (
							<>
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								Đang gửi...
							</>
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
