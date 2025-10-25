import { navItems } from '@/components/layouts/data/nav-items'
import { SearchProvider, useSearch } from '@/shared/context/search-context'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/Button'
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from '@workspace/ui/components/navigation-menu'
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@workspace/ui/components/sheet'
import { Menu, Search } from 'lucide-react'
import { useState } from 'react'
import MobileSheetMenu from './mobile-sheet-menu'

const Header: React.FC = () => {
    const navigate = useNavigate()
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const { setOpen } = useSearch()

    const handleNavigate = (path: string) => {
        navigate({ to: path })
        setIsSheetOpen(false)
    }

    return (
        <SearchProvider>
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:shadow-gray-800/50">
                <div className="container mx-auto flex items-center justify-between py-4 max-[776px]:px-4 md:px-10">
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                            <img src="/Logo.png" alt="Bithub Learning" className="h-10 w-36 object-contain" />
                        </div>
                    </Link>

                    <NavigationMenu className="hidden md:block">
                        <NavigationMenuList>
                            {navItems.map(item => (
                                <NavigationMenuItem key={item.title}>
                                    {item.items ? (
                                        <>
                                            <NavigationMenuTrigger className="transition-colors hover:text-blue-700 dark:text-gray-200 dark:hover:text-blue-400">
                                                {item.title}
                                            </NavigationMenuTrigger>
                                            <NavigationMenuContent className="dark:bg-gray-800">
                                                <ul className="grid w-[300px] gap-3 p-4 md:w-[400px] lg:w-[500px] dark:text-gray-200">
                                                    {item.items.map(subItem => (
                                                        <li key={subItem.title} className="p-2">
                                                            <NavigationMenuLink asChild>
                                                                <Link
                                                                    to={subItem.to}
                                                                    className="block space-y-1 rounded-md p-2 leading-none no-underline transition-colors outline-none select-none hover:bg-blue-50 dark:hover:bg-gray-700"
                                                                >
                                                                    <div className="text-sm leading-none font-medium hover:text-blue-700 dark:text-gray-200 dark:hover:text-blue-400">
                                                                        {subItem.title}
                                                                    </div>
                                                                    <p className="text-muted-foreground line-clamp-2 text-sm leading-snug dark:text-gray-400">
                                                                        {subItem.description}
                                                                    </p>
                                                                </Link>
                                                            </NavigationMenuLink>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </NavigationMenuContent>
                                        </>
                                    ) : (
                                        <NavigationMenuLink asChild>
                                            <Link
                                                to={item.to!}
                                                className={
                                                    navigationMenuTriggerStyle() +
                                                    ' transition-colors hover:text-blue-700 dark:text-gray-200 dark:hover:text-blue-400'
                                                }
                                            >
                                                {item.title}
                                            </Link>
                                        </NavigationMenuLink>
                                    )}
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>

                    <div className="hidden items-center space-x-4 md:flex">
                        {/* <div className="border-r pr-4 dark:border-gray-700">
              <button
                className="relative cursor-pointer mt-[6px] text-gray-600 hover:text-blue-700 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
                onClick={() => setOpen(true)}
              >
                <Search size={18} />
              </button>
            </div> */}
                        <Button
                            variant="outline"
                            onClick={() => navigate({ to: '/signin' })}
                            className="bithub-button-outline"
                        >
                            Đăng nhập
                        </Button>
                        <Button onClick={() => navigate({ to: '/signup' })} className="bithub-button-primary">
                            Đăng ký
                        </Button>
                    </div>

                    <div className="flex hidden items-center gap-2 max-[776px]:flex">
                        <div className="hidden border-r pr-4 max-[776px]:block dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => setOpen(true)}
                                className="relative mt-[6px] cursor-pointer text-gray-600 transition-colors hover:text-blue-700 dark:text-gray-300 dark:hover:text-blue-400"
                            >
                                <Search size={18} />
                            </button>
                        </div>
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetClose asChild style={{ color: 'white !important' }} />
                            <SheetTrigger asChild>
                                <button className="rounded-lg p-2 transition-colors hover:bg-gray-100 md:hidden dark:hover:bg-gray-800">
                                    <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                                </button>
                            </SheetTrigger>
                            <SheetContent
                                side="right"
                                className="w-[320px] bg-gradient-to-b from-white to-gray-50 p-0 sm:w-[400px] dark:from-gray-900 dark:to-gray-800"
                            >
                                <MobileSheetMenu onNavigate={handleNavigate} onClose={() => setIsSheetOpen(false)} />
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>
        </SearchProvider>
    )
}

export default Header
