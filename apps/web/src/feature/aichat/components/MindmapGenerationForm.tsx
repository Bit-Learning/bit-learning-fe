import { useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { Checkbox } from "@workspace/ui/components/Checkbox";
import { Label } from "@workspace/ui/components/label";
import { toast } from "@workspace/ui/components/Sonner";
import { Input } from "@workspace/ui/components/update/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/update/select";
import { Loader2, Network, Sparkles } from "lucide-react";
import React from "react";
import { useSelector } from "react-redux";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { useMindmapGeneration } from "../hooks";
import type {
	MindmapGenerationRequest,
	MindmapResponse,
} from "../service/MindmapService";
import { deductBalanceAI } from "../service/PaymentService";

interface MindmapGenerationFormProps {
	chatContext?: string;
}

export const MindmapGenerationForm: React.FC<MindmapGenerationFormProps> = ({
	chatContext,
}) => {
	const [topic, setTopic] = React.useState("");
	const [grade, setGrade] = React.useState<number>(10);
	const [maxDepth, setMaxDepth] = React.useState<number>(3);
	const [maxBranches, setMaxBranches] = React.useState<number>(4);
	const [includeExamples, setIncludeExamples] = React.useState(true);
	const { userInfo } = useSelector(selectAuthStateInfo);

	const { generateMindmapAsync, isGenerating } = useMindmapGeneration();
	const navigate = useNavigate();

	// Auto-fill topic from chat context if available
	React.useEffect(() => {
		if (chatContext && !topic) {
			const lines = chatContext
				.split("\n")
				.filter((line) => line.trim().length > 0);
			if (lines.length > 0 && lines[0]) {
				setTopic(lines[0].substring(0, 150)); // Limit to 150 chars as per requirement
			}
		}
	}, [chatContext, topic]);

	const handleGenerateMindmap = async () => {
		if ((userInfo?.wallet.balance || 0) < 10000) {
			toast.error({
				title: "Số dư không đủ",
				description:
					"Bạn không đủ tiền để tạo mind map. Vui lòng nạp thêm tiền vào ví.",
			});
			return;
		}

		if (!topic.trim()) {
			toast.error({
				title: "Vui lòng nhập chủ đề",
			});
			return;
		}

		const request: MindmapGenerationRequest = {
			topic: topic.trim(),
			grade,
			maxDepth: maxDepth,
			maxBranches: maxBranches,
			includeExamples: includeExamples,
			collectionName: "sgk_tin_kntt",
		};

		try {
			const result: MindmapResponse = await generateMindmapAsync(request);
			await deductBalanceAI(10000);

			if (result?.code && result.userId) {
				navigate({ to: `/mindmaps/${result.userId}/${result.code}` });
			}
		} catch (error) {
			console.error("Generation failed (form):", error);
		}
	};

	return (
		<div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
			<div className="flex items-center gap-2">
				<Network className="h-6 w-6 text-purple-600" />
				<h3 className="text-lg font-semibold">Tạo Mind Map AI</h3>
			</div>

			<div className="space-y-4">
				{/* Topic Input */}
				<div className="space-y-2">
					<Label htmlFor="topic">
						Chủ đề <span className="text-red-500">*</span>
					</Label>
					<Input
						id="topic"
						placeholder="Ví dụ: Lập trình Python, Cấu trúc dữ liệu"
						value={topic}
						onChange={(e) => setTopic(e.target.value.substring(0, 150))}
						disabled={isGenerating}
						maxLength={150}
					/>
					<p className="text-xs text-gray-500">
						Nhập chủ đề cho sơ đồ tư duy ({topic.length}/150)
					</p>
				</div>

				{/* Grade Selection */}
				<div className="space-y-2">
					<Label htmlFor="grade">Cấp độ lớp</Label>
					<Select
						value={grade.toString()}
						onValueChange={(value) => setGrade(Number(value))}
						disabled={isGenerating}
					>
						<SelectTrigger id="grade">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
								<SelectItem key={g} value={g.toString()}>
									Lớp {g}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<p className="text-xs text-gray-500">
						Nội dung sẽ phù hợp với cấp độ này (1-12)
					</p>
				</div>

				{/* Max Depth */}
				<div className="space-y-2">
					<Label htmlFor="maxDepth">Độ sâu tối đa</Label>
					<Input
						id="maxDepth"
						type="number"
						min={1}
						max={5}
						value={maxDepth}
						onChange={(e) =>
							setMaxDepth(Math.min(5, Math.max(1, Number(e.target.value))))
						}
						disabled={isGenerating}
					/>
					<p className="text-xs text-gray-500">
						Độ sâu cây của sơ đồ (1-5 cấp độ)
					</p>
				</div>

				{/* Max Branches */}
				<div className="space-y-2">
					<Label htmlFor="maxBranches">Số nhánh tối đa</Label>
					<Input
						id="maxBranches"
						type="number"
						min={1}
						max={6}
						value={maxBranches}
						onChange={(e) =>
							setMaxBranches(Math.min(6, Math.max(1, Number(e.target.value))))
						}
						disabled={isGenerating}
					/>
					<p className="text-xs text-gray-500">
						Số nhánh tối đa cho mỗi nút (1-6)
					</p>
				</div>

				{/* Options */}
				<div className="space-y-3">
					<Label>Tùy chọn</Label>
					<div className="flex items-center space-x-2">
						<Checkbox
							id="includeExamples"
							isSelected={includeExamples}
							onChange={setIncludeExamples}
							isDisabled={isGenerating}
						/>
						<Label
							htmlFor="includeExamples"
							className="cursor-pointer text-sm font-normal"
						>
							Bao gồm ví dụ
						</Label>
					</div>
				</div>

				{/* Info Box */}
				{chatContext && (
					<div className="rounded-md bg-purple-50 p-3">
						<div className="flex gap-2">
							<Sparkles className="h-4 w-4 flex-shrink-0 text-purple-600" />
							<div>
								<p className="text-xs font-medium text-purple-900">
									AI sẽ tạo nội dung tự động
								</p>
								<p className="mt-1 text-xs text-purple-700">
									Nội dung chat của bạn sẽ được sử dụng làm ngữ cảnh để AI tạo
									sơ đồ tư duy phù hợp hơn
								</p>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Generate Button */}
			<Button
				className="mt-auto w-full"
				onClick={handleGenerateMindmap}
				isDisabled={isGenerating || !topic.trim()}
				size="lg"
			>
				{isGenerating ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Đang tạo mind map...
					</>
				) : (
					<>
						<Network className="mr-2 h-4 w-4" />
						Tạo Mind Map
					</>
				)}
			</Button>

			{!topic.trim() && !isGenerating && (
				<p className="text-center text-xs text-gray-500">
					Nhập chủ đề để bắt đầu
				</p>
			)}
		</div>
	);
};
