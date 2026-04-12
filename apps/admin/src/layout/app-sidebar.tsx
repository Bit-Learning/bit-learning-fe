import { Link, useLocation } from "@tanstack/react-router";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import {
	BadgeCheck,
	Bell,
	ChevronLeft,
	ChevronRight,
	ChevronsUpDown,
	LogOut,
	Menu,
	X,
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
import { SignOutDialog } from "@/components/sign-out-dialog";
import { useSidebar } from "@/components/ui/sidebar";
import useDialogState from "@/shared/hooks/use-dialog-state";
import { cn } from "@/shared/lib/utils";
import { getNavGroupsForRole } from "./data/sidebar-data";
import type { NavCollapsible, NavItem, NavLink } from "./types";
import { useAdminProfile } from "@/features/auth/queries/useAuth";

const SIDEBAR_EXPANDED = "";
const SIDEBAR_COLLAPSED = "";

function checkIsActive(href: string, item: NavItem, mainNav = false) {
	return (
		href === item.url ||
		href.split("?")[0] === item.url ||
		!!item?.items?.some((i) => i.url === href) ||
		(mainNav &&
			href.split("/")[1] !== "" &&
			href.split("/")[1] === item?.url?.split("/")[1])
	);
}

type SidebarItemBaseProps = {
	collapsed: boolean;
	href: string;
	onNavigate?: () => void;
};

function SidebarLinkItem({
	item,
	href,
	collapsed,
	onNavigate,
}: SidebarItemBaseProps & { item: NavLink }) {
	const isActive = checkIsActive(href, item);

	return (
		<Link
			to={item.url}
			onClick={onNavigate}
			title={collapsed ? item.title : undefined}
			className={cn(
				"group relative flex h-11.5 items-center rounded-2xl px-3 text-sm font-medium transition-all duration-200",
				collapsed ? "justify-center w-12 mx-auto" : "gap-3",
				isActive
					? "bg-sky-50 text-sky-700 shadow-[0_10px_24px_rgba(14,165,233,0.12)] dark:bg-white dark:text-slate-950 dark:shadow-[0_10px_30px_rgba(255,255,255,0.08)]"
					: "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/6 dark:hover:text-white",
			)}
		>
			{isActive && !collapsed && (
				<span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-sky-500" />
			)}

			{item.icon && (
				<item.icon
					className={cn(
						"shrink-0 size-4.5",
						isActive
							? "text-sky-600 dark:text-sky-600"
							: "text-slate-400 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-100",
					)}
				/>
			)}

			{!collapsed && (
				<>
					<span className="truncate">{item.title}</span>

					{item.badge && (
						<span
							className={cn(
								"ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold",
								isActive
									? "bg-sky-100 text-sky-700 dark:bg-slate-900 dark:text-white"
									: "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-200",
							)}
						>
							{item.badge}
						</span>
					)}
				</>
			)}
		</Link>
	);
}

function SidebarCollapsibleItem({
	item,
	href,
	collapsed,
	onNavigate,
}: SidebarItemBaseProps & { item: NavCollapsible }) {
	const isActive = checkIsActive(href, item, true);
	const [open, setOpen] = useState(isActive);

	useEffect(() => {
		if (isActive) setOpen(true);
	}, [isActive]);

	if (collapsed) {
		return (
			<button
				type="button"
				title={item.title}
				onClick={() => setOpen((prev) => !prev)}
				className={cn(
					"group relative flex h-11 w-full items-center justify-center rounded-2xl transition-all duration-200",
					isActive
						? "bg-sky-50 text-sky-700 shadow-[0_10px_24px_rgba(14,165,233,0.12)] dark:bg-white dark:text-slate-950 dark:shadow-[0_10px_30px_rgba(255,255,255,0.08)]"
						: "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/6 dark:hover:text-white",
				)}
			>
				{item.icon && (
					<item.icon
						className={cn(
							"size-4.5 shrink-0",
							isActive
								? "text-sky-600"
								: "text-slate-400 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-100",
						)}
					/>
				)}
			</button>
		);
	}

	return (
		<div className="space-y-1">
			<button
				type="button"
				onClick={() => setOpen((prev) => !prev)}
				className={cn(
					"group relative flex h-11 w-full items-center gap-3 rounded-2xl px-3 text-sm font-medium transition-all duration-200",
					isActive
						? "bg-sky-50 text-sky-700 dark:bg-white/8 dark:text-white"
						: "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/6 dark:hover:text-white",
				)}
			>
				{item.icon && (
					<item.icon
						className={cn(
							"size-4.5 shrink-0",
							isActive
								? "text-sky-600 dark:text-sky-400"
								: "text-slate-400 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-100",
						)}
					/>
				)}

				<span className="flex-1 truncate text-left">{item.title}</span>

				{item.badge && (
					<span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:bg-white/10 dark:text-slate-100">
						{item.badge}
					</span>
				)}

				<ChevronRight
					className={cn(
						"size-4 shrink-0 text-slate-400 transition-transform duration-200 dark:text-slate-500",
						open && "rotate-90 text-slate-700 dark:text-slate-200",
					)}
				/>
			</button>

			<div
				className={cn(
					"grid overflow-hidden transition-all duration-200",
					open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
				)}
			>
				<div className="min-h-0">
					<div className="ml-5 space-y-1 border-l border-slate-200 pl-4 dark:border-white/10">
						{item.items.map((sub) => {
							const subActive = checkIsActive(href, sub);

							return (
								<Link
									key={`${sub.title}-${sub.url}`}
									to={sub.url}
									onClick={onNavigate}
									className={cn(
										"group flex h-9 items-center gap-2 rounded-xl px-3 text-[13px] font-medium transition-all",
										subActive
											? "bg-sky-50 text-sky-700 dark:bg-sky-500/12 dark:text-sky-300"
											: "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100",
									)}
								>
									<span
										className={cn(
											"size-1.5 rounded-full shrink-0",
											subActive
												? "bg-sky-500 dark:bg-sky-400"
												: "bg-slate-300 dark:bg-slate-600",
										)}
									/>
									{sub.icon && <sub.icon className="size-3.5 shrink-0" />}
									<span className="truncate">{sub.title}</span>

									{sub.badge && (
										<span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500">
											{sub.badge}
										</span>
									)}
								</Link>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}

function SidebarHeader({
	collapsed,
	onToggle,
	onCloseMobile,
}: {
	collapsed: boolean;
	onToggle: () => void;
	onCloseMobile: () => void;
}) {
	return (
		<div className="flex h-20 items-center justify-between border-b border-slate-200/70 px-4 dark:border-white/10">
			<Link
				to="/"
				onClick={onCloseMobile}
				className={cn(
					"flex items-center",
					collapsed ? "justify-center w-full" : "",
				)}
			>
				{collapsed ? (
					<div className="flex size-11 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm">
						<img
							src="/logo/icon-192.png"
							alt="App icon"
							className="h-full w-full object-cover"
						/>
					</div>
				) : (
					<div className="flex items-center gap-3">
						<div className="flex size-11 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm">
							<img
								src="/logo/icon-192.png"
								alt="App icon"
								className="h-full w-full object-cover"
							/>
						</div>

						<div className="min-w-0">
							<p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
								Bit Learning
							</p>
							<p className="truncate text-xs text-slate-500 dark:text-slate-400">
								Cổng quản trị hệ thống
							</p>
						</div>
					</div>
				)}
			</Link>

			<button
				type="button"
				onClick={onToggle}
				className={cn(
					"hidden md:flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white",
					collapsed && "absolute left-1/2 top-6 -translate-x-1/2",
				)}
				aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
			>
				{collapsed ? (
					<ChevronRight className="size-4" />
				) : (
					<ChevronLeft className="size-4" />
				)}
			</button>

			<button
				type="button"
				onClick={onCloseMobile}
				className="flex md:hidden size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
				aria-label="Close sidebar"
			>
				<X className="size-4" />
			</button>
		</div>
	);
}

function SidebarFooter({
	collapsed,
	name,
	email,
	initials,
	onSignOut,
}: {
	collapsed: boolean;
	name: string;
	email: string;
	initials: string;
	onSignOut: () => void;
}) {
	return (
		<div className="border-t border-slate-200/70 p-3 dark:border-white/10">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						className={cn(
							"group flex w-full items-center rounded-2xl border border-slate-200/80 bg-white/80 transition hover:bg-white dark:border-white/8 dark:bg-white/5 dark:hover:bg-white/8",
							collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-3",
						)}
					>
						<div className="relative shrink-0">
							{/* <div className="flex size-10 items-center justify-center rounded-2xl bg-white text-sm font-bold text-slate-950">
								{initials}
							</div> */}

							<div className="flex size-11 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm">
								<img
									src="/logo/icon-192.png"
									alt="App icon"
									className="h-full w-full object-cover"
								/>
							</div>
							<span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-emerald-400 dark:border-slate-950" />
						</div>

						{!collapsed && (
							<>
								<div className="min-w-0 flex-1 text-left">
									<p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
										{name || "..."}
									</p>
									<p className="truncate text-xs text-slate-500 dark:text-slate-400">
										{email}
									</p>
								</div>
								<ChevronsUpDown className="size-4 text-slate-400 transition group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-200" />
							</>
						)}
					</button>
				</DropdownMenuTrigger>

				<DropdownMenuContent
					side="right"
					align="end"
					sideOffset={10}
					className="w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-950"
				>
					<DropdownMenuLabel className="p-0">
						<div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3 dark:bg-slate-900">
							<div className="flex size-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white dark:bg-slate-100 dark:text-slate-950">
								{initials}
							</div>
							<div className="min-w-0 flex-1">
								<p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
									{name || "..."}
								</p>
								<p className="truncate text-xs text-slate-500 dark:text-slate-400">
									{email}
								</p>
							</div>
						</div>
					</DropdownMenuLabel>

					<DropdownMenuSeparator className="my-2" />

					<DropdownMenuGroup>
						<DropdownMenuItem
							asChild
							className="cursor-pointer rounded-xl px-3 py-2.5"
						>
							<Link to="/settings/account">
								<BadgeCheck className="mr-2 size-4 text-sky-600" />
								Tài khoản
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem
							asChild
							className="cursor-pointer rounded-xl px-3 py-2.5"
						>
							<Link to="/settings/notifications">
								<Bell className="mr-2 size-4 text-sky-600" />
								Thông báo
							</Link>
						</DropdownMenuItem>
					</DropdownMenuGroup>

					<DropdownMenuSeparator className="my-2" />

					<DropdownMenuItem
						onClick={onSignOut}
						className="cursor-pointer rounded-xl px-3 py-2.5 text-red-600 focus:text-red-600"
					>
						<LogOut className="mr-2 size-4" />
						Đăng xuất
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

const AppSidebar: React.FC = () => {
	const href = useLocation({ select: (l) => l.href });
	const [signOutOpen, setSignOutOpen] = useDialogState();
	const { state, isMobile, openMobile, setOpenMobile, toggleSidebar } =
		useSidebar();

	// On desktop, use the shared sidebar context state to determine
	// whether the app sidebar is in a collapsed (icon-only) mode.
	const collapsed = !isMobile && state === "collapsed";

	const { data: profile } = useAdminProfile();

	const navGroups = useMemo(
		() => getNavGroupsForRole(profile?.role),
		[profile?.role],
	);

	const name = profile
		? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim()
		: "...";

	const email = profile?.email ?? "";

	const initials =
		name
			.split(" ")
			.filter(Boolean)
			.map((part) => part[0])
			.slice(0, 2)
			.join("")
			.toUpperCase() || "?";

	const closeMobile = () => setOpenMobile(false);

	const sidebarContent = (
		<div className="flex h-full flex-col bg-white/95 text-slate-700 dark:bg-slate-950 dark:text-slate-200">
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute left-[-40px] -top-15 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl dark:bg-sky-500/20" />
				<div className="absolute bottom-[-80px] right-[-40px] h-48 w-48 rounded-full bg-indigo-500/8 blur-3xl dark:bg-indigo-500/10" />
			</div>

			<div className="relative z-10 flex h-full flex-col">
				<SidebarHeader
					collapsed={collapsed}
					onToggle={toggleSidebar}
					onCloseMobile={closeMobile}
				/>

				<div className="flex-1 overflow-y-auto px-3 py-4">
					<div className="space-y-5">
						{navGroups.map((group) => (
							<div key={group.title} className="space-y-2">
								{!collapsed && (
									<p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
										{group.title}
									</p>
								)}

								<div className="flex flex-col justify-center space-y-1">
									{group.items.map((item) => {
										const key = `${item.title}-${item.url ?? ""}`;

										if (!item.items) {
											return (
												<SidebarLinkItem
													key={key}
													item={item as NavLink}
													href={href}
													collapsed={collapsed}
													onNavigate={closeMobile}
												/>
											);
										}

										return (
											<SidebarCollapsibleItem
												key={key}
												item={item as NavCollapsible}
												href={href}
												collapsed={collapsed}
												onNavigate={closeMobile}
											/>
										);
									})}
								</div>
							</div>
						))}
					</div>
				</div>

				<SidebarFooter
					collapsed={collapsed}
					name={name}
					email={email}
					initials={initials}
					onSignOut={() => setSignOutOpen(true)}
				/>
			</div>
		</div>
	);

	return (
		<>
			<aside
				className={cn(
					"sticky top-0 hidden h-screen shrink-0 border-r border-slate-200/70 transition-all duration-300 dark:border-slate-200/10 md:flex",
					collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED,
				)}
			>
				{sidebarContent}
			</aside>

			<button
				type="button"
				onClick={() => setOpenMobile(true)}
				className="fixed left-4 top-4 z-50 flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 md:hidden"
				aria-label="Open sidebar"
			>
				<Menu className="size-4" />
			</button>

			{openMobile && (
				<div className="fixed inset-0 z-50 flex md:hidden">
					<button
						type="button"
						className="absolute inset-0 bg-black/60 backdrop-blur-sm"
						onClick={closeMobile}
						aria-label="Close sidebar overlay"
					/>
					<aside className="relative z-10 h-full w-72">{sidebarContent}</aside>
				</div>
			)}

			<SignOutDialog open={!!signOutOpen} onOpenChange={setSignOutOpen} />
		</>
	);
};

export default AppSidebar;
