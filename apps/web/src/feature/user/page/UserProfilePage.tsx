import TwoFactorSettings from "@/feature/auth/component/TwoFactorSettings";
import {
	setIsAuthenticatedAction,
	setUserInfoAction,
} from "@/feature/auth/store";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { useFetchOrdersByUserId } from "@/feature/order/hook/useOrder";
import { useUserPresentations } from "@/feature/presentations/hooks/usePresentations";
import { useFetchTransactionsByWalletId } from "@/feature/transaction/hook/useTransaction";
import { clearAuthTokens } from "@/shared/lib/cookies";
import { formatDateTime } from "@/shared/lib/date-time-utils";
import { mergeName } from "@/shared/lib/string-utils";
import { useAppDispatch } from "@/shared/redux/store";
import { Link, useNavigate } from "@tanstack/react-router";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@workspace/ui/components/Avatar";
import { Badge } from "@workspace/ui/components/Badge";
import { Button } from "@workspace/ui/components/Button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/Card";
import Loader from "@workspace/ui/components/loader/TerminalLoader";
import {
	Popover,
	PopoverDialog,
	PopoverTrigger,
} from "@workspace/ui/components/Popover";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarRail,
	SidebarTrigger,
} from "@workspace/ui/components/sidebar";
import {
	Activity,
	ArrowDownLeft,
	ArrowUpRight,
	Bell,
	Camera,
	Check,
	CheckCircle,
	CircleUserRound,
	Clock,
	CreditCard,
	Edit,
	Filter,
	Key,
	Laptop,
	Link2,
	LogOut,
	Mail,
	MapPin,
	Package,
	Presentation,
	Settings,
	Shield,
	TrendingDown,
	TrendingUp,
	User,
	Wallet,
	XCircle,
} from "lucide-react";
import * as React from "react";
import { useSelector } from "react-redux";
import { ChangePasswordDialog } from "../components/ChangePasswordDialog";
import { EditProfileDialog } from "../components/EditProfileDialog";
import { useUploadAvatar, useUploadCoverImage } from "../queries/useUser";
import "../styles/button.css";
import "../styles/present.button.css";

function UserProfilePage() {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { userInfo, isLoading } = useSelector(selectAuthStateInfo);
	const [activeSection, setActiveSection] = React.useState("overview");
	const [activeSettingTab, setActiveSettingTab] = React.useState("security");
	const [openChangePassword, setOpenChangePassword] = React.useState(false);
	const [openEditProfile, setOpenEditProfile] = React.useState(false);
	const [transactionTypeFilter, setTransactionTypeFilter] =
		React.useState<string>("ALL");
	const [transactionStatusFilter, setTransactionStatusFilter] =
		React.useState<string>("ALL");
	const { mutate: uploadAvatar, isPending: isUploadingAvatar } =
		useUploadAvatar();
	const { mutate: uploadCoverImage, isPending: isUploadingCover } =
		useUploadCoverImage();
	const avatarInputRef = React.useRef<HTMLInputElement>(null);
	const coverInputRef = React.useRef<HTMLInputElement>(null);
	const { data: userPresentations, isLoading: presentationsLoading } =
		useUserPresentations(userInfo?.id || 0);
	const { data: userOrders, isLoading: ordersLoading } = useFetchOrdersByUserId(
		userInfo?.id || 0,
	);
	const { data: userTransactions, isLoading: transactionsLoading } =
		useFetchTransactionsByWalletId(userInfo?.wallet?.id || 0);

	const filteredTransactions = React.useMemo(() => {
		if (!userTransactions) return [];

		return userTransactions.filter((transaction) => {
			const typeMatch =
				transactionTypeFilter === "ALL" ||
				transaction.type === transactionTypeFilter;
			const statusMatch =
				transactionStatusFilter === "ALL" ||
				transaction.status === transactionStatusFilter;
			return typeMatch && statusMatch;
		});
	}, [userTransactions, transactionTypeFilter, transactionStatusFilter]);

	const transactionStats = React.useMemo(() => {
		if (!userTransactions || userTransactions.length === 0) {
			return {
				totalDeposit: 0,
				totalSpent: 0,
				totalTransactions: 0,
				completedCount: 0,
				pendingCount: 0,
				failedCount: 0,
			};
		}

		return userTransactions.reduce(
			(acc, transaction) => {
				if (
					transaction.type === "DEPOSIT" &&
					transaction.status === "COMPLETED"
				) {
					acc.totalDeposit += transaction.amount;
				}
				if (
					(transaction.type === "PURCHASE" ||
						transaction.type === "AI_REQUEST") &&
					transaction.status === "COMPLETED"
				) {
					acc.totalSpent += transaction.amount;
				}
				if (transaction.status === "COMPLETED") acc.completedCount++;
				if (transaction.status === "PENDING") acc.pendingCount++;
				if (transaction.status === "FAILED") acc.failedCount++;
				acc.totalTransactions++;
				return acc;
			},
			{
				totalDeposit: 0,
				totalSpent: 0,
				totalTransactions: 0,
				completedCount: 0,
				pendingCount: 0,
				failedCount: 0,
			},
		);
	}, [userTransactions]);

	// User is guaranteed to exist here because of route-level protection
	if (isLoading || !userInfo) {
		return <Loader />;
	}

	const handleLogout = () => {
		clearAuthTokens();
		dispatch(setIsAuthenticatedAction(false));
		dispatch(setUserInfoAction(null));
		navigate({ to: "/signin" });
	};

	const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			// Validate file type
			if (!file.type.startsWith("image/")) {
				alert("Vui lòng chọn file ảnh hợp lệ");
				return;
			}
			// Validate file size (max 5MB)
			if (file.size > 5 * 1024 * 1024) {
				alert("Kích thước ảnh không được vượt quá 5MB");
				return;
			}
			uploadAvatar(file);
		}
	};

	const handleCoverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			// Validate file type
			if (!file.type.startsWith("image/")) {
				alert("Vui lòng chọn file ảnh hợp lệ");
				return;
			}
			// Validate file size (max 5MB)
			if (file.size > 5 * 1024 * 1024) {
				alert("Kích thước ảnh không được vượt quá 5MB");
				return;
			}
			uploadCoverImage(file);
		}
	};

	const menuItems = [
		{ id: "overview", label: "Tổng quan", icon: User },
		{ id: "presentations", label: "Bài thuyết trình", icon: Presentation },
		{ id: "orders", label: "Đơn hàng", icon: Package },
		{ id: "wallet", label: "Ví & Giao dịch", icon: Wallet },
		{ id: "checkout", label: "Nạp tiền", icon: CreditCard, url: "/checkout" },
		{ id: "activity", label: "Hoạt động", icon: Activity },
		{ id: "notifications", label: "Thông báo", icon: Bell },
		{ id: "settings", label: "Cài đặt", icon: Settings },
	];

	return (
		<SidebarProvider defaultOpen>
			<div className="flex min-h-screen w-full">
				<Sidebar collapsible="icon">
					<SidebarContent>
						<SidebarGroup>
							<div className="flex items-center gap-2 px-2 py-3">
								<SidebarTrigger size={"lg"} />
							</div>
						</SidebarGroup>

						<SidebarGroup>
							<SidebarGroupLabel>Hồ sơ</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									{menuItems.map((item) => (
										<SidebarMenuItem key={item.id}>
											<SidebarMenuButton
												onClick={() => {
													if (item.url) {
														navigate({ to: item.url });
														return;
													}
													setActiveSection(item.id);
												}}
												isActive={activeSection === item.id}
												tooltip={item.label}
											>
												<item.icon />
												<span>{item.label}</span>
											</SidebarMenuButton>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>

						<SidebarGroup>
							<SidebarGroupLabel>Tài khoản</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									<SidebarMenuItem>
										<SidebarMenuButton
											tooltip="Password"
											onClick={() => setOpenChangePassword(true)}
										>
											<Key />
											<span>Đổi mật khẩu</span>
										</SidebarMenuButton>
									</SidebarMenuItem>
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					</SidebarContent>

					<SidebarFooter>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton onClick={handleLogout} tooltip="Logout">
									<LogOut />
									<span>Đăng xuất</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarFooter>

					<SidebarRail />
				</Sidebar>

				<SidebarInset className="p-0">
					<div className="m-0">
						{/* Profile Header Card with Banner */}
						{activeSection !== "settings" && (
							<Card className="m-0 overflow-hidden rounded-none border-x-0 border-t-0">
								{/* Cover Photo Banner */}
								<div className="relative h-48 w-full md:h-64 lg:h-80">
									<img
										src={userInfo.coverImage || "/user_no_wallpaper.jpg"}
										alt="Cover"
										className="h-full w-full object-cover"
									/>
									<input
										type="file"
										ref={coverInputRef}
										onChange={handleCoverChange}
										accept="image/*"
										className="hidden"
									/>
									<Button
										size="sm"
										variant="secondary"
										className="absolute bottom-4 right-4 gap-2"
										onClick={() => coverInputRef.current?.click()}
										isDisabled={isUploadingCover}
									>
										<Camera className="h-4 w-4 text-white" />
										<span className="hidden text-white sm:inline">
											{isUploadingCover ? "Đang tải..." : "Chỉnh sửa ảnh bìa"}
										</span>
									</Button>
								</div>

								<CardContent className="relative bg-white p-6">
									<div className="flex justify-center gap-6">
										<div className="relative">
											<div className="rounded-full bg-white p-1">
												<Avatar className="border-gray h-32 w-32 border-2 md:h-40 md:w-40">
													{userInfo.avatar && (
														<AvatarImage
															src={userInfo.avatar}
															alt={userInfo.username}
														/>
													)}
													<AvatarFallback className="bg-blue-600 text-2xl text-white md:text-3xl">
														{userInfo.username?.slice(0, 2).toUpperCase() ||
															"??"}
													</AvatarFallback>
												</Avatar>
											</div>
											<input
												type="file"
												ref={avatarInputRef}
												onChange={handleAvatarChange}
												accept="image/*"
												className="hidden"
											/>
											<Button
												size="icon"
												variant="outline"
												className="absolute bottom-10 right-2 h-10 w-10 rounded-full bg-gray-200 shadow-md hover:bg-gray-50"
												onClick={() => avatarInputRef.current?.click()}
												isDisabled={isUploadingAvatar}
											>
												<Camera className="h-4 w-4" />
											</Button>
										</div>

										<div className="space-y-4">
											<div className="mb-6 flex flex-col gap-2">
												{/* <Badge variant={userInfo.role === 'ADMIN' ? 'default' : 'secondary'}>
                                                {userInfo.role}
                                            </Badge> */}
												{/* <Badge variant={userInfo.activated ? 'default' : 'destructive'}>
                                                {userInfo.activated ? 'Active' : 'Inactive'}
                                            </Badge> */}
												<div className="mb-1 flex items-center gap-4">
													<p className="text-3xl font-bold">
														{mergeName(userInfo.firstName, userInfo.lastName)}
													</p>

													{userInfo.activated && (
														<Check className="h-6 w-6 text-blue-500" />
													)}

													<Button
														size="sm"
														variant="outline"
														onClick={() => setOpenEditProfile(true)}
													>
														<Edit className="mr-2 h-4 w-4" />
														Chỉnh sửa hồ sơ
													</Button>
												</div>
												{userInfo.username && (
													<div className="flex items-center gap-1">
														{userInfo.username}
													</div>
												)}

												{userInfo.bio && (
													<div className="flex items-center gap-1">
														{userInfo.bio}
													</div>
												)}
											</div>

											<div className="text-muted-foreground flex flex-col flex-wrap gap-4 text-sm">
												<div className="flex items-center gap-1">
													<Mail className="size-4" />
													{userInfo.email}
												</div>
												<div className="flex items-center gap-1">
													<MapPin className="size-4" />
													{userInfo.location || "Vị trí không xác định"}
												</div>

												<div className="flex items-center gap-1">
													<CircleUserRound className="size-4" />
													{userInfo.jobTitle}
												</div>

												{userInfo.socialProfile &&
													Object.values(userInfo.socialProfile).some(
														(v) => v,
													) && (
														<PopoverTrigger>
															<Button
																variant="ghost"
																className="text-muted-foreground flex h-auto items-center justify-start gap-1 p-0 hover:bg-transparent"
															>
																<Link2 className="size-4" />
																<p className="hover:underline">
																	Kết nối với tôi
																</p>
															</Button>
															<Popover placement="bottom left">
																<PopoverDialog className="w-64">
																	<div className="flex flex-col gap-2">
																		{userInfo.socialProfile.facebook && (
																			<a
																				href={userInfo.socialProfile.facebook}
																				target="_blank"
																				rel="noopener noreferrer"
																				className="flex items-center gap-2 rounded-md p-2 text-blue-600 transition-colors hover:bg-blue-50"
																			>
																				<svg
																					className="h-4 w-4"
																					fill="currentColor"
																					viewBox="0 0 24 24"
																				>
																					<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
																				</svg>
																				Facebook
																			</a>
																		)}
																		{userInfo.socialProfile.instagram && (
																			<a
																				href={userInfo.socialProfile.instagram}
																				target="_blank"
																				rel="noopener noreferrer"
																				className="flex items-center gap-2 rounded-md p-2 text-pink-600 transition-colors hover:bg-pink-50"
																			>
																				<svg
																					className="h-4 w-4"
																					fill="currentColor"
																					viewBox="0 0 24 24"
																				>
																					<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
																				</svg>
																				Instagram
																			</a>
																		)}
																		{userInfo.socialProfile.twitter && (
																			<a
																				href={userInfo.socialProfile.twitter}
																				target="_blank"
																				rel="noopener noreferrer"
																				className="flex items-center gap-2 rounded-md p-2 text-sky-600 transition-colors hover:bg-sky-50"
																			>
																				<svg
																					className="h-4 w-4"
																					fill="currentColor"
																					viewBox="0 0 24 24"
																				>
																					<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
																				</svg>
																				Twitter/X
																			</a>
																		)}
																		{userInfo.socialProfile.linkedin && (
																			<a
																				href={userInfo.socialProfile.linkedin}
																				target="_blank"
																				rel="noopener noreferrer"
																				className="flex items-center gap-2 rounded-md p-2 text-blue-700 transition-colors hover:bg-blue-50"
																			>
																				<svg
																					className="h-4 w-4"
																					fill="currentColor"
																					viewBox="0 0 24 24"
																				>
																					<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
																				</svg>
																				LinkedIn
																			</a>
																		)}
																		{userInfo.socialProfile.github && (
																			<a
																				href={userInfo.socialProfile.github}
																				target="_blank"
																				rel="noopener noreferrer"
																				className="flex items-center gap-2 rounded-md p-2 text-gray-800 transition-colors hover:bg-gray-100"
																			>
																				<svg
																					className="h-4 w-4"
																					fill="currentColor"
																					viewBox="0 0 24 24"
																				>
																					<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
																				</svg>
																				GitHub
																			</a>
																		)}
																		{userInfo.socialProfile.website && (
																			<a
																				href={userInfo.socialProfile.website}
																				target="_blank"
																				rel="noopener noreferrer"
																				className="flex items-center gap-2 rounded-md p-2 text-green-600 transition-colors hover:bg-green-50"
																			>
																				<svg
																					className="h-4 w-4"
																					fill="none"
																					stroke="currentColor"
																					viewBox="0 0 24 24"
																				>
																					<path
																						strokeLinecap="round"
																						strokeLinejoin="round"
																						strokeWidth={2}
																						d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
																					/>
																				</svg>
																				Website
																			</a>
																		)}
																	</div>
																</PopoverDialog>
															</Popover>
														</PopoverTrigger>
													)}
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Dynamic Content Based on Active Section */}
						<div
							className={
								activeSection === "settings" ? "h-screen" : "space-y-4 p-6"
							}
						>
							{activeSection === "overview" && (
								<div className="space-y-4">
									<Card>
										<CardContent className="p-6">
											<div className="mb-4 flex items-center justify-between">
												<h3 className="text-lg font-semibold">
													Thông tin cơ bản
												</h3>
											</div>
											<div className="grid gap-4 md:grid-cols-2">
												{userInfo.pronouns && (
													<div>
														<span className="text-muted-foreground text-sm font-medium">
															Đại từ
														</span>
														<p className="text-base">{userInfo.pronouns}</p>
													</div>
												)}
												{userInfo.phoneNumber && (
													<div>
														<span className="text-muted-foreground text-sm font-medium">
															Số điện thoại
														</span>
														<p className="text-base">{userInfo.phoneNumber}</p>
													</div>
												)}
												<div>
													<span className="text-muted-foreground text-sm font-medium">
														Ngày tham gia
													</span>
													<p className="text-base">
														{userInfo.createdAt.slice(0, 10) || "N/A"}
													</p>
												</div>
											</div>
											{userInfo.bio && (
												<div className="mt-4">
													<span className="text-muted-foreground text-sm font-medium">
														Tiểu sử
													</span>
													<p className="mt-1 text-base">{userInfo.bio}</p>
												</div>
											)}
										</CardContent>
									</Card>
								</div>
							)}

							{activeSection === "presentations" && (
								<Card>
									<CardContent className="p-6">
										<div className="mb-6 flex items-center justify-between">
											<h3 className="text-lg font-semibold">
												Bài thuyết trình
											</h3>
										</div>
										{presentationsLoading ? (
											<Loader />
										) : userPresentations && userPresentations.length > 0 ? (
											<div className="grid gap-4 sm:grid-cols-2">
												{userPresentations.map((pres) => (
													<Card key={pres.id} className="p-4">
														<div className="mb-2 flex items-start justify-between">
															<div className="flex-1">
																<p className="font-semibold">{pres.name}</p>
																<p className="text-muted-foreground text-sm">
																	{pres.type}
																</p>
																<p>{formatDateTime(pres.createdAt ?? "")}</p>
															</div>
															<Badge
																variant={
																	pres.processing ? "secondary" : "secondary"
																}
															>
																{pres.processing
																	? "Đang xử lí, xin vui lòng đợi"
																	: ""}
															</Badge>
														</div>
														{!pres.processing && (
															<div className="mt-3 flex gap-2">
																<Link
																	to="/presentations/$id/presenter"
																	params={{ id: pres.id.toString() }}
																>
																	<button className="button">
																		<span className="text"> Trình chiếu</span>
																		<span className="svg">
																			<svg
																				xmlns="http://www.w3.org/2000/svg"
																				width="50"
																				height="20"
																				viewBox="0 0 38 15"
																				fill="none"
																			>
																				<path
																					fill="white"
																					d="M10 7.519l-.939-.344h0l.939.344zm14.386-1.205l-.981-.192.981.192zm1.276 5.509l.537.843.148-.094.107-.139-.792-.611zm4.819-4.304l-.385-.923h0l.385.923zm7.227.707a1 1 0 0 0 0-1.414L31.343.448a1 1 0 0 0-1.414 0 1 1 0 0 0 0 1.414l5.657 5.657-5.657 5.657a1 1 0 0 0 1.414 1.414l6.364-6.364zM1 7.519l.554.833.029-.019.094-.061.361-.23 1.277-.77c1.054-.609 2.397-1.32 3.629-1.787.617-.234 1.17-.392 1.623-.455.477-.066.707-.008.788.034.025.013.031.021.039.034a.56.56 0 0 1 .058.235c.029.327-.047.906-.39 1.842l1.878.689c.383-1.044.571-1.949.505-2.705-.072-.815-.45-1.493-1.16-1.865-.627-.329-1.358-.332-1.993-.244-.659.092-1.367.305-2.056.566-1.381.523-2.833 1.297-3.921 1.925l-1.341.808-.385.245-.104.068-.028.018c-.011.007-.011.007.543.84zm8.061-.344c-.198.54-.328 1.038-.36 1.484-.032.441.024.94.325 1.364.319.45.786.64 1.21.697.403.054.824-.001 1.21-.09.775-.179 1.694-.566 2.633-1.014l3.023-1.554c2.115-1.122 4.107-2.168 5.476-2.524.329-.086.573-.117.742-.115s.195.038.161.014c-.15-.105.085-.139-.076.685l1.963.384c.192-.98.152-2.083-.74-2.707-.405-.283-.868-.37-1.28-.376s-.849.069-1.274.179c-1.65.43-3.888 1.621-5.909 2.693l-2.948 1.517c-.92.439-1.673.743-2.221.87-.276.064-.429.065-.492.057-.043-.006.066.003.155.127.07.099.024.131.038-.063.014-.187.078-.49.243-.94l-1.878-.689zm14.343-1.053c-.361 1.844-.474 3.185-.413 4.161.059.95.294 1.72.811 2.215.567.544 1.242.546 1.664.459a2.34 2.34 0 0 0 .502-.167l.15-.076.049-.028.018-.011c.013-.008.013-.008-.524-.852l-.536-.844.019-.012c-.038.018-.064.027-.084.032-.037.008.053-.013.125.056.021.02-.151-.135-.198-.895-.046-.734.034-1.887.38-3.652l-1.963-.384zm2.257 5.701l.791.611.024-.031.08-.101.311-.377 1.093-1.213c.922-.954 2.005-1.894 2.904-2.27l-.771-1.846c-1.31.547-2.637 1.758-3.572 2.725l-1.184 1.314-.341.414-.093.117-.025.032c-.01.013-.01.013.781.624zm5.204-3.381c.989-.413 1.791-.42 2.697-.307.871.108 2.083.385 3.437.385v-2c-1.197 0-2.041-.226-3.19-.369-1.114-.139-2.297-.146-3.715.447l.771 1.846z"
																				/>
																			</svg>
																		</span>
																	</button>
																</Link>
															</div>
														)}
														{pres.processing && (
															<p className="text-muted-foreground mt-2 text-xs">
																Bài thuyết trình của bạn đang được tạo. Quá
																trình này có thể mất vài phút...
															</p>
														)}
													</Card>
												))}
											</div>
										) : (
											<div className="text-muted-foreground py-8 text-center">
												<p>Không có dữ liệu</p>
												<Link to="/presentations">
													<Button variant="outline" className="mt-4">
														Xem các mẫu có sẵn
													</Button>
												</Link>
											</div>
										)}
									</CardContent>
								</Card>
							)}

							{activeSection === "orders" && (
								<Card>
									<CardContent className="p-6">
										<div className="mb-6 flex items-center justify-between">
											<h3 className="text-lg font-semibold">My Orders</h3>
											<Badge variant="secondary">
												{userOrders?.length || 0}{" "}
												{userOrders?.length === 1 ? "Đơn hàng" : "Đơn hàng"}
											</Badge>
										</div>
										{ordersLoading ? (
											<Loader />
										) : userOrders && userOrders.length > 0 ? (
											<div className="space-y-4">
												{userOrders.map((order) => (
													<Card
														key={order.id}
														className="border-l-4 border-l-blue-500"
													>
														<CardContent className="p-4">
															<div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
																<div>
																	<div className="flex items-center gap-2">
																		<h4 className="font-semibold">
																			Order #{order.id}
																		</h4>
																		<Badge
																			variant={
																				order.status === "COMPLETED"
																					? "default"
																					: order.status === "PENDING"
																						? "secondary"
																						: "destructive"
																			}
																		>
																			{order.status}
																		</Badge>
																	</div>
																	<p className="text-muted-foreground text-sm">
																		{new Date(
																			order.createdAt,
																		).toLocaleDateString("en-US", {
																			year: "numeric",
																			month: "long",
																			day: "numeric",
																			hour: "2-digit",
																			minute: "2-digit",
																		})}
																	</p>
																</div>
																<div className="text-right">
																	<p className="text-sm text-gray-600">
																		Tổng số tiền
																	</p>
																	<p className="text-xl font-bold text-blue-600">
																		{order.totalAmount.toLocaleString("vi-VN")}{" "}
																		₫
																	</p>
																</div>
															</div>

															<div className="space-y-2">
																<p className="text-sm font-medium">
																	Chi tiết đơn hàng:
																</p>
																<div className="space-y-2">
																	{order.orderDetails.map((detail) => (
																		<div
																			key={detail.id}
																			className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
																		>
																			<div className="flex-1">
																				<p className="font-medium">
																					{detail.productName}
																				</p>
																				<p className="text-muted-foreground text-sm">
																					Quantity: {detail.quantity} × Unit
																					Price:{" "}
																					{detail.unitPrice.toLocaleString(
																						"vi-VN",
																					)}{" "}
																					₫
																				</p>
																			</div>
																			<div className="text-right">
																				<p className="font-semibold">
																					{detail.amount.toLocaleString(
																						"vi-VN",
																					)}{" "}
																					₫
																				</p>
																			</div>
																		</div>
																	))}
																</div>
															</div>

															<div className="mt-4 flex items-center justify-between border-t pt-3">
																<p className="text-muted-foreground text-xs">
																	Cập nhật lần cuối:{" "}
																	{new Date(order.updatedAt).toLocaleString(
																		"en-US",
																		{
																			month: "short",
																			day: "numeric",
																			hour: "2-digit",
																			minute: "2-digit",
																		},
																	)}
																</p>
																{order.status === "COMPLETED" && (
																	<Button variant="outline" size="sm">
																		Xem hóa đơn
																	</Button>
																)}
															</div>
														</CardContent>
													</Card>
												))}
											</div>
										) : (
											<div className="text-muted-foreground py-8 text-center">
												<Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
												<p className="mb-2 text-lg font-medium">
													Chưa có dữ liệu
												</p>
												<p className="text-sm">
													Lịch sử đặt hàng của bạn sẽ xuất hiện ở đây sau khi
													bạn mua hàng.
												</p>
												<Button variant="outline" className="mt-4">
													Xem các sản phẩm
												</Button>
											</div>
										)}
									</CardContent>
								</Card>
							)}

							{activeSection === "wallet" && (
								<>
									{/* Summary Cards */}
									<div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
										<Card className="border-l-4 border-l-green-500">
											<CardHeader className="pb-3">
												<CardTitle className="flex items-center justify-between text-sm font-medium">
													<span className="text-muted-foreground">
														Tổng nạp
													</span>
													<TrendingUp className="h-4 w-4 text-green-600" />
												</CardTitle>
											</CardHeader>
											<CardContent>
												<div className="text-2xl font-bold text-green-600">
													{transactionStats.totalDeposit.toLocaleString(
														"vi-VN",
													)}{" "}
													₫
												</div>
												<p className="text-muted-foreground mt-1 text-xs">
													Tổng tiền đã nạp vào ví
												</p>
											</CardContent>
										</Card>

										<Card className="border-l-4 border-l-red-500">
											<CardHeader className="pb-3">
												<CardTitle className="flex items-center justify-between text-sm font-medium">
													<span className="text-muted-foreground">
														Tổng chi
													</span>
													<TrendingDown className="h-4 w-4 text-red-600" />
												</CardTitle>
											</CardHeader>
											<CardContent>
												<div className="text-2xl font-bold text-red-600">
													{transactionStats.totalSpent.toLocaleString("vi-VN")}{" "}
													₫
												</div>
												<p className="text-muted-foreground mt-1 text-xs">
													Tổng chi tiêu & sử dụng
												</p>
											</CardContent>
										</Card>

										<Card className="border-l-4 border-l-blue-500">
											<CardHeader className="pb-3">
												<CardTitle className="flex items-center justify-between text-sm font-medium">
													<span className="text-muted-foreground">
														Số dư hiện tại
													</span>
													<Wallet className="h-4 w-4 text-blue-600" />
												</CardTitle>
											</CardHeader>
											<CardContent>
												<div className="text-2xl font-bold text-blue-600">
													{userInfo.wallet?.balance?.toLocaleString("vi-VN") ||
														0}{" "}
													₫
												</div>
												<p className="text-muted-foreground mt-1 text-xs">
													Số dư khả dụng trong ví
												</p>
											</CardContent>
										</Card>

										<Card className="border-l-4 border-l-purple-500">
											<CardHeader className="pb-3">
												<CardTitle className="flex items-center justify-between text-sm font-medium">
													<span className="text-muted-foreground">
														Giao dịch
													</span>
													<Activity className="h-4 w-4 text-purple-600" />
												</CardTitle>
											</CardHeader>
											<CardContent>
												<div className="text-2xl font-bold text-purple-600">
													{transactionStats.totalTransactions}
												</div>
												<div className="mt-1 flex gap-2 text-xs">
													<span className="flex items-center gap-1 text-green-600">
														<CheckCircle className="h-3 w-3" />
														{transactionStats.completedCount}
													</span>
													<span className="flex items-center gap-1 text-yellow-600">
														<Clock className="h-3 w-3" />
														{transactionStats.pendingCount}
													</span>
													<span className="flex items-center gap-1 text-red-600">
														<XCircle className="h-3 w-3" />
														{transactionStats.failedCount}
													</span>
												</div>
											</CardContent>
										</Card>
									</div>

									{/* Transaction History */}
									<Card>
										<CardContent className="p-6">
											<div className="mb-6 space-y-4">
												<div className="flex items-center justify-between">
													<h3 className="text-lg font-semibold">
														Lịch sử giao dịch
													</h3>
													<Badge variant="outline" className="text-sm">
														{filteredTransactions.length} /{" "}
														{userTransactions?.length || 0} giao dịch
													</Badge>
												</div>

												{/* Filters */}
												<div className="flex flex-col gap-3">
													<div className="flex items-center gap-2">
														<Filter className="text-muted-foreground h-4 w-4" />
														<span className="text-muted-foreground text-sm font-medium">
															Loại giao dịch:
														</span>
														<div className="flex flex-wrap gap-2">
															<Button
																size="sm"
																variant={
																	transactionTypeFilter === "ALL"
																		? "default"
																		: "outline"
																}
																onClick={() => setTransactionTypeFilter("ALL")}
															>
																Tất cả
															</Button>
															<Button
																size="sm"
																variant={
																	transactionTypeFilter === "DEPOSIT"
																		? "default"
																		: "outline"
																}
																onClick={() =>
																	setTransactionTypeFilter("DEPOSIT")
																}
																className="gap-1"
															>
																<ArrowDownLeft className="h-3 w-3" />
																Nạp tiền
															</Button>

															<Button
																size="sm"
																variant={
																	transactionTypeFilter === "PURCHASE"
																		? "default"
																		: "outline"
																}
																onClick={() =>
																	setTransactionTypeFilter("PURCHASE")
																}
																className="gap-1"
															>
																<CreditCard className="h-3 w-3" />
																Mua hàng
															</Button>
															<Button
																size="sm"
																variant={
																	transactionTypeFilter === "AI_REQUEST"
																		? "default"
																		: "outline"
																}
																onClick={() =>
																	setTransactionTypeFilter("AI_REQUEST")
																}
																className="gap-1"
															>
																<ArrowUpRight className="h-3 w-3" />
																Sử dụng AI
															</Button>
														</div>
													</div>

													<div className="flex items-center gap-2">
														<Filter className="text-muted-foreground h-4 w-4" />
														<span className="text-muted-foreground text-sm font-medium">
															Trạng thái:
														</span>
														<div className="flex flex-wrap gap-2">
															<Button
																size="sm"
																variant={
																	transactionStatusFilter === "ALL"
																		? "default"
																		: "outline"
																}
																onClick={() =>
																	setTransactionStatusFilter("ALL")
																}
															>
																Tất cả
															</Button>
															<Button
																size="sm"
																variant={
																	transactionStatusFilter === "COMPLETED"
																		? "default"
																		: "outline"
																}
																onClick={() =>
																	setTransactionStatusFilter("COMPLETED")
																}
																className="gap-1"
															>
																<CheckCircle className="h-3 w-3" />
																Hoàn thành
															</Button>
															<Button
																size="sm"
																variant={
																	transactionStatusFilter === "PENDING"
																		? "default"
																		: "outline"
																}
																onClick={() =>
																	setTransactionStatusFilter("PENDING")
																}
																className="gap-1"
															>
																<Clock className="h-3 w-3" />
																Đang xử lý
															</Button>
															<Button
																size="sm"
																variant={
																	transactionStatusFilter === "FAILED"
																		? "default"
																		: "outline"
																}
																onClick={() =>
																	setTransactionStatusFilter("FAILED")
																}
																className="gap-1"
															>
																<XCircle className="h-3 w-3" />
																Thất bại
															</Button>
														</div>
													</div>
												</div>
											</div>

											{transactionsLoading ? (
												<Loader />
											) : filteredTransactions &&
												filteredTransactions.length > 0 ? (
												<div className="overflow-x-auto">
													<table className="w-full">
														<thead>
															<tr className="border-b">
																<th className="pb-3 text-left text-sm font-semibold">
																	Mã GD
																</th>
																<th className="pb-3 text-left text-sm font-semibold">
																	Loại giao dịch
																</th>
																<th className="pb-3 text-right text-sm font-semibold">
																	Số tiền
																</th>
																<th className="pb-3 text-center text-sm font-semibold">
																	Trạng thái
																</th>
																<th className="pb-3 text-right text-sm font-semibold">
																	Thời gian
																</th>
															</tr>
														</thead>
														<tbody>
															{filteredTransactions.map((transaction) => (
																<tr key={transaction.id} className="border-b">
																	<td className="py-4 text-sm font-medium">
																		#{transaction.id}
																	</td>
																	<td className="py-4">
																		<div className="flex items-center gap-2">
																			{transaction.type === "PURCHASE" ? (
																				<CreditCard className="h-4 w-4 text-blue-600" />
																			) : transaction.type === "DEPOSIT" ? (
																				<ArrowDownLeft className="h-4 w-4 text-green-600" />
																			) : (
																				<ArrowUpRight className="h-4 w-4 text-purple-600" />
																			)}
																			<span className="text-sm">
																				{transaction.type === "PURCHASE"
																					? "Mua hàng"
																					: transaction.type === "DEPOSIT"
																						? "Nạp tiền"
																						: "Sử dụng AI"}
																			</span>
																		</div>
																	</td>
																	<td className="py-4 text-right font-semibold">
																		<span
																			className={
																				transaction.type === "DEPOSIT"
																					? "text-green-600"
																					: "text-red-600"
																			}
																		>
																			{transaction.type === "DEPOSIT"
																				? "+"
																				: "-"}
																			{Math.abs(
																				transaction.amount,
																			).toLocaleString("vi-VN")}{" "}
																			₫
																		</span>
																	</td>
																	<td className="py-4 text-center">
																		<Badge
																			variant={
																				transaction.status === "COMPLETED"
																					? "default"
																					: transaction.status === "PENDING"
																						? "secondary"
																						: "destructive"
																			}
																			className={
																				transaction.status === "COMPLETED"
																					? "bg-green-100 text-green-800"
																					: transaction.status === "PENDING"
																						? "bg-yellow-100 text-yellow-800"
																						: "bg-red-100 text-red-800"
																			}
																		>
																			{transaction.status === "COMPLETED"
																				? "Hoàn thành"
																				: transaction.status === "PENDING"
																					? "Đang xử lý"
																					: "Thất bại"}
																		</Badge>
																	</td>
																	<td className="text-muted-foreground py-4 text-right text-sm">
																		{new Date(
																			transaction.createdAt,
																		).toLocaleString("vi-VN", {
																			year: "numeric",
																			month: "2-digit",
																			day: "2-digit",
																			hour: "2-digit",
																			minute: "2-digit",
																		})}
																	</td>
																</tr>
															))}
														</tbody>
													</table>
												</div>
											) : (
												<div className="text-muted-foreground py-8 text-center">
													<Wallet className="mx-auto mb-4 h-12 w-12 text-gray-400" />
													<p className="mb-2 text-lg font-medium">
														{userTransactions && userTransactions.length > 0
															? "Không tìm thấy giao dịch phù hợp"
															: "Chưa có giao dịch"}
													</p>
													<p className="text-sm">
														{userTransactions && userTransactions.length > 0
															? "Thử thay đổi bộ lọc để xem các giao dịch khác"
															: "Lịch sử giao dịch của bạn sẽ xuất hiện ở đây sau khi bạn thực hiện giao dịch đầu tiên."}
													</p>
												</div>
											)}
										</CardContent>
									</Card>
								</>
							)}

							{activeSection === "activity" && (
								<Card>
									<CardContent className="p-6">
										<h3 className="mb-4 text-lg font-semibold">
											Recent Activity
										</h3>
										<p className="text-muted-foreground">
											No recent activity to display.
										</p>
									</CardContent>
								</Card>
							)}

							{activeSection === "notifications" && (
								<Card>
									<CardContent className="p-6">
										<h3 className="mb-4 text-lg font-semibold">
											Notifications
										</h3>
										<p className="text-muted-foreground">
											You have no new notifications.
										</p>
									</CardContent>
								</Card>
							)}

							{activeSection === "settings" && (
								<div className="flex h-full">
									{/* Left Sidebar - Settings Navigation */}
									<div className="w-64 border-r bg-gray-50 p-4">
										<h2 className="mb-4 text-xl font-bold">Cài đặt</h2>
										<nav className="space-y-1">
											<button
												onClick={() => setActiveSettingTab("security")}
												className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
													activeSettingTab === "security"
														? "bg-blue-100 font-medium text-blue-700"
														: "hover:bg-gray-100"
												}`}
											>
												<Shield className="h-5 w-5" />
												Bảo mật
											</button>
											<button
												onClick={() => setActiveSettingTab("account")}
												className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
													activeSettingTab === "account"
														? "bg-blue-100 font-medium text-blue-700"
														: "hover:bg-gray-100"
												}`}
											>
												<User className="h-5 w-5" />
												Tài khoản
											</button>
											<button
												onClick={() => setActiveSettingTab("notifications")}
												className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
													activeSettingTab === "notifications"
														? "bg-blue-100 font-medium text-blue-700"
														: "hover:bg-gray-100"
												}`}
											>
												<Bell className="h-5 w-5" />
												Thông báo
											</button>
											<button
												onClick={() => setActiveSettingTab("privacy")}
												className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
													activeSettingTab === "privacy"
														? "bg-blue-100 font-medium text-blue-700"
														: "hover:bg-gray-100"
												}`}
											>
												<Settings className="h-5 w-5" />
												Quyền riêng tư
											</button>
											<button
												onClick={() => setActiveSettingTab("appearance")}
												className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
													activeSettingTab === "appearance"
														? "bg-blue-100 font-medium text-blue-700"
														: "hover:bg-gray-100"
												}`}
											>
												<CreditCard className="h-5 w-5" />
												Giao diện
											</button>
										</nav>
									</div>

									{/* Right Content Area - Settings Content */}
									<div className="flex-1 overflow-y-auto p-8">
										{activeSettingTab === "security" && (
											<div className="max-w-3xl space-y-6">
												<div>
													<h3 className="mb-2 text-2xl font-bold">Bảo mật</h3>
													<p className="text-muted-foreground">
														Quản lý cài đặt bảo mật và xác thực của bạn
													</p>
												</div>

												{/* Two-Factor Authentication */}
												<Card>
													<CardHeader>
														<CardTitle>Xác thực hai yếu tố (2FA)</CardTitle>
													</CardHeader>
													<CardContent>
														<TwoFactorSettings
															is2FAEnabled={userInfo?.mfaEnabled || false}
															userEmail={userInfo?.email}
														/>
													</CardContent>
												</Card>

												{/* Password */}
												<Card>
													<CardHeader>
														<CardTitle>Mật khẩu</CardTitle>
													</CardHeader>
													<CardContent className="space-y-4">
														<div className="flex items-center justify-between">
															<div>
																<p className="font-medium">Đổi mật khẩu</p>
																<p className="text-muted-foreground text-sm">
																	Cập nhật mật khẩu của bạn thường xuyên
																</p>
															</div>
															<Button
																onClick={() => setOpenChangePassword(true)}
															>
																Đổi mật khẩu
															</Button>
														</div>
													</CardContent>
												</Card>

												{/* Active Sessions */}
												<Card>
													<CardHeader>
														<CardTitle>Phiên đăng nhập hoạt động</CardTitle>
													</CardHeader>
													<CardContent className="space-y-4">
														<div className="flex items-start justify-between rounded-lg border p-4">
															<div className="flex gap-3">
																<div className="rounded-lg bg-blue-100 p-2">
																	<Laptop className="h-5 w-5 text-blue-600" />
																</div>
																<div>
																	<p className="font-medium">
																		Thiết bị hiện tại
																	</p>
																	<p className="text-muted-foreground text-sm">
																		Linux • Chrome • Hà Nội, Việt Nam
																	</p>
																	<p className="text-muted-foreground text-xs">
																		Hoạt động ngay bây giờ
																	</p>
																</div>
															</div>
															<Badge variant="secondary">Hiện tại</Badge>
														</div>
													</CardContent>
												</Card>
											</div>
										)}

										{activeSettingTab === "account" && (
											<div className="max-w-3xl space-y-6">
												<div>
													<h3 className="mb-2 text-2xl font-bold">
														Cài đặt tài khoản
													</h3>
													<p className="text-muted-foreground">
														Quản lý thông tin tài khoản và tùy chọn của bạn
													</p>
												</div>

												{/* Profile Information */}
												<Card>
													<CardHeader>
														<CardTitle>Thông tin hồ sơ</CardTitle>
													</CardHeader>
													<CardContent className="space-y-4">
														<div className="flex items-center justify-between">
															<div>
																<p className="font-medium">Chỉnh sửa hồ sơ</p>
																<p className="text-muted-foreground text-sm">
																	Cập nhật thông tin cá nhân của bạn
																</p>
															</div>
															<Button onClick={() => setOpenEditProfile(true)}>
																Chỉnh sửa
															</Button>
														</div>
													</CardContent>
												</Card>

												{/* Language */}
												<Card>
													<CardHeader>
														<CardTitle>Ngôn ngữ & Khu vực</CardTitle>
													</CardHeader>
													<CardContent className="space-y-4">
														<div className="flex items-center justify-between rounded-lg border p-4">
															<div>
																<p className="font-medium">Ngôn ngữ</p>
																<p className="text-muted-foreground text-sm">
																	{userInfo.langKey?.toUpperCase() || "EN"}
																</p>
															</div>
															<Button variant="outline" size="sm">
																Thay đổi
															</Button>
														</div>
														<div className="flex items-center justify-between rounded-lg border p-4">
															<div>
																<p className="font-medium">Múi giờ</p>
																<p className="text-muted-foreground text-sm">
																	UTC+7 (Giờ Việt Nam)
																</p>
															</div>
															<Button variant="outline" size="sm">
																Thay đổi
															</Button>
														</div>
													</CardContent>
												</Card>

												{/* Delete Account */}
												<Card className="border-red-200">
													<CardHeader>
														<CardTitle className="text-red-600">
															Xóa tài khoản
														</CardTitle>
													</CardHeader>
													<CardContent className="space-y-4">
														<p className="text-muted-foreground text-sm">
															Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu của
															bạn. Hành động này không thể hoàn tác.
														</p>
														<Button variant="destructive">Xóa tài khoản</Button>
													</CardContent>
												</Card>
											</div>
										)}

										{activeSettingTab === "notifications" && (
											<div className="max-w-3xl space-y-6">
												<div>
													<h3 className="mb-2 text-2xl font-bold">Thông báo</h3>
													<p className="text-muted-foreground">
														Quản lý cách bạn nhận thông báo
													</p>
												</div>

												{/* Email Notifications */}
												<Card>
													<CardHeader>
														<CardTitle>Thông báo Email</CardTitle>
													</CardHeader>
													<CardContent className="space-y-4">
														<div className="flex items-center justify-between rounded-lg border p-4">
															<div className="flex-1">
																<p className="font-medium">Cập nhật khóa học</p>
																<p className="text-muted-foreground text-sm">
																	Nhận thông báo về khóa học mới và cập nhật
																</p>
															</div>
															<Button variant="outline" size="sm">
																Bật
															</Button>
														</div>
														<div className="flex items-center justify-between rounded-lg border p-4">
															<div className="flex-1">
																<p className="font-medium">Đơn hàng</p>
																<p className="text-muted-foreground text-sm">
																	Thông báo về đơn hàng và thanh toán
																</p>
															</div>
															<Button variant="outline" size="sm">
																Bật
															</Button>
														</div>
														<div className="flex items-center justify-between rounded-lg border p-4">
															<div className="flex-1">
																<p className="font-medium">
																	Tin tức & Khuyến mãi
																</p>
																<p className="text-muted-foreground text-sm">
																	Nhận ưu đãi và tin tức từ Bithub
																</p>
															</div>
															<Button variant="outline" size="sm">
																Tắt
															</Button>
														</div>
													</CardContent>
												</Card>

												{/* Push Notifications */}
												<Card>
													<CardHeader>
														<CardTitle>Thông báo đẩy</CardTitle>
													</CardHeader>
													<CardContent className="space-y-4">
														<div className="flex items-center justify-between rounded-lg border p-4">
															<div className="flex-1">
																<p className="font-medium">Tin nhắn mới</p>
																<p className="text-muted-foreground text-sm">
																	Nhận thông báo khi có tin nhắn mới
																</p>
															</div>
															<Button variant="outline" size="sm">
																Bật
															</Button>
														</div>
													</CardContent>
												</Card>
											</div>
										)}

										{activeSettingTab === "privacy" && (
											<div className="max-w-3xl space-y-6">
												<div>
													<h3 className="mb-2 text-2xl font-bold">
														Quyền riêng tư
													</h3>
													<p className="text-muted-foreground">
														Kiểm soát quyền riêng tư và dữ liệu của bạn
													</p>
												</div>

												{/* Profile Visibility */}
												<Card>
													<CardHeader>
														<CardTitle>Hiển thị hồ sơ</CardTitle>
													</CardHeader>
													<CardContent className="space-y-4">
														<div className="flex items-center justify-between rounded-lg border p-4">
															<div className="flex-1">
																<p className="font-medium">
																	Ai có thể xem hồ sơ của bạn
																</p>
																<p className="text-muted-foreground text-sm">
																	Công khai
																</p>
															</div>
															<Button variant="outline" size="sm">
																Thay đổi
															</Button>
														</div>
														<div className="flex items-center justify-between rounded-lg border p-4">
															<div className="flex-1">
																<p className="font-medium">Hiển thị email</p>
																<p className="text-muted-foreground text-sm">
																	Chỉ hiển thị cho bạn bè
																</p>
															</div>
															<Button variant="outline" size="sm">
																Thay đổi
															</Button>
														</div>
													</CardContent>
												</Card>

												{/* Data & Privacy */}
												<Card>
													<CardHeader>
														<CardTitle>Dữ liệu & Quyền riêng tư</CardTitle>
													</CardHeader>
													<CardContent className="space-y-4">
														<div className="flex items-center justify-between">
															<div>
																<p className="font-medium">
																	Tải xuống dữ liệu của bạn
																</p>
																<p className="text-muted-foreground text-sm">
																	Tải xuống bản sao dữ liệu của bạn
																</p>
															</div>
															<Button variant="outline">Tải xuống</Button>
														</div>
													</CardContent>
												</Card>
											</div>
										)}

										{activeSettingTab === "appearance" && (
											<div className="max-w-3xl space-y-6">
												<div>
													<h3 className="mb-2 text-2xl font-bold">Giao diện</h3>
													<p className="text-muted-foreground">
														Tùy chỉnh giao diện ứng dụng
													</p>
												</div>

												{/* Theme */}
												<Card>
													<CardHeader>
														<CardTitle>Chủ đề</CardTitle>
													</CardHeader>
													<CardContent className="space-y-4">
														<div className="grid grid-cols-3 gap-4">
															<button className="rounded-lg border-2 border-blue-500 p-4 text-center">
																<div className="mb-2 h-20 rounded bg-white" />
																<p className="font-medium">Sáng</p>
															</button>
															<button className="rounded-lg border-2 border-transparent p-4 text-center hover:border-gray-300">
																<div className="mb-2 h-20 rounded bg-gray-900" />
																<p className="font-medium">Tối</p>
															</button>
															<button className="rounded-lg border-2 border-transparent p-4 text-center hover:border-gray-300">
																<div className="mb-2 h-20 rounded bg-gradient-to-r from-white to-gray-900" />
																<p className="font-medium">Tự động</p>
															</button>
														</div>
													</CardContent>
												</Card>

												{/* Display Settings */}
												<Card>
													<CardHeader>
														<CardTitle>Cài đặt hiển thị</CardTitle>
													</CardHeader>
													<CardContent className="space-y-4">
														<div className="flex items-center justify-between rounded-lg border p-4">
															<div>
																<p className="font-medium">Kích thước chữ</p>
																<p className="text-muted-foreground text-sm">
																	Trung bình
																</p>
															</div>
															<Button variant="outline" size="sm">
																Điều chỉnh
															</Button>
														</div>
													</CardContent>
												</Card>
											</div>
										)}
									</div>
								</div>
							)}
						</div>

						{/* Profile Tabs Content */}
						{/* <ProfileContent /> */}
					</div>
					<ChangePasswordDialog
						open={openChangePassword}
						onOpenChange={setOpenChangePassword}
					/>
					<EditProfileDialog
						open={openEditProfile}
						onOpenChange={setOpenEditProfile}
					/>
				</SidebarInset>
			</div>
		</SidebarProvider>
	);
}

export default UserProfilePage;
