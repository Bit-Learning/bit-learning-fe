import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Minus, MessageCircle, ChevronRight } from "lucide-react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/shared/redux/store";
import {
	addMessageAction,
	clearChatAction,
	selectCurrentConversation,
	selectMessages,
} from "@/feature/chat-ai/stores/chat.store";
import {
	useCreateConversation,
	useSendMessage,
} from "@/feature/chat-ai/queries/useChat";
import { Message } from "@/feature/chat-ai/types/chat.type";

// ---------- Mini Chat Panel ----------
interface MiniChatPanelProps {
	onClose: () => void;
	onNavigateToFull: () => void;
	onMinimize: () => void;
}

function MiniChatPanel({
	onClose,
	onNavigateToFull,
	onMinimize,
}: MiniChatPanelProps) {
	const dispatch = useAppDispatch();
	const currentConversation = useSelector(selectCurrentConversation);
	const messages = useSelector(selectMessages);

	const createConversation = useCreateConversation();
	const sendMessage = useSendMessage(currentConversation?.id || "");

	const isLoading = sendMessage.isPending || createConversation.isPending;

	const [inputValue, setInputValue] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);

	// Welcome message hiển thị khi chưa có message thực
	const welcomeMessage: Message = {
		id: -1,
		role: "assistant",
		content: "Xin chào! Mình là trợ lý AI Tin học 👋 Bạn cần hỗ trợ gì?",
		createdAt: new Date().toISOString(),
	};

	const displayMessages = messages.length === 0 ? [welcomeMessage] : messages;
	const quickQuestions = ["HTML là gì?", "CSS Flexbox?", "JavaScript cơ bản"];

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, isLoading]);

	const handleSend = async () => {
		if (!inputValue.trim() || isLoading) return;

		const text = inputValue.trim();

		const userMsg: Message = {
			id: Date.now(),
			role: "user",
			content: text,
			createdAt: new Date().toISOString(),
		};

		dispatch(addMessageAction(userMsg));
		setInputValue("");

		let conversationId = currentConversation?.id;

		// Tạo conversation mới nếu chưa có
		if (!conversationId) {
			try {
				const res = await createConversation.mutateAsync({
					title: text.substring(0, 50),
				});
				conversationId = res.data.data?.id;
			} catch (err) {
				console.error("Failed to create conversation:", err);
				return;
			}
		}

		if (conversationId) {
			try {
				await sendMessage.mutateAsync({ question: text });
			} catch (err) {
				console.error("Failed to send message:", err);
			}
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const handleQuickQuestion = (q: string) => {
		setInputValue(q);
		setTimeout(() => inputRef.current?.focus(), 50);
	};

	return (
		<div
			style={{
				position: "fixed",
				bottom: "80px",
				left: "16px",
				width: "340px",
				maxHeight: "500px",
				background: "white",
				borderRadius: "20px",
				boxShadow:
					"0 24px 64px rgba(19,127,236,0.18), 0 4px 16px rgba(0,0,0,0.08)",
				border: "1px solid rgba(19,127,236,0.12)",
				display: "flex",
				flexDirection: "column",
				overflow: "hidden",
				zIndex: 9999,
				animation: "panelIn 0.28s cubic-bezier(0.34,1.56,0.64,1)",
				fontFamily: "'DM Sans', system-ui, sans-serif",
			}}
		>
			<style>{`
        @keyframes panelIn {
          from { opacity:0; transform:translateY(24px) scale(0.95); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes typingDot {
          0%,80%,100% { transform:translateY(0); opacity:0.4; }
          40%         { transform:translateY(-4px); opacity:1; }
        }
        @keyframes msgIn {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
        .mini-msg-user {
          background:linear-gradient(135deg,#137fec,#0f6fd4);
          color:white; border-radius:16px 16px 4px 16px;
          padding:10px 14px; font-size:13.5px; line-height:1.5;
          max-width:85%; align-self:flex-end; animation:msgIn 0.2s ease;
          word-break:break-word;
        }
        .mini-msg-bot {
          background:#f1f5fd; color:#1e293b;
          border-radius:4px 16px 16px 16px;
          padding:10px 14px; font-size:13.5px; line-height:1.5;
          max-width:85%; align-self:flex-start; animation:msgIn 0.2s ease;
          word-break:break-word;
        }
        .mini-send-btn:not(:disabled):hover {
          background:#0f6fd4 !important; transform:scale(1.08);
        }
        .mini-send-btn { transition:all 0.15s ease; }
        .quick-chip:hover {
          background:#137fec !important; color:white !important;
          border-color:#137fec !important;
        }
        .quick-chip { transition:all 0.15s ease; cursor:pointer; }
        .mini-input:focus { outline:none; }
        .open-full-btn:hover { background:rgba(255,255,255,0.25) !important; }
        .open-full-btn { transition:background 0.15s; }
        .hdr-icon-btn:hover { background:rgba(255,255,255,0.2) !important; }
        .hdr-icon-btn { transition:background 0.15s; }
        .mini-messages::-webkit-scrollbar { width:4px; }
        .mini-messages::-webkit-scrollbar-track { background:transparent; }
        .mini-messages::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:4px; }
      `}</style>

			{/* ── Header ── */}
			<div
				style={{
					background: "linear-gradient(135deg,#137fec 0%,#0a5cbf 100%)",
					padding: "14px 16px",
					display: "flex",
					alignItems: "center",
					gap: "10px",
					flexShrink: 0,
				}}
			>
				<div
					style={{
						width: 36,
						height: 36,
						background: "rgba(255,255,255,0.2)",
						borderRadius: 10,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						flexShrink: 0,
					}}
				>
					<Bot size={18} color="white" />
				</div>

				<div style={{ flex: 1, minWidth: 0 }}>
					<p
						style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "white" }}
					>
						Trợ lý Tin học AI
					</p>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 5,
							marginTop: 2,
						}}
					>
						<div
							style={{
								width: 6,
								height: 6,
								background: "#4ade80",
								borderRadius: "50%",
								flexShrink: 0,
							}}
						/>
						<span style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>
							Đang hoạt động
						</span>
					</div>
				</div>

				{/* Navigate to full chat */}
				<button
					className="open-full-btn"
					onClick={onNavigateToFull}
					style={{
						background: "rgba(255,255,255,0.15)",
						border: "none",
						borderRadius: 8,
						padding: "5px 8px",
						color: "white",
						fontSize: 11,
						fontWeight: 600,
						cursor: "pointer",
						display: "flex",
						alignItems: "center",
						gap: 3,
						whiteSpace: "nowrap",
						flexShrink: 0,
					}}
					title="Chuyển sang chat đầy đủ"
				>
					Mở rộng <ChevronRight size={12} />
				</button>

				<button
					className="hdr-icon-btn"
					onClick={onMinimize}
					style={{
						background: "transparent",
						border: "none",
						cursor: "pointer",
						padding: 4,
						borderRadius: 6,
						color: "rgba(255,255,255,0.8)",
						flexShrink: 0,
					}}
					title="Thu nhỏ"
				>
					<Minus size={14} />
				</button>

				<button
					className="hdr-icon-btn"
					onClick={onClose}
					style={{
						background: "transparent",
						border: "none",
						cursor: "pointer",
						padding: 4,
						borderRadius: 6,
						color: "rgba(255,255,255,0.8)",
						flexShrink: 0,
					}}
					title="Đóng"
				>
					<X size={14} />
				</button>
			</div>

			{/* ── Messages ── */}
			<div
				className="mini-messages"
				style={{
					flex: 1,
					overflowY: "auto",
					padding: "14px",
					display: "flex",
					flexDirection: "column",
					gap: 10,
					minHeight: 0,
				}}
			>
				{displayMessages.map((msg) => (
					<div
						key={msg.id}
						className={msg.role === "user" ? "mini-msg-user" : "mini-msg-bot"}
					>
						{msg.content}
					</div>
				))}

				{/* Typing indicator khi đang chờ response */}
				{isLoading && (
					<div
						className="mini-msg-bot"
						style={{ display: "flex", gap: 4, padding: "12px 14px" }}
					>
						{[0, 1, 2].map((i) => (
							<div
								key={i}
								style={{
									width: 6,
									height: 6,
									background: "#94a3b8",
									borderRadius: "50%",
									animation: `typingDot 1.2s ease ${i * 0.2}s infinite`,
								}}
							/>
						))}
					</div>
				)}

				<div ref={messagesEndRef} />
			</div>

			{/* ── Quick Questions (chỉ khi chưa chat) ── */}
			{messages.length === 0 && (
				<div
					style={{
						padding: "0 14px 10px",
						display: "flex",
						gap: 6,
						flexWrap: "wrap",
						flexShrink: 0,
					}}
				>
					{quickQuestions.map((q) => (
						<button
							key={q}
							className="quick-chip"
							onClick={() => handleQuickQuestion(q)}
							style={{
								background: "white",
								border: "1px solid #e2e8f0",
								borderRadius: 20,
								padding: "5px 12px",
								fontSize: 12,
								color: "#475569",
								fontWeight: 500,
							}}
						>
							{q}
						</button>
					))}
				</div>
			)}

			{/* ── Input ── */}
			<div
				style={{
					padding: "10px 12px",
					borderTop: "1px solid #f1f5f9",
					display: "flex",
					gap: 8,
					alignItems: "flex-end",
					flexShrink: 0,
				}}
			>
				<textarea
					ref={inputRef}
					className="mini-input"
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={handleKeyDown}
					disabled={isLoading}
					placeholder="Nhập câu hỏi..."
					rows={1}
					style={{
						flex: 1,
						border: "1px solid #e2e8f0",
						borderRadius: 12,
						padding: "9px 12px",
						fontSize: 13.5,
						color: "#1e293b",
						background: isLoading ? "#f1f5f9" : "#f8fafc",
						resize: "none",
						fontFamily: "inherit",
						lineHeight: 1.4,
						maxHeight: 80,
						transition: "background 0.2s",
					}}
				/>
				<button
					className="mini-send-btn"
					onClick={handleSend}
					disabled={!inputValue.trim() || isLoading}
					style={{
						width: 36,
						height: 36,
						background: inputValue.trim() && !isLoading ? "#137fec" : "#e2e8f0",
						border: "none",
						borderRadius: 10,
						cursor: inputValue.trim() && !isLoading ? "pointer" : "not-allowed",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						flexShrink: 0,
					}}
				>
					{isLoading ? (
						<div
							style={{
								width: 14,
								height: 14,
								border: "2px solid #94a3b8",
								borderTopColor: "transparent",
								borderRadius: "50%",
								animation: "spin 0.7s linear infinite",
							}}
						/>
					) : (
						<Send size={15} color={inputValue.trim() ? "white" : "#94a3b8"} />
					)}
				</button>
			</div>
		</div>
	);
}

// ---------- Main Widget ----------
interface BotStatusWidgetProps {
	/** Callback để navigate sang /chat-ai khi bấm "Mở rộng" */
	onNavigateToFull: () => void;
}

export default function BotStatusWidget({
	onNavigateToFull,
}: BotStatusWidgetProps) {
	const dispatch = useAppDispatch();
	const messages = useSelector(selectMessages);

	const [panelOpen, setPanelOpen] = useState(false);
	const [minimized, setMinimized] = useState(false);
	const [widgetClosed, setWidgetClosed] = useState(false);
	const [unreadCount, setUnreadCount] = useState(1);
	const [showTooltip, setShowTooltip] = useState(false);

	// Khôi phục trạng thái ẩn widget từ localStorage
	useEffect(() => {
		if (typeof window === "undefined") return;
		try {
			const stored = window.localStorage.getItem("botWidgetClosed");
			if (stored === "1") {
				setWidgetClosed(true);
			}
		} catch {
			// ignore
		}
	}, []);

	// Badge tăng khi bot reply trong khi panel đóng/minimized
	const prevMsgCount = useRef(messages.length);
	useEffect(() => {
		if ((!panelOpen || minimized) && messages.length > prevMsgCount.current) {
			const newBotMsgs = messages
				.slice(prevMsgCount.current)
				.filter((m) => m.role === "assistant").length;
			if (newBotMsgs > 0) setUnreadCount((c) => c + newBotMsgs);
		}
		prevMsgCount.current = messages.length;
	}, [messages, panelOpen, minimized]);

	if (widgetClosed) {
		return null;
	}

	const handleMouseEnter = () => {
		if (!panelOpen) setShowTooltip(true);
	};

	const handleMouseLeave = () => {
		setShowTooltip(false);
	};

	const handleWidgetClick = () => {
		setShowTooltip(false);
		setUnreadCount(0);
		if (minimized) {
			setMinimized(false);
			setPanelOpen(true);
		} else {
			setPanelOpen((prev) => !prev);
		}
	};

	const handleClose = () => {
		setPanelOpen(false);
		setMinimized(false);
		dispatch(clearChatAction()); // reset conversation khi đóng hẳn
	};

	const handleNavigateToFull = () => {
		setPanelOpen(false);
		onNavigateToFull();
		// Không clear để ChatAIContent kế thừa conversation đang chat
	};

	const handleHideWidget = () => {
		setPanelOpen(false);
		setMinimized(false);
		setShowTooltip(false);
		setWidgetClosed(true);
		if (typeof window !== "undefined") {
			try {
				window.localStorage.setItem("botWidgetClosed", "1");
			} catch {
				// ignore
			}
		}
	};

	return (
		<>
			<style>{`
        @keyframes pulse-ring {
          0%  { transform:scale(1);   opacity:0.6; }
          70% { transform:scale(1.6); opacity:0; }
          100%{ transform:scale(1.6); opacity:0; }
        }
        @keyframes float {
          0%,100% { transform:translateY(0px); }
          50%      { transform:translateY(-4px); }
        }
        @keyframes badgePop {
          0%  { transform:scale(0); }
          60% { transform:scale(1.25); }
          100%{ transform:scale(1); }
        }
        @keyframes tooltipIn {
          from { opacity:0; transform:translateX(-8px); }
          to   { opacity:1; transform:translateX(0); }
        }
        .bot-widget-btn {
          position:relative; background:white; border:none;
          padding:0; cursor:pointer; border-radius:18px;
          box-shadow:0 8px 28px rgba(19,127,236,0.22),0 2px 8px rgba(0,0,0,0.06);
          transition:box-shadow 0.25s ease,transform 0.25s ease;
          animation:float 3.5s ease-in-out infinite;
        }
        .bot-widget-btn:hover {
          box-shadow:0 14px 40px rgba(19,127,236,0.32),0 4px 12px rgba(0,0,0,0.1);
          transform:translateY(-2px) !important;
          animation-play-state:paused;
        }
        .bot-widget-btn:active { transform:scale(0.94) !important; }
		.bot-inner {
          display:flex; align-items:center; gap:12px;
          padding:10px 16px 10px 10px; border-radius:18px;
          border:1px solid rgba(19,127,236,0.12); background:white;
        }
		.bot-icon-wrap {
		  width:46px; height:46px;
		  background:linear-gradient(135deg,#dbeafe,#bfdbfe);
		  border-radius:13px;
		  display:flex; align-items:center; justify-content:center;
		  flex-shrink:0; position:relative; transition:background 0.2s;
		}
        .bot-widget-btn:hover .bot-icon-wrap {
          background:linear-gradient(135deg,#137fec,#0a5cbf);
        }
        .bot-widget-btn:hover .bot-icon-svg { color:#fff !important; }
        .bot-icon-svg { transition:color 0.2s; }
        .pulse-ring {
          position:absolute; inset:-4px; border-radius:16px;
          border:2px solid #137fec;
          animation:pulse-ring 2.4s ease-out infinite;
          pointer-events:none;
        }
        .notif-badge {
          position:absolute; top:-5px; right:-5px;
          width:18px; height:18px;
          background:#ef4444; border-radius:50%; border:2px solid white;
          display:flex; align-items:center; justify-content:center;
          font-size:10px; font-weight:700; color:white;
          animation:badgePop 0.4s cubic-bezier(0.34,1.56,0.64,1);
          font-family:system-ui; pointer-events:none;
        }
        .tooltip-bubble {
          position:absolute; left:calc(100% + 12px); bottom:50%;
          transform:translateY(50%);
          background:#1e293b; color:white;
          font-size:12px; font-weight:500;
          padding:7px 12px; border-radius:10px;
          white-space:nowrap;
          animation:tooltipIn 0.2s ease; pointer-events:none;
          font-family:'DM Sans',system-ui,sans-serif;
        }
        .tooltip-bubble::before {
          content:''; position:absolute; right:100%; top:50%;
          transform:translateY(-50%);
          border:6px solid transparent; border-right-color:#1e293b;
        }
		/* Mobile: chỉ hiện icon */
		@media (max-width:480px) {
		  .bot-text-block { display:none !important; }
		  .bot-inner { padding:8px; border-radius:14px; }
		  .bot-icon-wrap { width:40px; height:40px; border-radius:11px; }
		}
      `}</style>

			{/* Mini Chat Panel */}
			{panelOpen && !minimized && (
				<MiniChatPanel
					onClose={handleClose}
					onNavigateToFull={handleNavigateToFull}
					onMinimize={() => setMinimized(true)}
				/>
			)}

			{/* Widget Button */}
			<div style={{ position: "fixed", bottom: 16, left: 16, zIndex: 9998 }}>
				<button
					className="bot-widget-btn"
					onClick={handleWidgetClick}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
				>
					<div className="bot-inner">
						<div className="bot-icon-wrap">
							{!panelOpen && <div className="pulse-ring" />}

							{panelOpen && !minimized ? (
								<MessageCircle
									size={22}
									className="bot-icon-svg"
									style={{ color: "#137fec" }}
								/>
							) : (
								<Bot
									size={22}
									className="bot-icon-svg"
									style={{ color: "#137fec" }}
								/>
							)}

							{unreadCount > 0 && !panelOpen && (
								<div className="notif-badge">{unreadCount}</div>
							)}
						</div>

						<div className="bot-text-block">
							<p
								style={{
									margin: "0 0 2px",
									fontSize: 10,
									textTransform: "uppercase",
									letterSpacing: "0.06em",
									fontWeight: 700,
									color: "#94a3b8",
									fontFamily: "'DM Sans',system-ui,sans-serif",
								}}
							>
								Trạng thái Bot
							</p>
							<p
								style={{
									margin: 0,
									fontSize: 14,
									fontWeight: 700,
									color: "#1e293b",
									fontFamily: "'DM Sans',system-ui,sans-serif",
									display: "flex",
									alignItems: "center",
								}}
							>
								<span
									style={{
										display: "inline-block",
										width: 7,
										height: 7,
										background: "#22c55e",
										borderRadius: "50%",
										marginRight: 5,
									}}
								/>
								{panelOpen && !minimized ? "Đang chat..." : "Sẵn sàng hỗ trợ!"}
							</p>
						</div>
					</div>

					{showTooltip && !panelOpen && (
						<div className="tooltip-bubble">💡 Hỏi mình về Tin học nhé!</div>
					)}
				</button>

				{/* Close widget button (persists closed state) */}
				{(!panelOpen || minimized) && (
					<button
						onClick={handleHideWidget}
						style={{
							position: "absolute",
							top: -10,
							right: -10,
							width: 22,
							height: 22,
							borderRadius: "999px",
							border: "none",
							background: "#e2e8f0",
							boxShadow: "0 2px 6px rgba(15,23,42,0.25)",
							cursor: "pointer",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							zIndex: 1,
						}}
						aria-label="Ẩn trợ lý Tin học"
					>
						<X size={12} color="#0f172a" />
					</button>
				)}

				{/* Minimized label */}
				{minimized && (
					<div
						style={{
							position: "absolute",
							top: -8,
							right: -8,
							background: "#137fec",
							color: "white",
							fontSize: 10,
							fontWeight: 700,
							borderRadius: 8,
							padding: "2px 7px",
							fontFamily: "system-ui",
							animation: "badgePop 0.3s ease",
							pointerEvents: "none",
						}}
					>
						Chat
					</div>
				)}
			</div>
		</>
	);
}
