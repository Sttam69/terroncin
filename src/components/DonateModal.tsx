'use client'

import Image from 'next/image'

export default function DonateModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="glass-modal p-8 w-full max-w-md flex flex-col gap-6 text-center relative animate-[float_0.3s_ease-out]" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto border border-red-500/30">
                    <span className="material-symbols-outlined text-[32px]">favorite</span>
                </div>
                <div>
                    <h3 className="font-syne text-2xl font-bold text-white mb-2">Apoyar a Terroncín / Support Terroncín</h3>
                    <p className="font-inter text-sm text-gray-400">Tu apoyo nos ayuda a mantener los servidores activos y a seguir desarrollando nuevas funciones.<br/><br/>Your support helps us keep the servers running and continue developing new features.</p>
                </div>
                
                <div className="flex flex-col gap-4 w-full mt-2">
                    <a href="https://paypal.me/sttamboris" target="_blank" rel="noopener noreferrer" className="w-full py-4 rounded-xl bg-[#0070ba] hover:bg-[#003087] text-white font-bold transition-all flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(0,112,186,0.4)]">
                        <span className="material-symbols-outlined">payments</span>
                        Donar con PayPal / Donate
                    </a>
                    
                    <div className="w-full p-6 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-3">
                        <span className="font-inter text-sm font-semibold text-gray-300 mb-1">Escanea con tu app Deuna (Ecuador)</span>
                        <Image src="/qr-deuna.png" alt="Código QR de Deuna para donaciones" width={200} height={200} className="rounded-xl shadow-md mx-auto" />
                    </div>
                </div>
            </div>
        </div>
    )
}
