import PageMeta from "@/shared/components/seo/page-meta";
import ProblemSolveContent from "../components/ProblemSolveContent";

export const ProblemSolvePage: React.FC = () => (
	<>
		<PageMeta
			title="Solve Problem - Bit Learning"
			description="Giải bài tập coding"
		/>
		<ProblemSolveContent />
	</>
);
