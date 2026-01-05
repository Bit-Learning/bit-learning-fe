import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/Button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/Form";
import { Input } from "@workspace/ui/components/Input";
import { Tab, TabList, TabPanel, Tabs } from "@workspace/ui/components/Tabs";
import { Textarea } from "@workspace/ui/components/Textarea";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogTitle,
} from "@workspace/ui/components/update/dialog";
import { Loader2 } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { z } from "zod";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { useUpdateUserProfile } from "../queries/useUser";
import type { TUpdateUserRequest } from "../types/user.type";

const formSchema = z.object({
	username: z
		.string()
		.min(3, { message: "Username phải có ít nhất 3 ký tự" })
		.max(50)
		.optional(),
	firstName: z
		.string()
		.min(1, { message: "Tên phải có ít nhất 1 ký tự" })
		.max(50)
		.optional(),
	lastName: z
		.string()
		.min(1, { message: "Họ phải có ít nhất 1 ký tự" })
		.max(50)
		.optional(),
	pronouns: z.string().max(20).optional(),
	bio: z
		.string()
		.max(500, { message: "Tiểu sử không được vượt quá 500 ký tự" })
		.optional(),
	phoneNumber: z.string().max(20).optional(),
	location: z.string().max(100).optional(),
	jobTitle: z.string().max(100).optional(),
	langKey: z.string().max(10).optional(),
	// Social profiles
	facebook: z
		.string()
		.url({ message: "Link Facebook không hợp lệ" })
		.optional()
		.or(z.literal("")),
	instagram: z
		.string()
		.url({ message: "Link Instagram không hợp lệ" })
		.optional()
		.or(z.literal("")),
	threads: z
		.string()
		.url({ message: "Link Threads không hợp lệ" })
		.optional()
		.or(z.literal("")),
	twitter: z
		.string()
		.url({ message: "Link Twitter không hợp lệ" })
		.optional()
		.or(z.literal("")),
	linkedin: z
		.string()
		.url({ message: "Link LinkedIn không hợp lệ" })
		.optional()
		.or(z.literal("")),
	github: z
		.string()
		.url({ message: "Link GitHub không hợp lệ" })
		.optional()
		.or(z.literal("")),
	website: z
		.string()
		.url({ message: "Link Website không hợp lệ" })
		.optional()
		.or(z.literal("")),
});

interface EditProfileDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EditProfileDialog({
	open,
	onOpenChange,
}: EditProfileDialogProps) {
	const { userInfo } = useSelector(selectAuthStateInfo);
	const { mutate: updateProfile, isPending } = useUpdateUserProfile();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: userInfo?.username || "",
			firstName: userInfo?.firstName || "",
			lastName: userInfo?.lastName || "",
			pronouns: userInfo?.pronouns || "",
			bio: userInfo?.bio || "",
			phoneNumber: userInfo?.phoneNumber || "",
			location: userInfo?.location || "",
			jobTitle: userInfo?.jobTitle || "",
			langKey: userInfo?.langKey || "vi",
			facebook: userInfo?.socialProfile?.facebook || "",
			instagram: userInfo?.socialProfile?.instagram || "",
			threads: userInfo?.socialProfile?.threads || "",
			twitter: userInfo?.socialProfile?.twitter || "",
			linkedin: userInfo?.socialProfile?.linkedin || "",
			github: userInfo?.socialProfile?.github || "",
			website: userInfo?.socialProfile?.website || "",
		},
	});

	React.useEffect(() => {
		if (userInfo && open) {
			form.reset({
				username: userInfo?.username || "",
				firstName: userInfo?.firstName || "",
				lastName: userInfo?.lastName || "",
				pronouns: userInfo?.pronouns || "",
				bio: userInfo?.bio || "",
				phoneNumber: userInfo?.phoneNumber || "",
				location: userInfo?.location || "",
				jobTitle: userInfo?.jobTitle || "",
				langKey: userInfo?.langKey || "vi",
				facebook: userInfo?.socialProfile?.facebook || "",
				instagram: userInfo?.socialProfile?.instagram || "",
				threads: userInfo?.socialProfile?.threads || "",
				twitter: userInfo?.socialProfile?.twitter || "",
				linkedin: userInfo?.socialProfile?.linkedin || "",
				github: userInfo?.socialProfile?.github || "",
				website: userInfo?.socialProfile?.website || "",
			});
		}
	}, [userInfo, open, form]);

	function onSubmit(values: z.infer<typeof formSchema>) {
		const body: TUpdateUserRequest = {
			username: values.username,
			firstName: values.firstName,
			lastName: values.lastName,
			pronouns: values.pronouns,
			bio: values.bio,
			phoneNumber: values.phoneNumber,
			location: values.location,
			jobTitle: values.jobTitle,
			langKey: values.langKey,
			socialProfile: {
				facebook: values.facebook || undefined,
				instagram: values.instagram || undefined,
				threads: values.threads || undefined,
				twitter: values.twitter || undefined,
				linkedin: values.linkedin || undefined,
				github: values.github || undefined,
				website: values.website || undefined,
			},
		};

		updateProfile(body, {
			onSuccess: () => {
				onOpenChange(false);
			},
		});
	}

	return (
		<Dialog modal open={open} onOpenChange={onOpenChange}>
			<DialogOverlay />
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Chỉnh sửa hồ sơ</DialogTitle>
					<DialogDescription>
						Cập nhật thông tin cá nhân và mạng xã hội của bạn. Nhấn lưu để cập
						nhật thay đổi.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<Tabs className="w-full">
							<TabList>
								<Tab id="basic">Thông tin cơ bản</Tab>
								<Tab id="social">Mạng xã hội</Tab>
							</TabList>

							<TabPanel id="basic" className="mt-4 space-y-4">
								<div className="grid gap-4 sm:grid-cols-2">
									<FormField
										control={form.control}
										name="firstName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Tên</FormLabel>
												<FormControl>
													<Input placeholder="Nhập tên" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="lastName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Họ</FormLabel>
												<FormControl>
													<Input placeholder="Nhập họ" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="username"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Tên người dùng</FormLabel>
											<FormControl>
												<Input placeholder="Nhập tên người dùng" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="grid gap-4 sm:grid-cols-2">
									<FormField
										control={form.control}
										name="pronouns"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Đại từ</FormLabel>
												<FormControl>
													<Input placeholder="VD: Anh/Chị" {...field} />
												</FormControl>
												<FormDescription className="text-xs">
													Đại từ bạn muốn được xưng hô
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="langKey"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Ngôn ngữ</FormLabel>
												<FormControl>
													<Input placeholder="vi, en, ..." {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="bio"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Tiểu sử</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Giới thiệu về bản thân..."
													className="resize-none"
													rows={4}
													{...field}
												/>
											</FormControl>
											<FormDescription className="text-xs">
												{field.value?.length || 0}/500 ký tự
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="grid gap-4 sm:grid-cols-2">
									<FormField
										control={form.control}
										name="phoneNumber"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Số điện thoại</FormLabel>
												<FormControl>
													<Input placeholder="Nhập số điện thoại" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="location"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Địa điểm</FormLabel>
												<FormControl>
													<Input
														placeholder="VD: Hà Nội, Việt Nam"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="jobTitle"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Nghề nghiệp</FormLabel>
											<FormControl>
												<Input
													placeholder="VD: Lập trình viên, Học sinh..."
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</TabPanel>

							<TabPanel id="social" className="mt-4 space-y-4">
								<FormField
									control={form.control}
									name="facebook"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Facebook</FormLabel>
											<FormControl>
												<Input
													placeholder="https://facebook.com/..."
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="instagram"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Instagram</FormLabel>
											<FormControl>
												<Input
													placeholder="https://instagram.com/..."
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="twitter"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Twitter/X</FormLabel>
											<FormControl>
												<Input
													placeholder="https://twitter.com/..."
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="threads"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Threads</FormLabel>
											<FormControl>
												<Input
													placeholder="https://threads.net/..."
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="linkedin"
									render={({ field }) => (
										<FormItem>
											<FormLabel>LinkedIn</FormLabel>
											<FormControl>
												<Input
													placeholder="https://linkedin.com/in/..."
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="github"
									render={({ field }) => (
										<FormItem>
											<FormLabel>GitHub</FormLabel>
											<FormControl>
												<Input
													placeholder="https://github.com/..."
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="website"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Website</FormLabel>
											<FormControl>
												<Input
													placeholder="https://yourwebsite.com"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</TabPanel>
						</Tabs>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
							>
								Hủy
							</Button>
							<Button type="submit" isDisabled={isPending}>
								{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Lưu thay đổi
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
