import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // ESTO ES IMPORTANTE: llamamos a getUser() para forzar a Supabase a refrescar 
    // el token de autenticación (si expiró) y actualizar las cookies.
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Proteger rutas: Si no hay usuario y trata de ir a una ruta privada, lo mandamos a /login.
    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/auth')
    const isPublicRoute = request.nextUrl.pathname === '/'

    if (!user && !isAuthRoute && !isPublicRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Si el usuario ya está logueado y trata de ir a /login, lo mandamos al inicio (/)
    if (user && request.nextUrl.pathname === '/login') {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
