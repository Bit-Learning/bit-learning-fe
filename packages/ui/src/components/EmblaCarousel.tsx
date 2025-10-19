'use client'

import * as React from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { cn } from '../lib/utils'
import { EmblaOptionsType } from 'embla-carousel'

interface CarouselProps extends React.PropsWithChildren {
    options?: EmblaOptionsType
    className?: string
}

export function Carousel({ children, options, className }: CarouselProps) {
    const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start', ...options }, [Autoplay({ delay: 3000 })])

    return (
        <div className={cn('overflow-hidden', className)} ref={emblaRef}>
            <div className="flex gap-4">{children}</div>
        </div>
    )
}

export function CarouselItem({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn('min-w-[250px] flex-shrink-0', className)}>{children}</div>
}
