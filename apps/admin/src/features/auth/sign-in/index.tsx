import { useSearch } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

  return (
    <div className='fixed inset-0 flex items-center justify-center overflow-hidden bg-black'>
      {/* Animated background gradient */}
      <div
        className='animate-gradient absolute inset-0'
        style={{
          background: 'linear-gradient(#000, #0f0, #000)',
          animation: 'gradient 5s linear infinite',
        }}
      />

      {/* Grid of animated squares */}
      <div className='absolute inset-0 z-[2] flex flex-wrap items-center justify-center gap-[2px]'>
        {Array.from({ length: 256 }).map((_, i) => (
          <span
            key={i}
            className='block h-[calc(6.25vw-2px)] w-[calc(6.25vw-2px)] bg-[#181818] transition-all duration-[1500ms] hover:bg-[#0f0] hover:duration-0 sm:h-[calc(20vw-2px)] sm:w-[calc(20vw-2px)] md:h-[calc(10vw-2px)] md:w-[calc(10vw-2px)]'
          />
        ))}
      </div>

      {/* Sign in card - elevated above the grid */}
      <div className='relative z-[1000]'>
        <Card className='w-[400px] max-w-[90%] gap-4 border-none bg-[#222] shadow-[0_15px_35px_rgba(0,0,0,0.9)]'>
          <CardHeader>
            <CardTitle className='text-center text-4xl font-semibold tracking-tight text-[#0f0] uppercase'>
              Sign in
            </CardTitle>
            {/* <CardDescription className='text-center text-gray-300'>
              Enter your email and password below to <br />
              log into your account
            </CardDescription> */}
          </CardHeader>
          <CardContent>
            <UserAuthForm redirectTo={redirect} />
          </CardContent>
          {/* <CardFooter>
            <p className='px-8 text-center text-sm text-gray-300'>
              By clicking sign in, you agree to our{' '}
              <a
                href='/terms'
                className='text-[#0f0] underline underline-offset-4 transition-colors hover:text-[#00ff00]/70'
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href='/privacy'
                className='text-[#0f0] underline underline-offset-4 transition-colors hover:text-[#00ff00]/70'
              >
                Privacy Policy
              </a>
              .
            </p>
          </CardFooter> */}
        </Card>
      </div>

      <style>{`
        @keyframes gradient {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }
        .animate-gradient {
          animation: gradient 5s linear infinite;
        }
      `}</style>
    </div>
  )
}
