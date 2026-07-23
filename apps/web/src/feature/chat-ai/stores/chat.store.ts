import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/shared/redux/store";
import type { Conversation, Message } from "../types/chat.type";

export type TChatState = {
	currentConversation: Conversation | null;
	messages: Message[];
};

// ===== INITIAL STATE =====
const chatInitialState: TChatState = {
	currentConversation: null,
	messages: [],
};

// ===== REDUCERS =====
const setCurrentConversation = (
	state: TChatState,
	action: PayloadAction<Conversation | null>,
) => {
	state.currentConversation = action.payload;
};

const setMessages = (state: TChatState, action: PayloadAction<Message[]>) => {
	state.messages = action.payload;
};

const addMessage = (state: TChatState, action: PayloadAction<Message>) => {
	state.messages.push(action.payload);
};

const prependMessages = (
	state: TChatState,
	action: PayloadAction<Message[]>,
) => {
	state.messages = [...action.payload, ...state.messages];
};

const clearMessages = (state: TChatState) => {
	state.messages = [];
};

const clearChat = () => {
	return chatInitialState;
};

// ===== SLICE =====
export const chat = createSlice({
	name: "chat",
	initialState: chatInitialState,
	reducers: {
		setCurrentConversationAction: setCurrentConversation,
		setMessagesAction: setMessages,
		addMessageAction: addMessage,
		prependMessagesAction: prependMessages,
		clearMessagesAction: clearMessages,
		clearChatAction: clearChat,
	},
});

// ===== ACTIONS =====
export const {
	setCurrentConversationAction,
	setMessagesAction,
	addMessageAction,
	prependMessagesAction,
	clearMessagesAction,
	clearChatAction,
} = chat.actions;

// ===== SELECTORS =====
export const selectChatState = (state: RootState) => state.chat;
export const selectCurrentConversation = (state: RootState) =>
	state.chat.currentConversation;
export const selectMessages = (state: RootState) => state.chat.messages;

export default chat.reducer;
