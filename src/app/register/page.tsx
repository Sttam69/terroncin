'use client'

import { createClient } from '@/lib/supabase/client'
import Changelog from '@/components/Changelog'
import DonateModal from '@/components/DonateModal'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import logoMain from '../../../public/logo-main.png'

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [fullname, setFullname] = useState('')
  const [email, setEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [showDonateModal, setShowDonateModal] = useState(false)

  const supabase = createClient()

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

  const handleGithubLogin = async () => {
    setIsLoading(true)
    setErrorMsg('')
    try {
      const origin = window.location.origin
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setErrorMsg('Error al conectar con GitHub. Inténtalo de nuevo.')
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (email !== confirmEmail) {
      setErrorMsg('Los correos electrónicos no coinciden.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.')
      return
    }

    if (!acceptedTerms) {
      setErrorMsg('Debes aceptar los términos y condiciones.')
      return
    }

    setIsLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullname,
        },
      }
    })
    setIsLoading(false)
    if (error) {
      setErrorMsg(error.message)
    } else {
      setSuccessMsg('¡Registro exitoso! Revisa tu correo para verificar la cuenta o inicia sesión directamente.')
      setFullname('')
      setEmail('')
      setConfirmEmail('')
      setPassword('')
      setConfirmPassword('')
      setAcceptedTerms(false)
    }
  }

  return (
    <main className="flex flex-col min-h-screen items-center justify-center p-6 relative overflow-hidden">
      <div className="flex flex-col w-full max-w-md mx-auto relative z-10">

        {/* Decorative Ambient Element */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-terroncin-primary/20 rounded-full blur-[80px] pointer-events-none animate-pulse -z-10"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-terroncin-secondary/10 rounded-full blur-[80px] pointer-events-none animate-pulse -z-10" style={{ animationDelay: '2s' }}></div>

        {/* Glassmorphic Registration Card */}
        <div className="glass-panel rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Inner Glow Top Edge */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

          {/* Header Section */}
          <div className="flex flex-col items-center text-center mb-6 relative z-10">
            <Image src={logoMain} alt="Terroncín Logo" width={128} height={128} className="w-28 h-28 mx-auto mb-6 object-contain drop-shadow-lg" />
            <h1 className="font-syne text-2xl font-bold text-white mb-2">Únete a Terroncín</h1>
            <p className="font-inter text-sm text-gray-400">Crea tu santuario y conecta con tu comunidad.</p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl relative z-10 text-center text-sm text-red-200 font-inter">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-xl relative z-10 text-center text-sm text-green-200 font-inter">
              {successMsg}
            </div>
          )}

          {/* Registration Form */}
          <form className="flex flex-col gap-4 relative z-10" onSubmit={handleRegister}>
            {/* Full Name Field */}
            <div className="flex flex-col gap-2">
              <label className="font-inter text-xs font-semibold tracking-wide text-gray-400 ml-1" htmlFor="fullname">Nombre de usuario</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-terroncin-primary transition-colors text-[20px]">person</span>
                <input
                  id="fullname"
                  type="text"
                  placeholder="Ingresa tu apodo o nombre"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="w-full bg-[#0c0e12]/40 rounded-xl py-3 pl-12 pr-4 font-inter text-sm text-white focus:outline-none transition-all focus:shadow-glow-primary placeholder:text-gray-600 border border-transparent focus:border-terroncin-primary/50"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label className="font-inter text-[10px] font-semibold tracking-wide text-gray-400 ml-1" htmlFor="email">Correo electrónico</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-terroncin-primary transition-colors text-[20px]">alternate_email</span>
                <input
                  id="email"
                  type="email"
                  placeholder="Ingresa tu correo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0c0e12]/40 rounded-xl py-3 pl-12 pr-4 font-inter text-sm text-white focus:outline-none transition-all focus:shadow-glow-primary placeholder:text-gray-600 border border-transparent focus:border-terroncin-primary/50"
                />
              </div>
            </div>

            {/* Confirm Email Field */}
            <div className="flex flex-col gap-2">
              <label className="font-inter text-[10px] font-semibold tracking-wide text-gray-400 ml-1" htmlFor="confirmEmail">Confirmar correo electrónico</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-terroncin-primary transition-colors text-[20px]">mark_email_read</span>
                <input
                  id="confirmEmail"
                  type="email"
                  placeholder="Vuelve a ingresar tu correo"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  className="w-full bg-[#0c0e12]/40 rounded-xl py-3 pl-12 pr-4 font-inter text-sm text-white focus:outline-none transition-all focus:shadow-glow-primary placeholder:text-gray-600 border border-transparent focus:border-terroncin-primary/50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label className="font-inter text-[10px] font-semibold tracking-wide text-gray-400 ml-1" htmlFor="password">Contraseña</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-terroncin-primary transition-colors text-[20px]">lock</span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0c0e12]/40 rounded-xl py-3 pl-12 pr-12 font-inter text-sm text-white focus:outline-none transition-all focus:shadow-glow-primary placeholder:text-gray-600 border border-transparent focus:border-terroncin-primary/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col gap-2">
              <label className="font-inter text-[10px] font-semibold tracking-wide text-gray-400 ml-1" htmlFor="confirmPassword">Confirma tu contraseña</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-terroncin-primary transition-colors text-[20px]">lock_reset</span>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#0c0e12]/40 rounded-xl py-3 pl-12 pr-12 font-inter text-sm text-white focus:outline-none transition-all focus:shadow-glow-primary placeholder:text-gray-600 border border-transparent focus:border-terroncin-primary/50"
                />
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-3 py-2 mt-2">
              <div className="relative flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="w-5 h-5 rounded-md bg-[#282a2e] border-0 text-terroncin-primary cursor-pointer appearance-none checked:bg-terroncin-primary transition-all flex items-center justify-center peer"
                />
                {acceptedTerms && (
                  <span className="material-symbols-outlined absolute text-[16px] text-white pointer-events-none left-0.5 top-0.5">check</span>
                )}
              </div>
              <label className="font-inter text-sm text-gray-400" htmlFor="terms">
                Acepto los <Link href="/terminos" className="text-terroncin-primary hover:underline transition-all">términos de servicio</Link> y la <Link href="/privacidad" className="text-terroncin-primary hover:underline transition-all">política de privacidad</Link>.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-2 bg-terroncin-primary text-white font-inter font-semibold text-sm py-3 rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
              <span>Registrarse</span>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center relative z-50 pointer-events-auto">
            <a href="/login" className="font-inter text-sm text-gray-400 hover:text-terroncin-primary transition-colors inline-flex items-center gap-1 pointer-events-auto">
              <span>¿Ya tienes cuenta?</span>
              <span className="font-semibold text-terroncin-secondary">Inicia sesión</span>
            </a>
          </div>
        </div>

        {/* Social Registration (Micro-delight) */}
        <div className="mt-8 flex flex-col items-center z-10">
          <span className="font-inter text-xs font-semibold text-gray-500 mb-4 uppercase tracking-widest">O únete con</span>
          <div className="flex gap-4">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-12 h-12 rounded-full bg-[#282a2e] flex items-center justify-center hover:bg-[#333539] transition-colors disabled:opacity-50"
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
              onClick={handleGithubLogin}
              disabled={isLoading}
              className="w-12 h-12 rounded-full glass-panel flex items-center justify-center hover:bg-[#333539] transition-colors disabled:opacity-50"
              title="Continuar con GitHub"
            >
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin text-white">progress_activity</span>
              ) : (
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Global Donation Button */}
      <button 
        onClick={() => setShowDonateModal(true)}
        className="absolute top-6 right-6 z-50 flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors font-inter text-sm text-gray-300 hover:text-white backdrop-blur-md shadow-lg"
      >
        <span className="material-symbols-outlined text-[18px] text-red-400">favorite</span>
        Apoya el proyecto / Support the project ☕
      </button>

      {showDonateModal && <DonateModal onClose={() => setShowDonateModal(false)} />}
      <Changelog />
    </main>
  )
}
