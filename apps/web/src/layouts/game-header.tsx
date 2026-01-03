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
	SheetClose,
	SheetContent,
	SheetTrigger,
} from "@workspace/ui/components/sheet";
import {
	Gamepad2,
	LogOut,
	Menu,
	Search,
	Settings,
	User,
	User2Icon,
	Wallet,
} from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useLogout } from "@/feature/auth/queries/useAuth";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { SearchProvider, useSearch } from "@/shared/context/search-context";
import { mergeName } from "@/shared/lib/string-utils";
import MobileSheetMenu from "./mobile-sheet-menu";

const GameHeader: React.FC = () => {
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
			<header className="sticky top-0 z-50 border-b border-purple-900/20 bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 shadow-xl">
				<div className="container mx-auto flex items-center justify-between py-4 max-[776px]:px-4 md:px-10">
					<Link to="/" className="flex items-center space-x-3">
						<div className="flex items-center space-x-2">
							<Gamepad2 className="h-8 w-8 text-purple-300" />
							<img
								src="/Logo.png"
								alt="Bithub Learning"
								className="h-10 w-36 object-contain brightness-0 invert"
							/>
						</div>
					</Link>

					<div className="hidden items-center space-x-4 md:flex">
						{isAuthenticated && userInfo ? (
							<MenuTrigger>
								<Button
									variant="ghost"
									className="flex items-center gap-2 px-2 text-white hover:bg-purple-800"
								>
									<Avatar className="h-8 w-8">
										<AvatarImage
											src={userInfo.avatar}
											alt={userInfo.username}
										/>
										<AvatarFallback className="bg-purple-700 text-white">
											{userInfo.avatar?.slice(0, 2).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div className="flex flex-col items-start">
										<span className="text-md font-medium text-white">
											{mergeName(userInfo.firstName, userInfo.lastName)}
										</span>
									</div>
								</Button>
								<MenuPopover placement="bottom end">
									<DropdownMenu className="">
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
							<Button
								onClick={() => navigate({ to: "/signin" })}
								className="bg-purple-600 font-semibold text-white hover:bg-purple-700"
							>
								Đăng nhập
							</Button>
						)}
					</div>

					<div className="flex items-center gap-2 md:hidden">
						<div className="border-r border-purple-400 pr-4 max-[776px]:block">
							<button
								type="button"
								onClick={() => setOpen(true)}
								className="relative mt-1.5 cursor-pointer text-white transition-colors hover:text-purple-200"
							>
								<Search size={18} />
							</button>
						</div>
						<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
							<SheetClose asChild style={{ color: "white !important" }} />
							<SheetTrigger asChild>
								<button className="rounded-lg p-2 text-white transition-colors hover:bg-purple-700 md:hidden">
									<Menu className="h-6 w-6" />
								</button>
							</SheetTrigger>
							<SheetContent
								side="right"
								className="w-[320px] bg-gradient-to-b from-purple-900 to-purple-950 p-0 sm:w-[400px]"
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

export default GameHeader;
