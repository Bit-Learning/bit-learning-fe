import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/layout/header";
import { TopNav } from "@/layout/top-nav";
import { CurriculumGamesPage } from "@/features/games/pages/CurriculumGamesPage";

export const Route = createFileRoute("/_authenticated/apps/games/curriculum")({
	component: CurriculumGamesRoute,
});

function CurriculumGamesRoute() {
	return (
		<>
			<Header />
			<div className="border-b px-6 py-2">
				<TopNav
					links={[
						{
							title: "Trang chủ",
							href: "/apps/games",
							isActive: false,
						},
						{
							title: "Theo chương trình học",
							href: "/apps/games/curriculum",
							isActive: true,
						},
					]}
				/>
			</div>
			<div className="flex flex-1 flex-col gap-6 p-6">
				<div className="space-y-1">
					<h2 className="text-2xl font-bold tracking-tight">
						Game theo chương trình học
					</h2>
					<p className="text-sm text-muted-foreground">
						Xem và quản lý matching game theo bộ sách và lớp học.
					</p>
				</div>
				<CurriculumGamesPage />
			</div>
		</>
	);
}
