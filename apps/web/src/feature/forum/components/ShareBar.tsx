import { Facebook, Linkedin, Twitter, Link as LinkIcon } from "lucide-react";

const shareItems = [
	{
		icon: <Facebook className="w-4 h-4" />,
		label: "Facebook",
		onClick: () => {
			const url = window.location.href;
			window.open(
				`https://www.facebook.com/sharer/sharer.php?u=${url}`,
				"_blank",
			);
		},
	},
	{
		icon: <Linkedin className="w-4 h-4" />,
		label: "LinkedIn",
		onClick: () => {
			const url = window.location.href;
			window.open(
				`https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
				"_blank",
			);
		},
	},
	{
		icon: <Twitter className="w-4 h-4" />,
		label: "X",
		onClick: () => {
			const url = window.location.href;
			window.open(`https://twitter.com/intent/tweet?url=${url}`, "_blank");
		},
	},
	{
		icon: <LinkIcon className="w-4 h-4" />,
		label: "Copy link",
		onClick: async () => {
			await navigator.clipboard.writeText(window.location.href);
			alert("Đã copy link!");
		},
	},
];

export const ShareBar = () => {
	return (
		<div className="flex items-center gap-4 text-sm text-gray-500">
			<span className="font-medium text-gray-600">Chia sẻ bài viết:</span>

			<div className="flex items-center gap-2">
				{shareItems.map((item, idx) => (
					<button
						key={idx}
						onClick={item.onClick}
						className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all"
						title={item.label}
					>
						{item.icon}
					</button>
				))}
			</div>
		</div>
	);
};
