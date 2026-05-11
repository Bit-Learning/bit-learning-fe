import React from "react";
import type { Author } from "../types/forum.type";

interface AuthorAvatarProps {
	author: Author;
	size?: "sm" | "md" | "lg";
}

export const AuthorAvatar: React.FC<AuthorAvatarProps> = ({
	author,
	size = "md",
}) => {
	const sizeClasses = {
		sm: "w-9 h-9 text-xs",
		md: "w-11 h-11 text-sm",
		lg: "w-14 h-14 text-lg",
	};

	const getInitials = () => {
		return `${author.firstName[0] || ""}${author.lastName[0] || ""}`.toUpperCase();
	};

	if (author.avatar) {
		return (
			<div
				className={`${sizeClasses[size]} rounded-full border-2 border-gray-50 overflow-hidden bg-gray-100 shrink-0`}
			>
				<img
					alt={`${author.firstName} ${author.lastName}`}
					className="w-full h-full object-cover"
					decoding="async"
					loading="lazy"
					src={author.avatar}
				/>
			</div>
		);
	}

	return (
		<div
			className={`${sizeClasses[size]} rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0 border border-blue-200`}
		>
			{getInitials()}
		</div>
	);
};
