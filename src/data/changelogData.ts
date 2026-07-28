export type ChangelogEntry = {
    version: string;
    isLatest: boolean;
    features: string[];
}

export const changelogData: ChangelogEntry[] = [
    { 
        version: "v0.6.0-beta", 
        isLatest: true,
        features: [
            "Lanzamiento Beta Público: Transición oficial de Alpha a Beta con arquitectura preparada para alta concurrencia.",
            "Auth Guard estricto con proxy.ts: Migración al nuevo estándar de Next.js 16 para intercepción de rutas y protección de sesiones.",
            "Corrección y limpieza de despliegue: Resolución de conflictos de compilación en Vercel por archivos residuales de middleware.",
            "Configuración de producción OAuth: URIs de redirección para Google Login apuntando al entorno en vivo."
        ] 
    },
    { 
        version: "v0.5.0-alpha", 
        isLatest: false,
        features: [
            "Panel de Administración y Moderación", 
            "Sistema Knock-Knock para salas privadas", 
            "Roles jerárquicos (user, premium, admin, banned)", 
            "Cursores sincronizados con colores en tiempo real", 
            "Modal de donaciones bilingüe (Lobby, Login y Registro)",
            "Changelog automatizado y dinámico",
            "Soporte nativo para OAuth con GitHub",
            "Protecciones XSS, Fugas de Memoria WebRTC y alertas de concurrencia masiva",
            "Corrección de compilación SSR en Panel de Administración",
            "Protección de Rutas con Middleware y limpieza de sesión de invitados"
        ] 
    },
    { 
        version: "v0.4.0-alpha", 
        isLatest: false,
        features: ["Sistema de amigos y solicitudes", "Subida de archivos a Supabase Storage", "Invitaciones directas por URL", "Optimización de persistencia de Widgets"] 
    },
    { 
        version: "v0.3.0", 
        isLatest: false,
        features: ["Lienzo interactivo infinito", "Notas, texto y dibujo nativo", "Sincronización WebRTC en tiempo real"] 
    },
    { 
        version: "v0.2.0", 
        isLatest: false,
        features: ["Videollamadas integradas", "Redimensionamiento de burbujas", "Compartir pantalla con audio"] 
    },
    { 
        version: "v0.1.0", 
        isLatest: false,
        features: ["Inicio del proyecto", "Autenticación con Supabase", "Lobby y creación de salas"] 
    }
]
