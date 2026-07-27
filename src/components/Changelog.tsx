'use client'

import { useState } from 'react'

export default function Changelog() {
    const [isOpen, setIsOpen] = useState(false)
    const logs = [
        { version: "v0.5.0-alpha", changes: ["Chat interno en tiempo real con notificaciones", "Mejoras de UX en lienzos (Fondo, UI Flotante)", "Correcciones críticas en creación de cuentas", "Reproductor de YouTube sincronizado"] },
        { version: "v0.4.0-alpha", changes: ["Sistema de amigos y solicitudes", "Subida de archivos a Supabase Storage", "Invitaciones directas por URL", "Optimización de persistencia de Widgets"] },
        { version: "v0.3.0", changes: ["Lienzo interactivo infinito", "Notas, texto y dibujo nativo", "Sincronización WebRTC en tiempo real"] },
        { version: "v0.2.0", changes: ["Videollamadas integradas", "Redimensionamiento de burbujas", "Compartir pantalla con audio"] },
        { version: "v0.1.0", changes: ["Inicio del proyecto", "Autenticación con Supabase", "Lobby y creación de salas"] },
    ]
    
    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-50 text-xs text-white/50 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5 transition-all shadow-lg font-inter"
            >
                v0.5.0-alpha
            </button>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
                    <div className="bg-[#1e2024]/90 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl backdrop-blur-xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-syne font-bold text-white mb-6">Registro de Cambios</h2>
                        <div className="flex flex-col gap-6">
                            {logs.map((log, i) => (
                                <div key={i} className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${i === 0 ? 'bg-terroncin-primary text-white' : 'bg-white/10 text-gray-300'}`}>
                                            {log.version}
                                        </span>
                                    </div>
                                    <ul className="list-disc pl-5 flex flex-col gap-1 text-sm text-gray-400 font-inter">
                                        {log.changes.map((change, j) => (
                                            <li key={j}>{change}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setIsOpen(false)} className="mt-8 w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold transition-colors">Cerrar</button>
                    </div>
                </div>
            )}
        </>
    )
}
