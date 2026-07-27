export type ChangelogEntry = {
    version: string;
    isLatest: boolean;
    features: string[];
}

export const changelogData: ChangelogEntry[] = [
    { 
        version: "v0.5.0-alpha", 
        isLatest: true,
        features: [
            "Panel de Administración y Moderación", 
            "Sistema Knock-Knock para salas privadas", 
            "Roles jerárquicos (user, premium, admin, banned)", 
            "Cursores sincronizados con colores en tiempo real", 
            "Modal de donaciones bilingüe (Lobby, Login y Registro)",
            "Changelog automatizado y dinámico",
            "Soporte nativo para OAuth con GitHub",
            "Protecciones XSS, Fugas de Memoria WebRTC y alertas de concurrencia masiva"
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
