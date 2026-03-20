import React, { useState, useRef, useEffect } from "react";
import { Send, PanelLeft, Plus, Search, X, MessageSquare } from "lucide-react";
import {
	addMessageAction,
	clearChatAction,
	clearMessagesAction,
	selectCurrentConversation,
	selectMessages,
	setCurrentConversationAction,
} from "../stores/chat.store";
import {
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

const ChatAIContent: React.FC = () => {
	const dispatch = useAppDispatch();
	const currentConversation = useSelector(selectCurrentConversation);
	const messages = useSelector(selectMessages);

	const [currentView, setCurrentView] = useState<"intro" | "chat">("intro");
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [inputValue, setInputValue] = useState("");
	const [files, setFiles] = useState<File[]>([]);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const { data: conversationsData } = useUserConversations(0, 10);
	const createConversation = useCreateConversation();
	const sendMessage = useSendMessage(currentConversation?.id || "");

	// Load messages khi có conversation
	const { isLoading: isLoadingMessages } = useConversationMessages(
		currentConversation?.id || "",
		20,
	);

	const conversations = conversationsData?.data || [];

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

	// Effect để chuyển sang chat view khi có currentConversation và messages
	useEffect(() => {
		if (currentConversation && messages.length > 0) {
			setCurrentView("chat");
		}
	}, [currentConversation, messages.length]);

	const handleSelectConversation = (conversation: Conversation) => {
		// Clear messages cũ trước khi chuyển sang conversation mới
		dispatch(clearMessagesAction());
		// Set conversation mới
		dispatch(setCurrentConversationAction(conversation));
		setCurrentView("chat");
	};

	const handleSendMessage = async () => {
		if (!inputValue.trim()) return;

		const userMessage: Message = {
			id: Date.now(),
			role: "user",
			content: inputValue,
			createdAt: new Date().toISOString(),
			attachments: files.map((file) => ({
				fileName: file.name,
				fileUrl: "",
				fileType: file.type,
				fileSize: file.size,
			})),
		};

		dispatch(addMessageAction(userMessage));
		setInputValue("");
		setCurrentView("chat");

		let conversationId = currentConversation?.id;
		if (!conversationId) {
			try {
				const response = await createConversation.mutateAsync({
					title: inputValue.substring(0, 50),
				});
				conversationId = response.data.data?.id;
			} catch (error) {
				console.error("Failed to create conversation:", error);
				return;
			}
		}

		if (conversationId) {
			try {
				await sendMessage.mutateAsync({
					question: inputValue,
					files: files.length > 0 ? files : undefined,
				});
				setFiles([]);
			} catch (error) {
				console.error("Failed to send message:", error);
			}
		}
	};

	const handleQuickQuestion = (question: string) => {
		setInputValue(question);
		setTimeout(() => handleSendMessage(), 100);
	};

	const handleNewChat = () => {
		dispatch(clearChatAction());
		setCurrentView("intro");
		setInputValue("");
		setFiles([]);
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	const isLoading = sendMessage.isPending || createConversation.isPending;

	return (
		<div className="h-screen flex bg-slate-50 dark:bg-slate-900">
			<div
				className={`relative h-full flex border-r border-slate-200 bg-white text-slate-900 dark:border-slate-700/50 dark:bg-slate-800 dark:text-slate-200 transition-all duration-300 ease-in-out ${
					isSidebarOpen ? "w-72" : "w-12"
				}`}
			>
				{isSidebarOpen ? (
					<ChatSidebar
						conversations={conversations}
						currentConversationId={currentConversation?.id}
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
								className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
							>
								<PanelLeft size={20} />
							</button>
							<button
								type="button"
								onClick={() => {
									setIsSidebarOpen(true);
									handleNewChat();
								}}
								className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
							>
								<Plus size={18} />
							</button>
							<button
								type="button"
								onClick={() => setIsSearchOpen(true)}
								className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
							>
								<Search size={18} />
							</button>
						</div>
					</div>
				)}
			</div>

			<main className="flex-1 flex flex-col bg-white dark:bg-slate-900">
				{currentView === "intro" ? (
					<div className="flex-1 flex flex-col items-center justify-center px-4">
						<IntroView onQuickQuestion={handleQuickQuestion} />
						<div className="mt-6 w-full max-w-2xl">
							<div className="relative group">
								<div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm focus-within:shadow-md focus-within:ring-2 ring-blue-500/20 transition-all flex items-center pr-2">
									<textarea
										ref={textareaRef}
										value={inputValue}
										onChange={(e) => setInputValue(e.target.value)}
										onKeyDown={handleKeyPress}
										disabled={isLoading}
										className="w-full bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-200 px-4 py-3 resize-none outline-none disabled:opacity-50"
										placeholder="Hỏi bất cứ điều gì về Tin học..."
										rows={1}
										style={{ height: "auto", minHeight: "0" }}
									/>
									<button
										onClick={handleSendMessage}
										disabled={!inputValue.trim() || isLoading}
										className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{isLoading ? (
											<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
										) : (
											<Send size={18} />
										)}
									</button>
								</div>
							</div>
						</div>
					</div>
				) : (
					<>
						<ChatView messages={messages} />

						<div className="p-6 md:pb-12 max-w-4xl mx-auto w-full">
							<div className="relative group">
								<div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm focus-within:shadow-md focus-within:ring-2 ring-blue-500/20 transition-all flex items-center pr-2">
									<textarea
										ref={textareaRef}
										value={inputValue}
										onChange={(e) => setInputValue(e.target.value)}
										onKeyDown={handleKeyPress}
										disabled={isLoading}
										className="w-full bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-200 px-4 py-3 resize-none outline-none disabled:opacity-50"
										placeholder="Hỏi bất cứ điều gì về Tin học..."
										rows={1}
										style={{ height: "auto", minHeight: "0" }}
									/>
									<button
										onClick={handleSendMessage}
										disabled={!inputValue.trim() || isLoading}
										className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{isLoading ? (
											<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
										) : (
											<Send size={18} />
										)}
									</button>
								</div>
							</div>
						</div>
					</>
				)}
			</main>

			{isSearchOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
					<div className="w-full max-w-xl mx-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl transform transition-all duration-200 ease-out">
						<div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
							<div className="flex items-center gap-2">
								<Search size={18} className="text-slate-400" />
								<h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
									Tìm kiếm cuộc trò chuyện
								</h2>
							</div>
							<button
								type="button"
								onClick={() => setIsSearchOpen(false)}
								className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
							>
								<X size={16} />
							</button>
						</div>

						<div className="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800">
							<div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
								<Search size={16} className="text-slate-400" />
								<input
									autoFocus
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Nhập từ khóa để tìm kiếm..."
									className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
								/>
							</div>
						</div>

						<div className="max-h-80 overflow-y-auto px-4 py-3 space-y-4">
							<div>
								<div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
												className="w-full text-left rounded-lg px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
											>
												<div className="flex items-center gap-2">
													<MessageSquare size={16} className="text-slate-400" />
													<span className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
														{conv.title}
													</span>
												</div>
												<p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
													Xem lại cuộc trò chuyện này.
												</p>
											</button>
										))}
									</div>
								) : (
									<p className="text-xs text-slate-500 dark:text-slate-400">
										Không có kết quả hôm nay.
									</p>
								)}
							</div>

							<div>
								<div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
												className="w-full text-left rounded-lg px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
											>
												<div className="flex items-center gap-2">
													<MessageSquare size={16} className="text-slate-400" />
													<span className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
														{conv.title}
													</span>
												</div>
												<p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
													Xem lại cuộc trò chuyện này.
												</p>
											</button>
										))}
									</div>
								) : (
									<p className="text-xs text-slate-500 dark:text-slate-400">
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
