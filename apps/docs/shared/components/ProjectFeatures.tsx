import { NextJsIcon } from '@/shared/components/icons/NextJsIcon'
import { ReactIcon } from '@/shared/components/icons/ReactIcon'
import { ShadcnIcon } from '@/shared/components/icons/ShadcnIcon'
import { ViteIcon } from '@/shared/components/icons/ViteIcon'
import { cn } from '@workspace/ui/lib/utils'
import { ArrowUpRightIcon, Database, FormInput, PackageIcon, SquareTerminal, SwatchBook } from 'lucide-react'
import Link from 'next/link'

interface FeaturesProps {
    className?: string
    variant?: 'landing' | 'docs'
}

export function ProjectFeatures({ className, variant = 'landing' }: FeaturesProps) {
    return (
        <div
            className={cn(
                'not-prose grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
                variant === 'docs' && 'gap-4',
                className,
            )}
        >
            <FeatureCard
                variant={variant}
                icons={
                    <div className="flex gap-1.5">
                        <FeatureIcon className="bg-blue-500/10">
                            <ReactIcon className="size-6" />
                        </FeatureIcon>
                        <FeatureIcon className="bg-blue-500/10">
                            <NextJsIcon className="size-6 opacity-90" />
                        </FeatureIcon>
                        <FeatureIcon className="bg-blue-500/10">
                            <ViteIcon className="size-6" />
                        </FeatureIcon>
                        <FeatureIcon className="bg-blue-500/10">
                            <ShadcnIcon className="size-6" />
                        </FeatureIcon>
                    </div>
                }
                title="Modern Tech Stack"
                description="Modern technologies for developing high-quality frontend apps"
                url="/docs/guide/tech-stack"
            />
            <FeatureCard
                variant={variant}
                icons={
                    <FeatureIcon className="bg-green-500/10 text-green-500">
                        <PackageIcon strokeWidth={1.5} />
                    </FeatureIcon>
                }
                title="Opinionated Folder Structure"
                description="Scalable folder structure for managing multiple apps"
                url="/docs/guide/installation#project-structure"
            />
            <FeatureCard
                variant={variant}
                icons={
                    <FeatureIcon className="bg-cyan-500/10 text-cyan-500">
                        <SquareTerminal strokeWidth={1.5} />
                    </FeatureIcon>
                }
                title="CLI Tool"
                description="Command-line tool for scaffolding and managing Base Stack monorepos and applications"
                url="/docs/guide/cli"
            />
            <FeatureCard
                variant={variant}
                icons={
                    <FeatureIcon className="bg-purple-500/10 text-purple-500">
                        <SwatchBook strokeWidth={1.5} />
                    </FeatureIcon>
                }
                title="Components Library"
                description="Accessibility-first components built with shadcn/ui for better UX"
                url="/docs/ui"
            />
            <FeatureCard
                variant={variant}
                icons={
                    <FeatureIcon className="bg-orange-500/10 text-orange-500">
                        <FormInput strokeWidth={1.5} />
                    </FeatureIcon>
                }
                title="Form Handling"
                description="Recommended patterns for handling forms using React Hook Form and Zod"
                url="/docs/guide/form-overview"
            />
            <FeatureCard
                variant={variant}
                icons={
                    <FeatureIcon className="bg-red-500/10 text-red-500">
                        <Database strokeWidth={1.5} />
                    </FeatureIcon>
                }
                title="Data Fetching Strategy"
                description="Suggested methods for handling data requests with TanStack Query"
                url="/docs/guide/data-fetching-overview"
            />
        </div>
    )
}

interface FeatureCardProps {
    icons: React.ReactNode
    title: string
    description: string
    iconClassName?: string
    url?: string
    variant?: 'landing' | 'docs'
}

function FeatureCard({ icons, title, description, url = '#', variant = 'landing' }: FeatureCardProps) {
    return (
        <Link
            href={url}
            className={cn(
                'bg-background hover:bg-background-secondary group relative flex h-full flex-col justify-between gap-5 p-3 transition-colors md:p-8',
                variant === 'landing' && 'border-t border-r',
                variant === 'docs' && 'rounded-lg border md:p-4',
            )}
        >
            <ArrowUpRightIcon className="absolute top-3 right-3 size-6 stroke-1 opacity-0 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100" />
            <div>
                <h2 className="font-medium">{title}</h2>
                <p className="text-muted-foreground text-sm">{description}</p>
            </div>
            {icons}
        </Link>
    )
}

interface FeatureIconProps {
    children: React.ReactNode
    className?: string
}

function FeatureIcon({ children, className }: FeatureIconProps) {
    return (
        <div
            className={cn('bg-background-tertiary/90 flex h-11 w-11 items-center justify-center rounded-lg', className)}
        >
            {children}
        </div>
    )
}
