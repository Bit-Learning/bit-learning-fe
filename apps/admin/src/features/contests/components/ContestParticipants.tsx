import React, { useState } from "react";
import {
	Search,
	User,
	Loader2,
	ChevronUp,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAdminContestRegistrations } from "../queries/useContest";
import { ContestRegistrationDTO } from "../types/contest.type";

interface ContestParticipantsProps {
	contestId: string;
}

export const ContestParticipants: React.FC<ContestParticipantsProps> = ({
	contestId,
}) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [params, setParams] = useState({
		page: 0,
		size: 10,
		sort: "registeredAt,desc",
	});

	const { data, isLoading } = useAdminContestRegistrations(contestId, params);

	const participants = (data?.data ?? []) as ContestRegistrationDTO[];
	const totalElements = data?.page?.totalElements ?? 0;
	const totalPages = data?.page?.totalPages ?? 0;
	const currentPage = params.page;
	const sortDir = params.sort.endsWith("desc") ? "desc" : "asc";

	const formatDateTime = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleString("vi-VN", {
			hour: "2-digit",
			minute: "2-digit",
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	};

	const filteredParticipants = participants.filter(
		(p) =>
			p.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			p.email?.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const toggleSort = () =>
		setParams((prev) => ({
			...prev,
			page: 0,
			sort:
				prev.sort === "registeredAt,desc"
					? "registeredAt,asc"
					: "registeredAt,desc",
		}));

	const goToPage = (page: number) => setParams((prev) => ({ ...prev, page }));

	const getPageNumbers = () => {
		const pages: (number | "...")[] = [];
		if (totalPages <= 7) {
			return Array.from({ length: totalPages }, (_, i) => i);
		}
		pages.push(0);
		if (currentPage > 3) pages.push("...");
		for (
			let i = Math.max(1, currentPage - 1);
			i <= Math.min(totalPages - 2, currentPage + 1);
			i++
		) {
			pages.push(i);
		}
		if (currentPage < totalPages - 4) pages.push("...");
		pages.push(totalPages - 1);
		return pages;
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="text-center">
					<Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-3" />
					<p className="text-gray-600">Đang tải danh sách thí sinh...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
				<div>
					<h3 className="text-lg font-bold text-gray-900">
						Danh sách thí sinh ({totalElements})
					</h3>
					<p className="text-sm text-gray-600">
						Danh sách người dùng đã đăng ký tham gia cuộc thi
					</p>
				</div>

				<div className="flex items-center gap-3">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
						<Input
							type="text"
							placeholder="Tìm kiếm thí sinh..."
							value={searchQuery}
							onChange={(e) => {
								setSearchQuery(e.target.value);
								setParams((prev) => ({ ...prev, page: 0 }));
							}}
							className="pl-9 w-64"
						/>
					</div>
				</div>
			</div>

			<Card className="bg-white p-0 border-gray-200">
				<CardContent className="p-0">
					{participants.length === 0 ? (
						<div className="text-center py-12">
							<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<User className="w-8 h-8 text-gray-400" />
							</div>
							<h4 className="text-lg font-bold text-gray-900 mb-2">
								Chưa có thí sinh nào
							</h4>
							<p className="text-sm text-gray-600">
								Chưa có người dùng đăng ký cuộc thi này
							</p>
						</div>
					) : (
						<>
							<div className="overflow-x-auto">
								<table className="w-full text-left border-collapse">
									<thead className="bg-gray-50">
										<tr>
											<th className="px-6 py-4 text-xs font-bold text-gray-600">
												Thí sinh
											</th>
											<th className="px-6 py-4 text-xs font-bold text-gray-600">
												Email
											</th>
											<th
												className="px-6 py-4 text-xs font-bold text-gray-600 cursor-pointer select-none"
												onClick={toggleSort}
											>
												<div className="flex items-center gap-1">
													Ngày đăng ký
													<span className="flex flex-col -space-y-1">
														<ChevronUp
															className={`w-3 h-3 ${sortDir === "asc" ? "text-blue-600" : "text-gray-300"}`}
														/>
														<ChevronDown
															className={`w-3 h-3 ${sortDir === "desc" ? "text-blue-600" : "text-gray-300"}`}
														/>
													</span>
												</div>
											</th>
										</tr>
									</thead>

									<tbody className="divide-y divide-gray-200">
										{filteredParticipants.map((p) => (
											<tr
												key={p.registrationId}
												className="hover:bg-gray-50 transition-colors"
											>
												<td className="px-6 py-4">
													<div className="flex items-center gap-3">
														<Avatar className="w-10 h-10">
															<AvatarImage src={p.avatar} />
															<AvatarFallback>
																{p.username?.charAt(0).toUpperCase()}
															</AvatarFallback>
														</Avatar>
														<div>
															<p className="text-sm font-semibold text-gray-900">
																{p.fullName || p.username}
															</p>
															<p className="text-xs text-gray-500">
																@{p.username}
															</p>
														</div>
													</div>
												</td>
												<td className="px-6 py-4 text-sm text-gray-600">
													{p.email}
												</td>
												<td className="px-6 py-4 text-sm text-gray-600">
													{formatDateTime(p.registeredAt)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							{totalPages > 1 && (
								<div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
									<p className="text-sm text-gray-500">
										Trang {currentPage + 1} / {totalPages} &mdash;{" "}
										{totalElements} thí sinh
									</p>

									<div className="flex items-center gap-1">
										<Button
											variant="ghost"
											size="icon"
											className="w-8 h-8"
											disabled={currentPage === 0}
											onClick={() => goToPage(0)}
										>
											<ChevronsLeft className="w-4 h-4" />
										</Button>

										<Button
											variant="ghost"
											size="icon"
											className="w-8 h-8"
											disabled={currentPage === 0}
											onClick={() => goToPage(currentPage - 1)}
										>
											<ChevronLeft className="w-4 h-4" />
										</Button>

										{getPageNumbers().map((p, i) =>
											p === "..." ? (
												<span
													key={`ellipsis-${i}`}
													className="px-2 text-gray-400 text-sm select-none"
												>
													…
												</span>
											) : (
												<Button
													key={p}
													variant={p === currentPage ? "default" : "ghost"}
													size="icon"
													className="w-8 h-8 text-sm"
													onClick={() => goToPage(p as number)}
												>
													{(p as number) + 1}
												</Button>
											),
										)}

										<Button
											variant="ghost"
											size="icon"
											className="w-8 h-8"
											disabled={currentPage >= totalPages - 1}
											onClick={() => goToPage(currentPage + 1)}
										>
											<ChevronRight className="w-4 h-4" />
										</Button>

										<Button
											variant="ghost"
											size="icon"
											className="w-8 h-8"
											disabled={currentPage >= totalPages - 1}
											onClick={() => goToPage(totalPages - 1)}
										>
											<ChevronsRight className="w-4 h-4" />
										</Button>
									</div>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
};
