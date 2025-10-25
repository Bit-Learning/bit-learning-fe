'use client'

import { HamburgerMenu } from '@/shared/layouts/DocsLayout/HamburgerMenu'
import { CrossIcon } from '@/shared/layouts/DocsLayout/Icons'
import { ModulePicker } from '@/shared/layouts/DocsLayout/ModulePicker'
import { SidebarHeader } from '@/shared/layouts/DocsLayout/SidebarHeader'
import { SidebarMenu } from '@/shared/layouts/DocsLayout/SidebarMenu'
import { HeaderIconButtons } from '@/shared/layouts/HeaderIconButtons'
import { TopNavLinks } from '@/shared/layouts/TopNavLinks'
import { useIsMobile } from '@workspace/ui/hooks/use-mobile'
import React from 'react'

export function DocsLayout({ children, tocs }: { children: React.ReactNode; tocs: React.ReactNode }) {
    const isMobile = useIsMobile({ breakpoint: 1024 })

    return (
        <>
            <div className="container mx-auto w-full max-w-[1400px]">
                {/* header  */}
                <div className="fixed z-20 h-16 w-full max-w-[1400px]">
                    <CrossIcon className="absolute top-16 left-[0.5px] -translate-x-1/2 -translate-y-1/2 max-xl:hidden" />
                    <CrossIcon className="absolute top-16 right-[0.5px] translate-x-1/2 -translate-y-1/2 max-xl:hidden" />

                    {/* desktop header  */}
                    {!isMobile && (
                        <div className="grid h-full grid-cols-[260px_1fr] max-lg:hidden xl:grid-cols-[260px_1fr_260px]">
                            <div className="h-full border-l">
                                <SidebarHeader />
                            </div>
                            <div className="flex items-center border-x px-10">
                                <TopNavLinks />
                                <div className="flex-1" />
                                <HeaderIconButtons />
                            </div>
                            <div className="h-full border-r max-xl:hidden"></div>
                        </div>
                    )}

                    {/* mobile header  */}
                    {isMobile && (
                        <div className="flex h-full items-center gap-4 pr-5 pl-3 lg:hidden">
                            <HamburgerMenu />
                            <TopNavLinks />
                            <div className="flex-1" />
                            <HeaderIconButtons />
                        </div>
                    )}
                </div>
                {/* header background */}
                <div className="bg-background fixed left-0 z-[19] h-16 w-full border-b"></div>

                {/* content layout */}
                <div className="grid min-h-screen lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_260px]">
                    <div className="h-full max-lg:hidden">
                        <div className="fixed h-full w-[260px] border-l pt-16">
                            <ModulePicker />
                            <SidebarMenu />
                        </div>
                    </div>

                    {/* main content */}
                    <div className="bg-background-secondary/80 grid h-full pt-16 lg:grid-cols-[40px_1fr_40px] lg:border-x">
                        <div className="bg-[image:repeating-linear-gradient(315deg,var(--border)_0,var(--border)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] bg-fixed"></div>
                        <div className="lg:border-x">{children}</div>
                        <div className="bg-[image:repeating-linear-gradient(315deg,var(--border)_0,var(--border)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] bg-fixed"></div>
                    </div>
                    <div className="h-full py-16 max-xl:hidden">
                        <div className="fixed h-full w-[260px] border-r">{tocs}</div>
                    </div>
                </div>
            </div>
        </>
    )
}
