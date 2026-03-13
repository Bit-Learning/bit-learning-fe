import { useLogout } from "@/feature/auth/queries/useAuth";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { navItems } from "@/layouts/data/nav-items";
import CodeButton from "@/shared/components/button/CodeButton";
import { SearchProvider, useSearch } from "@/shared/context/search-context";
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
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from "@workspace/ui/components/navigation-menu";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetTrigger,
} from "@workspace/ui/components/sheet";
import { LogOut, Menu, Search, Settings, User, User2Icon } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import MobileSheetMenu from "./mobile-sheet-menu";

const TransparentHeader: React.FC = () => {
	const navigate = useNavigate();
	const [isSheetOpen, setIsSheetOpen] = useState(false);
	const { setOpen } = useSearch();
	const { isAuthenticated, userInfo } = useSelector(selectAuthStateInfo);
	const logout = useLogout();

	const handleNavigate = (path: string) => {
		navigate({ to: path });
		setIsSheetOpen(false);
	};

	const handleLogout = () => {
		logout();
		navigate({ to: "/signin" });
	};

	return (
		<SearchProvider>
			<header className="absolute left-0 right-0 top-0 z-50 border-b border-white/20 bg-white/10 shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300 hover:bg-white/[0.15]">
				<div className="container mx-auto flex items-center justify-between py-5 max-[776px]:px-4 md:px-10">
					<Link
						to="/"
						className="group flex items-center space-x-2 transition-transform duration-200 hover:scale-105"
					>
						<div className="flex items-center space-x-2">
							<img
								src="/Logo.png"
								alt="Bit Learning"
								className="h-10 w-36 object-contain drop-shadow-[0_2px_12px_rgba(255,255,255,0.5)] transition-all duration-300 group-hover:drop-shadow-[0_4px_20px_rgba(255,255,255,0.8)]"
							/>
						</div>
					</Link>

					<NavigationMenu className="hidden md:block">
						<NavigationMenuList>
							{navItems.map((item) => (
								<NavigationMenuItem key={item.title}>
									{item.items ? (
										<>
											<NavigationMenuTrigger className="text-white drop-shadow-sm transition-all duration-200 hover:text-gray-600 data-[state=open]:text-gray-600">
												{item.title}
											</NavigationMenuTrigger>
											<NavigationMenuContent className="border border-white/20 bg-gray-900/85 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] backdrop-blur-2xl backdrop-saturate-150">
												<ul className="grid w-[300px] gap-3 p-6 md:w-[400px] lg:w-[500px]">
													{item.items.map((subItem) => (
														<li key={subItem.title} className="p-1">
															<NavigationMenuLink asChild>
																<Link
																	to={subItem.to}
																	className="block select-none space-y-1.5 rounded-xl border border-transparent p-3 leading-none no-underline outline-none transition-all duration-200 hover:border-white/30 hover:bg-white/15 hover:shadow-lg"
																>
																	<div className="text-sm font-semibold leading-none text-white">
																		{subItem.title}
																	</div>
																	<p className="line-clamp-2 text-xs leading-snug text-gray-300">
																		{subItem.description}
																	</p>
																</Link>
															</NavigationMenuLink>
														</li>
													))}
												</ul>
											</NavigationMenuContent>
										</>
									) : (
										<NavigationMenuLink asChild>
											<Link
												to={item.to!}
												className={
													navigationMenuTriggerStyle() +
													" text-white drop-shadow-sm transition-all duration-200 hover:text-white/90"
												}
											>
												{item.title}
											</Link>
										</NavigationMenuLink>
									)}
								</NavigationMenuItem>
							))}
						</NavigationMenuList>
					</NavigationMenu>

					<div className="hidden items-center space-x-4 md:flex">
						{isAuthenticated && userInfo ? (
							<MenuTrigger>
								<Button
									variant="ghost"
									className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-white shadow-lg backdrop-blur-xl transition-all duration-200 hover:bg-white/20 hover:shadow-xl"
								>
									<Avatar className="h-8 w-8">
										<AvatarImage
											src={userInfo.avatar}
											alt={userInfo.username}
										/>
										<AvatarFallback className="bg-white/30 text-white backdrop-blur">
											{userInfo.avatar?.slice(0, 2).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div className="flex flex-col items-start">
										<span className="text-sm font-semibold text-white drop-shadow-md">
											{mergeName(userInfo.firstName, userInfo.lastName)}
										</span>
									</div>
								</Button>
								<MenuPopover placement="bottom end">
									<DropdownMenu className="border border-white/20 bg-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] backdrop-blur-2xl backdrop-saturate-150 dark:bg-gray-900/90">
										<MenuItem onAction={() => navigate({ to: "/profile" })}>
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
								onClick={() => navigate({ to: "/signin-role" })}
								className="rounded-full border border-white/30 bg-white/20 px-6 py-2.5 font-semibold text-white shadow-lg backdrop-blur-xl transition-all duration-200 hover:bg-white/30 hover:shadow-xl"
							/>
						)}
					</div>

					<div className="flex items-center gap-3 md:hidden">
						<div className="border-r border-white/20 pr-3 max-[776px]:block">
							<button
								type="button"
								onClick={() => setOpen(true)}
								className="relative cursor-pointer rounded-full p-2 text-white backdrop-blur-xl transition-all duration-200 hover:bg-white/10 hover:shadow-lg"
							>
								<Search size={18} className="drop-shadow-md" />
							</button>
						</div>
						<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
							<SheetClose asChild style={{ color: "white !important" }} />
							<SheetTrigger asChild>
								<button className="rounded-full p-2 text-white backdrop-blur-xl transition-all duration-200 hover:bg-white/10 hover:shadow-lg md:hidden">
									<Menu className="h-6 w-6 drop-shadow-md" />
								</button>
							</SheetTrigger>
							<SheetContent
								side="right"
								className="w-[320px] border-l border-white/20 bg-white/10 p-0 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] backdrop-blur-2xl backdrop-saturate-150 sm:w-[400px] dark:bg-gray-900/90"
							>
								<MobileSheetMenu
									onNavigate={handleNavigate}
									onClose={() => setIsSheetOpen(false)}
								/>
							</SheetContent>
						</Sheet>
					</div>
				</div>
			</header>
		</SearchProvider>
	);
};

export default TransparentHeader;
