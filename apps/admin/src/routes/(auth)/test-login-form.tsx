import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/test-login-form')({
  component: RouteComponent,
})

function RouteComponent() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login:', { username, password })
  }

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

      {/* Sign in form */}
      <div className='relative z-[1000] w-[400px] max-w-[90%] rounded bg-[#222] p-10 shadow-[0_15px_35px_rgba(0,0,0,0.9)]'>
        <div className='flex flex-col items-center gap-10'>
          <h2 className='text-4xl font-semibold text-[#0f0] uppercase'>
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className='flex w-full flex-col gap-6'>
            <div className='relative w-full'>
              <input
                type='text'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                className='peer w-full rounded border-none bg-[#333] px-2.5 pt-6 pb-2 text-base font-medium text-white outline-none'
              />
              <i
                className={`pointer-events-none absolute top-0 left-0 px-2.5 py-4 text-[#aaa] not-italic transition-all duration-500 ${
                  username ? 'translate-y-[-7.5px] text-[0.8em] text-white' : ''
                } peer-focus:translate-y-[-7.5px] peer-focus:text-[0.8em] peer-focus:text-white`}
              >
                Username
              </i>
            </div>

            <div className='relative w-full'>
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className='peer w-full rounded border-none bg-[#333] px-2.5 pt-6 pb-2 text-base font-medium text-white outline-none'
              />
              <i
                className={`pointer-events-none absolute top-0 left-0 px-2.5 py-4 text-[#aaa] not-italic transition-all duration-500 ${
                  password ? 'translate-y-[-7.5px] text-[0.8em] text-white' : ''
                } peer-focus:translate-y-[-7.5px] peer-focus:text-[0.8em] peer-focus:text-white`}
              >
                Password
              </i>
            </div>

            <div className='flex w-full justify-between'>
              <a href='#' className='text-white no-underline hover:underline'>
                Forgot Password
              </a>
              <a
                href='/register'
                className='font-semibold text-[#0f0] no-underline hover:underline'
              >
                Sign up here
              </a>
            </div>

            <div className='relative w-full'>
              <input
                type='submit'
                value='Login'
                className='w-full cursor-pointer rounded bg-[#0f0] p-2.5 text-[1.35em] font-semibold tracking-wider text-black active:opacity-60'
              />
            </div>
          </form>
        </div>
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
