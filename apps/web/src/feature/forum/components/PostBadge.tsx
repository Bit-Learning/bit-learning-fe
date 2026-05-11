import { Badge } from "lucide-react";
import { Post } from "../types/forum.type";

export function PostBadge({ post }: { post: Post }) {
	if (post.isFeatured)
		return <Badge className="bg-amber-500 text-white">Nổi bật</Badge>;
	if (post.isTrending)
		return <Badge className="bg-orange-500 text-white">Thịnh hành</Badge>;

	const ageInHours =
		(Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
	if (ageInHours <= 24)
		return <Badge className="bg-emerald-500 text-white">Mới</Badge>;
	return null;
}
