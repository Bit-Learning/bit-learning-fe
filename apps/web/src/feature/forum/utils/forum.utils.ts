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
