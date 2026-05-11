import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
	currentPage,
	totalPages,
	onPageChange,
}) => {
	const handlePrevious = () => {
		if (currentPage > 0) {
			onPageChange(currentPage - 1);
		}
	};

	const handleNext = () => {
		if (currentPage < totalPages - 1) {
			onPageChange(currentPage + 1);
		}
	};

	const handlePageClick = (page: number) => {
		onPageChange(page);
	};

	const getPageNumbers = () => {
		const pages: (number | string)[] = [];
		const maxVisible = 5;

		if (totalPages <= maxVisible) {
			for (let i = 0; i < totalPages; i++) {
				pages.push(i);
			}
		} else {
			pages.push(0);

			if (currentPage <= 2) {
				for (let i = 1; i < maxVisible - 1; i++) {
					pages.push(i);
				}
				pages.push("...");
				pages.push(totalPages - 1);
			} else if (currentPage >= totalPages - 3) {
				pages.push("...");
				for (let i = totalPages - maxVisible + 1; i < totalPages; i++) {
					pages.push(i);
				}
			} else {
				pages.push("...");
				pages.push(currentPage - 1);
				pages.push(currentPage);
				pages.push(currentPage + 1);
				pages.push("...");
				pages.push(totalPages - 1);
			}
		}

		return pages;
	};

	const pageNumbers = getPageNumbers();

	return (
		<div className="flex items-center justify-center gap-2 py-3">
			<Button
				variant="outline"
				size="icon"
				onClick={handlePrevious}
				disabled={currentPage === 0}
				className="h-9 w-9"
			>
				<ChevronLeft className="h-4 w-4" />
			</Button>

			{pageNumbers.map((page, index) =>
				page === "..." ? (
					<span key={`ellipsis-${index}`} className="px-2 text-gray-500">
						...
					</span>
				) : (
					<Button
						key={page}
						variant={currentPage === page ? "default" : "outline"}
						size="icon"
						onClick={() => handlePageClick(page as number)}
						className="h-9 w-9"
					>
						{(page as number) + 1}
					</Button>
				),
			)}

			<Button
				variant="outline"
				size="icon"
				onClick={handleNext}
				disabled={currentPage === totalPages - 1}
				className="h-9 w-9"
			>
				<ChevronRight className="h-4 w-4" />
			</Button>
		</div>
	);
};
