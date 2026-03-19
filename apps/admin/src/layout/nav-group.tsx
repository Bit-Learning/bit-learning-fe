import { Link, useLocation } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import type { NavCollapsible, NavGroup as NavGroupProps, NavItem, NavLink } from "./types";

export function NavGroup({ title, items }: NavGroupProps) {
  const { state, isMobile } = useSidebar();
  const href = useLocation({ select: (location) => location.href });

  return (
    <SidebarGroup className="px-0 py-1">
      <SidebarGroupLabel className="mb-0.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        {title}
      </SidebarGroupLabel>

      <SidebarMenu className="gap-0.5">
        {items.map((item) => {
          const key = `${item.title}-${item.url}`;

          if (!item.items) return <SidebarMenuLink key={key} item={item} href={href} />;

          if (state === "collapsed" && !isMobile)
            return <SidebarMenuCollapsedDropdown key={key} item={item} href={href} />;

          return <SidebarMenuCollapsible key={key} item={item} href={href} />;
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

/* ── Badge ── */
function NavBadge({ children }: { children: ReactNode }) {
  return (
    <Badge className="ml-auto rounded-full border border-blue-200 bg-blue-50 px-1.5 py-0 text-[10px] font-semibold text-blue-600">
      {children}
    </Badge>
  );
}

/* ── Simple link item ── */
function SidebarMenuLink({ item, href }: { item: NavLink; href: string }) {
  const { setOpenMobile } = useSidebar();
  const isActive = checkIsActive(href, item);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.title}
        className={[
          "group relative mx-1 h-9 rounded-lg px-3 text-[13px] transition-all duration-150",
          isActive
            ? "bg-blue-800 text-white shadow-sm  hover:bg-blue-600 hover:text-white"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        ].join(" ")}
      >
        <Link to={item.url} onClick={() => setOpenMobile(false)}>
          {item.icon && (
            <item.icon
              className={[
                "size-4 shrink-0 transition-colors",
                isActive ? "text-blue-800" : "text-slate-400 group-hover:text-slate-600",
              ].join(" ")}
            />
          )}
          <span className="font-medium">{item.title}</span>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

/* ── Collapsible group item ── */
function SidebarMenuCollapsible({ item, href }: { item: NavCollapsible; href: string }) {
  const { setOpenMobile } = useSidebar();
  const isActive = checkIsActive(href, item, true);

  return (
    <Collapsible asChild defaultOpen={isActive} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            className={[
              "group mx-1 h-9 rounded-lg px-3 text-[13px] transition-all duration-150",
              isActive
                ? "bg-blue-600 font-medium text-blue-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            ].join(" ")}
          >
            {item.icon && (
              <item.icon
                className={[
                  "size-4 shrink-0 transition-colors",
                  isActive ? "text-blue-500" : "text-slate-400 group-hover:text-slate-600",
                ].join(" ")}
              />
            )}
            <span className="font-medium">{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight
              className={[
                "ms-auto size-3.5 transition-transform duration-200",
                isActive ? "text-blue-400" : "text-slate-300",
                "group-data-[state=open]/collapsible:rotate-90 rtl:rotate-180",
              ].join(" ")}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent className="CollapsibleContent">
          <SidebarMenuSub className="mx-1 mt-0.5 border-l-2 border-blue-100 pl-3">
            {item.items.map((subItem) => {
              const subActive = checkIsActive(href, subItem);
              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={subActive}
                    className={[
                      "h-8 rounded-lg text-[12.5px] transition-all duration-150",
                      subActive ? "font-medium text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
                    ].join(" ")}
                  >
                    <Link to={subItem.url} onClick={() => setOpenMobile(false)}>
                      <span
                        className={[
                          "mr-1 inline-block size-1.5 shrink-0 rounded-full",
                          subActive ? "bg-blue-500" : "bg-slate-300",
                        ].join(" ")}
                      />
                      {subItem.icon && <subItem.icon className="size-3.5" />}
                      <span>{subItem.title}</span>
                      {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

/* ── Collapsed dropdown ── */
function SidebarMenuCollapsedDropdown({ item, href }: { item: NavCollapsible; href: string }) {
  const isActive = checkIsActive(href, item);

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={isActive}
            className={[
              "mx-1 h-9 rounded-lg px-3 text-[13px] transition-all duration-150",
              isActive
                ? "bg-blue-50 font-medium text-blue-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            ].join(" ")}
          >
            {item.icon && (
              <item.icon className={["size-4 shrink-0", isActive ? "text-blue-800" : "text-slate-400"].join(" ")} />
            )}
            <span className="font-medium">{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ms-auto size-3.5 text-slate-300 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="right"
          align="start"
          sideOffset={6}
          className="min-w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-200/60"
        >
          <DropdownMenuLabel className="px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            {item.title}
            {item.badge && <span className="ml-1 text-blue-500">({item.badge})</span>}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-100" />

          {item.items.map((sub) => {
            const subActive = checkIsActive(href, sub);
            return (
              <DropdownMenuItem
                key={`${sub.title}-${sub.url}`}
                asChild
                className={[
                  "cursor-pointer rounded-lg px-3 py-2 text-[13px]",
                  subActive
                    ? "bg-blue-50 text-blue-700 focus:bg-blue-50 focus:text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus:bg-slate-50",
                ].join(" ")}
              >
                <Link to={sub.url}>
                  {sub.icon && <sub.icon className="mr-2 size-3.5 text-blue-800" />}
                  <span className="max-w-52 text-wrap">{sub.title}</span>
                  {sub.badge && <span className="ms-auto text-[10px] text-blue-400">{sub.badge}</span>}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

/* ── Helper ── */
function checkIsActive(href: string, item: NavItem, mainNav = false) {
  return (
    href === item.url ||
    href.split("?")[0] === item.url ||
    !!item?.items?.filter((i) => i.url === href).length ||
    (mainNav && href.split("/")[1] !== "" && href.split("/")[1] === item?.url?.split("/")[1])
  );
}
