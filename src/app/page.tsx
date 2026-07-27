'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { nanoid } from 'nanoid'
import Link from 'next/link'
import Image from 'next/image'
import Changelog from '@/components/Changelog'
import Logo from '@/components/Logo'

export default function LobbyPage() {
  const [roomName, setRoomName] = useState('')
  const [joinRoomCode, setJoinRoomCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinRoomCode.trim()) return
    let code = joinRoomCode.trim()
    // If user pastes full URL, extract slug
    if (code.includes('/room/')) {
      code = code.split('/room/')[1].split('?')[0]
    }
    router.push(`/room/${code}`)
  }

  // Apodo/Profile Modal states
  const [profile, setProfile] = useState<any>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [nicknameInput, setNicknameInput] = useState('')
  const [avatarInput, setAvatarInput] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileTab, setProfileTab] = useState<'general' | 'security'>('general')
  const [bioInput, setBioInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [isGoogleAuth, setIsGoogleAuth] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [showDonateModal, setShowDonateModal] = useState(false)

  // Salas Recientes
  const [recentRooms, setRecentRooms] = useState<any[]>([])

  // Edit room logic
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null)
  const [editRoomNameValue, setEditRoomNameValue] = useState('')

  const startEditingRoom = (e: React.MouseEvent, room: any) => {
    e.stopPropagation()
    setEditingRoomId(room.id)
    setEditRoomNameValue(room.name)
  }

  const saveLobbyRoomName = async (roomId: string) => {
    if (!editRoomNameValue.trim()) {
      setEditingRoomId(null)
      return
    }
    setRecentRooms(prev => prev.map(r => r.id === roomId ? { ...r, name: editRoomNameValue.trim() } : r))
    setEditingRoomId(null)
    await supabase.from('rooms').update({ name: editRoomNameValue.trim() }).eq('id', roomId)
  }

  // Modal de Confirmación Custom
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, roomId: string | null, message: string }>({
    isOpen: false,
    roomId: null,
    message: ''
  })

  // Modal de Alertas Custom
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean, message: string, actionUrl?: string }>({
    isOpen: false,
    message: ''
  })

  // Amigos
  const [showFriendsModal, setShowFriendsModal] = useState(false)
  const [friendsTab, setFriendsTab] = useState<'list' | 'search'>('list')
  const [friendsList, setFriendsList] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [pendingRequests, setPendingRequests] = useState<any[]>([])

  // Friend Tags
  const [editingFriendId, setEditingFriendId] = useState<string | null>(null)
  const [friendTagInput, setFriendTagInput] = useState('')

  const fetchFriends = async () => {
    if (!user) return
    const { data: rels } = await supabase.from('friendships').select('*').or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
    if (rels) {
      const friendIds = rels.filter(r => r.status === 'accepted').map(r => r.user_id === user.id ? r.friend_id : r.user_id)
      const { data: profiles } = await supabase.from('profiles').select('*').in('id', friendIds)
      
      if (profiles) {
        const fullFriends = profiles.map(p => {
          const rel = rels.find(r => (r.user_id === user.id && r.friend_id === p.id) || (r.friend_id === user.id && r.user_id === p.id))
          return { ...p, friendship_id: rel?.id, custom_tag: rel?.custom_tag }
        })
        setFriendsList(fullFriends)
      }

      const pendingIds = rels.filter(r => r.status === 'pending' && r.friend_id === user.id).map(r => r.user_id)
      const pendingRels = rels.filter(r => r.status === 'pending' && r.friend_id === user.id)
      const { data: pendingProfiles } = await supabase.from('profiles').select('*').in('id', pendingIds)
      if (pendingProfiles) {
        setPendingRequests(pendingProfiles.map(p => ({ user: p, id: pendingRels.find(x => x.user_id === p.id)?.id })))
      }
    }
  }

  const saveFriendTag = async (friendshipId: string) => {
      await supabase.from('friendships').update({ custom_tag: friendTagInput.trim() }).eq('id', friendshipId)
      setEditingFriendId(null)
      fetchFriends()
  }

  const searchUsers = async () => {
    if (!searchQuery.trim() || !user) return
    const { data } = await supabase.from('profiles').select('*').ilike('display_name', `%${searchQuery}%`).neq('id', user.id).limit(10)
    if (data) setSearchResults(data)
  }

  const sendFriendRequest = async (friendId: string) => {
    await supabase.from('friendships').insert({ user_id: user.id, friend_id: friendId, status: 'pending' })
    setAlertModal({ isOpen: true, message: 'Solicitud de amistad enviada' })
  }

  const acceptRequest = async (relId: string) => {
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', relId)
    fetchFriends()
  }

  useEffect(() => {
    if (showFriendsModal) fetchFriends()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFriendsModal])

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const initUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)

      // Fetch profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(userProfile)
      setBioInput(userProfile?.status_text || '')
      setEmailInput(user.email || '')
      
      const isGoogle = user.app_metadata?.providers?.includes('google')
      setIsGoogleAuth(!!isGoogle)

      const defaultPrefix = user.email?.split('@')[0]
      if (!userProfile?.display_name || userProfile.display_name === defaultPrefix) {
        setNicknameInput(userProfile?.display_name || '')
        setAvatarInput(userProfile?.avatar_url || '')
        setShowProfileModal(true)
      } else {
        setNicknameInput(userProfile.display_name)
        setAvatarInput(userProfile.avatar_url || '')
      }

      // Setup global notification channel for invites
      supabase.channel(`user_notifications_${user.id}`)
        .on('broadcast', { event: 'room_invite' }, (payload) => {
          const { roomName, slug, from } = payload.payload
          setAlertModal({ isOpen: true, message: `${from} te ha invitado a unirte a la sala "${roomName}"!`, actionUrl: `/room/${slug}` })
        })
        .subscribe()

      fetchRecentRooms(user.id)
    }
    initUser()
  }, [supabase])

  const fetchRecentRooms = async (userId: string) => {
    const { data: rooms } = await supabase
      .from('rooms')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (rooms) setRecentRooms(rooms)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nicknameInput.trim() || !user) return

    setSavingProfile(true)
    
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        display_name: nicknameInput.trim(),
        avatar_url: avatarInput.trim(),
        status_text: bioInput.trim()
      })
      .eq('id', user.id)

    let authError = null
    if (profileTab === 'security') {
        const updateData: any = {}
        if (emailInput !== user.email) updateData.email = emailInput
        if (passwordInput) updateData.password = passwordInput
        
        if (Object.keys(updateData).length > 0) {
            const { error } = await supabase.auth.updateUser(updateData)
            authError = error
        }
    }

    if (!profileError && !authError) {
      setProfile({ ...profile, display_name: nicknameInput.trim(), avatar_url: avatarInput.trim(), status_text: bioInput.trim() })
      setShowProfileModal(false)
      if (emailInput !== user.email) {
          setAlertModal({ isOpen: true, message: 'Revisa tu bandeja de entrada para confirmar el cambio de correo electrónico.' })
      }
    } else {
      setAlertModal({ isOpen: true, message: authError?.message || profileError?.message || 'Error al guardar el perfil.' })
    }
    setSavingProfile(false)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || !user) return
      setIsUploadingAvatar(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const { error } = await supabase.storage.from('avatars').upload(fileName, file)
      if (!error) {
          const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
          setAvatarInput(data.publicUrl)
      } else {
          setAlertModal({ isOpen: true, message: 'Error subiendo la imagen' })
      }
      setIsUploadingAvatar(false)
  }
  
  const sendPasswordReset = async () => {
      if (!user?.email) return
      const { error } = await supabase.auth.resetPasswordForEmail(user.email)
      if (!error) {
          setAlertModal({ isOpen: true, message: 'Se ha enviado un correo para configurar tu contraseña local.' })
      }
  }

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomName.trim() || !user) return

    setIsLoading(true)
    const slug = nanoid(8)

    const { error } = await supabase.from('rooms').insert({
      slug,
      name: roomName,
      owner_id: user.id,
      is_private: true,
      max_participants: 8
    })

    if (error) {
      console.error('Error al crear sala:', error)
      setAlertModal({ isOpen: true, message: 'Hubo un error al crear la sala en Supabase.' })
      setIsLoading(false)
      return
    }

    router.push(`/room/${slug}`)
  }

  const requestDeleteRoom = (e: React.MouseEvent, roomId: string) => {
    e.stopPropagation()
    setConfirmModal({
      isOpen: true,
      roomId,
      message: '¿Seguro que deseas eliminar esta sala permanentemente?'
    })
  }

  const confirmDeleteRoom = async () => {
    const roomId = confirmModal.roomId
    if (!roomId) return

    // Cierra el modal inmediatamente para fluidez
    setConfirmModal({ isOpen: false, roomId: null, message: '' })

    // Ejecuta el borrado REAL en Supabase
    const { error } = await supabase.from('rooms').delete().eq('id', roomId)

    if (!error) {
      // Solo actualizamos el estado si Supabase confirma el borrado exitoso
      setRecentRooms(prev => prev.filter(r => r.id !== roomId))
    } else {
      console.error("Error borrando sala:", error)
      setAlertModal({ isOpen: true, message: 'No se pudo eliminar la sala. Verifica tus permisos o reglas RLS.' })
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Invitado'

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-terroncin-background">

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-transparent">
        <div className="h-16 px-6 flex items-center justify-between">
          <div className="flex items-center">
            <Logo />
          </div>
          <div className="flex items-center gap-3">
            {profile?.role === 'admin' && (
                <Link href="/admin" className="px-3 py-1.5 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 font-bold text-xs flex items-center gap-2 border border-red-500/30 transition-colors">
                    <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                    <span className="hidden sm:inline">Admin</span>
                </Link>
            )}
            <button onClick={() => setShowDonateModal(true)} className="px-3 py-1.5 rounded-full bg-[#0070ba]/20 hover:bg-[#0070ba]/40 text-[#009cde] font-bold text-xs flex items-center gap-2 border border-[#0070ba]/30 transition-colors">
                <span className="material-symbols-outlined text-[16px]">favorite</span>
                <span className="hidden sm:inline">Apoyar el Proyecto</span>
            </button>
            <button onClick={() => setShowFriendsModal(true)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center transition-colors border border-white/10" title="Amigos">
              <span className="material-symbols-outlined text-[20px] text-white">group</span>
            </button>
            <button onClick={() => setShowProfileModal(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 transition-colors border border-white/10">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-white text-[18px]">person</span>
              )}
              <span className="font-inter text-sm text-white hidden sm:inline">{displayName}</span>
            </button>
            <button onClick={handleSignOut} className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-col relative w-full pt-20 pb-24 min-h-screen overflow-y-auto">

        {/* Ambient Background Gradients */}
        <div className="absolute top-0 -left-20 w-[400px] h-[400px] bg-terroncin-secondary rounded-full mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none animate-pulse"></div>
        <div className="absolute top-[30%] -right-32 w-[500px] h-[500px] bg-terroncin-primary rounded-full mix-blend-screen filter blur-[120px] opacity-10 pointer-events-none" style={{ animation: 'pulse 10s ease-in-out infinite reverse' }}></div>

        {/* Main Content Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 z-10 w-full max-w-6xl mx-auto px-6 pt-8 pb-12">

          {/* Columna Izquierda: Acciones */}
          <div className="flex flex-col gap-8">
            {/* Welcome Message */}
            <div className="flex flex-col gap-2">
              <h1 className="font-syne text-3xl font-bold text-white tracking-tight">
                Hola <span className="text-terroncin-primary drop-shadow-[0_0_12px_rgba(255,107,53,0.4)]">{displayName}</span>,
              </h1>
              <p className="font-inter text-xl text-gray-400">
                ¿qué vamos a compartir hoy?
              </p>
              {profile?.status_text && (
                  <p className="font-inter text-sm text-gray-500 italic flex items-center gap-2 mt-1">
                      <span className="material-symbols-outlined text-[16px]">format_quote</span>
                      {profile.status_text}
                  </p>
              )}
            </div>

            {/* Primary CTA Card / Form */}
            <div className="w-full relative mt-4">
              <div className="absolute inset-0 bg-terroncin-primary rounded-[2rem] blur-xl opacity-50 transition-opacity duration-300"></div>

              <form onSubmit={handleCreateRoom} className="relative w-full bg-terroncin-primary rounded-[2rem] p-8 flex flex-col items-center justify-center gap-6 text-white shadow-[0_20px_40px_rgba(255,107,53,0.3)] overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent opacity-30 rounded-t-[2rem] pointer-events-none"></div>

                <div className="flex flex-col items-center gap-1 w-full">
                  <h2 className="font-syne text-2xl font-bold text-center">Crear Sala Privada</h2>
                  <p className="font-inter opacity-80 text-center mb-4 text-sm">Diseña tu santuario digital perfecto</p>

                  <input
                    type="text"
                    placeholder="Nombre de la sala..."
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="w-full bg-black/20 border-none rounded-xl py-3 px-4 text-white font-inter placeholder:text-white/60 focus:ring-2 focus:ring-white/50 transition-all outline-none text-center"
                    required
                    maxLength={50}
                  />

                  <button
                    type="submit"
                    disabled={isLoading || !roomName.trim() || showProfileModal}
                    className="mt-4 w-full bg-white text-terroncin-primary rounded-xl px-4 py-3 font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isLoading ? 'Creando...' : 'Crear Sala'}
                  </button>
                </div>
              </form>
            </div>

            {/* Tarjeta: Unirse a una Sala */}
            <div className="w-full relative mt-2">
              <form onSubmit={handleJoinRoom} className="relative w-full bg-[#1e2024]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 text-white shadow-lg overflow-hidden">
                <div className="flex flex-col items-center gap-1 w-full">
                  <h2 className="font-syne text-2xl font-bold text-center text-white">Unirse a una Sala</h2>
                  <p className="font-inter text-gray-400 text-center mb-4 text-sm">Ingresa el código o URL de invitación</p>

                  <input
                    type="text"
                    placeholder="Código de la sala..."
                    value={joinRoomCode}
                    onChange={(e) => setJoinRoomCode(e.target.value)}
                    className="w-full bg-black/40 border-none rounded-xl py-3 px-4 text-white font-inter placeholder:text-white/40 focus:ring-2 focus:ring-terroncin-primary/50 transition-all outline-none text-center"
                    required
                  />

                  <button
                    type="submit"
                    disabled={!joinRoomCode.trim()}
                    className="mt-4 w-full bg-terroncin-secondary text-white rounded-xl px-4 py-3 font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    Unirse
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Columna Derecha: Salas Recientes */}
          <div className="flex flex-col">
            {recentRooms.length > 0 ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-inter text-lg font-semibold text-white">Mis salas:</h3>
                </div>
                <div className="flex flex-col gap-3">
                  {recentRooms.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => router.push(`/room/${room.slug}`)}
                      className="flex items-center gap-5 p-4 rounded-xl bg-[#1e2024]/60 backdrop-blur-xl shadow-lg transform active:scale-95 transition-all duration-300 text-left border border-white/5 hover:bg-[#333539]/60 cursor-pointer group"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden relative shrink-0 shadow-md">
                        <div className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-110" style={{ backgroundImage: `url(${room.background_url || '/Room1.jpg'})` }}></div>
                      </div>
                      <div className="flex-1 flex flex-col min-w-0 justify-center">
                        {editingRoomId === room.id ? (
                          <input
                            autoFocus
                            value={editRoomNameValue}
                            onChange={e => setEditRoomNameValue(e.target.value)}
                            onBlur={() => saveLobbyRoomName(room.id)}
                            onKeyDown={e => e.key === 'Enter' && saveLobbyRoomName(room.id)}
                            onClick={e => e.stopPropagation()}
                            className="font-inter font-semibold text-white truncate bg-transparent border-b border-white/50 outline-none w-full"
                          />
                        ) : (
                          <div className="flex items-center gap-2 group/name">
                            <h4 className="font-inter font-semibold text-white truncate">{room.name}</h4>
                            <button onClick={(e) => startEditingRoom(e, room)} className="opacity-0 group-hover/name:opacity-100 text-gray-400 hover:text-white transition-opacity">
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                          </div>
                        )}
                        <p className="font-inter text-xs text-gray-400 mt-1 uppercase tracking-wider">{room.slug}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => requestDeleteRoom(e, room.id)}
                          className="w-10 h-10 rounded-full bg-red-500/10 hover:bg-red-500 flex items-center justify-center shrink-0 shadow-sm transition-colors text-red-500 hover:text-white"
                          title="Eliminar Sala"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 shadow-sm text-white">
                          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[250px] bg-white/5 rounded-[2rem] border border-white/5 border-dashed p-8 text-center gap-4">
                <span className="material-symbols-outlined text-[48px] text-white/20">weekend</span>
                <p className="font-inter text-gray-400">Aún no has creado ni visitado salas recientes.</p>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Custom Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="glass-modal p-6 w-full max-w-sm flex flex-col gap-6 text-center animate-[float_0.3s_ease-out]">
            <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
              <span className="material-symbols-outlined text-[32px]">warning</span>
            </div>
            <h3 className="font-syne text-xl font-bold text-white">{confirmModal.message}</h3>
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={() => setConfirmModal({ isOpen: false, roomId: null, message: '' })}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteRoom}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Modal */}
      {alertModal.isOpen && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="glass-modal p-6 w-full max-w-sm flex flex-col gap-6 text-center animate-[float_0.3s_ease-out]">
            <div className="w-16 h-16 rounded-full bg-terroncin-primary/20 text-terroncin-primary flex items-center justify-center mx-auto border border-terroncin-primary/30">
              <span className="material-symbols-outlined text-[32px]">info</span>
            </div>
            <h3 className="font-syne text-xl font-bold text-white">{alertModal.message}</h3>
            {alertModal.actionUrl ? (
              <div className="flex gap-2">
                <button onClick={() => setAlertModal({ isOpen: false, message: '' })} className="flex-1 btn-secondary py-2">Ignorar</button>
                <button onClick={() => router.push(alertModal.actionUrl!)} className="flex-1 btn-primary py-2">Unirse a la Sala</button>
              </div>
            ) : (
              <button onClick={() => setAlertModal({ isOpen: false, message: '' })} className="w-full btn-primary">Entendido</button>
            )}
          </div>
        </div>
      )}

      {/* Profile Onboarding / Edit Modal */}
      {showProfileModal && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="glass-modal p-0 w-full max-w-lg flex flex-col relative animate-[float_0.3s_ease-out] overflow-hidden">
            
            <div className="flex items-center justify-between p-6 pb-4 border-b border-white/10">
              <h2 className="font-syne text-2xl font-bold text-white">Configuración</h2>
              <button type="button" onClick={() => setShowProfileModal(false)} className="text-gray-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex bg-black/20 px-6 pt-4 gap-4 border-b border-white/5">
                <button onClick={() => setProfileTab('general')} className={`pb-2 text-sm font-semibold transition-colors border-b-2 ${profileTab === 'general' ? 'border-terroncin-primary text-terroncin-primary' : 'border-transparent text-gray-400 hover:text-white'}`}>General</button>
                <button onClick={() => setProfileTab('security')} className={`pb-2 text-sm font-semibold transition-colors border-b-2 ${profileTab === 'security' ? 'border-terroncin-primary text-terroncin-primary' : 'border-transparent text-gray-400 hover:text-white'}`}>Seguridad</button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-5 p-6">
                
                {profileTab === 'general' && (
                    <div className="flex flex-col gap-5 animate-[fade-in_0.2s_ease-out]">
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                {avatarInput ? (
                                    <img src={avatarInput} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-terroncin-primary shadow-glow-primary" />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-dashed border-white/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[32px] text-white/50">account_circle</span>
                                    </div>
                                )}
                                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    {isUploadingAvatar ? <span className="material-symbols-outlined animate-spin text-white">sync</span> : <span className="material-symbols-outlined text-white">upload</span>}
                                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
                                </label>
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-400 ml-1 mb-1 block">Apodo en Terroncín *</label>
                                <input
                                    type="text"
                                    placeholder="Tu apodo genial..."
                                    value={nicknameInput}
                                    onChange={(e) => setNicknameInput(e.target.value)}
                                    className="w-full input-glass font-bold"
                                    required
                                    maxLength={20}
                                />
                            </div>
                        </div>

                        <div className="w-full">
                            <label className="text-xs text-gray-400 ml-1 mb-1 block">¿Qué estás haciendo? (Estado)</label>
                            <textarea
                                placeholder="Tu estado actual..."
                                value={bioInput}
                                onChange={(e) => setBioInput(e.target.value)}
                                className="w-full input-glass text-sm min-h-[60px] resize-none"
                                maxLength={60}
                            />
                        </div>
                    </div>
                )}

                {profileTab === 'security' && (
                    <div className="flex flex-col gap-5 animate-[fade-in_0.2s_ease-out]">
                        <div className="w-full">
                            <label className="text-xs text-gray-400 ml-1 mb-1 block">Correo Electrónico</label>
                            <input
                                type="email"
                                value={emailInput}
                                onChange={(e) => setEmailInput(e.target.value)}
                                className="w-full input-glass text-sm"
                                required
                            />
                        </div>

                        {isGoogleAuth ? (
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-sm flex flex-col gap-2">
                                <span className="flex items-center gap-2 text-white font-semibold"><span className="material-symbols-outlined text-terroncin-primary">verified_user</span> Autenticado con Google</span>
                                <p className="text-gray-400 text-xs">No tienes una contraseña local configurada. Si deseas poder iniciar sesión con correo y contraseña en el futuro, puedes configurar una.</p>
                                <button type="button" onClick={sendPasswordReset} className="mt-2 text-terroncin-primary hover:text-white transition-colors self-start font-bold text-xs">
                                    Enviar correo para configurar contraseña local
                                </button>
                            </div>
                        ) : (
                            <div className="w-full">
                                <label className="text-xs text-gray-400 ml-1 mb-1 block">Nueva Contraseña (Opcional)</label>
                                <input
                                    type="password"
                                    placeholder="Dejar en blanco para no cambiar"
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    className="w-full input-glass text-sm"
                                />
                            </div>
                        )}
                    </div>
                )}

                <button
                type="submit"
                disabled={savingProfile || !nicknameInput.trim() || isUploadingAvatar}
                className="w-full btn-primary mt-2"
                >
                {savingProfile ? 'Guardando...' : 'Guardar Perfil'}
                </button>
            </form>
          </div>
        </div>
      )}

      {/* Friends Modal */}
      {showFriendsModal && (
        <div className="absolute inset-0 z-[65] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm" onClick={() => setShowFriendsModal(false)}>
          <div className="glass-modal p-6 w-full max-w-md flex flex-col gap-4 relative h-[600px] max-h-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="font-syne text-2xl font-bold text-white">Amigos</h2>
              <button onClick={() => setShowFriendsModal(false)} className="text-gray-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
            </div>

            <div className="flex bg-black/20 rounded-lg p-1">
              <button onClick={() => setFriendsTab('list')} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${friendsTab === 'list' ? 'bg-terroncin-primary text-white shadow' : 'text-gray-400 hover:text-white'}`}>Mis Amigos</button>
              <button onClick={() => setFriendsTab('search')} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${friendsTab === 'search' ? 'bg-terroncin-primary text-white shadow' : 'text-gray-400 hover:text-white'}`}>Buscar</button>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-3 py-2 pr-2">
              {friendsTab === 'list' && (
                <>
                  {pendingRequests.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs text-terroncin-primary font-bold uppercase tracking-wider mb-2">Solicitudes ({pendingRequests.length})</h4>
                      {pendingRequests.map(req => (
                        <div key={req.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 mb-2">
                          <div className="flex items-center gap-3">
                            <img src={req.user.avatar_url || 'https://via.placeholder.com/40'} className="w-8 h-8 rounded-full object-cover" />
                            <span className="font-inter text-sm text-white">{req.user.display_name}</span>
                          </div>
                          <button onClick={() => acceptRequest(req.id)} className="px-3 py-1 bg-terroncin-accent text-black font-bold text-xs rounded-lg hover:scale-105 transition-transform">Aceptar</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Amigos ({friendsList.length})</h4>
                  {friendsList.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No tienes amigos añadidos aún.</p>}
                  {friendsList.map(f => (
                    <div key={f.id} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5 group/friend">
                      <div className="flex items-center gap-3">
                        <img src={f.avatar_url || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover shrink-0" />
                        <div className="flex flex-col">
                            <span className="font-inter font-semibold text-white flex items-center gap-2">
                                {f.display_name}
                                {f.custom_tag && <span className="bg-terroncin-primary/20 text-terroncin-primary border border-terroncin-primary/30 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">{f.custom_tag}</span>}
                            </span>
                            {f.status_text && <span className="font-inter text-xs text-gray-400 italic truncate max-w-[200px]">{f.status_text}</span>}
                        </div>
                      </div>
                      
                      {editingFriendId === f.id ? (
                          <div className="flex items-center gap-2">
                              <input 
                                  autoFocus
                                  value={friendTagInput}
                                  onChange={e => setFriendTagInput(e.target.value)}
                                  onKeyDown={e => e.key === 'Enter' && saveFriendTag(f.friendship_id)}
                                  className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none w-24"
                                  placeholder="Etiqueta..."
                              />
                              <button onClick={() => saveFriendTag(f.friendship_id)} className="text-terroncin-primary hover:text-white"><span className="material-symbols-outlined text-[16px]">check</span></button>
                              <button onClick={() => setEditingFriendId(null)} className="text-gray-400 hover:text-white"><span className="material-symbols-outlined text-[16px]">close</span></button>
                          </div>
                      ) : (
                          <button onClick={() => {setEditingFriendId(f.id); setFriendTagInput(f.custom_tag || '')}} className="opacity-0 group-hover/friend:opacity-100 text-gray-400 hover:text-white transition-opacity p-1 shrink-0">
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                      )}
                    </div>
                  ))}
                </>
              )}
              {friendsTab === 'search' && (
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2">
                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchUsers()} placeholder="Buscar por nombre..." className="flex-1 input-glass py-2 px-3 text-sm" />
                    <button onClick={searchUsers} className="btn-primary py-2 px-4 rounded-xl"><span className="material-symbols-outlined text-[20px]">search</span></button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {searchResults.map(u => (
                      <div key={u.id} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <img src={u.avatar_url || 'https://via.placeholder.com/40'} className="w-8 h-8 rounded-full object-cover" />
                          <span className="font-inter text-sm text-white">{u.display_name}</span>
                        </div>
                        <button onClick={() => sendFriendRequest(u.id)} className="w-8 h-8 bg-white/10 hover:bg-terroncin-primary rounded-full flex items-center justify-center transition-colors">
                          <span className="material-symbols-outlined text-[16px] text-white">person_add</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Donate Modal */}
      {showDonateModal && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm" onClick={() => setShowDonateModal(false)}>
          <div className="glass-modal p-8 w-full max-w-md flex flex-col gap-6 text-center relative animate-[float_0.3s_ease-out]" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowDonateModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
            </button>
            <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto border border-red-500/30">
              <span className="material-symbols-outlined text-[32px]">favorite</span>
            </div>
            <div>
                <h3 className="font-syne text-2xl font-bold text-white mb-2">Apoyar a Terroncín</h3>
                <p className="font-inter text-sm text-gray-400">Tu apoyo nos ayuda a mantener los servidores activos y a seguir desarrollando nuevas funciones.</p>
            </div>
            
            <div className="flex flex-col gap-4 w-full mt-2">
              <a href="https://paypal.me/sttamboris" target="_blank" rel="noopener noreferrer" className="w-full py-4 rounded-xl bg-[#0070ba] hover:bg-[#003087] text-white font-bold transition-all flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(0,112,186,0.4)]">
                <span className="material-symbols-outlined">payments</span>
                Donar con PayPal
              </a>
              
              <div className="w-full p-6 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-3">
                <span className="font-inter text-sm font-semibold text-gray-300 mb-1">Escanea con tu app Deuna</span>
                <Image src="/qr-deuna.png" alt="Código QR de Deuna para donaciones" width={200} height={200} className="rounded-xl shadow-md mx-auto" />
              </div>
            </div>
          </div>
        </div>
      )}

      <Changelog />
    </div>
  )
}
