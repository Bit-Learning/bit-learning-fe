import { userApi } from "@/feature/user/api/user.api";
import type { Author } from "../types/forum.type";

export async function resolveAuthorUsername(author: Author) {
	if (author.username) return author.username;

	const response = await userApi.viewProfile(author.id);
	return response.data.data?.username;
}
