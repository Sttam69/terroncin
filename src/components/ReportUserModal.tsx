'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Flag } from 'lucide-react'

interface ReportUserModalProps {
  reportedUserId: string
  reportedUserName: string
  reporterId: string
  onClose: () => void
}

export default function ReportUserModal({ reportedUserId, reportedUserName, reporterId, onClose }: ReportUserModalProps) {
  const [reason, setReason] = useState('Spam')
  const [details, setDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const { error: submitError } = await supabase.from('user_reports').insert({
      reporter_id: reporterId,
      reported_user_id: reportedUserId,
      reason,
      details: details.trim()
    })

    if (submitError) {
      setError('Hubo un error al enviar el reporte. Por favor intenta de nuevo.')
      setIsSubmitting(false)
    } else {
      setSuccess(true)
      setIsSubmitting(false)
      setTimeout(() => {
        onClose()
      }, 2000)
    }
  }

  return (
    <div className="absolute inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md pointer-events-auto" onClick={onClose}>
      <div className="glass-modal p-6 w-full max-w-sm flex flex-col gap-4 relative animate-[float_0.3s_ease-out]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="font-syne text-xl font-bold text-white flex items-center gap-2">
            <Flag size={20} className="text-red-500" /> Reportar Usuario
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        
        {success ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center border border-green-500/30">
              <span className="material-symbols-outlined text-[32px]">check</span>
            </div>
            <p className="text-white font-inter">Reporte enviado exitosamente.</p>
            <p className="text-gray-400 text-sm">Nuestro equipo lo revisará pronto.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 ml-1">Usuario a reportar</label>
              <div className="bg-black/20 border border-white/5 rounded-xl px-3 py-2 text-white font-inter font-bold">
                {reportedUserName}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 ml-1">Motivo del reporte *</label>
              <select 
                value={reason} 
                onChange={e => setReason(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-terroncin-primary/50"
              >
                <option value="Spam">Spam</option>
                <option value="Acoso">Acoso</option>
                <option value="Contenido Inapropiado">Contenido Inapropiado</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 ml-1">Detalles adicionales (Opcional)</label>
              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="Por favor, describe el problema..."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm min-h-[100px] resize-none outline-none focus:border-terroncin-primary/50"
                maxLength={500}
              />
            </div>

            {error && <p className="text-red-400 text-xs text-center">{error}</p>}

            <div className="flex gap-2 mt-2">
              <button type="button" onClick={onClose} className="flex-1 btn-secondary py-2">Cancelar</button>
              <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary py-2 bg-red-500 hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.4)] border-red-500">
                {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
