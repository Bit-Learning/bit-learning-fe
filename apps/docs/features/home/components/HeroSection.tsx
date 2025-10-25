'use client'

import { CopyToClipboard } from '@/shared/components/CopyToClipboard'
import { DataTableRealworld } from '@/shared/components/examples/DataTableRealworld'
import { Button } from '@workspace/ui/components/Button'
import { ChevronRightIcon, Layers2Icon } from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
    return (
        <section className="px-3">
            <div className="container mx-auto max-w-screen-xl border-x px-3 py-5 md:px-8 md:pb-14">
                <div className="relative grid gap-10 xl:grid-cols-2 xl:gap-4">
                    <TitleAndCTA />
                    <ComponentDemo />
                </div>
            </div>
        </section>
    )
}

function TitleAndCTA() {
    return (
        <div className="space-y-5 py-0 md:py-5 xl:py-20">
            <div className="flex justify-center sm:justify-start">
                <div className="text-muted-foreground dark:bg-background-secondary/70 flex items-center gap-1 rounded-md border bg-white/60 py-0.5 pr-0.5 pl-2.5 font-mono text-xs">
                    <span>$ npx base-stack@latest init</span>
                    <CopyToClipboard text="npx base-stack@latest init" />
                </div>
            </div>
            <div>
                <h1 className="from-foreground to-muted-foreground bg-gradient-to-b bg-clip-text text-center text-3xl font-bold text-transparent sm:text-left sm:text-5xl">
                    The Foundation for Modern React Apps
                </h1>
                <p className="mt-1 text-center text-base sm:text-left sm:text-lg">
                    A modern React starter kit with best practices and all the essentials to quickly launch your
                    frontend.
                </p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:w-[328px]">
                <Button variant="default" size="xl" asChild>
                    <Link href="/docs/guide/introduction">
                        Get Started
                        <ChevronRightIcon className="size-4" />
                    </Link>
                </Button>
                <Button variant="outline" size="xl" asChild>
                    <Link href="/docs/ui">
                        <Layers2Icon />
                        Components
                    </Link>
                </Button>
            </div>
        </div>
    )
}

function ComponentDemo() {
    return (
        <div className="bg-background/85 overflow-hidden rounded-2xl border xl:w-[160%] xl:max-w-[calc(50vw-40px)]">
            <div className="relative flex items-center justify-center px-4 py-2">
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                    <span className="h-3 w-3 rounded-full border border-[#E0443E] bg-[#FF5F56]" />
                    <span className="h-3 w-3 rounded-full border border-[#DEA123] bg-[#FFBD2E]" />
                    <span className="h-3 w-3 rounded-full border border-[#13A10E] bg-[#27C93F]" />
                </div>
                <div className="bg-background-tertiary/70 text-muted-foreground rounded-sm px-10 py-1.5 text-xs">
                    http://localhost:9009
                </div>
            </div>
            <div className="px-5 pt-2 pb-5">
                <DataTableRealworld />
            </div>
        </div>
    )
}
