'use client'

import { useState } from 'react'
import { changelogData } from '@/data/changelogData'

export default function Changelog() {
    const [isOpen, setIsOpen] = useState(false)
    const latestVersion = changelogData[0]?.version || 'v0.0.0'
    
    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-50 text-xs text-white/50 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5 transition-all shadow-lg font-inter"
            >
                {latestVersion}
            </button>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
                    <div className="bg-[#1e2024]/90 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl backdrop-blur-xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-syne font-bold text-white mb-6">Registro de Cambios</h2>
                        <div className="flex flex-col gap-6">
                            {changelogData.map((log, i) => (
                                <div key={i} className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${log.isLatest ? 'bg-terroncin-primary text-white' : 'bg-white/10 text-gray-300'}`}>
                                            {log.version}
                                        </span>
                                    </div>
                                    <ul className="list-disc pl-5 flex flex-col gap-1 text-sm text-gray-400 font-inter">
                                        {log.features.map((feature, j) => (
                                            <li key={j}>{feature}</li>
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
