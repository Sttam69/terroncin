'use client'

import { createClient } from '@/lib/supabase/client'
import Changelog from '@/components/Changelog'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import logoMain from '../../../public/logo-main.png'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const supabase = createClient()
  const router = useRouter()

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    const origin = window.location.origin
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    if (!email || !password) {
      setErrorMsg('Por favor ingresa tu correo y contraseña.')
      return
    }

    setIsLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setIsLoading(false)

    if (error) {
      setErrorMsg('Haz ingresado datos incorrectos, vuelve a intentar.')
    } else {
      router.push('/')
    }
  }

  const handleAppleLogin = () => {
    setErrorMsg('El inicio de sesión con Apple aún no está disponible.')
  }

  return (
    <main className="flex flex-col min-h-screen items-center justify-center p-6 relative overflow-hidden">
      <div className="flex flex-col w-full max-w-md mx-auto z-10">

        {/* Decorative Ambient Element */}
        <div className="absolute -top-12 -left-8 w-32 h-32 bg-terroncin-primary/20 rounded-full blur-3xl animate-pulse -z-10"></div>
        <div className="absolute -top-24 -right-12 w-48 h-48 bg-terroncin-secondary/10 rounded-full blur-[64px] -z-10"></div>

        {/* Main Login Card */}
        <div className="glass-panel rounded-[2rem] p-8 shadow-2xl flex flex-col gap-6 relative overflow-hidden">
          {/* Subtle Inner Glow Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

          {/* Header Section */}
          <div className="flex flex-col items-center text-center space-y-2 relative z-10">
            <Image src={logoMain} alt="Terroncín Logo" width={128} height={128} className="w-28 h-28 mx-auto mb-6 object-contain drop-shadow-lg" />
            <h1 className="font-syne text-3xl font-bold text-white tracking-tight">
              Bienvenido de nuevo
            </h1>
            <p className="font-inter text-sm text-gray-400 max-w-[240px]">
              Tu santuario te espera. Entra y relájate.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl relative z-10 text-center text-sm text-red-200 font-inter">
              {errorMsg}
            </div>
          )}

          {/* Form Section */}
          <form className="flex flex-col gap-4 mt-2 relative z-10" onSubmit={handleLogin}>
            {/* Email Input */}
            <div className="flex flex-col gap-2">
              <label className="font-inter text-xs font-semibold tracking-wide text-gray-400 px-1" htmlFor="email">Correo o Usuario</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-terroncin-primary transition-colors">
                  alternate_email
                </span>
                <input
                  id="email"
                  type="text"
                  placeholder="Ingresa tu correo o usuario"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0c0e12]/40 border-none rounded-xl py-4 pl-12 pr-4 text-white font-inter placeholder:text-gray-600 focus:ring-2 focus:ring-terroncin-primary/50 focus:bg-[#0c0e12]/60 transition-all outline-none"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                <label className="font-inter text-xs font-semibold tracking-wide text-gray-400" htmlFor="password">Contraseña</label>
                <a className="font-inter text-xs font-semibold tracking-wide text-terroncin-primary hover:text-terroncin-primary-dim transition-colors" href="#">¿Olvidaste tu contraseña?</a>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-terroncin-primary transition-colors">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0c0e12]/40 border-none rounded-xl py-4 pl-12 pr-4 text-white font-inter placeholder:text-gray-600 focus:ring-2 focus:ring-terroncin-primary/50 focus:bg-[#0c0e12]/60 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full bg-terroncin-primary text-white font-inter text-base py-4 rounded-xl shadow-xl shadow-terroncin-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:hover:scale-100"
            >
              <span className="font-semibold">{isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}</span>
              {!isLoading && <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>}
            </button>
          </form>

          {/* Footer Action */}
          <div className="text-center mt-2 relative z-50 pointer-events-auto">
            <p className="font-inter text-sm text-gray-400">
              ¿No tienes una cuenta?
              <a href="/register" className="font-inter text-xs font-semibold tracking-wide text-terroncin-secondary hover:text-terroncin-secondary-dim transition-colors ml-2 pointer-events-auto">
                Crear una cuenta
              </a>
            </p>
          </div>
        </div>

        {/* Social Login (Visual Delight) */}
        <div className="flex flex-col items-center mt-6 gap-4 opacity-80 z-10">
          <div className="flex items-center gap-4 w-full">
            <div className="h-px bg-gray-700 flex-1"></div>
            <span className="font-inter text-xs font-semibold tracking-widest text-gray-400 uppercase">O continúa con</span>
            <div className="h-px bg-gray-700 flex-1"></div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-12 h-12 rounded-full glass-panel flex items-center justify-center hover:bg-[#333539] transition-colors disabled:opacity-50"
              title="Continuar con Google"
            >
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin text-white">progress_activity</span>
              ) : (
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path>
                </svg>
              )}
            </button>
            <button
              onClick={handleAppleLogin}
              className="w-12 h-12 rounded-full glass-panel flex items-center justify-center hover:bg-[#333539] transition-colors"
              title="Continuar con Apple"
            >
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.341-3.369-1.341-.454-1.152-1.11-1.459-1.11-1.459-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <Changelog />
    </main>
  )
}
