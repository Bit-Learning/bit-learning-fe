import { Button } from "@workspace/ui/components/Button";
import { Card } from "@workspace/ui/components/Card";
import { AlertCircle, ArrowUpRight, CheckCircle, Eye } from "lucide-react";
import type { RecentQuestion } from "../types/dashboard.type";

interface RecentQuestionsProps {
	questions: RecentQuestion[];
	maxItems?: number;
}

export const RecentQuestions = ({
	questions,
	maxItems = 4,
}: RecentQuestionsProps) => {
	const displayQuestions = questions.slice(0, maxItems);

	return (
		<Card className="p-6">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-lg font-semibold text-gray-900">Câu hỏi gần đây</h2>
				{/* <Link to="/mentor/questions">
                    <Button variant="ghost" size="sm" className="gap-1 text-blue-600">
                        Xem tất cả <ArrowUpRight className="h-4 w-4" />
                    </Button>
                </Link> */}
				<Button variant="ghost" size="sm" className="gap-1 text-blue-600">
					Xem tất cả <ArrowUpRight className="h-4 w-4" />
				</Button>
			</div>
			<div className="space-y-3">
				{displayQuestions.map((q) => (
					<QuestionItem key={q.id} question={q} />
				))}
			</div>
		</Card>
	);
};

interface QuestionItemProps {
	question: RecentQuestion;
}

const QuestionItem = ({ question }: QuestionItemProps) => {
	const isPending = question.status === "pending";

	return (
		<div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 transition-colors hover:bg-gray-100">
			<div
				className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
					isPending ? "bg-orange-100" : "bg-green-100"
				}`}
			>
				{isPending ? (
					<AlertCircle className="h-4 w-4 text-orange-600" />
				) : (
					<CheckCircle className="h-4 w-4 text-green-600" />
				)}
			</div>
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<p className="truncate font-medium text-gray-900">
						{question.student}
					</p>
					<span className="shrink-0 text-xs text-gray-500">
						• {question.time}
					</span>
				</div>
				<p className="text-xs text-blue-600">{question.course}</p>
				<p className="mt-1 line-clamp-1 text-sm text-gray-600">
					{question.question}
				</p>
			</div>
			<Button variant="ghost" size="sm" className="shrink-0">
				<Eye className="h-4 w-4" />
			</Button>
		</div>
	);
};
