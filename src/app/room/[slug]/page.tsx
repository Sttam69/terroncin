'use client'

import dynamic from 'next/dynamic'

// Desactivamos SSR por completo para el componente que maneja WebRTC
const RoomClient = dynamic(() => import('./RoomClient'), { 
    ssr: false,
    loading: () => (
        <div className="w-screen h-screen flex items-center justify-center bg-[#0a0a0c] text-white font-syne text-xl">
            Cargando entorno interactivo...
        </div>
    )
})

export default function RoomPage({ params }: { params: { slug: string } }) {
    return <RoomClient slug={params.slug} />
}
