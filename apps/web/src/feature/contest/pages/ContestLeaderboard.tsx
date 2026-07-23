import type React from "react";
import PageMeta from "@/shared/components/seo/page-meta";
import ContestLeaderboardContent from "../components/ContestLeaderboardContent";
import { ContestLayout } from "../layouts/ContestLayout";

const ContestLeaderboardPage: React.FC = () => {
	return (
		<>
			<PageMeta
				title="Bảng xếp hạng - Cuộc thi lập trình"
				description="Xem bảng xếp hạng trực tiếp của cuộc thi. Theo dõi thứ hạng và kết quả của các thí sinh."
			/>

			<ContestLayout>
				<ContestLeaderboardContent />
			</ContestLayout>
		</>
	);
};

export default ContestLeaderboardPage;
