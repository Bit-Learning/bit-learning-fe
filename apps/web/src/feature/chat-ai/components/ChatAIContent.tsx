import React, { useState, useRef, useEffect } from "react";
import {
	Send,
	PanelLeft,
	Plus,
	Search,
	X,
	MessageSquare,
	Paperclip,
	ChevronDown,
	Check,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import {
	addMessageAction,
	clearChatAction,
	clearMessagesAction,
	selectMessages,
} from "../stores/chat.store";
import {
	useConversation,
	useCreateConversation,
	useSendMessage,
	useUserConversations,
	useConversationMessages,
} from "../queries/useChat";
import IntroView from "./IntroView";
import ChatView from "./ChatView";
import ChatSidebar from "./ChatSidebar";
import type { Message, Conversation } from "../types/chat.type";
import { useAppDispatch } from "@/shared/redux/store";
import { useSelector } from "react-redux";

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
	// Hiển thị chat view khi đang tạo conversation mới (trước khi URL thay đổi)
	const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const modelDropdownRef = useRef<HTMLDivElement>(null);
	const prevConversationIdRef = useRef<string | undefined>(undefined);

	const { data: conversationsData } = useUserConversations(0, 10);
	const createConversation = useCreateConversation();
	const sendMessage = useSendMessage();

	// Load conversation metadata và messages khi có conversationId từ URL (F5)
	useConversation(conversationId || "");
	useConversationMessages(conversationId || "", 20);

	const conversations = conversationsData?.data || [];
	const currentView: "intro" | "chat" =
		conversationId || isCreatingNewChat ? "chat" : "intro";

	// Khi switch giữa các conversation (cùng route, khác param) → clear messages cũ
	useEffect(() => {
		if (
			prevConversationIdRef.current !== undefined &&
			prevConversationIdRef.current !== conversationId
		) {
			dispatch(clearMessagesAction());
		}
		prevConversationIdRef.current = conversationId;
	}, [conversationId, dispatch]);

	// Đóng model dropdown khi click ngoài
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				modelDropdownRef.current &&
				!modelDropdownRef.current.contains(e.target as Node)
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

	const searchedConversations = conversations.filter((c) =>
		c.title.toLowerCase().includes(searchQuery.toLowerCase()),
	);
	const todaySearchResults = searchedConversations.filter(
		(c) => new Date(c.createdAt).toDateString() === todayString,
	);
	const yesterdaySearchResults = searchedConversations.filter(
		(c) => new Date(c.createdAt).toDateString() === yesterdayString,
	);

	const handleSelectConversation = (conversation: Conversation) => {
		dispatch(clearMessagesAction());
		navigate({
			to: "/chat-ai/$conversationId",
			params: { conversationId: conversation.id },
		});
	};

	const handleSendMessage = async () => {
		if (!inputValue.trim() && files.length === 0) return;

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
				await sendMessage.mutateAsync({
					conversationId: activeId,
					request: {
						question,
						files: pendingFiles.length > 0 ? pendingFiles : undefined,
						model: selectedModel,
					},
				});
				// Navigate sau khi message đã được gửi để tránh race condition với useConversationMessages
				if (!conversationId) {
					navigate({
						to: "/chat-ai/$conversationId",
						params: { conversationId: activeId },
					});
				}
			}
		} catch (error) {
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

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selected = Array.from(e.target.files || []);
		setFiles((prev) => [...prev, ...selected]);
		e.target.value = "";
	};

	const handleRemoveFile = (index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const isLoading = sendMessage.isPending || createConversation.isPending;

	const filePreviewJsx =
		files.length > 0 ? (
			<div className="flex flex-wrap gap-2 mb-2 px-1">
				{files.map((file, i) => {
					const isImage = file.type.startsWith("image/");
					const url = URL.createObjectURL(file);
					return (
						<div key={i} className="relative group">
							{isImage ? (
								<img
									src={url}
									alt={file.name}
									className="h-16 w-16 object-cover rounded-md border border-slate-200 dark:border-slate-700 shadow-sm"
								/>
							) : (
								<div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-xl text-sm text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
									<Paperclip size={17} />
									<span className="max-w-25 truncate">{file.name}</span>
								</div>
							)}
							<button
								type="button"
								onClick={() => handleRemoveFile(i)}
								className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
							>
								<X size={10} />
							</button>
						</div>
					);
				})}
			</div>
		) : null;

	const inputBoxJsx = (
		<div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus-within:shadow-md focus-within:ring-2 ring-blue-500/20 transition-all flex items-center pr-2 pl-1 gap-1">
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
				className="cursor-pointer inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
				title="Đính kèm file hoặc ảnh"
			>
				<Paperclip size={18} />
			</button>

			<textarea
				ref={textareaRef}
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)}
				onKeyDown={handleKeyPress}
				disabled={isLoading}
				className="w-full bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-200 px-2 py-3 resize-none outline-none disabled:opacity-50"
				placeholder="Hỏi bất cứ điều gì về Tin học..."
				rows={1}
				style={{ height: "auto", minHeight: "0" }}
			/>

			{/* Model dropdown */}
			<div className="relative shrink-0" ref={modelDropdownRef}>
				<button
					type="button"
					onClick={() => setIsModelDropdownOpen((prev) => !prev)}
					disabled={isLoading}
					className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-600 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{selectedModel}
					<ChevronDown
						size={12}
						className={`transition-transform duration-150 ${isModelDropdownOpen ? "rotate-180" : ""}`}
					/>
				</button>

				{isModelDropdownOpen && (
					<div className="absolute bottom-full right-0 mb-2 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl z-50 overflow-hidden">
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
								className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
							>
								<div>
									<div className="text-[13px] font-medium text-slate-800 dark:text-slate-100">
										{option.label}
									</div>
									<div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
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
				className="cursor-pointer ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
			>
				{isLoading ? (
					<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
				) : (
					<Send size={18} />
				)}
			</button>
		</div>
	);

	return (
		<div className="flex h-[calc(100dvh-5rem)] min-h-[calc(100dvh-5rem)] overflow-hidden bg-slate-50 dark:bg-slate-900">
			<div
				className={`relative flex h-full min-h-0 border-r border-slate-200 bg-white text-slate-900 dark:border-slate-700/50 dark:bg-slate-800 dark:text-slate-200 transition-all duration-300 ease-in-out ${
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
								className="cursor-pointer inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
							>
								<PanelLeft size={20} />
							</button>
							<button
								type="button"
								onClick={() => {
									setIsSidebarOpen(true);
									handleNewChat();
								}}
								className="cursor-pointer inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
							>
								<Plus size={18} />
							</button>
							<button
								type="button"
								onClick={() => setIsSearchOpen(true)}
								className="cursor-pointer inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
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
					<div className="w-full max-w-2xl mx-4 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl transform transition-all duration-200 ease-out">
						<div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
							<div className="flex items-center gap-2">
								<Search size={18} className="text-slate-500" />
								<h2 className="text-md font-semibold text-slate-900 dark:text-slate-100">
									Tìm kiếm cuộc trò chuyện
								</h2>
							</div>
							<button
								type="button"
								onClick={() => setIsSearchOpen(false)}
								className="cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
							>
								<X size={20} />
							</button>
						</div>

						<div className="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800">
							<div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
								<Search size={20} className="text-slate-400" />
								<input
									autoFocus
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Nhập từ khóa để tìm kiếm..."
									className="w-full bg-transparent text-md outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
								/>
							</div>
						</div>

						<div className="max-h-80 overflow-y-auto px-4 py-3 space-y-4">
							<div>
								<div className="mb-2 text-smfont-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
									Hôm nay
								</div>
								{todaySearchResults.length > 0 ? (
									<div className="space-y-1">
										{todaySearchResults.map((conv) => (
											<button
												key={conv.id}
												type="button"
												onClick={() => {
													setIsSearchOpen(false);
													setIsSidebarOpen(true);
													handleSelectConversation(conv);
												}}
												className="cursor-pointer w-full text-left rounded-lg px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
											>
												<div className="flex items-center gap-2">
													<MessageSquare size={16} className="text-slate-400" />
													<span className="text-md font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
														{conv.title}
													</span>
												</div>
												<p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
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
								<div className="mb-2 text-smfont-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
									Hôm qua
								</div>
								{yesterdaySearchResults.length > 0 ? (
									<div className="space-y-1">
										{yesterdaySearchResults.map((conv) => (
											<button
												key={conv.id}
												type="button"
												onClick={() => {
													setIsSearchOpen(false);
													setIsSidebarOpen(true);
													handleSelectConversation(conv);
												}}
												className="cursor-pointer w-full text-left rounded-lg px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
											>
												<div className="flex items-center gap-2">
													<MessageSquare size={16} className="text-slate-400" />
													<span className="text-md font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
														{conv.title}
													</span>
												</div>
												<p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
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
