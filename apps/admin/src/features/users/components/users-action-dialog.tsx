"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SelectDropdown } from "@/components/select-dropdown";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { showSubmittedData } from "@/shared/lib/show-submitted-data";
import { getUserProfileById } from "../api/UserService";
import { roles } from "../data/data";
import type { User } from "../data/schema";

const formSchema = z
	.object({
		firstName: z.string().min(1, "First Name is required."),
		lastName: z.string().min(1, "Last Name is required."),
		username: z.string().min(1, "Username is required."),
		phoneNumber: z.string().min(1, "Phone number is required."),
		email: z.email({
			error: (iss) => (iss.input === "" ? "Email is required." : undefined),
		}),
		password: z.string().transform((pwd) => pwd.trim()),
		role: z.string().min(1, "Role is required."),
		confirmPassword: z.string().transform((pwd) => pwd.trim()),
		isEdit: z.boolean(),
	})
	.refine(
		(data) => {
			if (data.isEdit && !data.password) return true;
			return data.password.length > 0;
		},
		{
			message: "Password is required.",
			path: ["password"],
		},
	)
	.refine(
		({ isEdit, password }) => {
			if (isEdit && !password) return true;
			return password.length >= 8;
		},
		{
			message: "Password must be at least 8 characters long.",
			path: ["password"],
		},
	)
	.refine(
		({ isEdit, password }) => {
			if (isEdit && !password) return true;
			return /[a-z]/.test(password);
		},
		{
			message: "Password must contain at least one lowercase letter.",
			path: ["password"],
		},
	)
	.refine(
		({ isEdit, password }) => {
			if (isEdit && !password) return true;
			return /\d/.test(password);
		},
		{
			message: "Password must contain at least one number.",
			path: ["password"],
		},
	)
	.refine(
		({ isEdit, password, confirmPassword }) => {
			if (isEdit && !password) return true;
			return password === confirmPassword;
		},
		{
			message: "Passwords don't match.",
			path: ["confirmPassword"],
		},
	);

type UserForm = z.infer<typeof formSchema>;

type UserActionDialogProps = {
	currentRow?: User;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

function DetailItem({
	label,
	value,
	className,
}: {
	label: string;
	value?: string | number | null;
	className?: string;
}) {
	return (
		<div className={className}>
			<div className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
				{label}
			</div>
			<div className="mt-1 text-sm">{value ?? "-"}</div>
		</div>
	);
}

function UserDetailContent({ user }: { user: User }) {
	const mentorSpecialties = user.specialties?.length
		? user.specialties.join(", ")
		: null;
	const mentorStatus =
		user.role === "MENTOR"
			? user.isExternalMentor
				? (user.mentorApprovalStatus ?? "PENDING")
				: "INTERNAL"
			: null;

	return (
		<div className="space-y-6">
			<div className="grid gap-4 sm:grid-cols-2">
				<DetailItem label="Họ" value={user.firstName} />
				<DetailItem label="Tên" value={user.lastName} />
				<DetailItem label="Username" value={user.username} />
				<DetailItem label="Email" value={user.email} />
				<DetailItem label="Số điện thoại" value={user.phoneNumber} />
				<DetailItem label="Vai trò" value={user.role} />
				<DetailItem
					label="Trạng thái tài khoản"
					value={user.accountStatus === "DISABLED" ? "Bị khóa" : "Hoạt động"}
				/>
				<DetailItem
					label="Trạng thái"
					value={user.activated ? "Hoạt động" : "Không hoạt động"}
				/>
				<DetailItem label="Chức danh" value={user.jobTitle} />
				<DetailItem label="Khu vực" value={user.location} />
				<DetailItem
					label="Đăng nhập gần nhất"
					value={
						user.lastLoginAttempt
							? new Date(user.lastLoginAttempt).toLocaleString("vi-VN")
							: "Chưa từng"
					}
				/>
				<DetailItem
					label="Lý do khóa"
					value={user.accountStatusReason}
					className="sm:col-span-2"
				/>
			</div>

			{user.role === "MENTOR" && (
				<>
					<Separator />
					<div>
						<div className="mb-3 text-sm font-semibold">Thông tin mentor</div>
						<div className="grid gap-4 sm:grid-cols-2">
							<DetailItem label="Trạng thái mentor" value={mentorStatus} />
							<DetailItem label="Chuyên môn" value={mentorSpecialties} />
							<DetailItem label="Đơn vị công tác" value={user.company} />
							<DetailItem
								label="Kinh nghiệm"
								value={
									typeof user.yearsOfExperience === "number"
										? `${user.yearsOfExperience} năm`
										: null
								}
							/>
							<DetailItem
								label="Nổi bật"
								value={
									typeof user.featured === "boolean"
										? user.featured
											? "Có"
											: "Không"
										: null
								}
							/>
							<DetailItem label="Học viên" value={user.studentsCount} />
							<DetailItem label="Khoá học" value={user.coursesCount} />
							<DetailItem
								label="Lý do từ chối"
								value={user.mentorRejectionReason}
								className="sm:col-span-2"
							/>
						</div>
					</div>
				</>
			)}
		</div>
	);
}

export function UsersActionDialog({
	currentRow,
	open,
	onOpenChange,
}: UserActionDialogProps) {
	const isEdit = !!currentRow;

	const { data: userDetail, isLoading } = useQuery({
		queryKey: ["user-detail", currentRow?.id],
		queryFn: async () => {
			if (!currentRow?.id) {
				throw new Error("User ID is required");
			}
			const response = await getUserProfileById(currentRow.id);
			return response.data.data;
		},
		enabled: isEdit && open && !!currentRow?.id,
	});

	const form = useForm<UserForm>({
		resolver: zodResolver(formSchema),
		defaultValues: isEdit
			? {
					firstName: currentRow?.firstName ?? "",
					lastName: currentRow?.lastName ?? "",
					username: currentRow?.username ?? "",
					email: currentRow?.email ?? "",
					role: currentRow?.role ?? "",
					phoneNumber: currentRow?.phoneNumber ?? "",
					password: "",
					confirmPassword: "",
					isEdit,
				}
			: {
					firstName: "",
					lastName: "",
					username: "",
					email: "",
					role: "",
					phoneNumber: "",
					password: "",
					confirmPassword: "",
					isEdit,
				},
	});

	const onSubmit = (values: UserForm) => {
		form.reset();
		showSubmittedData(values);
		onOpenChange(false);
	};

	if (isEdit) {
		const detail = userDetail ?? currentRow;

		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-2xl">
					<DialogHeader className="text-start">
						<DialogTitle>Chi tiết người dùng</DialogTitle>
					</DialogHeader>
					<div className="max-h-[70vh] overflow-y-auto pr-1">
						{isLoading && (
							<div className="text-muted-foreground text-sm">
								Đang tải thông tin người dùng...
							</div>
						)}
						{!isLoading && detail && <UserDetailContent user={detail} />}
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Đóng
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	}

	const isPasswordTouched = !!form.formState.dirtyFields.password;

	return (
		<Dialog
			open={open}
			onOpenChange={(state) => {
				form.reset();
				onOpenChange(state);
			}}
		>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader className="text-start">
					<DialogTitle>Thêm người dùng</DialogTitle>
					<DialogDescription>Tạo người dùng mới tại đây.</DialogDescription>
				</DialogHeader>
				<div className="h-[26.25rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3">
					<Form {...form}>
						<form
							id="user-form"
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-4 px-0.5"
						>
							<FormField
								control={form.control}
								name="firstName"
								render={({ field }) => (
									<FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
										<FormLabel className="col-span-2 text-end">
											First Name
										</FormLabel>
										<FormControl>
											<Input
												placeholder="John"
												className="col-span-4"
												autoComplete="off"
												{...field}
											/>
										</FormControl>
										<FormMessage className="col-span-4 col-start-3" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="lastName"
								render={({ field }) => (
									<FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
										<FormLabel className="col-span-2 text-end">
											Last Name
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Doe"
												className="col-span-4"
												autoComplete="off"
												{...field}
											/>
										</FormControl>
										<FormMessage className="col-span-4 col-start-3" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="username"
								render={({ field }) => (
									<FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
										<FormLabel className="col-span-2 text-end">
											Username
										</FormLabel>
										<FormControl>
											<Input
												placeholder="john_doe"
												className="col-span-4"
												{...field}
											/>
										</FormControl>
										<FormMessage className="col-span-4 col-start-3" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
										<FormLabel className="col-span-2 text-end">Email</FormLabel>
										<FormControl>
											<Input
												placeholder="john.doe@gmail.com"
												className="col-span-4"
												{...field}
											/>
										</FormControl>
										<FormMessage className="col-span-4 col-start-3" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="phoneNumber"
								render={({ field }) => (
									<FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
										<FormLabel className="col-span-2 text-end">
											Phone Number
										</FormLabel>
										<FormControl>
											<Input
												placeholder="+123456789"
												className="col-span-4"
												{...field}
											/>
										</FormControl>
										<FormMessage className="col-span-4 col-start-3" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="role"
								render={({ field }) => (
									<FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
										<FormLabel className="col-span-2 text-end">Role</FormLabel>
										<SelectDropdown
											defaultValue={field.value}
											onValueChange={field.onChange}
											placeholder="Select a role"
											className="col-span-4"
											items={roles.map(({ label, value }) => ({
												label,
												value,
											}))}
										/>
										<FormMessage className="col-span-4 col-start-3" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
										<FormLabel className="col-span-2 text-end">
											Password
										</FormLabel>
										<FormControl>
											<Input
												type="password"
												placeholder="e.g., S3cur3P@ssw0rd"
												className="col-span-4"
												{...field}
											/>
										</FormControl>
										<FormMessage className="col-span-4 col-start-3" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="confirmPassword"
								render={({ field }) => (
									<FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
										<FormLabel className="col-span-2 text-end">
											Confirm Password
										</FormLabel>
										<FormControl>
											<Input
												type="password"
												disabled={!isPasswordTouched}
												placeholder="e.g., S3cur3P@ssw0rd"
												className="col-span-4"
												{...field}
											/>
										</FormControl>
										<FormMessage className="col-span-4 col-start-3" />
									</FormItem>
								)}
							/>
						</form>
					</Form>
				</div>
				<DialogFooter>
					<Button type="submit" form="user-form">
						Save changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
