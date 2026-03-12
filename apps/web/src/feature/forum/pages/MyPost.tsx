import type React from "react";
import PageMeta from "@/shared/components/seo/page-meta";
import MyPostContent from "../components/MyPostContent";

const MyPostPage: React.FC = () => {
	return (
		<>
			<PageMeta
				title="Bài đăng của tôi - Bit Learning"
				description="Quản lý và theo dõi các bài viết của bạn trên Bit Learning"
			/>
			<MyPostContent />
		</>
	);
};

export default MyPostPage;
