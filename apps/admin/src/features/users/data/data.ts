import { Shield, User2Icon, UserCheck, Users as UsersIcon } from "lucide-react";

export const activatedStatuses = new Map<boolean, string>([
	[true, "bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200"],
	[false, "bg-neutral-300/40 border-neutral-300"],
]);

export const roles = [
	{
		label: "Admin",
		value: "ADMIN",
		icon: Shield,
	},
	{
		label: "Manager",
		value: "MANAGER",
		icon: UserCheck,
	},
	{
		label: "Học viên",
		value: "STUDENT",
		icon: UsersIcon,
	},
	{
		label: "Giảng viên",
		value: "MENTOR",
		icon: User2Icon,
	},
] as const;

export const mentorApprovalStatuses = {
	INTERNAL: {
		label: "Nội bộ",
		className:
			"bg-slate-100 text-slate-900 dark:text-slate-100 border-slate-200",
	},
	PENDING: {
		label: "Chờ duyệt",
		className:
			"bg-amber-100 text-amber-900 dark:text-amber-100 border-amber-200",
	},
	APPROVED: {
		label: "Đã duyệt",
		className:
			"bg-emerald-100 text-emerald-900 dark:text-emerald-100 border-emerald-200",
	},
	REJECTED: {
		label: "Từ chối",
		className: "bg-rose-100 text-rose-900 dark:text-rose-100 border-rose-200",
	},
} as const;
