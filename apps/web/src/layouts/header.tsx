import { useLogout } from "@/feature/auth/queries/useAuth";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { selectCartItemCount } from "@/feature/order/stores/cart.store";
import { navItems } from "@/layouts/data/nav-items";
import { NotificationBell } from "@/feature/notification/component/notification-bell";
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
	Book,
	ChevronDown,
	LogOut,
	Menu,
	Settings,
	User,
	User2Icon,
	ShoppingCart,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useCart } from "@/feature/order/queries/useCart";
import BitCoinIcon from "@/shared/components/BitCoinIcon";

const Header: React.FC = () => {
	const navigate = useNavigate();
	const [isNavOpen, setIsNavOpen] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);
	const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
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
		navigate({ to: "/signin" });
	};

	const handleCartClick = () => {
		navigate({ to: "/cart" });
	};

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 20);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<header
			className={cn(
				"sticky top-0 left-0 right-0 z-50 transition-all duration-300",
				"bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-400 dark:border-gray-800/50",
				isScrolled && "shadow-lg",
			)}
		>
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between h-20">
					<Link to="/" className="flex items-center relative z-50">
						<img
							src="/Logo.png"
							alt="Bit Learning"
							className={cn(
								"object-contain transition-all duration-300",
								isScrolled ? "h-8 w-28" : "h-10 w-36",
							)}
						/>
					</Link>

					<nav className="hidden lg:flex items-center gap-1">
						{navItems.map((item) => (
							<div key={item.title} className="relative group">
								{item.items ? (
									<>
										<button
											onMouseEnter={() => setHoveredMenu(item.title)}
											className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200 cursor-pointer"
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
											onMouseEnter={() => setHoveredMenu(item.title)}
											onMouseLeave={() => setHoveredMenu(null)}
											className={cn(
												"absolute top-full left-0 mt-2 w-72 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white dark:bg-gray-800 shadow-xl transition-all duration-200 overflow-hidden z-100",
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
														<div className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors">
															{subItem.title}
														</div>
														<p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
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
										className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200 cursor-pointer"
									>
										{item.title}
									</button>
								)}
							</div>
						))}
					</nav>

					<div className="flex items-center gap-2">
						{isAuthenticated && (
							<button
								onClick={handleCartClick}
								className="relative rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group cursor-pointer"
							>
								<ShoppingCart className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
								{cartItemCount > 0 && (
									<span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-linear-to-r from-red-500 to-pink-500 text-[10px] font-bold text-white shadow-lg">
										{cartItemCount > 9 ? "9+" : cartItemCount}
									</span>
								)}
							</button>
						)}

						{isAuthenticated && userInfo && <NotificationBell />}

						{isAuthenticated && userInfo ? (
							<MenuTrigger>
								<Button
									variant="ghost"
									className="flex items-center gap-3 px-4 py-6 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-500"
								>
									<Avatar className="size-12">
										<AvatarImage
											src={userInfo.avatar}
											alt={userInfo.username}
										/>
										<AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-500 text-white text-xs">
											{userInfo.avatar?.slice(0, 2).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div className="hidden md:flex flex-col items-start">
										<span className="text-md font-bold text-gray-900 dark:text-gray-100">
											{mergeName(userInfo.firstName, userInfo.lastName)}
										</span>
										<div className="flex items-center justify-center gap-2">
											<span className="text-sm font-semibold text-gray-700 dark:text-gray-100">
												{userInfo.wallet.balance.toLocaleString("vi-VN")}
											</span>
											<BitCoinIcon size={18} />
										</div>
									</div>
								</Button>
								<MenuPopover placement="bottom end">
									<DropdownMenu className="min-w-50">
										<MenuItem
											onAction={() => navigate({ to: "/profile" })}
											className="cursor-pointer"
										>
											<User className="mr-3 h-4 w-4" />
											<span>Hồ sơ cá nhân</span>
										</MenuItem>
										{userInfo.role == "MENTOR" && (
											<MenuItem
												onAction={() => navigate({ to: "/mentor/dashboard" })}
												className="cursor-pointer"
											>
												<User2Icon className="mr-3 h-4 w-4" />
												<span>Mentor</span>
											</MenuItem>
										)}
										<MenuItem
											onAction={() => navigate({ to: "/dashboard" })}
											className="cursor-pointer"
										>
											<Book className="mr-3 h-4 w-4" />
											<span>Báo cáo học tập</span>
										</MenuItem>
										<MenuItem isDisabled className="cursor-pointer">
											<Settings className="mr-3 h-4 w-4" />
											<span>Cài đặt</span>
										</MenuItem>
										<MenuSeparator />
										<MenuItem
											onAction={handleLogout}
											className="cursor-pointer"
										>
											<LogOut className="mr-3 h-4 w-4" />
											<span>Đăng xuất</span>
										</MenuItem>
									</DropdownMenu>
								</MenuPopover>
							</MenuTrigger>
						) : (
							<button
								onClick={() => navigate({ to: "/signin-role" })}
								className="cursor-pointer hidden md:flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 transform hover:scale-105"
							>
								<User className="h-4 w-4" />
								Đăng nhập
							</button>
						)}

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

									{!isAuthenticated && (
										<button
											onClick={() => navigate({ to: "/signin-role" })}
											className="cursor-pointer mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg shadow-blue-500/30 transition-all duration-200"
										>
											<User className="h-4 w-4" />
											Đăng nhập
										</button>
									)}
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
