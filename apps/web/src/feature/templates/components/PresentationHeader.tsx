import { useNavigate } from "@tanstack/react-router";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@workspace/ui/components/navigation-menu";
import { PRESENTATION_ITEMS } from "@/shared/data/nav-data";

function ListItem({
	title,
	children,
	icon,
	onClick,
}: {
	title: string;
	children?: React.ReactNode;
	icon?: React.ReactNode;
	onClick?: () => void;
}) {
	return (
		<li
			onClick={onClick}
			className="hover:bg-muted cursor-pointer select-none rounded-md p-2 transition-colors"
		>
			<div className="flex items-center gap-2">
				{icon && <span className="text-muted-foreground">{icon}</span>}
				<div className="text-sm font-medium">{title}</div>
			</div>
			{children && (
				<p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
					{children}
				</p>
			)}
		</li>
	);
}

export function PresentationHeader() {
	const navigate = useNavigate();

	return (
		<header className="bg-background sticky top-0 z-50 rounded-t-3xl border-b shadow-sm">
			<div className="container mx-auto flex items-center justify-between py-4">
				{/* Logo */}
				<div
					onClick={() => navigate({ to: "/" })}
					className="flex cursor-pointer select-none items-center gap-2 transition-transform hover:scale-[1.02]"
				>
					<img
						src="/Logo.png"
						alt="InnEdu Logo"
						className="h-10 object-contain"
					/>
				</div>

				{/* Navigation */}
				<NavigationMenu>
					<NavigationMenuList className="flex-wrap">
						{PRESENTATION_ITEMS.map((item) => (
							<NavigationMenuItem key={item.label}>
								{item.type === "dropdown" ? (
									<>
										<NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
										<NavigationMenuContent>
											<ul className="grid gap-2 p-3 hover:cursor-pointer md:w-[400px] md:grid-cols-2 lg:w-[500px]">
												{item.items.map((subItem) => (
													<ListItem
														key={subItem.title}
														title={subItem.title}
														icon={
															subItem.icon ? (
																<subItem.icon size={16} />
															) : undefined
														}
														onClick={() =>
															subItem.to && navigate({ to: subItem.to })
														}
													>
														{subItem.description}
													</ListItem>
												))}
											</ul>
										</NavigationMenuContent>
									</>
								) : (
									<NavigationMenuLink
										onClick={() => navigate({ to: item.to })}
										className="hover:text-primary px-3 py-2 font-medium transition-colors hover:cursor-pointer"
									>
										{item.label}
									</NavigationMenuLink>
								)}
							</NavigationMenuItem>
						))}
					</NavigationMenuList>
				</NavigationMenu>
			</div>
		</header>
	);
}
