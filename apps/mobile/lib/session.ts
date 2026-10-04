import * as SecureStore from "expo-secure-store";
import type { Session } from "./types";
const KEY = "bit-learning.session";
export const getSession = async () => {
	const value = await SecureStore.getItemAsync(KEY);
	return value ? (JSON.parse(value) as Session) : null;
};
export const saveSession = (session: Session) =>
	SecureStore.setItemAsync(KEY, JSON.stringify(session));
export const clearSession = () => SecureStore.deleteItemAsync(KEY);
