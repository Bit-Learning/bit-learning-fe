import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sign-up')({
    component: SignUpPage,
})

function SignUpPage() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="mx-auto max-w-md px-4 text-center">
                <h1 className="my-6 text-4xl font-bold md:text-5xl">Sign In</h1>
                <p className="text-muted-foreground text-lg">
                    This is a placeholder for the Sign In page. Implement your sign-in logic here.
                </p>
            </div>
        </div>
    )
}
