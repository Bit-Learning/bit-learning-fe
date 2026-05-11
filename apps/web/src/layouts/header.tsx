import { useLogout } from "@/feature/auth/queries/useAuth";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { selectCartItemCount } from "@/feature/order/stores/cart.store";
import { navItems } from "@/layouts/data/nav-items";
import { NotificationBell } from "@/feature/notification/component/notification-bell";
import { mergeName } from "@/shared/lib/string-utils";
import { Link, useNavigate } from "@tanstack/react-router";
import {
	Sheet,
	SheetContent,
	SheetTrigger,
} from "@workspace/ui/components/sheet";
import { cn } from "@workspace/ui/lib/utils";
import {
	Book,
	ChevronDown,
	LogOut,
	Menu,
	Settings,
	User,
	User2Icon,
	ShoppingCart,
	Coins,
	MonitorPlay,
	ArrowLeftRight,
	LayoutDashboard,
	FileText,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useCart } from "@/feature/order/queries/useCart";
import BitCoinIcon from "@/shared/components/BitCoinIcon";
import Button from "@/shared/components/button/LoginButton";
import { ThemeToggle } from "@/shared/components/ThemeToggle";

const Header: React.FC = () => {
	const navigate = useNavigate();
	const [isNavOpen, setIsNavOpen] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);
	const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
	const closeMenuTimeout = useRef<number | null>(null);
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const profileRef = useRef<HTMLDivElement>(null);
	const { isAuthenticated, userInfo } = useSelector(selectAuthStateInfo);
	const cartItemCount = useSelector(selectCartItemCount);
	const logout = useLogout();

	useCart();

	const handleNavigate = (path: string) => {
		navigate({ to: path });
		setIsNavOpen(false);
		setHoveredMenu(null);
	};

	const handleLogout = () => {
		logout();
		navigate({ to: "/signin-role" });
	};

	const handleCartClick = () => {
		navigate({ to: "/cart" });
	};

	const cancelCloseMenu = () => {
		if (closeMenuTimeout.current !== null) {
			window.clearTimeout(closeMenuTimeout.current);
			closeMenuTimeout.current = null;
		}
	};

	const scheduleCloseMenu = () => {
		cancelCloseMenu();
		closeMenuTimeout.current = window.setTimeout(() => {
			setHoveredMenu(null);
		}, 120);
	};

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 20);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const handleClickOutside = useCallback((e: MouseEvent) => {
		if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
			setIsProfileOpen(false);
		}
	}, []);

	useEffect(() => {
		if (isProfileOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isProfileOpen, handleClickOutside]);

	return (
		<header
			className={cn(
				"sticky top-0 left-0 right-0 z-50",
				"transition-all duration-300",
				"backdrop-blur-2xl",
				"bg-white/70 dark:bg-[#020617]/70",
				"border-b border-white/20 dark:border-white/10",
				"supports-[backdrop-filter]:bg-white/60",
				"dark:supports-[backdrop-filter]:bg-[#020617]/60",
				isScrolled &&
					"shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]",
			)}
		>
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between h-20">
					<Link
						to="/"
						id="tour-logo"
						className="flex items-center relative z-50"
					>
						<img
							src="/Logo.png"
							alt="Bit Learning"
							className={cn(
								"object-contain transition-all duration-300",
								isScrolled ? "h-8 w-28" : "h-10 w-36",
							)}
						/>
					</Link>

					<nav id="tour-navbar" className="hidden lg:flex items-center gap-1">
						{navItems.map((item) => (
							<div
								key={item.title}
								className="relative group rounded-2xl border-transparent transition-all duration-200"
								onMouseEnter={cancelCloseMenu}
								onMouseLeave={scheduleCloseMenu}
							>
								{item.items ? (
									<>
										<button
											onMouseEnter={() => {
												cancelCloseMenu();
												setHoveredMenu(item.title);
											}}
											className="flex items-center gap-1 px-4 py-2 rounded-lg text-md font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200 cursor-pointer"
										>
											{item.title}
											<ChevronDown
												className={cn(
													"h-4 w-4 transition-transform duration-200",
													hoveredMenu === item.title && "rotate-180",
												)}
											/>
										</button>

										<div
											onMouseEnter={() => {
												cancelCloseMenu();
												setHoveredMenu(item.title);
											}}
											onMouseLeave={scheduleCloseMenu}
											className={cn(
												"absolute top-full mt-2 left-0 w-72 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white dark:bg-gray-800 shadow-xl transition-all duration-200 overflow-hidden z-100",
												hoveredMenu === item.title
													? "opacity-100 translate-y-0 pointer-events-auto"
													: "opacity-0 -translate-y-2 pointer-events-none",
											)}
										>
											<div className="p-2">
												{item.items.map((subItem) => (
													<button
														key={subItem.title}
														onClick={() => handleNavigate(subItem.to)}
														className="w-full rounded-xl p-3 text-left transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 group/item cursor-pointer"
													>
														<div className="text-md font-semibold text-gray-900 dark:text-gray-100 group-hover/item:text-primary dark:group-hover/item:text-blue-400 transition-colors">
															{subItem.title}
														</div>
														<p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
															{subItem.description}
														</p>
													</button>
												))}
											</div>
										</div>
									</>
								) : (
									<button
										onClick={() => handleNavigate(item.to!)}
										className="px-4 py-2 rounded-lg text-md font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200 cursor-pointer"
									>
										{item.title}
									</button>
								)}
							</div>
						))}
					</nav>

					<div id="tour-header-actions" className="flex items-center gap-2">
						{userInfo?.role === "MENTOR" && (
							<button
								onClick={() => navigate({ to: "/mentor/dashboard" })}
								className="relative rounded-xl p-2
               hover:bg-gray-100 dark:hover:bg-gray-800
               transition-all duration-200
               group cursor-pointer"
							>
								<LayoutDashboard
									className="h-7 w-7
                 text-gray-600 dark:text-gray-300
                 group-hover:text-primary
                 dark:group-hover:text-blue-400
                 transition-colors"
								/>

								<span
									className="absolute left-1/2 -translate-x-1/2 top-full mt-2
                 whitespace-nowrap
                 px-3 py-1.5
                 text-sm font-semibold
                 text-white bg-gray-900
                 rounded-lg shadow-lg
                 opacity-0 group-hover:opacity-100
                 transition-all duration-200"
								>
									Công cụ giảng viên
								</span>
							</button>
						)}
						{isAuthenticated && (
							<button
								onClick={handleCartClick}
								className="relative rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group cursor-pointer"
							>
								<ShoppingCart className="h-7 w-7 text-gray-600 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors" />
								{cartItemCount > 0 && (
									<span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg">
										{cartItemCount > 9 ? "9+" : cartItemCount}
									</span>
								)}
							</button>
						)}

						{isAuthenticated && userInfo && <NotificationBell />}

						{isAuthenticated && userInfo ? (
							<div className="relative" ref={profileRef}>
								<button
									type="button"
									onClick={() => setIsProfileOpen((prev) => !prev)}
									className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
								>
									<div className="relative size-13 shrink-0 overflow-hidden rounded-full pointer-events-none">
										{userInfo.avatar ? (
											<img
												src={userInfo.avatar}
												alt={userInfo.username}
												className="aspect-square size-full object-cover"
											/>
										) : (
											<div className="flex size-full items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-500 text-white text-xs">
												{userInfo.username?.slice(0, 2).toUpperCase()}
											</div>
										)}
									</div>
									<div className="hidden md:flex flex-col items-start">
										<span className="text-md font-bold text-gray-900 dark:text-gray-100">
											{mergeName(userInfo.firstName, userInfo.lastName)}
										</span>
										<div className="flex items-center justify-center gap-1">
											<span className="text-[16px] font-semibold text-amber-700 dark:text-gray-100 mt-0.5">
												{userInfo.wallet.balance.toLocaleString("vi-VN")}
											</span>
											<BitCoinIcon size={19} />
										</div>
									</div>
								</button>

								{isProfileOpen && (
									<div className="absolute right-0 top-full mt-2 z-50 min-w-50 rounded-lg border bg-white dark:bg-gray-800/80 shadow-lg p-1.5">
										<button
											onClick={() => {
												navigate({ to: "/profile" });
												setIsProfileOpen(false);
											}}
											className="flex w-full items-center gap-3 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-primary hover:text-white transition-colors"
										>
											<User className="h-4 w-4" />
											<span>Hồ sơ cá nhân</span>
										</button>
										{userInfo.role === "MENTOR" && (
											<button
												onClick={() => {
													navigate({ to: "/mentor/dashboard" });
													setIsProfileOpen(false);
												}}
												className="flex w-full items-center gap-3 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-primary hover:text-white transition-colors"
											>
												<LayoutDashboard className="h-4 w-4" />
												<span>Công cụ giảng viên</span>
											</button>
										)}
										<button
											onClick={() => {
												navigate({ to: "/dashboard" });
												setIsProfileOpen(false);
											}}
											className="flex w-full items-center gap-3 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-primary hover:text-white transition-colors"
										>
											<Book className="h-4 w-4" />
											<span>Báo cáo học tập</span>
										</button>

										<button
											onClick={() => {
												navigate({ to: "/profile/top-up" });
												setIsProfileOpen(false);
											}}
											className="flex w-full items-center gap-3 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-primary hover:text-white transition-colors"
										>
											<Coins className="h-4 w-4" />
											<span>Nạp xu BIT</span>
										</button>

										<button
											onClick={() => {
												navigate({ to: "/profile/my-course" });
												setIsProfileOpen(false);
											}}
											className="flex w-full items-center gap-3 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-primary hover:text-white transition-colors"
										>
											<MonitorPlay className="h-4 w-4" />
											<span>Khóa học của tôi</span>
										</button>

										<button
											onClick={() => {
												navigate({ to: "/forum/my" });
												setIsProfileOpen(false);
											}}
											className="flex w-full items-center gap-3 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-primary hover:text-white transition-colors"
										>
											<FileText className="h-4 w-4" />
											<span>Quản lý bài viết</span>
										</button>

										<button
											onClick={() => {
												navigate({ to: "/profile/history" });
												setIsProfileOpen(false);
											}}
											className="flex w-full items-center gap-3 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-primary hover:text-white transition-colors"
										>
											<ArrowLeftRight className="h-4 w-4" />
											<span>Lịch sử mua hàng</span>
										</button>

										<button
											onClick={() => {
												navigate({ to: "/profile/password" });
												setIsProfileOpen(false);
											}}
											className="flex w-full items-center gap-3 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-primary hover:text-white transition-colors"
										>
											<Settings className="h-4 w-4" />
											<span>Đổi mật khẩu</span>
										</button>
										<div className="my-1 h-px bg-gray-200 dark:bg-gray-700" />
										<button
											onClick={() => {
												handleLogout();
												setIsProfileOpen(false);
											}}
											className="flex w-full items-center gap-3 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-red-500 hover:text-white transition-colors"
										>
											<LogOut className="h-4 w-4" />
											<span>Đăng xuất</span>
										</button>
									</div>
								)}
							</div>
						) : (
							<Button />
						)}

						<ThemeToggle />

						<Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
							<SheetTrigger asChild className="lg:hidden">
								<button className="rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
									<Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
								</button>
							</SheetTrigger>
							<SheetContent
								side="right"
								className="w-[320px] bg-white dark:bg-gray-900 p-6 overflow-y-auto"
							>
								<div className="flex flex-col gap-4 mt-8">
									<h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
										Menu
									</h2>
									{navItems.map((item) => (
										<div
											key={item.title}
											className="border-b border-gray-200 dark:border-gray-800 pb-4 last:border-b-0"
										>
											{item.items ? (
												<div>
													<div className="mb-3 font-bold text-gray-900 dark:text-gray-100">
														{item.title}
													</div>
													<div className="flex flex-col gap-2">
														{item.items.map((subItem) => (
															<button
																key={subItem.title}
																onClick={() => handleNavigate(subItem.to)}
																className="rounded-xl p-3 text-left transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/30"
															>
																<div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
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
													className="w-full rounded-xl p-3 text-left font-bold text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200"
												>
													{item.title}
												</button>
											)}
										</div>
									))}

									{!isAuthenticated && <Button />}
								</div>
							</SheetContent>
						</Sheet>
					</div>
				</div>
			</div>
		</header>
	);
};

export default Header;
