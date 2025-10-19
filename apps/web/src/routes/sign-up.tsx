import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sign-up')({
    component: SignUpPage,
})

function SignUpPage() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center max-w-md mx-auto px-4">
                <h1 className="text-4xl md:text-5xl font-bold my-6">Sign In</h1>
                <p className="text-lg text-muted-foreground">
                    This is a placeholder for the Sign In page. Implement your sign-in logic here.
                </p>
            </div>
        </div>
    )
}
