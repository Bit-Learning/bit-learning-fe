import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import type { Row } from "@tanstack/react-table";
import { Eye, ShieldBan, ShieldCheck } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PostPreview } from "../types/post.type";

type PostsRowActionsProps = {
	row: Row<PostPreview>;
};

export function PostsRowActions({ row }: PostsRowActionsProps) {
	const navigate = useNavigate();
	const post = row.original;

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
			<DropdownMenuContent align="end" className="w-[210px]">
				<DropdownMenuItem
					onClick={() =>
						navigate({
							to: "/posts/$id",
							params: { id: post.id.toString() },
						})
					}
				>
					Xem chi tiết
					<DropdownMenuShortcut>
						<Eye size={16} />
					</DropdownMenuShortcut>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem disabled>
					{post.isBanned ? "Mở khóa bài viết" : "Khóa bài viết"}
					<DropdownMenuShortcut>
						{post.isBanned ? (
							<ShieldCheck size={16} />
						) : (
							<ShieldBan size={16} />
						)}
					</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
