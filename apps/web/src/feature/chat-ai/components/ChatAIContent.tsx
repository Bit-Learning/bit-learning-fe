import React, { useEffect, useRef, useState } from "react";
import {
	AlertTriangle,
	Check,
	ChevronDown,
	MessageSquare,
	PanelLeft,
	Paperclip,
	Plus,
	Search,
	Send,
	X,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useSelector } from "react-redux";
import { Badge } from "@workspace/ui/components/Badge";
import { toast } from "@/shared/components/Sonner";
import { useAppDispatch } from "@/shared/redux/store";
import {
	addMessageAction,
	clearChatAction,
	clearMessagesAction,
	selectMessages,
} from "../stores/chat.store";
import {
	useChatQuota,
	useConversation,
	useConversationMessages,
	useCreateConversation,
	useSendMessage,
	useUserConversations,
} from "../queries/useChat";
import type { Conversation, Message } from "../types/chat.type";
import ChatSidebar from "./ChatSidebar";
import ChatView from "./ChatView";
import IntroView from "./IntroView";

interface ChatAIContentProps {
	conversationId?: string;
}

const ChatAIContent: React.FC<ChatAIContentProps> = ({ conversationId }) => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const messages = useSelector(selectMessages);

	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [inputValue, setInputValue] = useState("");
	const [files, setFiles] = useState<File[]>([]);
	const [selectedModel, setSelectedModel] = useState<"gpt-4o-mini" | "gpt-4o">(
		"gpt-4o-mini",
	);
	const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
	const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const modelDropdownRef = useRef<HTMLDivElement>(null);
	const prevConversationIdRef = useRef<string | undefined>(undefined);

	const { data: conversationsData } = useUserConversations(0, 10);
	const { data: quotaData } = useChatQuota();
	const createConversation = useCreateConversation();
	const sendMessage = useSendMessage();

	useConversation(conversationId || "");
	useConversationMessages(conversationId || "", 20);

	const conversations = conversationsData?.data || [];
	const quota = quotaData?.data;
	const remainingFreeToday = quota?.remaining_free_today ?? 0;
	const dailyFreeLimit = quota?.daily_free_limit ?? 5;
	const willChargeNextPrompt = quota?.next_prompt_will_be_charged === true;
	const currentView: "intro" | "chat" =
		conversationId || isCreatingNewChat ? "chat" : "intro";

	useEffect(() => {
		if (
			prevConversationIdRef.current !== undefined &&
			prevConversationIdRef.current !== conversationId
		) {
			dispatch(clearMessagesAction());
		}
		prevConversationIdRef.current = conversationId;
	}, [conversationId, dispatch]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				modelDropdownRef.current &&
				!modelDropdownRef.current.contains(event.target as Node)
			) {
				setIsModelDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const todayString = new Date().toDateString();
	const yesterdayString = new Date(
		Date.now() - 24 * 60 * 60 * 1000,
	).toDateString();

	const searchedConversations = conversations.filter((conversation) =>
		conversation.title.toLowerCase().includes(searchQuery.toLowerCase()),
	);
	const todaySearchResults = searchedConversations.filter(
		(conversation) =>
			new Date(conversation.createdAt).toDateString() === todayString,
	);
	const yesterdaySearchResults = searchedConversations.filter(
		(conversation) =>
			new Date(conversation.createdAt).toDateString() === yesterdayString,
	);

	const handleSelectConversation = (conversation: Conversation) => {
		dispatch(clearMessagesAction());
		navigate({
			to: "/chat-ai/$conversationId",
			params: { conversationId: conversation.id },
		});
	};

	const handleSendMessage = async () => {
		if (!inputValue.trim() && files.length === 0) {
			return;
		}

		const question = inputValue;
		const pendingFiles = [...files];

		const userMessage: Message = {
			id: Date.now(),
			role: "user",
			content: question,
			createdAt: new Date().toISOString(),
			attachments: pendingFiles.map((file) => ({
				fileName: file.name,
				fileUrl: URL.createObjectURL(file),
				fileType: file.type,
				fileSize: file.size,
			})),
		};

		dispatch(addMessageAction(userMessage));
		setInputValue("");
		setFiles([]);

		try {
			let activeId = conversationId;

			if (!activeId) {
				setIsCreatingNewChat(true);
				const response = await createConversation.mutateAsync({
					title: question.substring(0, 50),
				});
				activeId = response.data.data?.id;
			}

			if (activeId) {
				const response = await sendMessage.mutateAsync({
					conversationId: activeId,
					request: {
						question,
						files: pendingFiles.length > 0 ? pendingFiles : undefined,
						model: selectedModel,
					},
				});

				const updatedQuota = response.data.data?.quota;
				const chargedAmount = updatedQuota?.charged_amount ?? 0;

				if (updatedQuota?.was_free) {
					toast.success({
						title: "Đã dùng 1 lượt chat miễn phí",
					});
				} else if (chargedAmount > 0) {
					toast.info({
						title: `Đã trừ ${chargedAmount} BIT`,
					});
				}

				if (!conversationId) {
					navigate({
						to: "/chat-ai/$conversationId",
						params: { conversationId: activeId },
					});
				}
			}
		} catch (error) {
			toast.error({
				title: "tin nhắn không hợp lệ",
			});
			console.error("Failed to send message:", error);
		} finally {
			setIsCreatingNewChat(false);
		}
	};

	const handleQuickQuestion = (question: string) => {
		setInputValue(question);
		setTimeout(() => handleSendMessage(), 100);
	};

	const handleNewChat = () => {
		dispatch(clearChatAction());
		setIsCreatingNewChat(false);
		navigate({ to: "/chat-ai" });
	};

	const handleKeyPress = (event: React.KeyboardEvent) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			handleSendMessage();
		}
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selected = Array.from(event.target.files || []);
		setFiles((previous) => [...previous, ...selected]);
		event.target.value = "";
	};

	const handleRemoveFile = (index: number) => {
		setFiles((previous) =>
			previous.filter((_, itemIndex) => itemIndex !== index),
		);
	};

	const isLoading = sendMessage.isPending || createConversation.isPending;

	const filePreviewJsx =
		files.length > 0 ? (
			<div className="mb-2 flex flex-wrap gap-2 px-1">
				{files.map((file, index) => {
					const isImage = file.type.startsWith("image/");
					const url = URL.createObjectURL(file);

					return (
						<div key={`${file.name}-${index}`} className="group relative">
							{isImage ? (
								<img
									src={url}
									alt={file.name}
									className="h-16 w-16 rounded-md border border-slate-200 object-cover shadow-sm dark:border-slate-700"
								/>
							) : (
								<div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
									<Paperclip size={17} />
									<span className="max-w-25 truncate">{file.name}</span>
								</div>
							)}

							<button
								type="button"
								onClick={() => handleRemoveFile(index)}
								className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
							>
								<X size={10} />
							</button>
						</div>
					);
				})}
			</div>
		) : null;

	const inputBoxJsx = (
		<div className="space-y-3">
			{quota && (
				<div className="flex flex-wrap items-center gap-2 px-1">
					<Badge
						variant={willChargeNextPrompt ? "outline" : "secondary"}
						className={
							willChargeNextPrompt
								? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
								: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
						}
					>
						{remainingFreeToday}/{dailyFreeLimit} lượt miễn phí còn lại
					</Badge>
				</div>
			)}

			{willChargeNextPrompt && (
				<div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800/70 dark:bg-amber-950/40 dark:text-amber-200">
					<AlertTriangle size={16} className="mt-0.5 shrink-0" />
					<p>
						Tin nhắn tiếp theo sẽ bị trừ BIT vì bạn đã hết lượt miễn phí hôm
						nay.
					</p>
				</div>
			)}

			<div className="flex items-center gap-1 rounded-md border border-slate-300 bg-white pl-1 pr-2 shadow-sm transition-all ring-blue-500/20 focus-within:shadow-md focus-within:ring-2 dark:border-slate-700 dark:bg-slate-800">
				<input
					ref={fileInputRef}
					type="file"
					multiple
					accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.pptx"
					className="hidden"
					onChange={handleFileChange}
				/>

				<button
					type="button"
					onClick={() => fileInputRef.current?.click()}
					disabled={isLoading}
					className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-700"
					title="Đính kèm file hoặc ảnh"
				>
					<Paperclip size={18} />
				</button>

				<textarea
					ref={textareaRef}
					value={inputValue}
					onChange={(event) => setInputValue(event.target.value)}
					onKeyDown={handleKeyPress}
					disabled={isLoading}
					className="w-full resize-none border-none bg-transparent px-2 py-3 text-slate-700 outline-none focus:ring-0 disabled:opacity-50 dark:text-slate-200"
					placeholder="Hỏi bất cứ điều gì về Tin học..."
					rows={1}
					style={{ height: "auto", minHeight: "0" }}
				/>

				<div className="relative shrink-0" ref={modelDropdownRef}>
					<button
						type="button"
						onClick={() => setIsModelDropdownOpen((previous) => !previous)}
						disabled={isLoading}
						className="flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-700/50"
					>
						{selectedModel}
						<ChevronDown
							size={12}
							className={`transition-transform duration-150 ${
								isModelDropdownOpen ? "rotate-180" : ""
							}`}
						/>
					</button>

					{isModelDropdownOpen && (
						<div className="absolute bottom-full right-0 z-50 mb-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
							{(
								[
									{
										value: "gpt-4o-mini",
										label: "gpt-4o-mini",
										desc: "Nhanh, phù hợp câu hỏi thông thường",
									},
									{
										value: "gpt-4o",
										label: "gpt-4o",
										desc: "Thông minh hơn, phù hợp bài toán phức tạp",
									},
								] as const
							).map((option) => (
								<button
									key={option.value}
									type="button"
									onClick={() => {
										setSelectedModel(option.value);
										setIsModelDropdownOpen(false);
									}}
									className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/60"
								>
									<div>
										<div className="text-[13px] font-medium text-slate-800 dark:text-slate-100">
											{option.label}
										</div>
										<div className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
											{option.desc}
										</div>
									</div>

									{selectedModel === option.value && (
										<Check size={15} className="shrink-0 text-blue-500" />
									)}
								</button>
							))}
						</div>
					)}
				</div>

				<button
					onClick={handleSendMessage}
					disabled={(!inputValue.trim() && files.length === 0) || isLoading}
					className="ml-1 inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-blue-500 text-white shadow-sm transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isLoading ? (
						<div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
					) : (
						<Send size={18} />
					)}
				</button>
			</div>
		</div>
	);

	return (
		<div className="flex h-[calc(100dvh-5rem)] min-h-[calc(100dvh-5rem)] overflow-hidden bg-slate-50 dark:bg-slate-900">
			<div
				className={`relative flex h-full min-h-0 border-r border-slate-200 bg-white text-slate-900 transition-all duration-300 ease-in-out dark:border-slate-700/50 dark:bg-slate-800 dark:text-slate-200 ${
					isSidebarOpen ? "w-72" : "w-12"
				}`}
			>
				{isSidebarOpen ? (
					<ChatSidebar
						conversations={conversations}
						currentConversationId={conversationId}
						onNewChat={handleNewChat}
						onSelectConversation={handleSelectConversation}
						onToggleCollapse={() => setIsSidebarOpen(false)}
						onOpenSearch={() => setIsSearchOpen(true)}
					/>
				) : (
					<div className="flex h-full w-full flex-col items-center justify-between py-4">
						<div className="flex flex-col items-center gap-3">
							<button
								type="button"
								onClick={() => setIsSidebarOpen(true)}
								className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
							>
								<PanelLeft size={20} />
							</button>

							<button
								type="button"
								onClick={() => {
									setIsSidebarOpen(true);
									handleNewChat();
								}}
								className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700"
							>
								<Plus size={18} />
							</button>

							<button
								type="button"
								onClick={() => setIsSearchOpen(true)}
								className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
							>
								<Search size={18} />
							</button>
						</div>
					</div>
				)}
			</div>

			<main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white dark:bg-slate-900">
				{currentView === "intro" ? (
					<div className="flex flex-1 flex-col items-center justify-center overflow-hidden px-4">
						<IntroView onQuickQuestion={handleQuickQuestion} />
						<div className="mt-6 w-full max-w-2xl">
							{filePreviewJsx}
							{inputBoxJsx}
						</div>
					</div>
				) : (
					<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
						<ChatView messages={messages} isTyping={isLoading} />
						<div className="mx-auto w-full max-w-5xl px-6 md:pb-12">
							{filePreviewJsx}
							{inputBoxJsx}
						</div>
					</div>
				)}
			</main>

			{isSearchOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
					<div className="mx-4 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-2 shadow-xl transition-all duration-200 ease-out dark:border-slate-700 dark:bg-slate-900">
						<div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
							<div className="flex items-center gap-2">
								<Search size={18} className="text-slate-500" />
								<h2 className="text-md font-semibold text-slate-900 dark:text-slate-100">
									Tìm kiếm cuộc trò chuyện
								</h2>
							</div>

							<button
								type="button"
								onClick={() => setIsSearchOpen(false)}
								className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
							>
								<X size={20} />
							</button>
						</div>

						<div className="border-b border-slate-100 px-4 pb-3 pt-4 dark:border-slate-800">
							<div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
								<Search size={20} className="text-slate-400" />
								<input
									autoFocus
									type="text"
									value={searchQuery}
									onChange={(event) => setSearchQuery(event.target.value)}
									placeholder="Nhập từ khóa để tìm kiếm..."
									className="text-md w-full bg-transparent outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
								/>
							</div>
						</div>

						<div className="max-h-80 space-y-4 overflow-y-auto px-4 py-3">
							<div>
								<div className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
									Hôm nay
								</div>

								{todaySearchResults.length > 0 ? (
									<div className="space-y-1">
										{todaySearchResults.map((conversation) => (
											<button
												key={conversation.id}
												type="button"
												onClick={() => {
													setIsSearchOpen(false);
													setIsSidebarOpen(true);
													handleSelectConversation(conversation);
												}}
												className="w-full cursor-pointer rounded-lg px-3 py-2 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/80"
											>
												<div className="flex items-center gap-2">
													<MessageSquare size={16} className="text-slate-400" />
													<span className="text-md line-clamp-1 font-medium text-slate-900 dark:text-slate-100">
														{conversation.title}
													</span>
												</div>
												<p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
													Xem lại cuộc trò chuyện này.
												</p>
											</button>
										))}
									</div>
								) : (
									<p className="text-sm text-slate-500 dark:text-slate-400">
										Không có kết quả hôm nay.
									</p>
								)}
							</div>

							<div>
								<div className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
									Hôm qua
								</div>

								{yesterdaySearchResults.length > 0 ? (
									<div className="space-y-1">
										{yesterdaySearchResults.map((conversation) => (
											<button
												key={conversation.id}
												type="button"
												onClick={() => {
													setIsSearchOpen(false);
													setIsSidebarOpen(true);
													handleSelectConversation(conversation);
												}}
												className="w-full cursor-pointer rounded-lg px-3 py-2 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/80"
											>
												<div className="flex items-center gap-2">
													<MessageSquare size={16} className="text-slate-400" />
													<span className="text-md line-clamp-1 font-medium text-slate-900 dark:text-slate-100">
														{conversation.title}
													</span>
												</div>
												<p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
													Xem lại cuộc trò chuyện này.
												</p>
											</button>
										))}
									</div>
								) : (
									<p className="text-sm text-slate-500 dark:text-slate-400">
										Không có kết quả hôm qua.
									</p>
								)}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ChatAIContent;
