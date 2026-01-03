import { Button } from "@workspace/ui/components/update/button";
import { Input } from "@workspace/ui/components/update/input";
import { ArrowUp, Globe, MoreHorizontal, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { mockMessages } from "../data/chat-data";
import { PrismCodeBlock } from "./PrismCodeBlock";

// Parse message content to handle code blocks and markdown
const parseMessageContent = (content: string) => {
	const parts = [];
	const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
	let lastIndex = 0;
	let match;

	while ((match = codeBlockRegex.exec(content)) !== null) {
		// Add text before code block
		if (match.index > lastIndex) {
			parts.push({
				type: "text",
				content: content.slice(lastIndex, match.index),
			});
		}

		// Add code block
		parts.push({
			type: "code",
			language: match[1] || "text",
			content: match[2]?.trim() || "",
		});

		lastIndex = match.index + match[0].length;
	}

	// Add remaining text
	if (lastIndex < content.length) {
		parts.push({
			type: "text",
			content: content.slice(lastIndex),
		});
	}

	return parts.length > 0 ? parts : [{ type: "text", content }];
};

// Format text with bold markdown
const formatText = (text: string) => {
	const parts = text.split(/(\*\*.*?\*\*)/);
	return parts.map((part, index) => {
		if (part.startsWith("**") && part.endsWith("**")) {
			return <strong key={index}>{part.slice(2, -2)}</strong>;
		}
		return part;
	});
};

const MessageContent = ({ content }: { content: string }) => {
	const parts = parseMessageContent(content);

	return (
		<div>
			{parts.map((part, index) => {
				if (part.type === "code") {
					return (
						<PrismCodeBlock
							key={index}
							code={part.content}
							language={part.language || "text"}
						/>
					);
				}
				return (
					<p
						key={index}
						className="text-sm leading-relaxed whitespace-pre-wrap"
					>
						{formatText(part.content)}
					</p>
				);
			})}
		</div>
	);
};

export const ChatPrompt = () => {
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState(mockMessages);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [scrollToBottom]);

	const handleSubmit = () => {
		if (!message.trim()) return;

		const newMessage = {
			id: Date.now().toString(),
			role: "user",
			content: message,
			timestamp: new Date().toLocaleTimeString("vi-VN", {
				hour: "2-digit",
				minute: "2-digit",
			}),
		};

		setMessages([...messages, newMessage]);
		setMessage("");
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	};

	return (
		<div className="flex h-full flex-col">
			{/* Messages Area */}
			<div className="flex-1 overflow-y-auto pb-32">
				<div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
					{messages.map((msg) => (
						<div
							key={msg.id}
							className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
						>
							<div
								className={`rounded-2xl px-4 py-3 ${
									msg.role === "user"
										? "text-accent-foreground max-w-[80%] bg-[#9EC6F3]"
										: "bg-muted max-w-[85%]"
								}`}
							>
								{msg.role === "assistant" ? (
									<MessageContent content={msg.content} />
								) : (
									<p className="text-sm whitespace-pre-wrap">{msg.content}</p>
								)}
								<span className="mt-2 block text-xs opacity-70">
									{msg.timestamp}
								</span>
							</div>
						</div>
					))}
					<div ref={messagesEndRef} />
				</div>
			</div>

			{/* Input Area - Fixed at bottom */}
			<div className="bg-background fixed right-0 bottom-0 left-0 border-t py-3">
				<div className="bg-muted/50 mx-auto flex max-w-3xl items-center gap-2 rounded-2xl border px-4 py-2 shadow-sm">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="h-8 w-8 shrink-0 rounded-full"
					>
						<Plus size={18} />
					</Button>

					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="h-8 w-8 shrink-0 rounded-full"
					>
						<Globe size={18} />
					</Button>

					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="h-8 w-8 shrink-0 rounded-full"
					>
						<MoreHorizontal size={18} />
					</Button>

					<Input
						type="text"
						placeholder="Nhập tin nhắn..."
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						onKeyDown={handleKeyDown}
						className="flex-1 border-0 bg-transparent focus-visible:ring-0"
					/>

					<Button
						type="button"
						size="icon"
						onClick={handleSubmit}
						disabled={!message.trim()}
						className="text-primary-foreground h-8 w-8 shrink-0 rounded-full bg-[#9EC6F3] hover:bg-[#CBE1F9] disabled:opacity-50"
					>
						<ArrowUp color="black" size={18} />
					</Button>
				</div>
			</div>
		</div>
	);
};
