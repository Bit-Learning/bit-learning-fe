import { Shield, UserCheck, Users as UsersIcon } from "lucide-react";

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
		label: "Staff",
		value: "STAFF",
		icon: UserCheck,
	},
	{
		label: "User",
		value: "USER",
		icon: UsersIcon,
	},
] as const;
