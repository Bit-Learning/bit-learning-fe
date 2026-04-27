import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ArrowLeft,
	ArrowUpRight,
	Eye,
	FileCode2,
	Mail,
	RefreshCw,
	Save,
	Search,
	Send,
	Sparkles,
	Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/shared/lib/utils";
import {
	getAdminMailTemplate,
	getAdminMailTemplateContent,
	listAdminMailTemplates,
	migrateAdminMailTemplateFromClasspath,
	previewAdminMailTemplate,
	publishAdminMailTemplate,
	upsertAdminMailTemplateDraft,
} from "../api/admin-mail-template.api";
import type { MailTemplateSource } from "../types/admin-mail-template.types";
import { useNavigate } from "@tanstack/react-router";

const previewSources: Array<{ value: MailTemplateSource; label: string }> = [
	{ value: "EFFECTIVE", label: "Nguồn đang hiệu lực" },
	{ value: "CLASSPATH", label: "Classpath" },
	{ value: "MINIO_DRAFT", label: "Draft trên MinIO" },
	{ value: "MINIO_PUBLISHED", label: "Published trên MinIO" },
];

function formatDateTime(value?: string | null) {
	if (!value) return "Chưa có";
	return new Date(value).toLocaleString("vi-VN");
}

function getStatusTone(status?: string) {
	switch (status) {
		case "PUBLISHED":
			return "bg-emerald-500/10 text-emerald-700 border-emerald-200";
		case "DRAFT":
			return "bg-amber-500/10 text-amber-700 border-amber-200";
		default:
			return "bg-slate-500/10 text-slate-700 border-slate-200";
	}
}

function getSourceTone(source?: string) {
	switch (source) {
		case "MINIO_PUBLISHED":
			return "bg-sky-500/10 text-sky-700 border-sky-200";
		case "MINIO_DRAFT":
			return "bg-violet-500/10 text-violet-700 border-violet-200";
		default:
			return "bg-slate-500/10 text-slate-700 border-slate-200";
	}
}

export function AdminMailTemplatesPage() {
	const qc = useQueryClient();
	const [selectedKey, setSelectedKey] = useState<string>("");
	const [search, setSearch] = useState("");
	const [activeTab, setActiveTab] = useState("editor");
	const [previewSource, setPreviewSource] =
		useState<MailTemplateSource>("EFFECTIVE");
	const [displayName, setDisplayName] = useState("");
	const [subjectKey, setSubjectKey] = useState("");
	const [description, setDescription] = useState("");
	const [html, setHtml] = useState("");
	const [savedDraftState, setSavedDraftState] = useState({
		displayName: "",
		subjectKey: "",
		description: "",
		html: "",
	});

	const { data: templates, isLoading: isListLoading } = useQuery({
		queryKey: ["admin-mail-templates"],
		queryFn: listAdminMailTemplates,
	});

	const filteredTemplates = useMemo(() => {
		const keyword = search.trim().toLowerCase();
		if (!keyword) return templates ?? [];
		return (templates ?? []).filter(
			(template) =>
				template.key.toLowerCase().includes(keyword) ||
				template.displayName.toLowerCase().includes(keyword) ||
				(template.subjectKey ?? "").toLowerCase().includes(keyword),
		);
	}, [search, templates]);

	useEffect(() => {
		if (!filteredTemplates.length) {
			setSelectedKey("");
			return;
		}

		const stillExists = filteredTemplates.some(
			(template) => template.key === selectedKey,
		);
		if (!selectedKey || !stillExists) {
			setSelectedKey(filteredTemplates[0]?.key ?? "");
		}
	}, [filteredTemplates, selectedKey]);

	const { data: detail, isLoading: isDetailLoading } = useQuery({
		queryKey: ["admin-mail-template", selectedKey],
		queryFn: () => getAdminMailTemplate(selectedKey),
		enabled: Boolean(selectedKey),
	});

	const { data: content, isLoading: isContentLoading } = useQuery({
		queryKey: ["admin-mail-template-content", selectedKey],
		queryFn: () => getAdminMailTemplateContent(selectedKey),
		enabled: Boolean(selectedKey),
	});

	useEffect(() => {
		if (!detail || !content || detail.key !== selectedKey) return;
		const nextDraftState = {
			displayName: detail.displayName ?? "",
			subjectKey: detail.subjectKey ?? "",
			description: detail.description ?? "",
			html: content.html ?? "",
		};
		setDisplayName(nextDraftState.displayName);
		setSubjectKey(nextDraftState.subjectKey);
		setDescription(nextDraftState.description);
		setHtml(nextDraftState.html);
		setSavedDraftState(nextDraftState);
		setPreviewSource(
			(detail.effectiveSource as MailTemplateSource) || "EFFECTIVE",
		);
	}, [content, detail, selectedKey]);

	const hasUnsavedChanges =
		displayName !== savedDraftState.displayName ||
		subjectKey !== savedDraftState.subjectKey ||
		description !== savedDraftState.description ||
		html !== savedDraftState.html;

	useEffect(() => {
		if (!hasUnsavedChanges) return;

		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			event.preventDefault();
			event.returnValue = "";
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [hasUnsavedChanges]);

	const confirmDiscardUnsavedChanges = () => {
		if (!hasUnsavedChanges) return true;
		return window.confirm(
			"Bạn có thay đổi chưa lưu. Rời khỏi đây sẽ làm mất phần draft đang chỉnh sửa. Tiếp tục?",
		);
	};

	const previewMutation = useMutation({
		mutationFn: ({
			key,
			source,
		}: {
			key: string;
			source: MailTemplateSource;
		}) => previewAdminMailTemplate(key, { source, langKey: "vi" }),
	});

	useEffect(() => {
		if (!selectedKey || activeTab !== "preview") return;
		previewMutation.mutate({ key: selectedKey, source: previewSource });
	}, [activeTab, previewSource, selectedKey]);

	const invalidateCurrentTemplate = async (key: string) => {
		await Promise.all([
			qc.invalidateQueries({ queryKey: ["admin-mail-templates"] }),
			qc.invalidateQueries({ queryKey: ["admin-mail-template", key] }),
			qc.invalidateQueries({ queryKey: ["admin-mail-template-content", key] }),
		]);
	};

	const saveDraftMutation = useMutation({
		mutationFn: () =>
			upsertAdminMailTemplateDraft(selectedKey, {
				displayName,
				subjectKey,
				description,
				html,
			}),
		onSuccess: async () => {
			toast.success("Đã lưu draft mail template");
			setSavedDraftState({
				displayName,
				subjectKey,
				description,
				html,
			});
			await invalidateCurrentTemplate(selectedKey);
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Không thể lưu draft");
		},
	});

	const publishMutation = useMutation({
		mutationFn: () => publishAdminMailTemplate(selectedKey),
		onSuccess: async () => {
			toast.success("Đã publish mail template");
			await invalidateCurrentTemplate(selectedKey);
			previewMutation.mutate({ key: selectedKey, source: "EFFECTIVE" });
		},
		onError: (error: any) => {
			toast.error(
				error?.response?.data?.message || "Không thể publish template",
			);
		},
	});

	const migrateMutation = useMutation({
		mutationFn: () => migrateAdminMailTemplateFromClasspath(selectedKey),
		onSuccess: async () => {
			toast.success("Đã migrate template từ classpath sang draft");
			await invalidateCurrentTemplate(selectedKey);
		},
		onError: (error: any) => {
			toast.error(
				error?.response?.data?.message || "Không thể migrate template",
			);
		},
	});

	const navigate = useNavigate();

	return (
		<>
			<Header fixed />
			<div className="mt-5 ml-3">
				<Button
					variant="link"
					className="justify-start"
					onClick={() => navigate({ to: "/metrics" })}
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Quay lại
				</Button>
			</div>
			<div className="flex flex-1 flex-col gap-6 p-6">
				<Card className="overflow-hidden border border-border/70 bg-linear-to-br from-amber-50 via-white to-rose-50/60 shadow-sm">
					<CardContent className="p-6">
						<div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
							<div className="max-w-2xl">
								<h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
									Quản lý mẫu email
								</h2>
								<p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
									Quản lý bản classpath hiện tại, draft trên MinIO và bản
									published trong một giao diện dành cho admin.
								</p>
							</div>

							<div className="grid gap-3 sm:grid-cols-3">
								<div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3">
									<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
										Tổng template
									</p>
									<p className="mt-2 text-xl font-semibold text-foreground">
										{templates?.length ?? 0}
									</p>
								</div>
								<div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3">
									<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
										Đang lọc
									</p>
									<p className="mt-2 text-xl font-semibold text-foreground">
										{filteredTemplates.length}
									</p>
								</div>
								<div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3">
									<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
										Template đang chọn
									</p>
									<p className="mt-2 truncate text-sm font-semibold text-foreground">
										{selectedKey || "Chưa chọn"}
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
					<Card className="border border-border/70 shadow-sm">
						<CardHeader className="space-y-4">
							<div>
								<h3 className="text-lg font-semibold text-foreground">
									Danh sách template
								</h3>
								<p className="mt-1 text-sm text-muted-foreground">
									Tìm theo key, tên hiển thị hoặc subject key.
								</p>
							</div>

							<div className="relative">
								<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									value={search}
									onChange={(event) => setSearch(event.target.value)}
									placeholder="Ví dụ: welcome, activation..."
									className="pl-9"
								/>
							</div>
						</CardHeader>

						<CardContent className="space-y-3">
							{isListLoading ? (
								Array.from({ length: 6 }).map((_, index) => (
									<Skeleton key={index} className="h-24 rounded-2xl" />
								))
							) : filteredTemplates.length === 0 ? (
								<div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
									Không tìm thấy mail template phù hợp.
								</div>
							) : (
								filteredTemplates.map((template) => {
									const isActive = template.key === selectedKey;

									return (
										<button
											key={template.key}
											type="button"
											onClick={() => {
												if (template.key === selectedKey) return;
												if (!confirmDiscardUnsavedChanges()) return;
												setSelectedKey(template.key);
											}}
											className={cn(
												"w-full rounded-2xl border px-4 py-4 text-left transition",
												isActive
													? "border-slate-900 bg-slate-900 text-white shadow-sm"
													: "border-border/70 bg-background hover:border-slate-300 hover:bg-muted/20",
											)}
										>
											<div className="flex items-start justify-between gap-3">
												<div className="min-w-0">
													<p
														className={cn(
															"truncate text-sm font-semibold",
															isActive ? "text-white" : "text-foreground",
														)}
													>
														{template.displayName}
													</p>
													<p
														className={cn(
															"mt-1 truncate text-xs",
															isActive
																? "text-slate-300"
																: "text-muted-foreground",
														)}
													>
														{template.key}
													</p>
												</div>
												<Mail
													className={cn(
														"h-4 w-4 shrink-0",
														isActive ? "text-white" : "text-muted-foreground",
													)}
												/>
											</div>

											<div className="mt-3 flex flex-wrap gap-2">
												<span
													className={cn(
														"rounded-full border px-2.5 py-1 text-[11px] font-medium",
														isActive
															? "border-white/20 bg-white/10 text-white"
															: getStatusTone(template.status),
													)}
												>
													{template.status}
												</span>
												<span
													className={cn(
														"rounded-full border px-2.5 py-1 text-[11px] font-medium",
														isActive
															? "border-white/20 bg-white/10 text-white"
															: getSourceTone(template.effectiveSource),
													)}
												>
													{template.effectiveSource}
												</span>
											</div>
										</button>
									);
								})
							)}
						</CardContent>
					</Card>

					<Card className="border border-border/70 shadow-sm">
						<CardContent className="p-6">
							{!selectedKey ? (
								<div className="rounded-2xl border border-dashed border-border px-4 py-16 text-center text-sm text-muted-foreground">
									Chọn một mail template ở cột bên trái để bắt đầu chỉnh sửa.
								</div>
							) : isDetailLoading || isContentLoading || !detail || !content ? (
								<div className="space-y-4">
									<Skeleton className="h-9 w-60" />
									<Skeleton className="h-28 w-full rounded-3xl" />
									<Skeleton className="h-96 w-full rounded-3xl" />
								</div>
							) : (
								<div className="space-y-6">
									<div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
										<div className="space-y-3">
											<div className="flex flex-wrap items-center gap-2">
												<Badge
													variant="outline"
													className={getStatusTone(detail.status)}
												>
													{detail.status}
												</Badge>
												<Badge
													variant="outline"
													className={getSourceTone(detail.effectiveSource)}
												>
													{detail.effectiveSource}
												</Badge>
												{detail.source && (
													<Badge
														variant="outline"
														className="border-border/70 bg-background/80"
													>
														Source: {detail.source}
													</Badge>
												)}
												{hasUnsavedChanges && (
													<Badge
														variant="outline"
														className="border-amber-200 bg-amber-500/10 text-amber-700"
													>
														Có thay đổi chưa lưu
													</Badge>
												)}
											</div>

											<div>
												<h3 className="text-2xl font-semibold tracking-tight text-foreground">
													{detail.displayName}
												</h3>
												<p className="mt-1 text-sm text-muted-foreground">
													{detail.key}
												</p>
											</div>

											<div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
												<p>
													Cập nhật lần cuối: {formatDateTime(detail.updatedAt)}
												</p>
												<p>Người cập nhật: {detail.updatedBy || "Chưa có"}</p>
												<p>
													Published lúc: {formatDateTime(detail.publishedAt)}
												</p>
												<p>
													Classpath name:{" "}
													{detail.classpathTemplateName || "Chưa có"}
												</p>
											</div>
										</div>

										<div className="flex flex-wrap gap-2">
											<Button
												type="button"
												variant="outline"
												onClick={() => {
													if (!confirmDiscardUnsavedChanges()) return;
													invalidateCurrentTemplate(selectedKey);
												}}
												disabled={isDetailLoading || isContentLoading}
											>
												<RefreshCw className="h-4 w-4" />
												Tải lại
											</Button>
											<Button
												type="button"
												variant="outline"
												onClick={() => migrateMutation.mutate()}
												disabled={migrateMutation.isPending}
											>
												<Upload className="h-4 w-4" />
												{migrateMutation.isPending
													? "Đang migrate..."
													: "Migrate từ classpath"}
											</Button>
											<Button
												type="button"
												variant="outline"
												onClick={() => saveDraftMutation.mutate()}
												disabled={saveDraftMutation.isPending || !html.trim()}
											>
												<Save className="h-4 w-4" />
												{saveDraftMutation.isPending
													? "Đang lưu..."
													: "Lưu draft"}
											</Button>
											<Button
												type="button"
												onClick={() => publishMutation.mutate()}
												disabled={publishMutation.isPending}
											>
												<Send className="h-4 w-4" />
												{publishMutation.isPending
													? "Đang publish..."
													: "Publish"}
											</Button>
										</div>
									</div>

									{hasUnsavedChanges && (
										<div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
											Bạn đang chỉnh sửa draft và chưa lưu. Hãy chọn{" "}
											<span className="font-semibold">Lưu draft</span> trước khi
											publish, preview nguồn draft hoặc chuyển sang template
											khác.
										</div>
									)}

									<div className="grid gap-4 lg:grid-cols-3">
										<div className="space-y-2">
											<label
												className="text-sm font-medium text-foreground"
												htmlFor="mail-template-display-name"
											>
												Tên hiển thị
											</label>
											<Input
												id="mail-template-display-name"
												value={displayName}
												onChange={(event) => setDisplayName(event.target.value)}
											/>
										</div>

										<div className="space-y-2">
											<label
												className="text-sm font-medium text-foreground"
												htmlFor="mail-template-subject-key"
											>
												Subject key
											</label>
											<Input
												id="mail-template-subject-key"
												value={subjectKey}
												onChange={(event) => setSubjectKey(event.target.value)}
												placeholder="mail.subject.welcome"
											/>
										</div>

										<div className="space-y-2">
											<label
												className="text-sm font-medium text-foreground"
												htmlFor="mail-template-effective-source"
											>
												Preview source
											</label>
											<Select
												value={previewSource}
												onValueChange={(value) =>
													setPreviewSource(value as MailTemplateSource)
												}
											>
												<SelectTrigger id="mail-template-effective-source">
													<SelectValue placeholder="Chọn nguồn preview" />
												</SelectTrigger>
												<SelectContent>
													{previewSources.map((option) => (
														<SelectItem key={option.value} value={option.value}>
															{option.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									</div>

									<div className="space-y-2">
										<label
											className="text-sm font-medium text-foreground"
											htmlFor="mail-template-description"
										>
											Mô tả
										</label>
										<Textarea
											id="mail-template-description"
											value={description}
											onChange={(event) => setDescription(event.target.value)}
											className="min-h-20"
											placeholder="Mô tả ngắn về mục đích và thời điểm dùng template"
										/>
									</div>

									<Tabs
										value={activeTab}
										onValueChange={setActiveTab}
										className="gap-4"
									>
										<TabsList>
											<TabsTrigger value="editor" className="gap-2">
												<FileCode2 className="h-4 w-4" />
												Editor
											</TabsTrigger>
											<TabsTrigger value="preview" className="gap-2">
												<Eye className="h-4 w-4" />
												Preview
											</TabsTrigger>
											<TabsTrigger value="metadata" className="gap-2">
												<ArrowUpRight className="h-4 w-4" />
												Metadata
											</TabsTrigger>
										</TabsList>

										<TabsContent value="editor" className="space-y-3">
											<div className="flex items-center justify-between">
												<p className="text-sm text-muted-foreground">
													Nội dung bên dưới là draft đang chỉnh sửa. Hãy lưu
													draft trước khi publish.
												</p>
												<p className="text-xs text-muted-foreground">
													{html.length.toLocaleString("vi-VN")} ký tự
												</p>
											</div>

											<Textarea
												value={html}
												onChange={(event) => setHtml(event.target.value)}
												className="min-h-[520px] font-mono text-xs leading-6"
												placeholder="<html>...</html>"
											/>
										</TabsContent>

										<TabsContent value="preview" className="space-y-4">
											<div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
												<div>
													<p className="text-sm font-medium text-foreground">
														Preview từ backend renderer
													</p>
													<p className="text-xs text-muted-foreground">
														Preview dùng source đã chọn ở trên. Nếu vừa sửa
														editor, hãy lưu draft trước.
													</p>
												</div>
												<Button
													type="button"
													variant="outline"
													onClick={() =>
														previewMutation.mutate({
															key: selectedKey,
															source: previewSource,
														})
													}
													disabled={previewMutation.isPending}
												>
													<RefreshCw
														className={cn(
															"h-4 w-4",
															previewMutation.isPending && "animate-spin",
														)}
													/>
													Làm mới preview
												</Button>
											</div>

											{previewMutation.isPending ? (
												<Skeleton className="h-[560px] w-full rounded-3xl" />
											) : previewMutation.isError ? (
												<div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-6 text-sm text-destructive">
													Không thể render preview với source hiện tại.
												</div>
											) : (
												<iframe
													title={`preview-${selectedKey}`}
													className="h-[560px] w-full rounded-3xl border border-border/70 bg-white"
													srcDoc={previewMutation.data || ""}
												/>
											)}
										</TabsContent>

										<TabsContent value="metadata" className="space-y-4">
											<div className="grid gap-4 md:grid-cols-2">
												<div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4">
													<p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
														Effective source
													</p>
													<p className="mt-2 text-sm font-semibold text-foreground">
														{detail.effectiveSource}
													</p>
												</div>
												<div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4">
													<p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
														Status
													</p>
													<p className="mt-2 text-sm font-semibold text-foreground">
														{detail.status}
													</p>
												</div>
												<div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4">
													<p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
														Draft object path
													</p>
													<p className="mt-2 break-all text-sm text-foreground">
														{detail.draftObjectPath || "Chưa có"}
													</p>
												</div>
												<div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4">
													<p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
														Published object path
													</p>
													<p className="mt-2 break-all text-sm text-foreground">
														{detail.publishedObjectPath || "Chưa có"}
													</p>
												</div>
											</div>
										</TabsContent>
									</Tabs>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</>
	);
}
