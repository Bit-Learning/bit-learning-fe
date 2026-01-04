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
import {
	ChevronRight,
	LogOut,
	Menu,
	Search,
	Settings,
	User,
	User2Icon,
	Wallet,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLogout } from "@/feature/auth/queries/useAuth";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { navItems } from "@/layouts/data/nav-items";
import CodeButton from "@/shared/components/button/CodeButton";
import { SearchProvider } from "@/shared/context/search-context";
import { mergeName } from "@/shared/lib/string-utils";

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
					container sticky top-5 z-50 mx-auto
					rounded-2xl
					border border-white/20 dark:border-white/10
					bg-white/60 dark:bg-gray-900/60
					backdrop-blur-sm backdrop-saturate-150
					shadow-lg shadow-black/5 dark:shadow-black/40
					supports-backdrop-filter:bg-white/50
				"
			>
				<div className="flex items-center justify-between gap-4 py-4 px-4 md:px-6">
					{/* Left: Hamburger Menu + Logo */}
					<div className="flex items-center gap-3">
						{/* Desktop Navigation Dropdown */}
						<div className="hidden md:block relative" ref={desktopMenuRef}>
							<button
								onClick={() => setIsDesktopMenuOpen(!isDesktopMenuOpen)}
								className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
							>
								<Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
							</button>

							{isDesktopMenuOpen && (
								<div className="absolute left-0 top-full mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800 py-2 z-50">
									{navItems.map((item) => (
										<div
											key={item.title}
											className="relative"
											onMouseEnter={() =>
												item.items && setHoveredItem(item.title)
											}
											onMouseLeave={() => setHoveredItem(null)}
										>
											{item.items ? (
												<>
													<div className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-default">
														<span>{item.title}</span>
														<ChevronRight className="h-4 w-4" />
													</div>

													{hoveredItem === item.title && (
														<div className="absolute left-full top-0 ml-2 w-80 rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800 p-2 z-50">
															{item.items.map((subItem) => (
																<button
																	key={subItem.title}
																	onClick={() => handleNavigate(subItem.to)}
																	className="w-full rounded-md p-3 text-left transition-colors hover:bg-blue-50 dark:hover:bg-gray-700"
																>
																	<div className="text-sm font-medium text-gray-900 dark:text-gray-200">
																		{subItem.title}
																	</div>
																	<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
																		{subItem.description}
																	</p>
																</button>
															))}
														</div>
													)}
												</>
											) : (
												<button
													onClick={() => handleNavigate(item.to!)}
													className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
												>
													{item.title}
												</button>
											)}
										</div>
									))}
								</div>
							)}
						</div>

						{/* Mobile Navigation Sheet */}
						<Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
							<SheetTrigger asChild className="md:hidden">
								<button className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
									<Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
								</button>
							</SheetTrigger>
							<SheetContent
								side="left"
								className="w-[320px] bg-white p-6 dark:bg-gray-900 overflow-y-auto"
							>
								<div className="flex flex-col gap-4 mt-8">
									<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
										Menu
									</h2>
									{navItems.map((item) => (
										<div
											key={item.title}
											className="border-b border-gray-100 dark:border-gray-800 pb-3 last:border-b-0"
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
																className="rounded-md p-3 text-left transition-colors hover:bg-blue-50 dark:hover:bg-gray-800 border border-transparent hover:border-blue-200 dark:hover:border-gray-700"
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
													className="w-full rounded-md p-3 text-left font-semibold text-gray-900 transition-colors hover:bg-blue-50 dark:text-gray-200 dark:hover:bg-gray-800"
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
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
							<input
								type="text"
								placeholder="Tìm kiếm khóa học, bài viết..."
								className="w-full rounded-full border border-gray-200 bg-white py-5 pl-10 pr-4 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500"
							/>
							<button className="absolute end-2.5 bottom-1/2 translate-y-1/2 p-4 text-sm font-medium text-white bg-blue-700 rounded-full border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
								<svg
									viewBox="0 0 20 20"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									aria-hidden="true"
									className="w-4 h-4"
								>
									<path
										d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
										stroke-width="2"
										stroke-linejoin="round"
										stroke-linecap="round"
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
							className="rounded-lg p-2 transition-colors hover:bg-gray-100 md:hidden dark:hover:bg-gray-800"
						>
							<Search className="h-5 w-5 text-gray-600 dark:text-gray-300" />
						</button>

						{/* User Menu / Login */}
						{isAuthenticated && userInfo ? (
							<MenuTrigger>
								<Button
									variant="ghost"
									className="flex items-center gap-2 px-2"
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
											onAction={() => navigate({ to: "/user-profile" })}
										>
											<Wallet className="mr-2 h-4 w-4" />
											<span>
												{(userInfo.wallet?.balance ?? 0).toLocaleString(
													"vi-VN",
													{
														style: "currency",
														currency: "VND",
													},
												)}
											</span>
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
