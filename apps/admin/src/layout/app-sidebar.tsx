import { Link, useLocation } from "@tanstack/react-router";
import React, { useState } from "react";
import {
	ChevronRight,
	Menu,
	X,
	ChevronsUpDown,
	BadgeCheck,
	Bell,
	LogOut,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";
import { getNavGroupsForRole } from "./data/sidebar-data";
import { SignOutDialog } from "@/components/sign-out-dialog";
import useDialogState from "@/shared/hooks/use-dialog-state";
import type { NavCollapsible, NavItem, NavLink } from "./types";
import { useAdminProfile } from "@/features/auth/queries/useAuth";

const BG = "#0d1117";

function checkIsActive(href: string, item: NavItem, mainNav = false) {
	return (
		href === item.url ||
		href.split("?")[0] === item.url ||
		!!item?.items?.filter((i) => i.url === href).length ||
		(mainNav &&
			href.split("/")[1] !== "" &&
			href.split("/")[1] === item?.url?.split("/")[1])
	);
}

function NavLinkItem({
	item,
	href,
	onClose,
}: {
	item: NavLink;
	href: string;
	onClose: () => void;
}) {
	const isActive = checkIsActive(href, item);
	return (
		<Link
			to={item.url}
			onClick={onClose}
			className={cn(
				"flex items-center gap-3 rounded-none px-3 h-11 text-[1em] font-medium transition-all",
				isActive
					? "bg-primary text-white shadow shadow-blue-900/50"
					: "text-slate-400 hover:bg-white/5 hover:text-slate-100",
			)}
		>
			{item.icon && (
				<item.icon
					className={cn(
						"size-4 shrink-0",
						isActive ? "text-white" : "text-slate-500",
					)}
				/>
			)}
			<span className="truncate">{item.title}</span>
			{item.badge && (
				<span className="ml-auto rounded-full bg-blue-500/20 px-1.5 text-[10px] font-bold text-blue-300">
					{item.badge}
				</span>
			)}
		</Link>
	);
}

function NavCollapsibleItem({
	item,
	href,
	onClose,
}: {
	item: NavCollapsible;
	href: string;
	onClose: () => void;
}) {
	const isActive = checkIsActive(href, item, true);
	const [open, setOpen] = useState(isActive);

	return (
		<div>
			<button
				onClick={() => setOpen((p) => !p)}
				className={cn(
					"flex w-full items-center gap-3 rounded-none px-3 h-11 text-[1em] font-medium transition-all",
					isActive
						? "bg-white/10 text-white"
						: "text-slate-400 hover:bg-white/5 hover:text-slate-100",
				)}
			>
				{item.icon && (
					<item.icon
						className={cn(
							"size-4 shrink-0",
							isActive ? "text-blue-400" : "text-slate-500",
						)}
					/>
				)}
				<span className="truncate flex-1 text-left">{item.title}</span>
				{item.badge && (
					<span className="rounded-full bg-blue-500/20 px-1.5 text-[10px] font-bold text-blue-300">
						{item.badge}
					</span>
				)}
				<ChevronRight
					className={cn(
						"size-3.5 text-slate-600 transition-transform",
						open && "rotate-90",
					)}
				/>
			</button>

			{open && (
				<div className="ml-4 mt-0.5 border-l border-white/8 pl-3 space-y-1">
					{item.items.map((sub) => {
						const subActive = checkIsActive(href, sub);
						return (
							<Link
								key={sub.title}
								to={sub.url}
								onClick={onClose}
								className={cn(
									"flex items-center gap-2 rounded-lg px-3 h-8 text-[12.5px] font-medium transition-all",
									subActive
										? "text-blue-400 bg-blue-500/10"
										: "text-slate-500 hover:bg-white/5 hover:text-slate-200",
								)}
							>
								<span
									className={cn(
										"size-1.5 shrink-0 rounded-full",
										subActive ? "bg-blue-400" : "bg-slate-700",
									)}
								/>
								{sub.icon && <sub.icon className="size-3.5" />}
								<span>{sub.title}</span>
								{sub.badge && (
									<span className="ml-auto text-[10px] text-blue-400">
										{sub.badge}
									</span>
								)}
							</Link>
						);
					})}
				</div>
			)}
		</div>
	);
}

const AppSidebar: React.FC = () => {
	const href = useLocation({ select: (l) => l.href });
	const [open, setOpen] = useState(true);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [signOutOpen, setSignOutOpen] = useDialogState();

	const { data: profile } = useAdminProfile();

	const user = {
		name: profile ? `${profile.firstName} ${profile.lastName}`.trim() : "...",
		email: profile?.email ?? "",
	};

	const initials =
		user.name
			.split(" ")
			.filter(Boolean)
			.map((n) => n[0])
			.slice(0, 2)
			.join("")
			.toUpperCase() || "?";

	const navGroups = getNavGroupsForRole(profile?.role);
	const closeMobile = () => setMobileOpen(false);

	const sidebarContent = (
		<div className="flex h-full flex-col" style={{ background: BG }}>
			<div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
				<Link to="/" onClick={closeMobile}>
					{open ? (
						<img
							src="/Logo.png"
							alt="Bit Learning"
							className="h-9.5 w-32 object-contain"
						/>
					) : (
						<div className="" />
					)}
				</Link>
				<button
					onClick={() => setOpen((p) => !p)}
					className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white/6 hover:text-slate-300 transition-all"
				>
					<Menu className="size-4" />
				</button>
				<button
					onClick={closeMobile}
					className="flex md:hidden h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white/6 hover:text-slate-300 transition-all"
				>
					<X className="size-4" />
				</button>
			</div>

			<div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200/80">
				{navGroups.map((group) => (
					<div key={group.title} className="mb-3">
						{open && (
							<p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
								{group.title}
							</p>
						)}
						<div className="space-y-0.5">
							{group.items.map((item) => {
								const key = `${item.title}-${item.url ?? ""}`;
								if (!item.items)
									return (
										<NavLinkItem
											key={key}
											item={item as NavLink}
											href={href}
											onClose={closeMobile}
										/>
									);
								return (
									<NavCollapsibleItem
										key={key}
										item={item as NavCollapsible}
										href={href}
										onClose={closeMobile}
									/>
								);
							})}
						</div>
					</div>
				))}
			</div>

			<div className="border-t border-slate-200 px-3 py-3">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button className="group w-full flex items-center gap-3 rounded-xl px-2.5 py-2 hover:bg-white/5 transition-all outline-none">
							<div className="relative shrink-0">
								<div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-xs font-bold text-white">
									{initials}
								</div>
								<span
									className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 bg-emerald-400"
									style={{ borderColor: BG }}
								/>
							</div>
							{open && (
								<>
									<div className="flex-1 min-w-0 text-left">
										<p className="truncate text-[13px] font-semibold text-slate-200">
											{user.name || "..."}
										</p>
										<p className="truncate text-[11px] text-slate-500">
											{user?.email ?? ""}
										</p>
									</div>
									<ChevronsUpDown className="size-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
								</>
							)}
						</button>
					</DropdownMenuTrigger>

					<DropdownMenuContent
						side="right"
						align="end"
						sideOffset={8}
						className="min-w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-300/30"
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-3 rounded-lg bg-blue-50 px-3 py-2.5">
								<div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-xs font-bold text-white shrink-0">
									{initials}
								</div>
								<div className="flex-1 min-w-0">
									<p className="truncate text-sm font-semibold text-slate-800">
										{user.name || "..."}
									</p>
									<p className="truncate text-xs text-slate-400">
										{user?.email ?? ""}
									</p>
								</div>
							</div>
						</DropdownMenuLabel>

						<DropdownMenuSeparator className="my-1.5 bg-slate-100" />

						<DropdownMenuGroup>
							<DropdownMenuItem
								asChild
								className="cursor-pointer rounded-lg px-3 py-2 text-[13px] text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus:bg-slate-50 focus:text-slate-900"
							>
								<Link to="/settings/account">
									<BadgeCheck className="mr-2 size-4 text-blue-500" />
									Tài Khoản
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem
								asChild
								className="cursor-pointer rounded-lg px-3 py-2 text-[13px] text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus:bg-slate-50 focus:text-slate-900"
							>
								<Link to="/settings/notifications">
									<Bell className="mr-2 size-4 text-blue-500" />
									Thông Báo
								</Link>
							</DropdownMenuItem>
						</DropdownMenuGroup>

						<DropdownMenuSeparator className="my-1.5 bg-slate-100" />

						<DropdownMenuItem
							onClick={() => setSignOutOpen(true)}
							className="cursor-pointer rounded-lg px-3 py-2 text-[13px] text-red-500 hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600"
						>
							<LogOut className="mr-2 size-4" />
							Đăng Xuất
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);

	return (
		<>
			<aside
				className={cn(
					"hidden md:flex flex-col h-screen sticky top-0 shrink-0 transition-all duration-300 border-r border-slate-200 bg-white",
					open ? "w-72" : "w-16",
				)}
			>
				{sidebarContent}
			</aside>

			<button
				onClick={() => setMobileOpen(true)}
				className="md:hidden fixed top-4 left-4 z-50 h-9 w-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 shadow-lg"
			>
				<Menu className="size-4" />
			</button>

			{mobileOpen && (
				<div className="md:hidden fixed inset-0 z-50 flex">
					<div
						className="fixed inset-0 bg-black/60 backdrop-blur-sm"
						onClick={closeMobile}
					/>
					<aside className="relative z-10 w-64 h-full flex flex-col bg-white">
						{sidebarContent}
					</aside>
				</div>
			)}

			<SignOutDialog open={!!signOutOpen} onOpenChange={setSignOutOpen} />
		</>
	);
};

export default AppSidebar;
