import { useState } from "react";
import {
	PlusIcon,
	SearchIcon,
	EyeIcon,
	EditIcon,
	TrashIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	usePrompts,
	useCreatePrompt,
	usePatchPrompt,
	useDeletePrompt,
} from "../queries/usePrompt";
import type {
	SystemPromptPatchRequest,
	SystemPromptRequest,
	SystemPromptResponse,
} from "../types/prompt.type";

import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { PromptFormDialog } from "../components/PromptFormDialog";
import { PromptContentModal } from "../components/PromptContentModal";
import { Main } from "@/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/layout/header";
export const SystemPromptsPage = () => {
	const { data: prompts = [], isLoading } = usePrompts();

	const createMutation = useCreatePrompt();
	const patchMutation = usePatchPrompt();
	const deleteMutation = useDeletePrompt();

	const [search, setSearch] = useState("");
	const [formOpen, setFormOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<
		SystemPromptResponse | undefined
	>();
	const [viewTarget, setViewTarget] = useState<
		SystemPromptResponse | undefined
	>();
	const [deleteTarget, setDeleteTarget] = useState<
		SystemPromptResponse | undefined
	>();

	const filtered = prompts.filter(
		(p) =>
			p.name.toLowerCase().includes(search.toLowerCase()) ||
			p.prompt_key.toLowerCase().includes(search.toLowerCase()),
	);

	const openCreate = () => {
		setEditTarget(undefined);
		setFormOpen(true);
	};

	const openEdit = (item: SystemPromptResponse) => {
		setEditTarget(item);
		setFormOpen(true);
	};

	const handleFormSubmit = (
		data: SystemPromptRequest | SystemPromptPatchRequest,
	) => {
		if (editTarget) {
			patchMutation.mutate(
				{ id: editTarget.id, data: data as SystemPromptPatchRequest },
				{ onSuccess: () => setFormOpen(false) },
			);
		} else {
			createMutation.mutate(data as SystemPromptRequest, {
				onSuccess: () => setFormOpen(false),
			});
		}
	};

	const handleDelete = () => {
		if (!deleteTarget) return;
		deleteMutation.mutate(deleteTarget.id, {
			onSuccess: () => setDeleteTarget(undefined),
		});
	};

	const isSaving = createMutation.isPending || patchMutation.isPending;

	return (
		<>
			<Header />

			<div className="space-y-6 p-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold">System Prompts</h1>
						<p className="text-muted-foreground mt-1 text-sm">
							Quản lý các system prompt dùng cho AI
						</p>
					</div>
					<Button onClick={openCreate}>
						<PlusIcon className="mr-2 h-4 w-4" />
						Thêm Prompt
					</Button>
				</div>

				<div className="relative max-w-sm">
					<SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
					<Input
						className="pl-9"
						placeholder="Tìm theo tên hoặc key..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>

				<div className="rounded-lg border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-12">#</TableHead>
								<TableHead>Prompt Key</TableHead>
								<TableHead>Tên</TableHead>
								<TableHead>Mô tả</TableHead>
								<TableHead>Content</TableHead>
								<TableHead>Trạng thái</TableHead>
								<TableHead>Cập nhật</TableHead>
								<TableHead className="text-center">Thao tác</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								Array.from({ length: 5 }).map((_, i) => (
									<TableRow key={i}>
										{Array.from({ length: 8 }).map((_, j) => (
											<TableCell key={j}>
												<Skeleton className="h-4 w-full" />
											</TableCell>
										))}
									</TableRow>
								))
							) : filtered.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={8}
										className="text-muted-foreground py-10 text-center text-sm"
									>
										{search
											? "Không tìm thấy kết quả"
											: "Chưa có system prompt nào"}
									</TableCell>
								</TableRow>
							) : (
								filtered.map((item, idx) => (
									<TableRow key={item.id}>
										<TableCell className="text-muted-foreground text-sm">
											{idx + 1}
										</TableCell>
										<TableCell>
											<Badge variant="secondary" className="font-mono text-xs">
												{item.prompt_key}
											</Badge>
										</TableCell>
										<TableCell className="font-medium">{item.name}</TableCell>
										<TableCell className="text-muted-foreground max-w-48 truncate text-sm">
											{item.description || "—"}
										</TableCell>
										<TableCell>
											<button
												className="text-muted-foreground hover:text-foreground max-w-48 truncate text-left text-xs font-mono block transition-colors"
												onClick={() => setViewTarget(item)}
											>
												{item.content.slice(0, 60)}...
											</button>
										</TableCell>
										<TableCell>
											<Badge
												variant={item.is_active ? "default" : "secondary"}
												className="text-xs"
											>
												{item.is_active ? "Active" : "Inactive"}
											</Badge>
										</TableCell>
										<TableCell className="text-muted-foreground text-xs">
											{new Date(item.updated_at).toLocaleDateString("vi-VN")}
										</TableCell>
										<TableCell>
											<div className="flex justify-end gap-1">
												<Button
													size="icon"
													variant="ghost"
													onClick={() => setViewTarget(item)}
												>
													<EyeIcon className="h-4 w-4" />
												</Button>
												<Button
													size="icon"
													variant="ghost"
													onClick={() => openEdit(item)}
												>
													<EditIcon className="h-4 w-4" />
												</Button>
												<Button
													size="icon"
													variant="ghost"
													className="text-destructive hover:text-destructive"
													onClick={() => setDeleteTarget(item)}
												>
													<TrashIcon className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>

				<PromptFormDialog
					open={formOpen}
					editTarget={editTarget}
					isPending={isSaving}
					onSubmit={handleFormSubmit}
					onClose={() => setFormOpen(false)}
				/>

				<PromptContentModal
					open={!!viewTarget}
					data={viewTarget}
					onClose={() => setViewTarget(undefined)}
				/>

				<DeleteConfirmModal
					open={!!deleteTarget}
					itemName={deleteTarget?.name}
					isPending={deleteMutation.isPending}
					onConfirm={handleDelete}
					onClose={() => setDeleteTarget(undefined)}
				/>
			</div>
		</>
	);
};
