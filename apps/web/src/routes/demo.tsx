import { ThemeSwitcher } from '@/shared/components/ThemeSwitcher'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/Button'
import { toast } from '@workspace/ui/components/Sonner'

export const Route = createFileRoute('/demo')({
    component: WelcomePage,
})

function WelcomePage() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="mx-auto max-w-2xl px-4 text-center">
                <ThemeSwitcher />

                <h1 className="my-6 text-4xl font-bold md:text-5xl">Welcome to Tanstack Router</h1>
                <p className="text-muted-foreground text-lg">
                    A powerful routing library for React that enables type-safe, flexible, and scalable navigation in
                    your applications.
                </p>
                <Button
                    size="lg"
                    className="mt-6"
                    onClick={() =>
                        toast.success({
                            title: 'Welcome to Tanstack Router',
                            description:
                                'You have successfully launched the starter project. Explore and start building your next great idea!',
                        })
                    }
                >
                    Welcome
                </Button>
            </div>
        </div>
    )
}
