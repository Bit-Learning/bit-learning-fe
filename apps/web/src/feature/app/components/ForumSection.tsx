import React from "react";
import { Button } from "@workspace/ui/components/Button";
import ForumPostCard from "./ForumPostCard";
import { ForumPostCardProps } from "../types";
import { Link } from "@tanstack/react-router";

const ForumSection: React.FC = () => {
	const posts: ForumPostCardProps[] = [
		{
			avatar:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuCs6e6gP8sbJ2o_4b6UANG6DBrsban7keRMletQYZ_ot3MHLo1Emn-ynPhngwqewf_NcwcuTADmezo-jqjVBxr7oNtrB1gm4VYv8rnh3FkVm1rtnHKwAu_HSDgEvVghzyp5EQRbXRjp8HPhmBc2xrR5E8z59tvfPxhUuiZ22aGRLQvwJP4OpGpKOCN4CfiROWpP0mzeaEOrnUIhCQIijSDDbELudfqQQFOWQOmrZHVhXuq39NVlaNbKCJg8agV0OnHTQ_tSy-BSki4",
			author: "Minh Anh",
			time: "10 phút trước",
			tags: "#Python #Lớp-7",
			title: "Làm sao để tạo hiệu ứng tuyết rơi trong Scratch ạ?",
			comments: 12,
			likes: 45,
		},
		{
			avatar:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuBlhMHxJbtwAaSbksp3xxINNF_M32rSD8QSsG2hFlVzXeRJHQBul9ke2GeAh3Pt3438sVZ3F79L2NjSkA4lXTmMN1RzL8zGPGPoX_8rxS9-aNRvPYDobiokPTE8gdXfpfX7dDXH6oViwXqqhT0HC8w9IqfeD-awae9iw_GTPInMsVh-j9wKA2Iny318Goos9g97I3njYGD2zSvcB4k24kAg7DRP7K2TCpkdyzP6ArGIVb5FkG5ODLGqxbyoUQKpgsB_R2Lp-7ID85A",
			author: "Quốc Bảo",
			time: "2 giờ trước",
			tags: "#AI #Dự-án-Lab",
			title:
				"Chia sẻ code game Space Battle mình vừa làm xong với Bitlearning Bot!",
			comments: 8,
			likes: 102,
		},
		{
			avatar:
				"https://lh3.googleusercontent.com/aida-public/AB6AXuBEA9Y5HM2jGpZ258RFZN3Jf7sOqycDy2HBDfgHYhBBk3CXOH2LWxRNx1DPuHHAL5U_tlMpZNzA0LMQlAX0TQvH3SibDcPG2xYWSm6vF0udHEqNc6UU2TvL8Hs4BpEV0wymOtUvOywF7P3Z-yL2qoMx75Pom25ZHejbRk3hplFbzwp4uL11j-_tU76f1cV8cWukKhQO5x_t74mIn9hK2o66xBR3_hvr4ipae-mwJovAB21b05mCsjs62MmB7eR6jJHhB9XfsRS8T10",
			author: "Hải Yến",
			time: "5 giờ trước",
			tags: "#Algorithm #Lớp-9",
			title: "Có bạn nào giải được bài tập Ma trận bậc thang này không?",
			comments: 24,
			likes: 18,
		},
	];

	return (
		<section id="tour-forum" className="py-16">
			<div className="text-center mb-12">
				<h3 className="text-3xl font-extrabold text-slate-900 mb-4">
					Diễn Đàn Bitlearning
				</h3>
				<p className="text-slate-600">
					Giao lưu, hỏi đáp và chia sẻ kiến thức cùng cộng đồng BitLearners
				</p>
			</div>
			<div className="grid lg:grid-cols-3 gap-8">
				{posts.map((post, index) => (
					<ForumPostCard key={index} {...post} />
				))}
			</div>
			<div className="mt-10 text-center">
				<Link to="/forum">
					<Button
						variant="outline"
						className="px-8 py-5 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 hover:text-[#137fec]"
					>
						Ghé thăm Diễn đàn
					</Button>
				</Link>
			</div>
		</section>
	);
};

export default ForumSection;
