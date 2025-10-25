import { useAuth } from '@/shared/context/AuthContext'
import { NAV_ITEMS, PRESENTATION_ITEMS } from '@/shared/data/nav-data'
import { useNavigate } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/Avatar'
import { Badge } from '@workspace/ui/components/Badge'
import { Button } from '@workspace/ui/components/Button'
import { Menu, MenuItem, MenuTrigger, MenuPopover, MenuSeparator } from '@workspace/ui/components/Menu'
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuTrigger,
    NavigationMenuContent,
    NavigationMenuLink,
} from '@workspace/ui/components/navigation-menu'
import { CountryDropdown } from '@workspace/ui/components/update/country-dropdown'
import { User, UserPlus, LogOut, UserCircle, Settings } from 'lucide-react'

export function Header() {
    const navigate = useNavigate()

    return (
        <header className="bg-background sticky top-0 z-50 rounded-t-3xl border-b shadow-sm">
            <div className="container mx-auto flex items-center justify-between py-4">
                {/* Logo */}
                <div
                    onClick={() => navigate({ to: '/' })}
                    className="flex cursor-pointer select-none items-center gap-2 transition-transform hover:scale-[1.02]"
                >
                    <img src="/Logo.png" alt="InnEdu Logo" className="h-10 object-contain" />
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
                                            <ul className="grid gap-2 p-3 md:w-[400px] md:grid-cols-2 lg:w-[500px]">
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
                                        className="hover:text-primary px-3 py-2 font-medium transition-colors"
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
        <li onClick={onClick} className="hover:bg-muted cursor-pointer select-none rounded-md p-2 transition-colors">
            <div className="flex items-center gap-2">
                {icon && <span className="text-muted-foreground">{icon}</span>}
                <div className="text-sm font-medium">{title}</div>
            </div>
            {children && <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{children}</p>}
        </li>
    )
}

export function FullHeader() {
    const navigate = useNavigate()
    const { user, isAuthenticated, logout, isLoading } = useAuth()

    const handleLogout = () => {
        logout()
        navigate({ to: '/' })
    }

    return (
        <div className="relative">
            {/* Purple/Navy curved background */}
            <div className="absolute inset-0 h-28 rounded-b-3xl bg-[#14244A]" />

            {/* Right-side actions */}
            <div className="absolute right-5 top-1 z-20 flex items-center gap-3">
                {/* <CountryDropdown placeholder="Select country" defaultValue="VNM" onChange={() => {}} slim /> */}

                {!isLoading && (
                    <>
                        {isAuthenticated && user ? (
                            <MenuTrigger>
                                <Button
                                    variant="unstyled"
                                    className="flex items-center gap-2 text-white hover:bg-white/10"
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage
                                            src="https://bundui-images.netlify.app/avatars/08.png"
                                            alt={user.username}
                                        />
                                        <AvatarFallback className="text-xs">
                                            {user.username?.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium">{user.username}</span>
                                </Button>
                                <MenuPopover placement="bottom end">
                                    <Menu className="min-w-[200px]">
                                        <MenuItem onAction={() => navigate({ to: '/user-profile' })}>
                                            <UserCircle className="h-4 w-4" />
                                            <span>Profile</span>
                                        </MenuItem>
                                        <MenuItem onAction={() => navigate({ to: '/user-profile' })}>
                                            <Settings className="h-4 w-4" />
                                            <span>Settings</span>
                                        </MenuItem>
                                        <MenuSeparator />
                                        <MenuItem onAction={handleLogout} className="text-red-600">
                                            <LogOut className="h-4 w-4" />
                                            <span>Logout</span>
                                        </MenuItem>
                                    </Menu>
                                </MenuPopover>
                            </MenuTrigger>
                        ) : (
                            <>
                                <Button
                                    variant="link"
                                    onClick={() => navigate({ to: '/sign-in' })}
                                    className="text-white"
                                >
                                    <User /> Đăng nhập
                                </Button>
                                <Button
                                    variant="link"
                                    onClick={() => navigate({ to: '/sign-up' })}
                                    className="text-white"
                                >
                                    <UserPlus />
                                    Đăng ký
                                </Button>
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Header sits below */}
            <div className="z-100 relative mt-10">
                <Header />
            </div>
        </div>
    )
}

export function PresentationHeader() {
    const navigate = useNavigate()

    return (
        <header className="bg-background sticky top-0 z-50 rounded-t-3xl border-b shadow-sm">
            <div className="container mx-auto flex items-center justify-between py-4">
                {/* Logo */}
                <div
                    onClick={() => navigate({ to: '/' })}
                    className="flex cursor-pointer select-none items-center gap-2 transition-transform hover:scale-[1.02]"
                >
                    <img src="/Logo.png" alt="InnEdu Logo" className="h-10 object-contain" />
                </div>

                {/* Navigation */}
                <NavigationMenu>
                    <NavigationMenuList className="flex-wrap">
                        {PRESENTATION_ITEMS.map(item => (
                            <NavigationMenuItem key={item.label}>
                                {item.type === 'dropdown' ? (
                                    <>
                                        <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
                                        <NavigationMenuContent>
                                            <ul className="grid gap-2 p-3 hover:cursor-pointer md:w-[400px] md:grid-cols-2 lg:w-[500px]">
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
    )
}
