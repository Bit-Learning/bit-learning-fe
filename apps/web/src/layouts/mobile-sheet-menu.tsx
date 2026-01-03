import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { navItems } from "@/layouts/data/nav-items";

interface MobileSheetMenuProps {
	onNavigate: (path: string) => void;
	onClose?: () => void;
}

const MobileSheetMenu: React.FC<MobileSheetMenuProps> = ({
	onNavigate,
	onClose,
}) => {
	const [openItems, setOpenItems] = useState<string[]>([]);

	const toggleItem = (item: string) => {
		setOpenItems((prev) =>
			prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
		);
	};

	return (
		<nav className="h-full overflow-y-auto bg-[#222] p-0 text-white">
			<div className="space-y-0">
				{navItems.map((item) => (
					<div key={item.title} className="border-b border-[#444]">
						<button
							onClick={() => {
								if (item.items) {
									toggleItem(item.title);
								} else if (item.to) {
									onNavigate(item.to);
									onClose?.();
								}
							}}
							className="flex w-full items-center justify-between px-4 py-3 text-[15px] font-bold uppercase tracking-wide transition hover:bg-[#333]"
						>
							<span>{item.title}</span>
							{item.items ? (
								openItems.includes(item.title) ? (
									<Minus className="h-5 w-5" />
								) : (
									<Plus className="h-5 w-5" />
								)
							) : null}
						</button>
						{item.items && openItems.includes(item.title) && (
							<div className="bg-[#222] px-6 pb-2">
								{item.items.map((subItem) => (
									<button
										key={subItem.title}
										onClick={() => {
											onNavigate(subItem.to);
											onClose?.();
										}}
										className="block w-full border-b border-[#444] py-2 text-left text-[13px] font-medium transition last:border-b-0 hover:text-red-500"
									>
										{subItem.title}
									</button>
								))}
							</div>
						)}
					</div>
				))}
			</div>
		</nav>
	);
};

export default MobileSheetMenu;
