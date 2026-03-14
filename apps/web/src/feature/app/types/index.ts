export interface FeatureCardProps {
	color: "blue" | "orange" | "purple" | "green" | "red" | "cyan";
	icon?: React.ComponentType<{ className?: string }>;
	title: string;
	description: string;
	link: string;
	linkText: string;
	thumbnail: string;
}

export interface GameCardProps {
	image: string;
	category: string;
	categoryColor: string;
	title: string;
}

export interface ForumPostCardProps {
	avatar: string;
	author: string;
	time: string;
	tags: string;
	title: string;
	comments: number;
	likes: number;
}
