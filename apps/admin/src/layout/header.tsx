import { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { ConfigDrawer } from "@/components/config-drawer";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { NotificationBell } from "@/features/notification/components/notification-bell";
import { cn } from "@/shared/lib/utils";

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
	fixed?: boolean;
	title?: string;
	subtitle?: string;
	actions?: React.ReactNode;
};

export function Header({
	className,
	fixed = true,
	title = "",
	subtitle,
	actions,
	...props
}: HeaderProps) {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => {
			const top =
				window.pageYOffset ||
				document.documentElement.scrollTop ||
				document.body.scrollTop ||
				0;

			setScrolled(top > 8);
		};

		onScroll();
		document.addEventListener("scroll", onScroll, { passive: true });

		return () => document.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<header
			className={cn(
				"z-40 border-b border-slate-200/70 transition-all duration-300",
				fixed && "sticky top-0",
				scrolled
					? "bg-white/90 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl"
					: "bg-white/80 backdrop-blur-md",
				className,
			)}
			{...props}
		>
			<div className="flex min-h-[76px] items-center px-4 md:px-6">
				{/* Left: sidebar + title */}
				<div className="flex shrink-0 items-center gap-3">
					<div
						className={cn(
							"rounded-2xl border border-slate-200 bg-white p-1.5 transition-all duration-300",
							scrolled
								? "shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
								: "shadow-sm",
						)}
					>
						<SidebarTrigger className="h-9 w-9 rounded-xl border-0 bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-950" />
					</div>

					<div className="hidden md:block">
						<h1 className="text-lg font-semibold tracking-tight text-slate-900">
							{title}
						</h1>
						<div className="space-y-1 text-center">
							<div className="flex items-center justify-center gap-2">
								<img
									src="./Logo.png"
									alt="Bit Learning Logo"
									className="h-10 w-full object-contain"
								/>
							</div>
						</div>
						{subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
					</div>
				</div>

				{/* Center: big search bar */}
				<div className="flex flex-1 justify-center px-4">
					<div className="w-full max-w-xl lg:max-w-2xl">
						<Search />
					</div>
				</div>

				{/* Right: actions */}
				<div className="ml-auto flex shrink-0 items-center gap-2 md:gap-3">
					{actions ?? (
						<>
							<ThemeSwitch />
							<ConfigDrawer />
							<NotificationBell />
							<ProfileDropdown />
						</>
					)}
				</div>
			</div>
		</header>
	);
}
