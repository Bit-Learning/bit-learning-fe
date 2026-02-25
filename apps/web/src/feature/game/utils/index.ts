import { TopicCode } from "../data";

export function parseMatchingMetaFromTitle(title: string): {
	grade: number;
	topic: TopicCode;
} | null {
	const match = title.match(/Lớp\s+(\d+)\s*-\s*([A-F])/i);
	if (!match) return null;
	const grade = Number.parseInt(match[1]!, 10);
	const topic = match[2]!.toUpperCase() as TopicCode;
	if (!Number.isFinite(grade)) return null;
	return { grade, topic };
}
