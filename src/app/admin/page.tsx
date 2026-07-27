'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { adminUpdateUser, adminResetPassword } from '@/app/actions/admin'

export const dynamic = 'force-dynamic'

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'users' | 'reports'>('users')
  const [isLoading, setIsLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [editUsername, setEditUsername] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const initAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      // Verificar rol
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        return router.push('/') // Redirigir al Lobby si no es admin
      }

      // Obtener todos los perfiles
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('id, display_name, email, avatar_url, role, bio, status_text')
        .order('display_name', { ascending: true })

      if (allProfiles) setProfiles(allProfiles)

      // Obtener reportes
      const { data: allReports } = await supabase
        .from('reports')
        .select(`
          id, 
          reporter_id, 
          reported_id, 
          reason, 
          status, 
          created_at,
          reporter:profiles!reporter_id(display_name, avatar_url),
          reported:profiles!reported_id(display_name, avatar_url)
        `)
        .order('created_at', { ascending: false })

      if (allReports) setReports(allReports)

      setIsLoading(false)
    }

    initAdmin()
  }, [router, supabase])

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (!error) {
      setProfiles(prev => prev.map(p => p.id === userId ? { ...p, role: newRole } : p))
    } else {
      alert('Error al cambiar rol: ' + error.message)
    }
  }

  const resolveReport = async (reportId: string) => {
    const { error } = await supabase.from('reports').update({ status: 'resolved' }).eq('id', reportId)
    if (!error) {
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'resolved' } : r))
    } else {
      alert('Error al resolver reporte: ' + error.message)
    }
  }

  const banUser = async (userId: string, reportId: string) => {
    // Sancionar usuario cambiando su rol a 'banned' o guardando en blocks, 
    // Usaremos el rol para mantenerlo simple según la petición.
    const { error } = await supabase.from('profiles').update({ role: 'banned' }).eq('id', userId)
    if (!error) {
      setProfiles(prev => prev.map(p => p.id === userId ? { ...p, role: 'banned' } : p))
      resolveReport(reportId) // Resolver el reporte automáticamente
      alert('Usuario sancionado.')
    } else {
      alert('Error al sancionar: ' + error.message)
    }
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    // Update display_name in profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ display_name: editUsername })
      .eq('id', editingUser.id)
    
    if (profileError) {
      alert('Error actualizando el perfil: ' + profileError.message)
      return
    }

    // Update auth email
    if (editEmail !== editingUser.email) {
        const res = await adminUpdateUser(editingUser.id, editEmail)
        if (res.error) {
            alert('Error actualizando correo: ' + res.error)
            return
        }
    }

    setProfiles(prev => prev.map(p => p.id === editingUser.id ? { ...p, display_name: editUsername, email: editEmail } : p))
    setEditingUser(null)
    alert('Usuario actualizado correctamente.')
  }

  const handleSendReset = async () => {
      if (!editEmail) return
      const res = await adminResetPassword(editEmail)
      if (res.error) {
          alert('Error enviando reseteo: ' + res.error)
      } else {
          alert('Correo de reseteo enviado exitosamente a ' + editEmail)
      }
  }

  if (isLoading) return <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center text-white font-syne text-xl">Cargando Panel de Admin...</div>

  return (
    <main className="flex flex-col min-h-screen p-6 relative bg-[#0a0a0c] text-white">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="flex flex-col w-full max-w-6xl mx-auto relative z-10 pt-10">
        <div className="flex items-center justify-between mb-8">
            <h1 className="font-syne text-4xl font-bold flex items-center gap-3">
                <span className="material-symbols-outlined text-red-500 text-[40px]">admin_panel_settings</span>
                Panel de Administración
            </h1>
            <Link href="/" className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors font-inter flex items-center gap-2 border border-white/10">
                <span className="material-symbols-outlined">arrow_back</span>
                Volver al Lobby
            </Link>
        </div>

        <div className="flex gap-4 mb-6">
            <button 
                onClick={() => setActiveTab('users')} 
                className={`px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'users' ? 'bg-terroncin-primary text-white shadow-[0_0_15px_rgba(255,107,53,0.4)]' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
            >
                Gestión de Usuarios
            </button>
            <button 
                onClick={() => setActiveTab('reports')} 
                className={`px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 ${activeTab === 'reports' ? 'bg-terroncin-primary text-white shadow-[0_0_15px_rgba(255,107,53,0.4)]' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
            >
                Bandeja de Reportes
                {reports.filter(r => r.status === 'pending').length > 0 && (
                    <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{reports.filter(r => r.status === 'pending').length}</span>
                )}
            </button>
        </div>

        <div className="bg-[#1e2024]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            {activeTab === 'users' && (
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-inter">
                        <thead>
                            <tr className="border-b border-white/10 text-gray-400">
                                <th className="py-4 px-4 font-semibold uppercase tracking-wider text-xs">Usuario</th>
                                <th className="py-4 px-4 font-semibold uppercase tracking-wider text-xs">ID</th>
                                <th className="py-4 px-4 font-semibold uppercase tracking-wider text-xs">Estado / Bio</th>
                                <th className="py-4 px-4 font-semibold uppercase tracking-wider text-xs">Rol Actual</th>
                            </tr>
                        </thead>
                        <tbody>
                            {profiles.map(p => (
                                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden border border-white/20 shrink-0">
                                                {p.avatar_url ? (
                                                    <img src={p.avatar_url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <span className="material-symbols-outlined text-[20px]">person</span>
                                                    </div>
                                                )}
                                            </div>
                                            <span className="font-semibold text-white">{p.display_name}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-xs text-gray-500 font-mono">
                                        {p.id.slice(0, 8)}...
                                    </td>
                                    <td className="py-4 px-4 text-sm text-gray-400 truncate max-w-[200px]">
                                        {p.status_text || p.bio || <span className="italic text-gray-600">Sin estado</span>}
                                    </td>
                                    <td className="py-4 px-4 flex items-center gap-2">
                                        <select 
                                            value={p.role || 'user'} 
                                            onChange={(e) => handleRoleChange(p.id, e.target.value)}
                                            className="bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-terroncin-primary focus:ring-1 focus:ring-terroncin-primary transition-all cursor-pointer"
                                        >
                                            <option value="user">Usuario (User)</option>
                                            <option value="premium">Premium</option>
                                            <option value="moderator">Moderador (Mod)</option>
                                            <option value="admin">Administrador (Admin)</option>
                                            <option value="banned">Bloqueado (Banned)</option>
                                        </select>
                                        <button 
                                            onClick={() => { setEditingUser(p); setEditUsername(p.display_name); setEditEmail(p.email || ''); }}
                                            className="p-2 bg-white/5 hover:bg-white/15 rounded-lg text-gray-400 hover:text-white transition-colors"
                                            title="Editar Perfil"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'reports' && (
                <div className="flex flex-col gap-4">
                    {reports.length === 0 ? (
                        <div className="text-center text-gray-500 py-10 font-inter">No hay reportes en la bandeja.</div>
                    ) : (
                        reports.map(report => (
                            <div key={report.id} className={`p-6 rounded-2xl border transition-all ${report.status === 'resolved' ? 'bg-white/5 border-white/5 opacity-60' : 'bg-red-500/10 border-red-500/30'}`}>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <img src={report.reporter?.avatar_url || 'https://via.placeholder.com/40'} className="w-8 h-8 rounded-full border border-white/10" />
                                            <span className="font-semibold text-white text-sm">{report.reporter?.display_name || 'Desconocido'}</span>
                                        </div>
                                        <span className="text-gray-500 material-symbols-outlined">arrow_right_alt</span>
                                        <div className="flex items-center gap-2">
                                            <img src={report.reported?.avatar_url || 'https://via.placeholder.com/40'} className="w-8 h-8 rounded-full border border-red-500/50" />
                                            <span className="font-semibold text-red-400 text-sm">{report.reported?.display_name || 'Desconocido'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${report.status === 'resolved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                            {report.status === 'resolved' ? 'Resuelto' : 'Pendiente'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="mt-4 p-4 bg-black/40 rounded-xl text-gray-300 text-sm font-inter italic border border-white/5">
                                    "{report.reason}"
                                </div>

                                {report.status !== 'resolved' && (
                                    <div className="mt-4 flex gap-3 justify-end">
                                        <button 
                                            onClick={() => resolveReport(report.id)}
                                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl transition-colors"
                                        >
                                            Marcar como Resuelto
                                        </button>
                                        <button 
                                            onClick={() => banUser(report.reported_id, report.id)}
                                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-500 font-semibold text-sm rounded-xl border border-red-500/30 transition-colors flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">gavel</span>
                                            Sancionar Usuario
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
      </div>

      {editingUser && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 fixed">
              <div className="bg-[#1e2024] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-[float_0.3s_ease-out]">
                  <button onClick={() => setEditingUser(null)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
                      <span className="material-symbols-outlined">close</span>
                  </button>
                  <h2 className="font-syne text-2xl font-bold mb-6 text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-terroncin-primary">manage_accounts</span>
                      Editar Cuenta
                  </h2>
                  <form onSubmit={handleEditUser} className="flex flex-col gap-4">
                      <div>
                          <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Apodo (Username)</label>
                          <input 
                              type="text" 
                              value={editUsername} 
                              onChange={e => setEditUsername(e.target.value)} 
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-terroncin-primary transition-colors"
                              required 
                          />
                      </div>
                      <div>
                          <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Correo Electrónico</label>
                          <input 
                              type="email" 
                              value={editEmail} 
                              onChange={e => setEditEmail(e.target.value)} 
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-terroncin-primary transition-colors"
                              required 
                          />
                      </div>
                      <div className="flex flex-col gap-2 mt-4">
                          <button type="submit" className="w-full py-3 bg-terroncin-primary hover:bg-[#ff865a] text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(255,107,53,0.3)]">
                              Guardar Cambios
                          </button>
                          <button type="button" onClick={handleSendReset} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors border border-white/10">
                              Enviar correo de restablecimiento de contraseña
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </main>
  )
}
