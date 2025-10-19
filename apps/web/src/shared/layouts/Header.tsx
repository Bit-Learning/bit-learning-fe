import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuTrigger,
    NavigationMenuContent,
    NavigationMenuLink,
} from '@workspace/ui/components/navigation-menu'
import { Button } from '@workspace/ui/components/Button'
import { CountryDropdown } from '@workspace/ui/components/update/country-dropdown'
import { useNavigate } from '@tanstack/react-router'
import { NAV_ITEMS } from '@/shared/data/nav-data'

export function Header() {
    const navigate = useNavigate()

    return (
        <header className="border-b bg-background sticky top-0 z-50 shadow-sm rounded-t-3xl">
            <div className="container mx-auto flex items-center justify-between py-4">
                {/* Logo */}
                <div
                    onClick={() => navigate({ to: '/' })}
                    className="flex items-center gap-2 cursor-pointer select-none transition-transform hover:scale-[1.02]"
                >
                    <img src="/logo-innedu-b.png" alt="InnEdu Logo" className="h-10 object-contain" />
                </div>

                {/* Navigation */}
                <NavigationMenu>
                    <NavigationMenuList className="flex-wrap">
                        {NAV_ITEMS.map(item => (
                            <NavigationMenuItem key={item.label}>
                                {item.type === 'dropdown' ? (
                                    <>
                                        <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
                                        <NavigationMenuContent>
                                            <ul className="grid gap-2 p-3 md:w-[400px] lg:w-[500px] md:grid-cols-2">
                                                {item.items.map(subItem => (
                                                    <ListItem
                                                        key={subItem.title}
                                                        title={subItem.title}
                                                        icon={subItem.icon ? <subItem.icon size={16} /> : undefined}
                                                        onClick={() => subItem.to && navigate({ to: subItem.to })}
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
                                        className="px-3 py-2 font-medium hover:text-primary transition-colors"
                                    >
                                        {item.label}
                                    </NavigationMenuLink>
                                )}
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>

                {/* Right-side actions */}
                <div className="flex items-center gap-3">
                    <CountryDropdown placeholder="Select country" defaultValue="VNM" onChange={() => {}} slim />
                    <Button variant="outline" onClick={() => navigate({ to: '/sign-in' })}>
                        Sign in
                    </Button>
                </div>
            </div>
        </header>
    )
}

function ListItem({
    title,
    children,
    icon,
    onClick,
}: {
    title: string
    children?: React.ReactNode
    icon?: React.ReactNode
    onClick?: () => void
}) {
    return (
        <li onClick={onClick} className="cursor-pointer rounded-md p-2 hover:bg-muted transition-colors select-none">
            <div className="flex items-center gap-2">
                {icon && <span className="text-muted-foreground">{icon}</span>}
                <div className="font-medium text-sm">{title}</div>
            </div>
            {children && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{children}</p>}
        </li>
    )
}
