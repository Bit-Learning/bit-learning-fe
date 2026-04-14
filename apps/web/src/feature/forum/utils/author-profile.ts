import { ViewUserProfile } from "@/feature/user/api/user.api";
import type { Author } from "../types/forum.type";

export async function resolveAuthorUsername(author: Author) {
	if (author.username) return author.username;

	const response = await ViewUserProfile(author.id);
	return response.data.data.username;
}
