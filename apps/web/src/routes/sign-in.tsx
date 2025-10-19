import { UserAuthForm } from '@/shared/components/user-auth-form'
import { createFileRoute, Link } from '@tanstack/react-router'
import { buttonVariants } from '@workspace/ui/components/Button'
import { FieldDescription } from '@workspace/ui/components/update/field'
import { cn } from '@workspace/ui/lib/utils'

export const Route = createFileRoute('/sign-in')({
    component: SignInPage,
})

function SignInPage() {
    return (
        <>
            <div className="md:hidden">
                <img
                    src="/examples/authentication-light.png"
                    alt="Authentication"
                    className="block h-auto w-full dark:hidden"
                    loading="lazy"
                />
                <img
                    src="/examples/authentication-dark.png"
                    alt="Authentication"
                    className="hidden h-auto w-full dark:block"
                    loading="lazy"
                />
            </div>
            <div className="relative container hidden flex-1 shrink-0 items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
                {/* <Link
                    to="/sign-in"
                    className={cn(buttonVariants({ variant: 'ghost' }), 'absolute right-4 top-4 md:right-8 md:top-8')}
                >
                    Login
                </Link> */}
                <div className="text-primary relative hidden h-full flex-col p-10 lg:flex dark:border-r">
                    <div className="bg-primary/5 absolute inset-0" />
                    <div className="relative z-20 flex items-center text-lg font-medium">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2 h-6 w-6"
                        >
                            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                        </svg>
                        InnEdu
                    </div>
                    <div className="relative z-20 mt-auto">
                        <blockquote className="leading-normal text-balance">
                            &ldquo;This library has saved me countless hours of work and helped me deliver stunning
                            designs to my clients faster than ever before.&rdquo; - Sofia Davis
                        </blockquote>
                    </div>
                </div>
                <div className="flex items-center justify-center lg:h-[1000px] lg:p-8">
                    <div className="mx-auto flex w-full flex-col justify-center gap-6 sm:w-[350px]">
                        <div className="flex flex-col gap-2 text-center">
                            <h1 className="text-2xl font-semibold tracking-tight">Sign in to your account</h1>
                            <p className="text-muted-foreground text-sm">Enter your credentials below to sign in</p>
                        </div>
                        <UserAuthForm />
                        <FieldDescription className="px-6 text-center">
                            By clicking continue, you agree to our <Link to="/terms">Terms of Service</Link> and{' '}
                            <Link to="/privacy">Privacy Policy</Link>.
                        </FieldDescription>
                    </div>
                </div>
            </div>
        </>
    )
}
