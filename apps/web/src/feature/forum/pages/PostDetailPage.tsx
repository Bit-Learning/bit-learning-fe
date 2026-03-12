import type React from "react";
import PageMeta from "@/shared/components/seo/page-meta";
import PostDetailContent from "../components/PostDetailContent";

const PostDetailPage: React.FC = () => {
	return (
		<>
			<PageMeta
				title="Chi tiết bài viết - Diễn đàn Bit Learning"
				description="Xem chi tiết bài viết và tham gia thảo luận"
			/>
			<PostDetailContent />
		</>
	);
};

export default PostDetailPage;
