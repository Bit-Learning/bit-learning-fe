import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import type { Row } from "@tanstack/react-table";
import { CheckCircle2, ShieldX, Trash2, UserPen } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/Sonner";
import { updateMentorStatus } from "../api/UserService";
import type { User } from "../data/schema";
import { useUsers } from "./users-provider";

type DataTableRowActionsProps = {
	row: Row<User>;
};

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
	const { setOpen, setCurrentRow } = useUsers();
	const queryClient = useQueryClient();

	const { mutate: mutateMentorStatus } = useMutation({
		mutationFn: updateMentorStatus,
		onSuccess: async () => {
			toast.success({
				title: "Cập nhật trạng thái mentor thành công",
			});
			await queryClient.invalidateQueries({ queryKey: ["users"] });
		},
		onError: () => {
			toast.error({
				title: "Không thể cập nhật trạng thái mentor",
			});
		},
	});

	const user = row.original;
	const isExternalMentor = user.role === "MENTOR" && user.isExternalMentor;
	const isPendingExternalMentor =
		isExternalMentor &&
		(user.mentorApprovalStatus === "PENDING" || !user.mentorApprovalStatus);

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
				>
					<DotsHorizontalIcon className="h-4 w-4" />
					<span className="sr-only">Open menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[200px]">
				{isExternalMentor && (
					<>
						<DropdownMenuItem
							onClick={() => {
								mutateMentorStatus({
									userId: user.id,
									status: "APPROVED",
								});
							}}
						>
							Duyệt mentor
							<DropdownMenuShortcut>
								<CheckCircle2 size={16} />
							</DropdownMenuShortcut>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => {
								const reason =
									window.prompt("Lý do từ chối (tuỳ chọn):") ?? undefined;
								mutateMentorStatus({
									userId: user.id,
									status: "REJECTED",
									rejectionReason: reason?.trim() || undefined,
								});
							}}
							disabled={!isPendingExternalMentor}
						>
							Từ chối mentor
							<DropdownMenuShortcut>
								<ShieldX size={16} />
							</DropdownMenuShortcut>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
					</>
				)}
				<DropdownMenuItem
					onClick={() => {
						setCurrentRow(row.original);
						setOpen("edit");
					}}
				>
					Edit
					<DropdownMenuShortcut>
						<UserPen size={16} />
					</DropdownMenuShortcut>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={() => {
						setCurrentRow(row.original);
						setOpen("delete");
					}}
					className="text-red-500!"
				>
					Delete
					<DropdownMenuShortcut>
						<Trash2 size={16} />
					</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
