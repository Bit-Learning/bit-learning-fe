import { useLogout } from "@/feature/auth/queries/useAuth";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { navItems } from "@/layouts/data/nav-items";
import CodeButton from "@/shared/components/button/CodeButton";
import { SearchProvider } from "@/shared/context/search-context";
import { mergeName } from "@/shared/lib/string-utils";
import { Link, useNavigate } from "@tanstack/react-router";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@workspace/ui/components/Avatar";
import { Button } from "@workspace/ui/components/Button";
import {
	Menu as DropdownMenu,
	MenuItem,
	MenuPopover,
	MenuSeparator,
	MenuTrigger,
} from "@workspace/ui/components/Menu";
import {
	Sheet,
	SheetContent,
	SheetTrigger,
} from "@workspace/ui/components/sheet";
import { cn } from "@workspace/ui/lib/utils";
import {
	ChevronRight,
	LogOut,
	Menu,
	Search,
	Settings,
	User,
	User2Icon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

const Header: React.FC = () => {
	const navigate = useNavigate();
	const [isNavOpen, setIsNavOpen] = useState(false);
	const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
	const [hoveredItem, setHoveredItem] = useState<string | null>(null);
	const { isAuthenticated, userInfo } = useSelector(selectAuthStateInfo);
	const logout = useLogout();
	const desktopMenuRef = useRef<HTMLDivElement>(null);

	const handleNavigate = (path: string) => {
		navigate({ to: path });
		setIsNavOpen(false);
		setIsDesktopMenuOpen(false);
		setHoveredItem(null);
	};

	const handleLogout = () => {
		logout();
		navigate({ to: "/signin" });
	};

	// Close desktop menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				desktopMenuRef.current &&
				!desktopMenuRef.current.contains(event.target as Node)
			) {
				setIsDesktopMenuOpen(false);
				setHoveredItem(null);
			}
		};

		if (isDesktopMenuOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isDesktopMenuOpen]);

	return (
		<SearchProvider>
			<header
				className="
          container sticky top-5 z-100 mx-auto
          rounded-[20px]
          border border-white/40 dark:border-white/20
          bg-white/70 dark:bg-gray-900/70
          backdrop-blur-2xl
          backdrop-saturate-200
          shadow-[0_8px_32px_0_rgba(0,0,0,0.08)]
          dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]
          before:absolute before:inset-0
          before:rounded-[20px]
          before:bg-linear-to-br
          before:from-white/60 before:via-white/20 before:to-transparent
          before:opacity-60
          before:pointer-events-none
          after:absolute after:inset-x-0 after:top-0 after:h-px
          after:bg-linear-to-r
          after:from-transparent after:via-white/80 after:to-transparent
          after:pointer-events-none
          overflow-visible
        "
			>
				<div className="relative z-10 flex items-center justify-between gap-4 py-4 px-4 md:px-6">
					{/* Left: Hamburger Menu + Logo */}
					<div className="flex items-center gap-3">
						{/* Desktop Navigation Dropdown */}
						<div className="hidden md:block relative" ref={desktopMenuRef}>
							<button
								onClick={() => setIsDesktopMenuOpen(!isDesktopMenuOpen)}
								className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
							>
								<Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
							</button>

							{isDesktopMenuOpen && (
								<div className="absolute left-0 top-full mt-7 w-64 rounded-2xl border border-white/40 dark:border-white/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] py-2 z-9999 overflow-visible">
									{/* Inner glow */}
									<div className="absolute inset-0 bg-linear-to-br from-white/40 via-transparent to-transparent pointer-events-none rounded-2xl" />

									<div className="relative z-10">
										{navItems.map((item) => (
											<div key={item.title} className="relative group">
												{item.items ? (
													<div
														onMouseEnter={() => setHoveredItem(item.title)}
														onMouseLeave={() => setHoveredItem(null)}
													>
														<div className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10 cursor-default transition-all duration-200 mx-1 rounded-xl">
															<span>{item.title}</span>
															<ChevronRight className="h-4 w-4" />
														</div>

														<div
															onMouseEnter={() => setHoveredItem(item.title)}
															onMouseLeave={() => setHoveredItem(null)}
															className={cn(
																"absolute left-full top-0 pl-2 transition-all duration-200 ease-out will-change-transform",
																hoveredItem === item.title
																	? "opacity-100 translate-x-0 scale-100 pointer-events-auto"
																	: "opacity-0 translate-x-2 scale-95 pointer-events-none",
															)}
														>
															{/* Hover bridge */}
															<div className="absolute -left-2 top-0 h-full w-8" />

															{/* Submenu */}
															<div className="w-80 rounded-2xl border border-white/40 dark:border-white/20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] p-2 overflow-hidden">
																<div className="absolute inset-0 bg-linear-to-br from-white/40 via-transparent to-transparent pointer-events-none" />

																<div className="relative z-10 space-y-2">
																	{item.items.map((subItem) => (
																		<button
																			key={subItem.title}
																			onClick={() => handleNavigate(subItem.to)}
																			className="w-full rounded-xl p-3 text-left transition-all duration-300 ease-in-out hover:bg-blue-100/60 dark:hover:bg-blue-900/20 backdrop-blur-sm group"
																		>
																			<div className="text-sm font-medium text-gray-900 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
																				{subItem.title}
																			</div>
																			<p className="mt-1 text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300">
																				{subItem.description}
																			</p>
																		</button>
																	))}
																</div>
															</div>
														</div>
													</div>
												) : (
													<button
														onClick={() => handleNavigate(item.to!)}
														className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10 transition-all duration-200 mx-1 rounded-xl"
													>
														{item.title}
													</button>
												)}
											</div>
										))}
									</div>
								</div>
							)}
						</div>

						{/* Mobile Navigation Sheet */}
						<Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
							<SheetTrigger asChild className="md:hidden">
								<button className="rounded-xl p-2 transition-all duration-200 hover:bg-white/50 dark:hover:bg-white/10 backdrop-blur-sm">
									<Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
								</button>
							</SheetTrigger>
							<SheetContent
								side="left"
								className="w-[320px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl p-6 overflow-y-auto border-r border-white/40 dark:border-white/20"
							>
								<div className="flex flex-col gap-4 mt-8">
									<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
										Menu
									</h2>
									{navItems.map((item) => (
										<div
											key={item.title}
											className="border-b border-gray-100/50 dark:border-gray-800/50 pb-3 last:border-b-0"
										>
											{item.items ? (
												<div>
													<div className="mb-3 font-semibold text-gray-900 dark:text-gray-200">
														{item.title}
													</div>
													<div className="ml-2 flex flex-col gap-2">
														{item.items.map((subItem) => (
															<button
																key={subItem.title}
																onClick={() => handleNavigate(subItem.to)}
																className="rounded-xl p-3 text-left transition-all duration-200 hover:bg-blue-50/80 dark:hover:bg-white/10 border border-transparent hover:border-blue-200/50 dark:hover:border-white/20 backdrop-blur-sm"
															>
																<div className="text-sm font-medium text-gray-700 dark:text-gray-300">
																	{subItem.title}
																</div>
																<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
																	{subItem.description}
																</p>
															</button>
														))}
													</div>
												</div>
											) : (
												<button
													onClick={() => handleNavigate(item.to!)}
													className="w-full rounded-xl p-3 text-left font-semibold text-gray-900 transition-all duration-200 hover:bg-blue-50/80 dark:text-gray-200 dark:hover:bg-white/10 backdrop-blur-sm"
												>
													{item.title}
												</button>
											)}
										</div>
									))}
								</div>
							</SheetContent>
						</Sheet>

						<Link to="/" className="flex items-center">
							<img
								src="/Logo.png"
								alt="Bithub Learning"
								className="h-8 w-28 object-contain md:h-10 md:w-36"
							/>
						</Link>
					</div>

					{/* Center: Search Bar */}
					<div className="hidden flex-1 max-w-xl md:block">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 z-10" />
							<input
								type="text"
								placeholder="Tìm kiếm khóa học, bài viết..."
								className="w-full rounded-full border border-white/40 dark:border-white/20 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl py-2.5 pl-10 pr-14 text-sm transition-all duration-200 focus:border-blue-400/60 dark:focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-gray-200 dark:placeholder-gray-400 shadow-inner"
							/>
							<button className="absolute end-1.5 top-1/2 -translate-y-1/2 p-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300/50 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800/50 transition-all duration-200 shadow-lg shadow-blue-500/30">
								<svg
									viewBox="0 0 20 20"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									aria-hidden="true"
									className="w-4 h-4"
								>
									<path
										d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
										strokeWidth="2"
										strokeLinejoin="round"
										strokeLinecap="round"
										stroke="currentColor"
									/>
								</svg>
								<span className="sr-only">Search</span>
							</button>
						</div>
					</div>

					{/* Right: User Menu or Login Button */}
					<div className="flex items-center gap-2">
						{/* Mobile Search Icon */}
						<button
							type="button"
							className="rounded-xl p-2 transition-all duration-200 hover:bg-white/50 dark:hover:bg-white/10 md:hidden backdrop-blur-sm"
						>
							<Search className="h-5 w-5 text-gray-600 dark:text-gray-300" />
						</button>

						{/* User Menu / Login */}
						{isAuthenticated && userInfo ? (
							<MenuTrigger>
								<Button
									variant="ghost"
									className="flex items-center gap-2 px-2 hover:bg-white/50 dark:hover:bg-white/10 rounded-xl transition-all duration-200"
								>
									<Avatar className="h-8 w-8">
										<AvatarImage
											src={userInfo.avatar}
											alt={userInfo.username}
										/>
										<AvatarFallback>
											{userInfo.avatar?.slice(0, 2).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div className="hidden flex-col items-start md:flex">
										<span className="text-sm font-medium">
											{mergeName(userInfo.firstName, userInfo.lastName)}
										</span>
									</div>
								</Button>
								<MenuPopover placement="bottom end">
									<DropdownMenu>
										<MenuItem
											onAction={() => navigate({ to: "/user-profile" })}
										>
											<User className="mr-2 h-4 w-4" />
											<span>Hồ sơ cá nhân</span>
										</MenuItem>
										<MenuItem
											onAction={() => navigate({ to: "/mentor/dashboard" })}
										>
											<User2Icon className="mr-2 h-4 w-4" />
											<span>Mentor</span>
										</MenuItem>
										<MenuItem isDisabled>
											<Settings className="mr-2 h-4 w-4" />
											<span>Cài đặt</span>
										</MenuItem>
										<MenuSeparator />
										<MenuItem onAction={handleLogout}>
											<LogOut className="mr-2 h-4 w-4" />
											<span>Đăng xuất</span>
										</MenuItem>
									</DropdownMenu>
								</MenuPopover>
							</MenuTrigger>
						) : (
							<CodeButton
								label="Đăng nhập"
								onClick={() => navigate({ to: "/signin" })}
								className="hidden md:block"
							/>
						)}
					</div>
				</div>
			</header>
		</SearchProvider>
	);
};

export default Header;
