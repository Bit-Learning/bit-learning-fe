import type React from "react";
import PageMeta from "@/shared/components/seo/page-meta";
import PostFormContent from "../components/PostFormContent";

const PostFormPage: React.FC = () => {
	return (
		<>
			<PageMeta
				title="Diễn đàn - Bit Learning"
				description="Nơi trao đổi, học hỏi và chia sẻ kiến thức lập trình cùng cộng đồng Bit Learning"
			/>
			<PostFormContent />
		</>
	);
};

export default PostFormPage;
