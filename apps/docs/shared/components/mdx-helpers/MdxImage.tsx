export function MdxImage({ src, alt }: { src: string; alt: string }) {
    return (
        <div className="px-5">
            <img
                src={src}
                alt={alt}
                className="overflow-hidden rounded-xl border border-neutral-300 dark:hue-rotate-180 dark:invert"
            />
        </div>
    )
}
