import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SlideTemplates } from "./SlideTemplates";
import { TemplateManagement } from "./TemplateManagement";

export function TemplatesPage() {
	return (
		<>
			<Header fixed>
				<Search />
				<div className="ms-auto flex items-center space-x-4">
					<ThemeSwitch />
					<ConfigDrawer />
					<ProfileDropdown />
				</div>
			</Header>

			<Main className="flex flex-1 flex-col gap-4 sm:gap-6">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Quản lý mẫu</h2>
					<p className="text-muted-foreground">
						Quản lý tất cả các loại mẫu trong hệ thống
					</p>
				</div>

				<Tabs defaultValue="products" className="w-full">
					<TabsList className="grid w-full max-w-md grid-cols-2">
						<TabsTrigger value="products">Mẫu sản phẩm</TabsTrigger>
						<TabsTrigger value="slides">Mẫu slide</TabsTrigger>
					</TabsList>

					<TabsContent value="products" className="mt-6">
						<TemplateManagement />
					</TabsContent>

					<TabsContent value="slides" className="mt-6">
						<SlideTemplates />
					</TabsContent>
				</Tabs>
			</Main>
		</>
	);
}
