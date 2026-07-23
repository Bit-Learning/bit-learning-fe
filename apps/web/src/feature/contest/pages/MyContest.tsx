import React, { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import PageMeta from "@/shared/components/seo/page-meta";
import { ContestListContent } from "../components/ContestListContent";
import { ContestStatus } from "../types/contest.type";
import { useMyContests } from "../queries/useContest";
import { useNavigate } from "@tanstack/react-router";

export const MyContestPage: React.FC = () => {
	const navigate = useNavigate();
	const [currentPage, setCurrentPage] = useState(0);
	const [search, setSearch] = useState("");

	const {
		data: contestsData,
		isLoading,
		error,
	} = useMyContests({
		search: search || undefined,
		page: currentPage,
		size: 6,
	});

	const handleSearch = (value: string) => {
		setSearch(value);
		setCurrentPage(0);
	};

	const contests = useMemo(() => {
		if (!contestsData?.data) return [];
		return contestsData.data.map((contest) => {
			const now = new Date();
			const startTime = new Date(contest.startTime);
			const endTime = new Date(contest.endTime);
			const durationMinutes = Math.floor(
				(endTime.getTime() - startTime.getTime()) / 60000,
			);
			let progress: number | undefined;
			let timeLeft: string | undefined;
			let countdown:
				| { d?: number; h?: number; m?: number; s?: number }
				| undefined;

			if (contest.status === ContestStatus.RUNNING) {
				const totalDuration = endTime.getTime() - startTime.getTime();
				const elapsed = now.getTime() - startTime.getTime();
				progress = Math.floor((elapsed / totalDuration) * 100);
				const remaining = Math.floor(
					(endTime.getTime() - now.getTime()) / 1000,
				);
				const hours = Math.floor(remaining / 3600);
				const minutes = Math.floor((remaining % 3600) / 60);
				timeLeft = `${hours}h ${minutes}m`;
			}

			if (contest.status === ContestStatus.UPCOMING) {
				const remaining = Math.floor(
					(startTime.getTime() - now.getTime()) / 1000,
				);
				const days = Math.floor(remaining / 86400);
				const hours = Math.floor((remaining % 86400) / 3600);
				const minutes = Math.floor((remaining % 3600) / 60);
				const seconds = remaining % 60;
				countdown = {
					d: days > 0 ? days : undefined,
					h: hours,
					m: minutes,
					s: seconds,
				};
			}

			return { ...contest, durationMinutes, progress, timeLeft, countdown };
		});
	}, [contestsData]);

	const totalPages = contestsData?.page?.totalPages || 0;

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
					<p className="text-gray-600 font-medium">
						Đang tải danh sách kỳ thi...
					</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-xl font-bold text-gray-900 mb-2">
						Không thể tải dữ liệu
					</h2>
					<p className="text-gray-600 mb-4">Vui lòng thử lại sau</p>
					<button
						onClick={() => window.location.reload()}
						className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						Tải lại trang
					</button>
				</div>
			</div>
		);
	}

	return (
		<>
			<PageMeta
				title="Kỳ thi Tin học - Bitlearning"
				description="Danh sách các kỳ thi lập trình"
			/>
			<div className="relative overflow-hidden h-60 md:h-72 flex items-end">
				<img
					src="/contest.png"
					alt="hero"
					className="absolute inset-0 w-full h-full object-cover"
				/>
			</div>
			<div className="bg-white border-b border-gray-200 shadow-sm mb-6">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<nav className="text-md text-gray-500 flex items-center">
						<span
							onClick={() => navigate({ to: "/" })}
							className="hover:text-blue-600 cursor-pointer"
						>
							Trang chủ
						</span>
						<span className="mx-2 text-gray-400">/</span>
						<span className="text-blue-600 font-medium">Cuộc thi của tôi</span>
					</nav>
				</div>
			</div>
			<ContestListContent
				contests={contests}
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={setCurrentPage}
				search={search}
				onSearchChange={handleSearch}
			/>
		</>
	);
};
