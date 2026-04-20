import type { useNavigate } from "@tanstack/react-router";
import type { Post } from "../types/forum.type";

export function formatDate(date: string): string {
	return new Date(date).toLocaleDateString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

export function formatRelative(date: string): string {
	const diffH = Math.floor((Date.now() - new Date(date).getTime()) / 3_600_000);
	if (diffH < 1) return "Vừa xong";
	if (diffH < 24) return `${diffH} giờ trước`;
	const days = Math.floor(diffH / 24);
	if (days < 30) return `${days} ngày trước`;
	return formatDate(date);
}

export function formatCompactNumber(value: number) {
	if (value >= 1000) {
		return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
	}
	return String(value);
}

export function getAuthorName(post: Post) {
	if (post.author.name) return post.author.name;
	return `${post.author.firstName} ${post.author.lastName}`.trim();
}

export function updateSearchState(
	navigate: ReturnType<typeof useNavigate>,
	nextSearch: {
		q?: string;
		category?: string;
		tag?: string;
		sort?: string;
	},
) {
	navigate({
		to: "/forum",
		replace: true,
		resetScroll: false,
		search: {
			q: nextSearch.q || undefined,
			category: nextSearch.category || undefined,
			tag: nextSearch.tag || undefined,
			sort: nextSearch.sort || undefined,
		},
	});
}

export function getErrorMessage(error: unknown) {
	if (error instanceof Error && error.message) {
		return error.message;
	}
	return "Unable to load posts right now.";
}

export function getSkeletonKeys(prefix: string, count: number) {
	return Array.from({ length: count }, (_, index) => `${prefix}-${index + 1}`);
}
