import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuTrigger,
    NavigationMenuContent,
    NavigationMenuLink,
} from '@workspace/ui/components/navigation-menu'
import { Button } from '@workspace/ui/components/Button'
import { ThemeSwitcher } from '@/shared/components/ThemeSwitcher'
import { useNavigate } from '@tanstack/react-router'

export function Header() {
    const navigate = useNavigate()

    return (
        <header className="border-b bg-background sticky top-0 z-50 shadow-md rounded-t-3xl">
            <div className="container mx-auto flex items-center justify-between py-4 px-6">
                {/* <div className="text-xl font-bold">InnEdu</div> */}

                <div
                    onClick={() => navigate({ to: '/' })}
                    className="flex items-center gap-2 cursor-pointer select-none"
                >
                    <img
                        src="/logo-innedu-b.png"
                        alt="InnEdu Logo"
                        className="w-100% h-12 object-contain transition-transform duration-200 hover:scale-105"
                    />
                    {/* <span className="font-semibold text-lg tracking-tight">InnEdu</span> */}
                </div>

                <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <div className="p-4 flex flex-col gap-2">
                                    <NavigationMenuLink href="#">All Products</NavigationMenuLink>
                                    <NavigationMenuLink href="#">New Arrivals</NavigationMenuLink>
                                    <NavigationMenuLink href="#">Sale</NavigationMenuLink>
                                </div>
                            </NavigationMenuContent>
                        </NavigationMenuItem>

                        <NavigationMenuItem>
                            <NavigationMenuLink href="#">About</NavigationMenuLink>
                        </NavigationMenuItem>

                        <NavigationMenuItem>
                            <NavigationMenuLink href="#">Contact</NavigationMenuLink>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>

                <div className="flex items-center gap-3">
                    {/* <ThemeSwitcher /> */}
                    <Button variant="outline" onClick={() => navigate({ to: '/sign-in' })}>
                        Sign in
                    </Button>
                </div>
            </div>
        </header>
    )
}
