import type { AppealTicketStatus, AppealUser } from "./types/post-appeal.type";

export function getAppealUserName(user?: AppealUser | null): string {
	if (!user) return "Chưa có thông tin";

	const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
	if (fullName) return fullName;
	if (user.name?.trim()) return user.name.trim();
	if (user.email?.trim()) return user.email.trim();
	return `#${user.id}`;
}

export function formatAppealDate(value?: string | null): string {
	if (!value) return "--";
	return new Date(value).toLocaleString("vi-VN");
}

export function getAppealStatusLabel(status: AppealTicketStatus): string {
	return status === "OPEN" ? "Đang chờ xử lý" : "Đã đóng";
}
