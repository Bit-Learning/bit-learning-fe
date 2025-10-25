import { GITHUB_URL, GITHUB_URL_AUTHOR } from '@/shared/consts/common'
import Link from 'next/link'

export function FooterSection() {
    return (
        <footer className="px-3">
            <div className="container mx-auto max-w-screen-xl border-x px-3 py-6 md:py-12">
                <p className="text-muted-foreground text-center text-sm">
                    Built by{' '}
                    <Link href={GITHUB_URL_AUTHOR} className="underline" target="_blank">
                        Henry Pham
                    </Link>
                    . Check out the source on{' '}
                    <Link href={GITHUB_URL} className="underline" target="_blank">
                        GitHub
                    </Link>
                    .
                </p>
            </div>
        </footer>
    )
}
