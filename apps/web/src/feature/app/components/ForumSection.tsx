import React from "react";
import { Button } from "@workspace/ui/components/Button";
import { Link } from "@tanstack/react-router";
import ForumPostCard from "./ForumPostCard";
import { useFeaturedForumPosts } from "@/feature/forum/queries/useForum";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";

const ForumSection: React.FC = () => {
	const { data, isLoading } = useFeaturedForumPosts(6);
	const posts = data?.data ?? [];

	return (
		<section id="tour-forum" className="py-16">
			<div className="mb-12 flex flex-col gap-4 text-center">
				<p className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">
					Trung tâm thảo luận
				</p>
				<h3 className="text-4xl font-black text-slate-900">
					Bài đăng thực tế từ cộng đồng Bit Learning
				</h3>
				<p className="mx-auto max-w-3xl text-slate-600">
					Các chủ đề thảo luận nổi bật, chia sẻ kinh nghiệm thực tiễn và câu hỏi
					do người học đặt ra.
				</p>
			</div>

			{isLoading ? (
				<div className="grid gap-8 lg:grid-cols-3">
					{Array.from({ length: 3 }).map((_, index) => (
						<div
							key={index}
							className="h-[420px] animate-pulse rounded-[1.75rem] border border-slate-200 bg-white"
						/>
					))}
				</div>
			) : (
				<Splide
					options={{
						type: "loop",
						perPage: 3,
						gap: "2rem",
						arrows: true,
						pagination: true,
						breakpoints: {
							1024: { perPage: 2 },
							640: { perPage: 1 },
						},
					}}
					aria-label="Bài đăng nổi bật từ cộng đồng Bit Learning"
				>
					{posts.map((post) => (
						<SplideSlide key={post.id}>
							<ForumPostCard post={post} />
						</SplideSlide>
					))}
				</Splide>
			)}

			<div className="mt-10 text-center">
				<Link to="/forum">
					<Button
						variant="outline"
						className="rounded-full border border-slate-200 bg-white px-8 py-5 font-bold text-slate-600 hover:bg-slate-50 hover:text-[#137fec]"
					>
						Xem thêm
					</Button>
				</Link>
			</div>
		</section>
	);
};

export default ForumSection;
