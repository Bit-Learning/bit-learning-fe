import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { TopNav } from "@/components/layout/top-nav";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
export function Dashboard() {
  return (
    <>
      <Header>
        <TopNav links={topNav} />
        <div className="ms-auto flex items-center space-x-4">
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main></Main>
    </>
  );
}

const topNav = [
  {
    title: "Tổng quan",
    href: "dashboard/overview",
    isActive: true,
    disabled: false,
  },
  {
    title: "Khách hàng",
    href: "dashboard/customers",
    isActive: false,
    disabled: true,
  },
  {
    title: "Sản phẩm",
    href: "dashboard/products",
    isActive: false,
    disabled: true,
  },
  {
    title: "Cài đặt",
    href: "dashboard/settings",
    isActive: false,
    disabled: true,
  },
];
