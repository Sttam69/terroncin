'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, useDragControls } from 'framer-motion'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { Camera, MonitorUp, MousePointer2, ChevronDown, ChevronUp, Image as ImageIcon, Video, MessageSquare, X, Smile, Mic, MicOff, VideoOff, PhoneOff, Type, PlaySquare, PenTool, StickyNote, ChevronRight, ChevronLeft, Pointer } from 'lucide-react'
import Logo from '@/components/Logo'
import EmojiPicker from 'emoji-picker-react'
import ReactPlayer from 'react-player'
import { nanoid } from 'nanoid'
import DOMPurify from 'dompurify'

type Participant = {
    user_id: string
    display_name: string
    avatar_url: string
    status_text?: string
}

type CursorData = {
    x: number;
    y: number;
    name: string;
    color: string;
}

const CURSOR_COLORS = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#D946EF', '#F43F5E']
const getCursorColor = (id: string) => CURSOR_COLORS[id.charCodeAt(0) % CURSOR_COLORS.length]
const CANVAS_SIZE = 10000

type Widget = {
    id: string;
    type: 'note' | 'text' | 'image' | 'video' | 'draw';
    x: number;
    y: number;
    width?: number;
    height?: number;
    content?: string;
    fontSize?: number;
    color?: string;
    textAlign?: string;
    drawData?: string;
    lineWidth?: number;
}

const RemoteVideoPlayer = ({ stream, className }: { stream: MediaStream, className?: string }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);
    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            className={className || "w-full h-full object-cover pointer-events-none"}
        />
    )
}

const DrawWidget = ({ w, setWidgets }: any) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [color, setColor] = useState(w.color || '#ff6b35')
    const [lineWidth, setLineWidth] = useState(w.lineWidth || 4)

    useEffect(() => {
        const canvas = canvasRef.current
        if (canvas) {
            const ctx = canvas.getContext('2d')
            if (ctx) {
                if (w.drawData) {
                    const img = new Image()
                    img.onload = () => ctx.drawImage(img, 0, 0)
                    img.src = w.drawData
                } else {
                    ctx.fillStyle = 'white'
                    ctx.fillRect(0, 0, canvas.width, canvas.height)
                }
            }
        }
    }, [w.drawData])

    const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
        e.stopPropagation()
        setIsDrawing(true)
        const ctx = canvasRef.current?.getContext('2d')
        if (ctx) {
            ctx.beginPath()
            ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
        }
    }
    const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
        e.stopPropagation()
        if (!isDrawing) return
        const ctx = canvasRef.current?.getContext('2d')
        if (ctx) {
            ctx.lineWidth = lineWidth
            ctx.lineCap = 'round'
            ctx.strokeStyle = color
            ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
            ctx.stroke()
        }
    }
    const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
        e.stopPropagation()
        setIsDrawing(false)
        if (canvasRef.current) {
            const dataUrl = canvasRef.current.toDataURL()
            setWidgets((prev: Widget[]) => prev.map(x => x.id === w.id ? { ...x, drawData: dataUrl } : x))
        }
    }

    const updateTool = () => {
        setWidgets((prev: Widget[]) => prev.map(x => x.id === w.id ? { ...x, color, lineWidth } : x))
    }

    return (
        <div className="flex flex-col w-full h-full bg-white min-w-[400px] min-h-[300px] cursor-crosshair">
            <div className="flex items-center gap-4 p-2 bg-black/80 border-b border-white/10" onPointerDown={e => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-white font-inter">Color:</span>
                    <input type="color" value={color} onChange={e => setColor(e.target.value)} onBlur={updateTool} className="w-8 h-8 cursor-pointer rounded bg-transparent border-0 p-0" />
                </div>
                <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs text-white font-inter">Grosor:</span>
                    <input type="range" min="1" max="20" value={lineWidth} onChange={e => setLineWidth(Number(e.target.value))} onBlur={updateTool} className="flex-1 cursor-pointer" />
                </div>
            </div>
            <div className="flex-1 relative w-full h-full">
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={300}
                    style={{ width: '100%', height: '100%' }}
                    onPointerDown={startDrawing}
                    onPointerMove={draw}
                    onPointerUp={stopDrawing}
                    onPointerLeave={stopDrawing}
                    className="w-full h-full"
                />
            </div>
        </div>
    )
}

const NoteWidget = ({ w, setWidgets, channelRef }: { w: any, setWidgets: any, channelRef?: any }) => {
    const [fontSize, setFontSize] = useState(w.fontSize || 14)
    const [color, setColor] = useState(w.color || '#ffffff')
    const [align, setAlign] = useState(w.textAlign || 'left')
    const [content, setContent] = useState(w.content || '')
    const debounceRef = useRef<any>(null)

    // Sync incoming content from remote users
    useEffect(() => {
        setContent(w.content || '')
    }, [w.content])

    const updateWidget = () => {
        setWidgets((prev: Widget[]) => prev.map(x => x.id === w.id ? { ...x, fontSize, color, textAlign: align, content } : x))
    }

    const handleContentChange = (newText: string) => {
        setContent(newText)
        // Update local state immediately
        setWidgets((prev: Widget[]) => prev.map(x => x.id === w.id ? { ...x, content: newText } : x))
        // Debounced broadcast to remote users
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            if (channelRef?.current) {
                channelRef.current.send({
                    type: 'broadcast',
                    event: 'widget_sync',
                    payload: { action: 'update', widget: { id: w.id, content: newText } }
                })
            }
        }, 300)
    }

    return (
        <div className="flex flex-col w-full h-full bg-transparent min-w-[250px] min-h-[250px]">
            <div className="flex items-center gap-2 p-2 bg-black/20 border-b border-white/10" onPointerDown={e => e.stopPropagation()}>
                <input type="number" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} onBlur={updateWidget} className="w-12 bg-black/50 text-white text-xs px-1 py-1 rounded outline-none border border-white/10" title="Tamaño" />
                <input type="color" value={color} onChange={e => setColor(e.target.value)} onBlur={updateWidget} className="w-6 h-6 bg-transparent border-0 p-0 rounded cursor-pointer" title="Color" />
                <select value={align} onChange={e => setAlign(e.target.value as any)} onBlur={updateWidget} className="bg-black/50 text-white text-xs rounded px-1 py-1 flex-1 outline-none border border-white/10">
                    <option value="left">Izquierda</option>
                    <option value="center">Centro</option>
                    <option value="right">Derecha</option>
                    <option value="justify">Justificado</option>
                </select>
            </div>
            <textarea
                value={content}
                onChange={e => handleContentChange(e.target.value)}
                onBlur={updateWidget}
                className="flex-1 bg-transparent resize-none outline-none p-4 font-inter w-full h-full"
                style={{ fontSize: `${fontSize}px`, color, textAlign: align }}
                placeholder="Escribe tu nota aquí..."
                onPointerDown={e => e.stopPropagation()}
            />
        </div>
    )
}

const TextWidget = ({ w, setWidgets }: any) => {
    const [fontSize, setFontSize] = useState(w.fontSize || 24)
    const [color, setColor] = useState(w.color || '#ffffff')
    const [align, setAlign] = useState(w.textAlign || 'left')

    const updateWidget = () => {
        setWidgets((prev: Widget[]) => prev.map(x => x.id === w.id ? { ...x, fontSize, color, textAlign: align } : x))
    }

    return (
        <div className="flex flex-col w-full h-full bg-transparent min-w-[250px] min-h-[150px]">
            <div className="flex items-center gap-2 p-2 bg-black/20 border-b border-white/10" onPointerDown={e => e.stopPropagation()}>
                <input type="number" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} onBlur={updateWidget} className="w-12 bg-black/50 text-white text-xs px-1 py-1 rounded outline-none border border-white/10" title="Tamaño" />
                <input type="color" value={color} onChange={e => setColor(e.target.value)} onBlur={updateWidget} className="w-6 h-6 bg-transparent border-0 p-0 rounded cursor-pointer" title="Color" />
                <select value={align} onChange={e => setAlign(e.target.value as any)} onBlur={updateWidget} className="bg-black/50 text-white text-xs rounded px-1 py-1 flex-1 outline-none border border-white/10">
                    <option value="left">Izquierda</option>
                    <option value="center">Centro</option>
                    <option value="right">Derecha</option>
                    <option value="justify">Justificado</option>
                </select>
            </div>
            <div
                contentEditable
                suppressContentEditableWarning
                className="flex-1 p-4 font-bold outline-none w-full h-full"
                style={{ fontSize: `${fontSize}px`, color, textAlign: align }}
                onPointerDown={e => e.stopPropagation()}
                onBlur={e => {
                    const newContent = DOMPurify.sanitize(e.currentTarget.innerHTML);
                    setWidgets((prev: Widget[]) => prev.map(x => x.id === w.id ? { ...x, content: newContent } : x))
                }}
                dangerouslySetInnerHTML={{ __html: w.content ? DOMPurify.sanitize(w.content) : 'Texto Libre' }}
            />
        </div>
    )
}

const SyncedVideoWidget = ({ w, setWidgets, channelRef }: any) => {
    const playerRef = useRef<any>(null)
    const [playing, setPlaying] = useState(false)
    const [url, setUrl] = useState(w.content || '')
    const ignoreNextSync = useRef(false)

    const [isMounted, setIsMounted] = useState(false)
    useEffect(() => setIsMounted(true), [])

    useEffect(() => {
        const handleSync = (e: any) => {
            const data = e.detail
            if (data.widgetId !== w.id) return

            if (data.type === 'play') {
                ignoreNextSync.current = true
                setPlaying(true)
            } else if (data.type === 'pause') {
                ignoreNextSync.current = true
                setPlaying(false)
            } else if (data.type === 'seek') {
                ignoreNextSync.current = true
                playerRef.current?.seekTo(data.playedSeconds, 'seconds')
            } else if (data.type === 'url') {
                setUrl(data.url)
            }
        }
        window.addEventListener('video_sync', handleSync)
        return () => window.removeEventListener('video_sync', handleSync)
    }, [w.id])

    const broadcast = (type: string, data: any) => {
        if (ignoreNextSync.current) {
            ignoreNextSync.current = false
            return
        }
        if (channelRef?.current) {
            channelRef.current.send({
                type: 'broadcast',
                event: 'video_sync',
                payload: { widgetId: w.id, type, ...data }
            })
        }
    }

    const onPlay = () => { setPlaying(true); broadcast('play', {}) }
    const onPause = () => { setPlaying(false); broadcast('pause', {}) }
    const onSeek = (e: any) => { broadcast('seek', { playedSeconds: e }) }

    return (
        <div className="flex flex-col w-full h-full bg-black min-w-[300px] min-h-[200px]">
            {!url ? (
                <div className="flex items-center justify-center p-4 h-full" onPointerDown={e => e.stopPropagation()}>
                    <input
                        type="url"
                        placeholder="Pegar URL de YouTube..."
                        className="bg-white/10 text-white rounded p-2 text-sm outline-none border border-white/20 w-full"
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                setUrl(e.currentTarget.value)
                                broadcast('url', { url: e.currentTarget.value })
                                setWidgets((prev: Widget[]) => prev.map(x => x.id === w.id ? { ...x, content: e.currentTarget.value } : x))
                            }
                        }}
                    />
                </div>
            ) : (
                <div className="w-full h-full pointer-events-auto" onPointerDown={e => e.stopPropagation()}>
                    {isMounted && (() => {
                        const Player = ReactPlayer as any;
                        return (
                            <Player
                                ref={playerRef as any}
                                url={url as any}
                                width="100%"
                                height="100%"
                                controls
                                playing={playing}
                                onPlay={onPlay}
                                onPause={onPause}
                                onSeek={onSeek}
                                onError={(e: any) => console.error("Error reproduciendo Video Widget:", e)}
                            />
                        )
                    })()}
                </div>
            )}
        </div>
    )
}

const WidgetNode = ({ w, setWidgets, channelRef }: { w: Widget, setWidgets: any, channelRef?: any }) => {
    const dragControls = useDragControls()
    return (
        <motion.div
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            onDragEnd={(_, info) => {
                const newX = w.x + info.offset.x
                const newY = w.y + info.offset.y
                setWidgets((prev: Widget[]) => prev.map(x => x.id === w.id ? { ...x, x: newX, y: newY } : x))
                if (channelRef?.current) {
                    channelRef.current.send({
                        type: 'broadcast',
                        event: 'widget_sync',
                        payload: { action: 'update', widget: { id: w.id, x: newX / CANVAS_SIZE, y: newY / CANVAS_SIZE, _relative: true } }
                    })
                }
            }}
            whileDrag={{ scale: 1.05, zIndex: 100 }}
            initial={{ left: w.x, top: w.y }}
            animate={{ left: w.x, top: w.y, width: w.width || 'auto', height: w.height || 'auto' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="nodrag absolute flex flex-col z-50 shadow-2xl border border-white/20 rounded-xl bg-[#1e2024]/90 backdrop-blur-md pointer-events-auto resize overflow-hidden"
            style={{
                minWidth: 200,
                minHeight: 150,
            }}
            onMouseUp={(e) => {
                const target = e.currentTarget;
                if (target.offsetWidth !== w.width || target.offsetHeight !== w.height) {
                    setWidgets((prev: Widget[]) => prev.map(x => x.id === w.id ? { ...x, width: target.offsetWidth, height: target.offsetHeight } : x))
                    if (channelRef?.current) {
                        channelRef.current.send({
                            type: 'broadcast',
                            event: 'widget_sync',
                            payload: { action: 'update', widget: { id: w.id, width: target.offsetWidth, height: target.offsetHeight } }
                        })
                    }
                }
            }}
        >
            <div
                className="h-8 bg-black/50 flex items-center justify-between px-3 cursor-grab active:cursor-grabbing border-b border-white/10"
                onPointerDown={(e) => dragControls.start(e)}
            >
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pointer-events-none">{w.type}</span>
                <button onPointerDown={e => e.stopPropagation()} onClick={() => setWidgets((prev: Widget[]) => prev.filter(x => x.id !== w.id))} className="text-red-400 hover:text-red-500">
                    <X size={14} />
                </button>
            </div>
            <div className="flex-1 bg-[#1e2024]/90 w-full h-full relative" onPointerDown={e => e.stopPropagation()}>
                {w.type === 'note' && <NoteWidget w={w} setWidgets={setWidgets} channelRef={channelRef} />}
                {w.type === 'text' && <TextWidget w={w} setWidgets={setWidgets} />}
                {w.type === 'image' && <img src={w.content} className="w-full h-full object-contain pointer-events-none" />}
                {w.type === 'video' && <SyncedVideoWidget w={w} setWidgets={setWidgets} channelRef={channelRef} />}
                {w.type === 'draw' && <DrawWidget w={w} setWidgets={setWidgets} />}
            </div>
        </motion.div>
    )
}

export default function RoomClient({ slug }: { slug: string }) {
    const router = useRouter()
    const [roomData, setRoomData] = useState<any>(null)
    const [participants, setParticipants] = useState<Participant[]>([])
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    // Modal de fondos
    const [showBgModal, setShowBgModal] = useState(false)
    const backgrounds = ['/Room1.jpg', '/Room2.jpg', '/Room3.jpg']

    // WebRTC & Media State
    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const [localScreenStream, setLocalScreenStream] = useState<MediaStream | null>(null)
    const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream[]>>({})
    const [bubblePositions, setBubblePositions] = useState<Record<string, { x: number, y: number }>>({})

    // Widgets & Toolbar
    const [widgets, setWidgets] = useState<Widget[]>([])
    const [showToolbar, setShowToolbar] = useState(false)
    const [widgetPrompt, setWidgetPrompt] = useState<{ isOpen: boolean, type: 'image' | 'video' | null }>({ isOpen: false, type: null })
    const [widgetUrlInput, setWidgetUrlInput] = useState('')
    const [widgetTab, setWidgetTab] = useState<'url' | 'upload'>('url')
    const [bgTab, setBgTab] = useState<'preset' | 'upload'>('preset')
    const [isUploading, setIsUploading] = useState(false)

    // Invites & Alerts
    const [alertMessage, setAlertMessage] = useState<string | null>(null)
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [friendsList, setFriendsList] = useState<any[]>([])

    // Collapsible Header
    const [isHeaderVisible, setIsHeaderVisible] = useState(false)

    // Knock-Knock & Moderation
    const [isApproved, setIsApproved] = useState(false)
    const [knockKnockStatus, setKnockKnockStatus] = useState<'pending' | 'rejected'>('pending')
    const [joinRequests, setJoinRequests] = useState<any[]>([])
    const [showParticipantsList, setShowParticipantsList] = useState(false)

    const handleJoinResponse = (userId: string, approved: boolean) => {
        setJoinRequests(prev => prev.filter(req => req.userId !== userId))
        supabase.channel(`knock:${slug}`).send({
            type: 'broadcast',
            event: 'join-response',
            payload: { userId, approved }
        })
    }

    const handleKickUser = (userId: string, ban: boolean = false) => {
        if (!channelRef.current || !roomData || !currentUser) return
        
        if (ban) {
            supabase.from('room_bans').insert({ room_id: roomData.id, user_id: userId, banned_by: currentUser.id }).then(() => {
                channelRef.current.send({ type: 'broadcast', event: 'kick', payload: { userId } })
            })
        } else {
            channelRef.current.send({ type: 'broadcast', event: 'kick', payload: { userId } })
        }
    }

    // Chat State
    type ChatMessage = { id: string; senderId: string; senderName: string; content: string; timestamp: number }
    const [showChat, setShowChat] = useState(false)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [chatInput, setChatInput] = useState('')
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [hasUnreadMessages, setHasUnreadMessages] = useState(false)

    const showChatRef = useRef(showChat)
    useEffect(() => { showChatRef.current = showChat }, [showChat])

    const chatPanelRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (showChatRef.current && chatPanelRef.current && !chatPanelRef.current.contains(e.target as Node)) {
                // Ensure we don't close it if they clicked the FAB (handled by checking if they clicked inside the panel, but wait, the FAB isn't in the panel)
                // We should give the FAB an id or class to exclude it, or simply since the FAB is hidden when chat is open, it won't be clicked.
                setShowChat(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchFriends = async () => {
        if (!currentUser) return
        const { data: rels } = await supabase.from('friendships').select('*').or(`user_id.eq.${currentUser.id},friend_id.eq.${currentUser.id}`).eq('status', 'accepted')
        if (rels) {
            const friendIds = rels.map(r => r.user_id === currentUser.id ? r.friend_id : r.user_id)
            const { data: profiles } = await supabase.from('profiles').select('*').in('id', friendIds)
            if (profiles) setFriendsList(profiles)
        }
    }

    const sendInvite = async (friendId: string) => {
        const profile = await supabase.from('profiles').select('display_name').eq('id', currentUser.id).single()
        const channel = supabase.channel(`user_notifications_${friendId}`)
        channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await channel.send({
                    type: 'broadcast',
                    event: 'room_invite',
                    payload: { roomName: roomData.name, slug, from: profile.data?.display_name || 'Alguien' }
                })
                channel.unsubscribe()
            }
        })
        setAlertMessage("¡Invitación enviada!")
        setTimeout(() => setAlertMessage(null), 2000)
    }

    useEffect(() => {
        if (showInviteModal) fetchFriends()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showInviteModal])

    const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return null

        setIsUploading(true)
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${currentUser.id}/${fileName}`

        const { error } = await supabase.storage.from('terroncin_assets').upload(filePath, file)
        if (error) {
            console.error("Error al subir archivo:", error)
            setIsUploading(false)
            return null
        }

        const { data: { publicUrl } } = supabase.storage.from('terroncin_assets').getPublicUrl(filePath)
        setIsUploading(false)
        return publicUrl
    }

    // Hardware Selection & Resizing
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
    const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState<string>('')
    const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState<string>('')
    const [showMicMenu, setShowMicMenu] = useState(false)
    const [showVideoMenu, setShowVideoMenu] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [isVideoOff, setIsVideoOff] = useState(false)
    const [cameraSizes, setCameraSizes] = useState<Record<string, { width: number, height: number }>>({})
    const [screenSizes, setScreenSizes] = useState<Record<string, { width: number, height: number }>>({})
    
    // Cursors State
    const [cursors, setCursors] = useState<Record<string, CursorData>>({})
    const lastCursorSync = useRef<number>(0)
    const [canvasTransform, setCanvasTransform] = useState({ scale: 0.8, x: 0, y: 0 })

    const isCanvasLoaded = useRef(false)
    const peersRef = useRef<Record<string, any>>({})
    const localVideoRef = useRef<HTMLVideoElement>(null)
    const channelRef = useRef<any>(null)
    const isChannelReady = useRef(false)

    const supabase = createClient()

    // 1. Init Room & User
    useEffect(() => {
        const initRoom = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return setError("No estás autenticado")
            setCurrentUser(user)

            const { data: room, error: roomError } = await supabase
                .from('rooms')
                .select('*')
                .eq('slug', slug)
                .single()

            if (roomError || !room) {
                setError("La sala no existe o no tienes acceso")
                return
            }

            // Validar Baneos
            try {
                const { data: banInfo, error: banError } = await supabase.from('room_bans').select('*').eq('room_id', room.id).eq('user_id', user.id).maybeSingle()
                if (banInfo) {
                    setError("Acceso denegado. Has sido bloqueado permanentemente de esta sala.")
                    return
                }
            } catch (err) {
                console.warn("⚠️ [Room] Advertencia validando bans, permitiendo acceso:", err)
            }

            setRoomData(room)
            if (room.owner_id === user.id) {
                setIsApproved(true)
            }

            if (room.canvas_state && Array.isArray(room.canvas_state)) {
                setWidgets(room.canvas_state)
            }
            isCanvasLoaded.current = true
        }
        initRoom()
    }, [slug, supabase])

    // Knock-Knock logic (for visitor)
    useEffect(() => {
        if (!roomData || isApproved || error || !currentUser) return

        const knockChannel = supabase.channel(`knock:${slug}`)
            .on('broadcast', { event: 'join-response' }, (payload) => {
                if (payload.payload.userId === currentUser.id) {
                    if (payload.payload.approved) {
                        setIsApproved(true)
                    } else {
                        setKnockKnockStatus('rejected')
                    }
                }
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    const profile = await supabase.from('profiles').select('display_name, avatar_url').eq('id', currentUser.id).single()
                    const displayName = profile?.data?.display_name || currentUser.email?.split('@')[0] || 'Invitado'
                    knockChannel.send({
                        type: 'broadcast',
                        event: 'join-request',
                        payload: { userId: currentUser.id, name: displayName, avatar: profile?.data?.avatar_url }
                    })
                }
            })

        return () => { 
            knockChannel.unsubscribe() 
            supabase.removeChannel(knockChannel)
        }
    }, [roomData, isApproved, error, currentUser, slug, supabase])

    // Knock-Knock logic (for owner)
    useEffect(() => {
        if (!roomData || roomData.owner_id !== currentUser?.id) return

        const knockChannel = supabase.channel(`knock:${slug}`)
            .on('broadcast', { event: 'join-request' }, (payload) => {
                const requestUser = payload.payload
                setJoinRequests(prev => [...prev, requestUser])
            })
            .subscribe()

        return () => { 
            knockChannel.unsubscribe() 
            supabase.removeChannel(knockChannel)
        }
    }, [roomData, currentUser, slug, supabase])

    // Edit Room Name Logic
    const [isEditingName, setIsEditingName] = useState(false)
    const [editNameValue, setEditNameValue] = useState('')

    useEffect(() => {
        if (roomData?.name) {
            setEditNameValue(roomData.name)
        }
    }, [roomData?.name])

    const saveRoomName = async () => {
        if (!editNameValue.trim() || editNameValue === roomData?.name) {
            setIsEditingName(false)
            return
        }
        setRoomData({ ...roomData, name: editNameValue.trim() })
        setIsEditingName(false)
        await supabase.from('rooms').update({ name: editNameValue.trim() }).eq('slug', slug)
    }

    // Auto-save widgets to Supabase
    useEffect(() => {
        if (!isCanvasLoaded.current || !roomData) return;
        const timer = setTimeout(async () => {
            const { error } = await supabase.from('rooms').update({ canvas_state: widgets }).eq('slug', slug)
            if (error) console.error("Error guardando canvas_state:", error)
        }, 1000)
        return () => clearTimeout(timer)
    }, [widgets, roomData, slug, supabase])

    // 2. Setup WebRTC, Presence and DB Channel
    useEffect(() => {
        if (!currentUser || !roomData || !isApproved) return

        let stream: MediaStream | null = null
        let PeerClass: any = null

        const cleanupRoom = () => {
            console.log("🧹 [WebRTC] Ejecutando limpieza profunda del Room...");
            Object.values(peersRef.current).forEach((peer: any) => {
                try { peer.destroy() } catch (e) {}
            })
            peersRef.current = {}
            if (stream) {
                console.log("🛑 [WebRTC] Deteniendo pistas de medios locales...");
                stream.getTracks().forEach(track => track.stop())
            }
            if (channelRef.current) {
                console.log("🔌 [WebRTC] Desuscribiendo del canal de Supabase...");
                channelRef.current.unsubscribe()
                supabase.removeChannel(channelRef.current)
            }
            setRemoteStreams({})
            setLocalStream(null)
        }

        const handleBeforeUnload = () => {
            cleanupRoom()
        }
        window.addEventListener('beforeunload', handleBeforeUnload)

        const startConnection = async () => {
            try {
                // @ts-ignore
                PeerClass = (await import('@thaunknown/simple-peer')).default
                console.log("⏳ [WebRTC] Solicitando permisos de cámara y micrófono...");
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                console.log("🎥 [WebRTC] ¡Cámara y micrófono obtenidos exitosamente!");
                setLocalStream(stream)
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream
                }
                const devs = await navigator.mediaDevices.enumerateDevices()
                setDevices(devs)
            } catch (err) {
                console.warn("⚠️ [WebRTC] No se pudo obtener cámara/micrófono:", err)
                alert("No se pudo acceder a tu cámara o micrófono. Asegúrate de dar los permisos correspondientes. Seguirás conectado a la sala.")
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('display_name, avatar_url, status_text')
                .eq('id', currentUser.id)
                .single()

            const displayName = profile?.display_name || currentUser.email
            const avatarUrl = profile?.avatar_url || ''
            const statusText = profile?.status_text || ''

            const roomChannel = supabase.channel(`room:${slug}`, {
                config: {
                    presence: { key: currentUser.id },
                    broadcast: { self: false }
                },
            })
            channelRef.current = roomChannel

            roomChannel
                .on('presence', { event: 'sync' }, () => {
                    const presenceState = roomChannel.presenceState()
                    const activeUsers: Participant[] = []

                    for (const id in presenceState) {
                        const state = presenceState[id][0] as any
                        activeUsers.push({
                            user_id: id,
                            display_name: state.display_name,
                            avatar_url: state.avatar_url,
                            status_text: state.status_text,
                        })

                        if (id !== currentUser.id && !peersRef.current[id]) {
                            const isInitiator = currentUser.id > id
                            createPeer(id, isInitiator, stream, roomChannel)
                        }
                    }

                    const currentIds = Object.keys(presenceState)
                    Object.keys(peersRef.current).forEach(peerId => {
                        if (!currentIds.includes(peerId)) {
                            peersRef.current[peerId].destroy()
                            delete peersRef.current[peerId]
                            setRemoteStreams(prev => {
                                const newStreams = { ...prev }
                                delete newStreams[peerId]
                                return newStreams
                            })
                            setCursors(prev => {
                                const newCursors = { ...prev }
                                delete newCursors[peerId]
                                return newCursors
                            })
                        }
                    })

                    setParticipants(activeUsers)
                    if (activeUsers.length >= 15) {
                        setAlertMessage("Advertencia: Alta concurrencia. El rendimiento de audio/video podría verse afectado.")
                        setTimeout(() => setAlertMessage(null), 5000)
                    }
                })
                .on('broadcast', { event: 'kick' }, (payload) => {
                    if (payload.payload.userId === currentUser.id) {
                        router.push('/')
                        setTimeout(() => alert("Has sido expulsado de la sala."), 100)
                    }
                })
                .on('presence', { event: 'join' }, () => { })
                .on('broadcast', { event: 'signal' }, (payload) => {
                    const { from, to, signal } = payload.payload
                    if (to !== currentUser.id || !signal) return
                    
                    console.log(`📡 [WebRTC] Señal recibida de ${from} | Tipo: ${signal.type || 'ice-candidate'}`)
                    
                    if (!peersRef.current[from]) {
                        const isInitiator = currentUser.id > from
                        createPeer(from, isInitiator, stream, roomChannel, signal)
                    } else {
                        try {
                            peersRef.current[from].signal(signal)
                        } catch (e) {
                            console.error(`❌ [WebRTC] Error procesando señal de ${from}:`, e)
                        }
                    }
                })
                .on('broadcast', { event: 'chat' }, (payload) => {
                    setMessages(prev => [...prev, payload.payload as ChatMessage])
                    if (!showChatRef.current) setHasUnreadMessages(true)
                })
                .on('broadcast', { event: 'video_sync' }, (payload) => {
                    window.dispatchEvent(new CustomEvent('video_sync', { detail: payload.payload }))
                })
                .on('broadcast', { event: 'widget_sync' }, (payload) => {
                    const { action, widget } = payload.payload
                    if (action === 'update') {
                        // Decode relative coordinates back to absolute px
                        const decoded = { ...widget }
                        if (decoded._relative) {
                            if (decoded.x !== undefined) decoded.x = decoded.x * CANVAS_SIZE
                            if (decoded.y !== undefined) decoded.y = decoded.y * CANVAS_SIZE
                            delete decoded._relative
                        }
                        setWidgets(prev => prev.map(x => x.id === decoded.id ? { ...x, ...decoded } : x))
                    } else if (action === 'add') {
                        // Decode relative coords for new widgets too
                        const decoded = { ...widget }
                        if (decoded._relative) {
                            if (decoded.x !== undefined) decoded.x = decoded.x * CANVAS_SIZE
                            if (decoded.y !== undefined) decoded.y = decoded.y * CANVAS_SIZE
                            delete decoded._relative
                        }
                        setWidgets(prev => [...prev, decoded])
                    }
                })
                .on('broadcast', { event: 'bubble_move' }, (payload) => {
                    const { bubbleId, rx, ry } = payload.payload
                    // Decode relative to absolute
                    setBubblePositions(prev => ({ ...prev, [bubbleId]: { x: rx * CANVAS_SIZE, y: ry * CANVAS_SIZE } }))
                })
                .on('broadcast', { event: 'cursor-move' }, (payload) => {
                    const { userId, x, y, name } = payload.payload
                    if (userId === currentUser.id) return
                    setCursors(prev => ({
                        ...prev,
                        [userId]: { x, y, name, color: prev[userId]?.color || getCursorColor(userId) }
                    }))
                })
                .on('broadcast', { event: 'bubble_move' }, (payload) => {
                    const { bubbleId, x, y } = payload.payload
                    setBubblePositions(prev => ({ ...prev, [bubbleId]: { x, y } }))
                })
                .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `slug=eq.${slug}` }, (payload) => {
                    setRoomData((prev: any) => ({ ...prev, ...payload.new }))
                })
                .subscribe(async (status) => {
                    if (status === 'SUBSCRIBED') {
                        isChannelReady.current = true
                        await roomChannel.track({
                            user_id: currentUser.id,
                            display_name: displayName,
                            avatar_url: avatarUrl,
                            status_text: statusText,
                        })
                    } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                        isChannelReady.current = false
                    }
                })
        }

        const createPeer = (targetUserId: string, initiator: boolean, localStream: MediaStream | null, channel: any, incomingSignal?: any) => {
            if (peersRef.current[targetUserId]) {
                console.warn(`⚠️ [WebRTC] Intento de duplicar Peer con ${targetUserId}. Ignorado.`);
                return;
            }

            console.log(`🛠️ [WebRTC] Inicializando nuevo Peer hacia ${targetUserId} | Initiator: ${initiator}`);

            const peer = new PeerClass({
                initiator,
                stream: localStream || undefined,
                trickle: true,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:global.stun.twilio.com:3478' }
                    ]
                }
            })

            peer.on('signal', (signal: any) => {
                console.log(`🚀 [WebRTC] Emitiendo señal hacia ${targetUserId} | Tipo: ${signal.type || 'ice-candidate'}`);
                channel.send({
                    type: 'broadcast',
                    event: 'signal',
                    payload: { from: currentUser.id, to: targetUserId, signal }
                })
            })

            peer.on('connect', () => {
                console.log(`✅ [WebRTC] ¡Conexión P2P ESTABLECIDA exitosamente con ${targetUserId}!`)
            })

            peer.on('error', (err: any) => {
                console.error(`❌ [WebRTC] ERROR CRÍTICO en Peer con ${targetUserId}:`, err)
                try { peer.destroy() } catch (e) {}
                delete peersRef.current[targetUserId]
            })

            peer.on('stream', (remoteStream: MediaStream) => {
                console.log(`🔥 [WebRTC] ¡STREAM RECIBIDO de ${targetUserId}! ID: ${remoteStream.id} | Tracks:`, remoteStream.getTracks().length);
                setRemoteStreams(prev => {
                    const existing = prev[targetUserId] || []
                    if (!existing.some(s => s.id === remoteStream.id)) {
                        return { ...prev, [targetUserId]: [...existing, remoteStream] }
                    }
                    return prev
                })
            })

            peer.on('removestream', (remoteStream: MediaStream) => {
                console.log(`🗑️ [WebRTC] Stream removido por ${targetUserId}`);
                setRemoteStreams(prev => {
                    const existing = prev[targetUserId] || []
                    return { ...prev, [targetUserId]: existing.filter(s => s.id !== remoteStream.id) }
                })
            })

            peersRef.current[targetUserId] = peer

            if (incomingSignal) {
                try {
                    peer.signal(incomingSignal)
                } catch (e) {
                    console.error("Error aplicando señal inicial:", e)
                }
            }

            // Screen share is added only when the user explicitly clicks the share button
        }

        startConnection()

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
            cleanupRoom()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser, roomData?.id, slug, supabase, isApproved])

    const sendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!chatInput.trim()) return

        const profile = await supabase.from('profiles').select('display_name').eq('id', currentUser.id).single()
        const newMsg: ChatMessage = {
            id: nanoid(),
            senderId: currentUser.id,
            senderName: profile.data?.display_name || 'Alguien',
            content: chatInput.trim(),
            timestamp: Date.now()
        }

        channelRef.current?.send({
            type: 'broadcast',
            event: 'chat',
            payload: newMsg
        })
        setMessages(prev => [...prev, newMsg])
        setChatInput('')
        setShowEmojiPicker(false)
    }

    const toggleMute = () => {
        if (localStream) {
            const audioTracks = localStream.getAudioTracks()
            if (audioTracks.length > 0) {
                audioTracks[0].enabled = !audioTracks[0].enabled
                setIsMuted(!audioTracks[0].enabled)
            }
        }
    }

    const toggleVideo = () => {
        if (localStream) {
            const videoTracks = localStream.getVideoTracks()
            if (videoTracks.length > 0) {
                videoTracks[0].enabled = !videoTracks[0].enabled
                setIsVideoOff(!videoTracks[0].enabled)
            }
        }
    }

    const changeDevice = async (kind: 'video' | 'audio', deviceId: string) => {
        if (kind === 'video') setSelectedVideoDeviceId(deviceId)
        if (kind === 'audio') setSelectedAudioDeviceId(deviceId)

        if (localStream) {
            localStream.getTracks().forEach(t => t.stop())
        }

        const constraints: MediaStreamConstraints = {
            video: kind === 'video' ? { deviceId: { exact: deviceId } } : (selectedVideoDeviceId ? { deviceId: { exact: selectedVideoDeviceId } } : true),
            audio: kind === 'audio' ? { deviceId: { exact: deviceId } } : (selectedAudioDeviceId ? { deviceId: { exact: selectedAudioDeviceId } } : true)
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints)
            setLocalStream(stream)
            if (localVideoRef.current) localVideoRef.current.srcObject = stream

            Object.values(peersRef.current).forEach(peer => {
                if (localStream) peer.removeStream(localStream)
                peer.addStream(stream)
            })
        } catch (e) { console.error(e) }
    }

    const handleUpdateBackground = async (bgUrl: string) => {
        setRoomData({ ...roomData, background_url: bgUrl })
        setShowBgModal(false)
        await supabase.from('rooms').update({ background_url: bgUrl }).eq('slug', slug)
    }

    const handleScreenShare = async () => {
        if (localScreenStream) {
            localScreenStream.getTracks().forEach(t => t.stop())
            setLocalScreenStream(null)
            Object.values(peersRef.current).forEach(peer => {
                if (peer && peer.removeStream) peer.removeStream(localScreenStream)
            })
            return
        }

        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
            setLocalScreenStream(screenStream)

            Object.values(peersRef.current).forEach(peer => {
                if (peer && peer.addStream) peer.addStream(screenStream)
            })

            screenStream.getVideoTracks()[0].onended = () => {
                setLocalScreenStream(null)
                Object.values(peersRef.current).forEach(peer => {
                    if (peer && peer.removeStream) peer.removeStream(screenStream)
                })
            }
        } catch (err) {
            console.error("Error compartiendo pantalla:", err)
        }
    }

    const handleAddWidget = (type: Widget['type']) => {
        if (type === 'image' || type === 'video') {
            setWidgetPrompt({ isOpen: true, type })
            return
        }
        spawnWidget(type)
    }

    const spawnWidget = (type: Widget['type'], content?: string) => {
        const newWidget: Widget = {
            id: nanoid(6),
            type,
            x: 5000 + (Math.random() * 400 - 200),
            y: 5000 + (Math.random() * 400 - 200),
            content
        }
        setWidgets(prev => [...prev, newWidget])
        if (channelRef.current) {
            channelRef.current.send({
                type: 'broadcast',
                event: 'widget_sync',
                payload: { action: 'add', widget: { ...newWidget, x: newWidget.x / CANVAS_SIZE, y: newWidget.y / CANVAS_SIZE, _relative: true } }
            })
        }
        setWidgetPrompt({ isOpen: false, type: null })
        setWidgetUrlInput('')
    }

    if (error) return <div className="flex min-h-screen items-center justify-center bg-terroncin-background-dark text-red-500 font-bold">{error}</div>
    if (!roomData) return <div className="flex min-h-screen items-center justify-center bg-terroncin-background-dark text-gray-400 font-inter">Entrando a la sala...</div>

    if (!isApproved) {
        return (
           <div className="flex flex-col min-h-screen items-center justify-center bg-[#0a0a0c] text-white gap-6 p-6 text-center">
              <Logo />
              <div className="bg-[#1e2024]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 max-w-md w-full shadow-2xl flex flex-col items-center gap-4 animate-[float_0.3s_ease-out]">
                  <div className="w-16 h-16 rounded-full bg-terroncin-primary/20 flex items-center justify-center text-terroncin-primary border border-terroncin-primary/30 mb-2 animate-pulse">
                      <span className="material-symbols-outlined text-[32px]">vpn_key</span>
                  </div>
                  <h1 className="text-2xl font-syne font-bold text-white">Esperando aprobación</h1>
                  <p className="text-gray-400 font-inter text-sm mb-2">{knockKnockStatus === 'pending' ? 'Hemos avisado al anfitrión de la sala. Aguarda un momento mientras te da acceso...' : 'El anfitrión ha denegado tu solicitud de acceso.'}</p>
                  
                  {knockKnockStatus === 'pending' && (
                      <div className="flex items-center gap-2 text-terroncin-primary/80 font-inter font-semibold text-sm">
                          <div className="w-4 h-4 rounded-full border-2 border-terroncin-primary/80 border-t-transparent animate-spin"></div>
                          Tocando la puerta...
                      </div>
                  )}

                  {knockKnockStatus === 'rejected' && (
                      <button onClick={() => router.push('/')} className="mt-4 px-8 py-3 w-full bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all font-inter">Volver al Lobby</button>
                  )}
              </div>
           </div>
        )
    }

    const currentBg = roomData.background_url || '/Room1.jpg'

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!channelRef.current || !currentUser || !isChannelReady.current) return
        
        const now = Date.now()
        // Incrementar el throttle a 50ms para no saturar el canal WebSockets
        if (now - lastCursorSync.current < 50) return
        lastCursorSync.current = now

        const rect = e.currentTarget.getBoundingClientRect()
        const x = (e.clientX - rect.left) / canvasTransform.scale
        const y = (e.clientY - rect.top) / canvasTransform.scale

        const me = participants.find(p => p.user_id === currentUser.id)
        const displayName = me?.display_name || currentUser.email?.split('@')[0] || 'Invitado'

        channelRef.current.send({
            type: 'broadcast',
            event: 'cursor-move',
            payload: {
                userId: currentUser.id,
                name: displayName,
                x,
                y
            }
        })
    }

    return (
        <div className="w-screen h-screen overflow-hidden relative bg-[#0a0a0c] font-inter text-white select-none">

            {/* Join Requests UI (Owner only) */}
            <div className="fixed top-24 right-6 z-[100] flex flex-col gap-3">
                {joinRequests.map(req => (
                    <div key={req.userId} className="bg-[#1e2024]/95 backdrop-blur-2xl border border-white/20 rounded-xl p-4 shadow-2xl flex flex-col gap-3 text-white w-72 animate-[float_0.3s_ease-out]">
                        <div className="flex items-center gap-3">
                            {req.avatar ? <img src={req.avatar} className="w-10 h-10 rounded-full object-cover shadow-md" /> : <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shadow-md"><span className="material-symbols-outlined text-lg">person</span></div>}
                            <div className="flex flex-col overflow-hidden">
                                <span className="font-syne font-bold text-sm truncate">{req.name}</span>
                                <span className="font-inter text-[11px] text-gray-400">quiere entrar a la sala</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleJoinResponse(req.userId, false)} className="flex-1 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-all">Rechazar</button>
                            <button onClick={() => handleJoinResponse(req.userId, true)} className="flex-1 py-2 rounded-lg bg-terroncin-primary text-white hover:bg-[#ff865a] shadow-md text-xs font-bold transition-all">Permitir</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar (Desplegable) */}
            <div className={`absolute top-1/2 -translate-y-1/2 left-0 z-[80] flex items-center transition-transform duration-300 ${showToolbar ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="bg-[#1e2024]/80 backdrop-blur-xl border border-white/10 rounded-r-2xl p-3 flex flex-col gap-4 shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
                    <button onClick={() => handleAddWidget('note')} className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/15 transition-colors group" title="Nueva Nota">
                        <StickyNote size={24} className="text-gray-300 group-hover:text-terroncin-primary transition-colors" />
                    </button>
                    <button onClick={() => handleAddWidget('text')} className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/15 transition-colors group" title="Texto Libre">
                        <Type size={24} className="text-gray-300 group-hover:text-terroncin-primary transition-colors" />
                    </button>
                    <button onClick={() => handleAddWidget('image')} className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/15 transition-colors group" title="Foto / GIF">
                        <ImageIcon size={24} className="text-gray-300 group-hover:text-terroncin-primary transition-colors" />
                    </button>
                    <button onClick={() => handleAddWidget('video')} className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/15 transition-colors group" title="Video de YouTube">
                        <PlaySquare size={24} className="text-gray-300 group-hover:text-terroncin-primary transition-colors" />
                    </button>
                    <button onClick={() => handleAddWidget('draw')} className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/15 transition-colors group" title="Pizarra de Dibujo">
                        <PenTool size={24} className="text-gray-300 group-hover:text-terroncin-primary transition-colors" />
                    </button>
                    <button onClick={handleScreenShare} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors group ${localScreenStream ? 'bg-terroncin-primary text-white' : 'bg-white/5 hover:bg-white/15'}`} title="Compartir Pantalla">
                        <MonitorUp size={24} className={localScreenStream ? 'text-white' : 'text-gray-300 group-hover:text-terroncin-primary transition-colors'} />
                    </button>
                </div>
                <button
                    onClick={() => setShowToolbar(!showToolbar)}
                    className="absolute -right-8 w-8 h-16 bg-[#1e2024]/80 backdrop-blur-xl border border-white/10 border-l-0 rounded-r-xl flex items-center justify-center shadow-lg hover:bg-white/10 transition-colors"
                >
                    {showToolbar ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
            </div>

            {/* Lienzo Gigante PANEABLE */}
            <div className="absolute inset-0 z-0">
                <TransformWrapper
                    initialScale={0.8}
                    minScale={0.1}
                    maxScale={1.5}
                    centerOnInit={true}
                    limitToBounds={false}
                    wheel={{ step: 0.002 }}
                    panning={{ velocityDisabled: true, excluded: ['nodrag'] }}
                    onZoomStop={(ref: any) => setCanvasTransform({ scale: ref.state.scale, x: ref.state.positionX, y: ref.state.positionY })}
                    onPanningStop={(ref: any) => setCanvasTransform({ scale: ref.state.scale, x: ref.state.positionX, y: ref.state.positionY })}
                    onInit={(ref: any) => setCanvasTransform({ scale: ref.state.scale, x: ref.state.positionX, y: ref.state.positionY })}
                >
                    <TransformComponent wrapperStyle={{ width: '100vw', height: '100vh' }} contentStyle={{ width: '10000px', height: '10000px', position: 'relative' }}>
                        
                        <div 
                            className="absolute inset-0 pointer-events-auto" 
                            onPointerMove={handlePointerMove}
                        >
                            {/* Immersive Background Nítido centrado en el mega-lienzo de 10000px */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                            <div
                                className="w-[1920px] h-[1080px] bg-cover bg-center transition-all duration-[1500ms] ease-in-out rounded-[40px] shadow-[0_0_150px_rgba(0,0,0,0.8)] border border-white/5"
                                style={{ backgroundImage: `url(${currentBg})` }}
                            ></div>
                        </div>

                        {/* Widgets Render */}
                        {widgets.map(w => (
                            <WidgetNode key={w.id} w={w} setWidgets={setWidgets} channelRef={channelRef} />
                        ))}

                        {/* Contenedor de Participantes Absolutos en el Mega Lienzo */}
                        {participants.map((p, index) => {
                            const isMe = p.user_id === currentUser?.id;

                            // Posiciones iniciales numéricas (px) para poder acumular offsets
                            const defaultX = isMe ? 4700 : (4700 + (index * 200));
                            const defaultY = isMe ? 4832 : (4900 + (index * 150));

                            // Fuente de verdad: bubblePositions (sincronizado) o defaults
                            const camKey = `cam-${p.user_id}`;
                            const camPos = bubblePositions[camKey] || { x: defaultX, y: defaultY };

                            const userStreams = remoteStreams[p.user_id] || []
                            const mainStream = userStreams[0]
                            const screenShareStream = userStreams[1]

                            // Posición para screen share
                            const screenKey = `screen-${p.user_id}`;
                            const screenDefaultX = 4800 + (index * 200);
                            const screenDefaultY = 5150 + (index * 150);
                            const screenPos = bubblePositions[screenKey] || { x: screenDefaultX, y: screenDefaultY };

                            return (
                                <div key={p.user_id}>
                                    {/* Tarjeta de Cámara Principal con Mayor Contraste */}
                                    <motion.div
                                        drag
                                        dragMomentum={false}
                                        onPointerDown={e => e.stopPropagation()}
                                        whileDrag={{ scale: 1.05, zIndex: 100, cursor: 'grabbing' }}
                                        initial={{ left: camPos.x, top: camPos.y }}
                                        animate={{ left: camPos.x, top: camPos.y }}
                                        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                                        onDragEnd={(_, info) => {
                                            const newX = camPos.x + info.offset.x;
                                            const newY = camPos.y + info.offset.y;
                                            setBubblePositions(prev => ({ ...prev, [camKey]: { x: newX, y: newY } }));
                                            if (channelRef.current) {
                                                channelRef.current.send({
                                                    type: 'broadcast',
                                                    event: 'bubble_move',
                                                    payload: { bubbleId: camKey, rx: newX / CANVAS_SIZE, ry: newY / CANVAS_SIZE }
                                                })
                                            }
                                        }}
                                        className={`nodrag absolute flex flex-col z-50 overflow-hidden shadow-2xl border-2 border-terroncin-accent group pointer-events-auto cursor-grab bg-black/80 backdrop-blur-xl resize`}
                                        style={{
                                            width: cameraSizes[p.user_id]?.width || 256,
                                            height: cameraSizes[p.user_id]?.height || 192,
                                            minWidth: 150,
                                            minHeight: 150,
                                            borderRadius: isMe ? 32 : 24
                                        }}
                                        onMouseUp={(e) => {
                                            const target = e.currentTarget;
                                            setCameraSizes(prev => ({ ...prev, [p.user_id]: { width: target.offsetWidth, height: target.offsetHeight } }))
                                        }}
                                    >
                                        {isMe ? (
                                            <video
                                                ref={localVideoRef}
                                                autoPlay
                                                playsInline
                                                muted
                                                className="w-full h-full object-cover pointer-events-none transform scale-x-[-1]"
                                            />
                                        ) : (
                                            mainStream ? (
                                                <RemoteVideoPlayer
                                                    stream={mainStream}
                                                    className="w-full h-full object-cover pointer-events-none"
                                                />
                                            ) : (
                                                p.avatar_url ? (
                                                    <div className="w-full h-full bg-cover bg-center pointer-events-none" style={{ backgroundImage: `url(${p.avatar_url})` }}></div>
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-terroncin-primary/30 to-[#333539]/50 flex items-center justify-center text-5xl font-syne font-bold text-white shadow-inner pointer-events-none">
                                                        {p.display_name.charAt(0).toUpperCase()}
                                                    </div>
                                                )
                                            )
                                        )}

                                        <div className={`absolute inset-0 border-[3px] border-terroncin-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[inset_0_0_20px_rgba(74,225,131,0.5)] pointer-events-none`} style={{ borderRadius: isMe ? 32 : 24 }}></div>

                                        <div className={`absolute pointer-events-none ${isMe ? 'bottom-4 left-4 right-4 flex justify-between items-end' : 'bottom-3 left-3'}`}>
                                            <div className="bg-[#1e2024]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 shadow-sm">
                                                <span className="w-2 h-2 rounded-full bg-terroncin-accent animate-pulse shadow-[0_0_8px_rgba(74,225,131,0.8)]"></span>
                                                <span className="font-inter text-xs font-semibold truncate max-w-[120px] text-white">
                                                    {p.display_name} {isMe && <span className="text-gray-400 font-normal ml-1">(Tú)</span>}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Tarjeta Extra: Pantalla Compartida Remota */}
                                    {!isMe && screenShareStream && (
                                        <motion.div
                                            drag
                                            dragMomentum={false}
                                            onPointerDown={e => e.stopPropagation()}
                                            whileDrag={{ scale: 1.05, zIndex: 100, cursor: 'grabbing' }}
                                            initial={{ left: screenPos.x, top: screenPos.y }}
                                            animate={{ left: screenPos.x, top: screenPos.y }}
                                            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                                            onDragEnd={(_, info) => {
                                                const newX = screenPos.x + info.offset.x;
                                                const newY = screenPos.y + info.offset.y;
                                                setBubblePositions(prev => ({ ...prev, [screenKey]: { x: newX, y: newY } }));
                                                if (channelRef.current) {
                                                    channelRef.current.send({
                                                        type: 'broadcast',
                                                        event: 'bubble_move',
                                                        payload: { bubbleId: screenKey, rx: newX / CANVAS_SIZE, ry: newY / CANVAS_SIZE }
                                                    })
                                                }
                                            }}
                                            className="nodrag absolute flex flex-col rounded-[32px] z-50 overflow-hidden shadow-2xl border-2 border-terroncin-accent group pointer-events-auto cursor-grab bg-black/90 resize"
                                            style={{
                                                width: screenSizes[p.user_id]?.width || 800,
                                                height: screenSizes[p.user_id]?.height || 450,
                                                minWidth: 300,
                                                minHeight: 200,
                                            }}
                                            onMouseUp={(e) => {
                                                const target = e.currentTarget;
                                                setScreenSizes(prev => ({ ...prev, [p.user_id]: { width: target.offsetWidth, height: target.offsetHeight } }))
                                            }}
                                        >
                                            <RemoteVideoPlayer
                                                stream={screenShareStream}
                                                className="w-full h-full object-contain pointer-events-none"
                                            />
                                            <div className="absolute top-4 left-4 pointer-events-none bg-[#1e2024]/90 backdrop-blur-md px-4 py-2 rounded-xl border border-terroncin-accent flex items-center gap-2 shadow-lg">
                                                <span className="material-symbols-outlined text-terroncin-accent text-[20px]">screen_share</span>
                                                <span className="font-inter text-sm font-bold text-white">
                                                    Pantalla de {p.display_name}
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            )
                        })}

                        {/* Tarjeta Extra: Mi Pantalla Compartida (Local) */}
                        {localScreenStream && (
                            <motion.div
                                drag
                                dragMomentum={false}
                                onPointerDown={e => e.stopPropagation()}
                                whileDrag={{ scale: 1.05, zIndex: 100, cursor: 'grabbing' }}
                                initial={{ left: 'calc(5000px - 400px)', top: 'calc(5000px - 500px)' }}
                                className="nodrag absolute flex flex-col rounded-[32px] z-50 overflow-hidden shadow-2xl border-2 border-terroncin-primary group pointer-events-auto cursor-grab bg-black/90 resize"
                                style={{
                                    width: screenSizes['local']?.width || 800,
                                    height: screenSizes['local']?.height || 450,
                                    minWidth: 300,
                                    minHeight: 200,
                                }}
                                onMouseUp={(e) => {
                                    const target = e.currentTarget;
                                    setScreenSizes(prev => ({ ...prev, ['local']: { width: target.offsetWidth, height: target.offsetHeight } }))
                                }}
                            >
                                <video
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-contain pointer-events-none"
                                    ref={el => { if (el) el.srcObject = localScreenStream }}
                                />
                                <div className="absolute top-4 left-4 pointer-events-none bg-[#1e2024]/90 backdrop-blur-md px-4 py-2 rounded-xl border border-terroncin-primary flex items-center gap-2 shadow-lg">
                                    <span className="material-symbols-outlined text-terroncin-primary text-[20px]">screen_share</span>
                                    <span className="font-inter text-sm font-bold text-white">
                                        Tu Pantalla Compartida
                                    </span>
                                </div>
                            </motion.div>
                         )}

                        {/* Telepresencia Visual (Cursores) */}
                        {Object.values(cursors).map((cursor) => (
                            <div
                                key={cursor.name}
                                className="absolute top-0 left-0 pointer-events-none z-[100] flex items-start drop-shadow-lg"
                                style={{
                                    transform: `translate(${cursor.x}px, ${cursor.y}px)`,
                                    transition: 'transform 0.05s linear'
                                }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill={cursor.color} xmlns="http://www.w3.org/2000/svg" className="transform -translate-x-1 -translate-y-1" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))' }}>
                                    <path d="M5.5 3.21V20.8C5.5 21.45 6.27 21.78 6.74 21.33L10.96 17.27C11.19 17.05 11.49 16.92 11.82 16.92H18.25C18.89 16.92 19.23 16.14 18.79 15.68L6.87 3.03C6.48 2.62 5.5 2.89 5.5 3.21Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <div 
                                    className="px-2 py-1 rounded-full text-white text-[10px] font-bold whitespace-nowrap ml-1 mt-3"
                                    style={{ backgroundColor: cursor.color, boxShadow: '0px 2px 4px rgba(0,0,0,0.3)' }}
                                >
                                    {cursor.name}
                                </div>
                            </div>
                        ))}
                        </div>
                    </TransformComponent>
                </TransformWrapper>
            </div>

            {/* Header Toggle Button */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-[60]">
                <button
                    onClick={() => setIsHeaderVisible(!isHeaderVisible)}
                    className={`w-16 h-8 bg-[#111317]/80 backdrop-blur-xl border border-white/10 border-t-0 rounded-b-2xl flex items-center justify-center hover:bg-white/10 transition-all duration-300 ${isHeaderVisible ? 'translate-y-16' : 'translate-y-0 shadow-lg'}`}
                >
                    {isHeaderVisible ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                </button>
            </div>

            {/* Glass Header (Colapsable) */}
            <header className={`absolute top-0 inset-x-0 z-50 bg-[#111317]/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.4)] pt-safe pointer-events-auto transition-transform duration-300 ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`}>
                <div className="h-16 px-4 flex items-center justify-between">
                    <div className="w-24 flex items-center">
                        <button
                            onClick={() => router.push('/')}
                            className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors active:scale-90"
                        >
                            <span className="material-symbols-outlined text-[24px]">arrow_back_ios_new</span>
                        </button>
                    </div>
                    <div className="flex-1 flex justify-center">
                        <Logo />
                    </div>
                    <div className="w-auto flex items-center justify-end gap-2">
                        <button
                            onClick={() => setShowInviteModal(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-terroncin-primary/20 hover:bg-terroncin-primary/40 text-terroncin-primary backdrop-blur-md border border-terroncin-primary/30 rounded-full transition-colors font-inter text-xs font-semibold"
                        >
                            <span className="material-symbols-outlined text-[16px]">person_add</span>
                            <span className="hidden sm:inline">Invitar Amigo</span>
                        </button>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href)
                                setAlertMessage("¡Enlace copiado!")
                                setTimeout(() => setAlertMessage(null), 2000)
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 rounded-full transition-colors font-inter text-xs font-semibold"
                        >
                            <span className="material-symbols-outlined text-[16px]">link</span>
                            <span className="hidden sm:inline">Copiar URL</span>
                        </button>
                        <button
                            onClick={() => setShowBgModal(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 rounded-full transition-colors font-inter text-xs font-semibold"
                        >
                            <span className="material-symbols-outlined text-[16px]">wallpaper</span>
                            <span className="hidden sm:inline">Fondo</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Title Overlay Fijo */}
            <div className="absolute top-20 left-6 z-40 pointer-events-auto flex flex-col gap-2">
                <h2 className="text-sm font-semibold text-gray-200 uppercase tracking-widest drop-shadow-md bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/10 flex items-center gap-2 w-fit">
                    {isEditingName ? (
                        <input
                            autoFocus
                            value={editNameValue}
                            onChange={e => setEditNameValue(e.target.value)}
                            onBlur={saveRoomName}
                            onKeyDown={e => e.key === 'Enter' && saveRoomName()}
                            className="bg-transparent border-b border-white/50 text-white outline-none w-32"
                        />
                    ) : (
                        <span onClick={() => { if (roomData?.owner_id === currentUser?.id) setIsEditingName(true) }} className={roomData?.owner_id === currentUser?.id ? "cursor-text hover:text-white transition-colors" : ""}>{roomData?.name}</span>
                    )}
                    <span className="opacity-50">|</span>
                    <button onClick={() => setShowParticipantsList(!showParticipantsList)} className="flex items-center gap-1 hover:text-white transition-colors">
                        <span>{participants.length || 1} conectados</span>
                        <ChevronDown size={14} className={showParticipantsList ? 'rotate-180 transition-transform' : 'transition-transform'} />
                    </button>
                </h2>
                
                {/* Moderation / Participants List */}
                {showParticipantsList && (
                    <div className="bg-[#1e2024]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-2xl w-64 animate-[float_0.3s_ease-out]">
                        <h3 className="font-syne font-bold text-sm text-white/50 uppercase tracking-wider mb-1">Participantes</h3>
                        {participants.map(p => (
                            <div key={p.user_id} className="flex items-center justify-between group/user">
                                <div className="flex items-center gap-2 truncate">
                                    {p.avatar_url ? (
                                        <img src={p.avatar_url} className="w-8 h-8 rounded-full object-cover shrink-0" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-[16px]">person</span></div>
                                    )}
                                    <div className="flex flex-col truncate">
                                        <span className="font-inter text-sm text-white truncate">{p.display_name} {p.user_id === currentUser.id && '(Tú)'}</span>
                                        {p.status_text && <span className="font-inter text-[10px] text-gray-400 italic truncate" title={p.status_text}>{p.status_text}</span>}
                                    </div>
                                </div>
                                
                                {roomData.owner_id === currentUser.id && p.user_id !== currentUser.id && (
                                    <div className="flex items-center gap-1 opacity-0 group-hover/user:opacity-100 transition-opacity">
                                        <button onClick={() => handleKickUser(p.user_id, false)} className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 flex items-center justify-center" title="Expulsar (Kick)">
                                            <span className="material-symbols-outlined text-[14px]">logout</span>
                                        </button>
                                        <button onClick={() => handleKickUser(p.user_id, true)} className="w-7 h-7 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 flex items-center justify-center" title="Bloquear Permanentemente">
                                            <span className="material-symbols-outlined text-[14px]">block</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Controls (Fijos) */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 md:gap-4 p-3 bg-[#1e2024]/70 backdrop-blur-xl rounded-full border border-white/10 shadow-modal pointer-events-auto">

                {/* Audio Button Group */}
                <div className="relative flex items-center bg-[#111317] rounded-full border border-white/5 group">
                    <button onClick={toggleMute} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-[#93000a] hover:bg-red-500 text-white' : 'hover:bg-[#333539] text-white'}`}>
                        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    <button onClick={() => { setShowMicMenu(!showMicMenu); setShowVideoMenu(false); navigator.mediaDevices.enumerateDevices().then(setDevices) }} className="w-6 h-12 flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded-r-full hover:bg-white/10 pr-1">
                        <ChevronUp className="w-4 h-4" />
                    </button>

                    {showMicMenu && (
                        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 bg-[#1e2024] border border-white/10 rounded-2xl shadow-2xl p-3 flex flex-col gap-2 w-56 backdrop-blur-xl">
                            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider ml-1">Micrófono</label>
                            {devices.filter(d => d.kind === 'audioinput').map(d => (
                                <button
                                    key={d.deviceId}
                                    onClick={() => { changeDevice('audio', d.deviceId); setShowMicMenu(false) }}
                                    className={`text-left text-xs p-2 rounded-lg truncate ${selectedAudioDeviceId === d.deviceId ? 'bg-terroncin-primary/20 text-terroncin-primary' : 'text-white hover:bg-white/10'}`}
                                >
                                    {d.label || `Micrófono ${d.deviceId.slice(0, 5)}`}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Video Button Group */}
                <div className="relative flex items-center bg-[#111317] rounded-full border border-white/5 group">
                    <button onClick={toggleVideo} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? 'bg-[#93000a] hover:bg-red-500 text-white' : 'hover:bg-[#333539] text-white'}`}>
                        {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                    </button>
                    <button onClick={() => { setShowVideoMenu(!showVideoMenu); setShowMicMenu(false); navigator.mediaDevices.enumerateDevices().then(setDevices) }} className="w-6 h-12 flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded-r-full hover:bg-white/10 pr-1">
                        <ChevronUp className="w-4 h-4" />
                    </button>

                    {showVideoMenu && (
                        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 bg-[#1e2024] border border-white/10 rounded-2xl shadow-2xl p-3 flex flex-col gap-2 w-56 backdrop-blur-xl">
                            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider ml-1">Cámara</label>
                            {devices.filter(d => d.kind === 'videoinput').map(d => (
                                <button
                                    key={d.deviceId}
                                    onClick={() => { changeDevice('video', d.deviceId); setShowVideoMenu(false) }}
                                    className={`text-left text-xs p-2 rounded-lg truncate ${selectedVideoDeviceId === d.deviceId ? 'bg-terroncin-primary/20 text-terroncin-primary' : 'text-white hover:bg-white/10'}`}
                                >
                                    {d.label || `Cámara ${d.deviceId.slice(0, 5)}`}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="w-px h-8 bg-white/10 mx-1"></div>
                <button onClick={() => router.push('/')} className="w-16 h-12 rounded-full flex items-center justify-center bg-[#93000a] hover:bg-red-500 transition-colors shadow-[0_0_15px_rgba(255,180,171,0.3)]">
                    <PhoneOff className="text-white w-5 h-5" />
                </button>
            </div>

            {/* Widget URL Modal */}
            {widgetPrompt.isOpen && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md pointer-events-auto">
                    <div className="glass-modal p-8 w-full max-w-sm flex flex-col gap-6 relative animate-[float_0.3s_ease-out]">
                        <h3 className="font-syne text-xl font-bold text-white text-center">Añadir {widgetPrompt.type === 'image' ? 'Foto/GIF' : 'Video'}</h3>

                        <div className="flex bg-black/20 rounded-lg p-1">
                            <button onClick={() => setWidgetTab('url')} className={`flex-1 py-1 text-sm font-semibold rounded-md transition-colors ${widgetTab === 'url' ? 'bg-terroncin-primary text-white shadow' : 'text-gray-400'}`}>Por URL</button>
                            <button onClick={() => setWidgetTab('upload')} className={`flex-1 py-1 text-sm font-semibold rounded-md transition-colors ${widgetTab === 'upload' ? 'bg-terroncin-primary text-white shadow' : 'text-gray-400'}`}>Subir de PC</button>
                        </div>

                        {widgetTab === 'url' ? (
                            <form onSubmit={(e) => { e.preventDefault(); spawnWidget(widgetPrompt.type!, widgetUrlInput); }} className="flex flex-col gap-4">
                                <input type="url" placeholder="https://..." value={widgetUrlInput} onChange={(e) => setWidgetUrlInput(e.target.value)} className="w-full input-glass text-sm text-center" required />
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => { setWidgetPrompt({ isOpen: false, type: null }); setWidgetUrlInput(''); }} className="flex-1 btn-secondary py-2">Cancelar</button>
                                    <button type="submit" className="flex-1 btn-primary py-2">Añadir</button>
                                </div>
                            </form>
                        ) : (
                            <div className="flex flex-col gap-4 items-center">
                                <input type="file" accept={widgetPrompt.type === 'image' ? "image/*" : "video/*"} id="file-upload" className="hidden" onChange={async (e) => {
                                    const url = await uploadFile(e)
                                    if (url) spawnWidget(widgetPrompt.type!, url)
                                }} />
                                <label htmlFor="file-upload" className="w-full flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/20 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group">
                                    {isUploading ? (
                                        <span className="material-symbols-outlined text-[32px] text-terroncin-primary animate-spin">refresh</span>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[32px] text-gray-400 group-hover:text-white mb-2">upload</span>
                                            <span className="text-sm font-inter text-gray-400 group-hover:text-white">Seleccionar archivo</span>
                                        </>
                                    )}
                                </label>
                                <button type="button" onClick={() => { setWidgetPrompt({ isOpen: false, type: null }); }} className="w-full btn-secondary py-2">Cancelar</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal de Fondos */}
            {showBgModal && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md pointer-events-auto" onClick={() => setShowBgModal(false)}>
                    <div className="glass-modal p-8 w-full max-w-lg flex flex-col gap-6 relative" onClick={e => e.stopPropagation()}>
                        <div className="text-center">
                            <h3 className="font-syne text-2xl font-bold text-white">Entorno Virtual</h3>
                            <p className="font-inter text-sm text-gray-400 mt-1">Selecciona la vibra de la sala</p>
                        </div>

                        <div className="flex bg-black/20 rounded-lg p-1 mx-auto w-3/4 mb-2">
                            <button onClick={() => setBgTab('preset')} className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${bgTab === 'preset' ? 'bg-terroncin-primary text-white shadow' : 'text-gray-400'}`}>Predeterminados</button>
                            <button onClick={() => setBgTab('upload')} className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${bgTab === 'upload' ? 'bg-terroncin-primary text-white shadow' : 'text-gray-400'}`}>Subir Propio</button>
                        </div>

                        {bgTab === 'preset' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {backgrounds.map((bg) => (
                                    <button key={bg} onClick={() => handleUpdateBackground(bg)} className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${currentBg === bg ? 'border-terroncin-primary shadow-glow-primary scale-105' : 'border-transparent'}`}>
                                        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${bg})` }}></div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4 items-center w-full">
                                <input type="file" accept="image/*" id="bg-upload" className="hidden" onChange={async (e) => {
                                    const url = await uploadFile(e)
                                    if (url) handleUpdateBackground(url)
                                }} />
                                <label htmlFor="bg-upload" className="w-full flex flex-col items-center justify-center h-40 border-2 border-dashed border-white/20 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group">
                                    {isUploading ? (
                                        <span className="material-symbols-outlined text-[32px] text-terroncin-primary animate-spin">refresh</span>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[40px] text-gray-400 group-hover:text-white mb-2">wallpaper</span>
                                            <span className="text-sm font-inter text-gray-400 group-hover:text-white">Subir una imagen</span>
                                        </>
                                    )}
                                </label>
                            </div>
                        )}

                        <button onClick={() => setShowBgModal(false)} className="mt-2 w-full btn-secondary py-3">Volver a la sala</button>
                    </div>
                </div>
            )}

            {/* Global Alerts */}
            {alertMessage && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-terroncin-accent text-black font-bold px-4 py-2 rounded-full shadow-glow-primary animate-[float_0.3s_ease-out]">
                    {alertMessage}
                </div>
            )}

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md pointer-events-auto" onClick={() => setShowInviteModal(false)}>
                    <div className="glass-modal p-6 w-full max-w-sm flex flex-col gap-4 relative animate-[float_0.3s_ease-out]" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h2 className="font-syne text-xl font-bold text-white">Invitar Amigos</h2>
                            <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                            {friendsList.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No tienes amigos añadidos.</p>}
                            {friendsList.map(f => (
                                <div key={f.id} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <img src={f.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + f.display_name} className="w-8 h-8 rounded-full object-cover" />
                                        <span className="font-inter text-sm font-semibold text-white">{f.display_name}</span>
                                    </div>
                                    <button onClick={() => sendInvite(f.id)} className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-lg transition-colors border border-white/10">Invitar</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Panel */}
            <div ref={chatPanelRef} className={`absolute top-0 right-0 h-full w-80 bg-[#1e2024]/95 backdrop-blur-xl border-l border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] z-[80] flex flex-col transition-transform duration-300 ${showChat ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h2 className="font-syne font-bold text-white flex items-center gap-2"><MessageSquare size={18} /> Chat de la Sala</h2>
                    <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 pb-24">
                    {messages.length === 0 && <p className="text-xs text-gray-500 text-center mt-10">Envía el primer mensaje...</p>}
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex flex-col max-w-[85%] ${msg.senderId === currentUser.id ? 'self-end items-end' : 'self-start items-start'}`}>
                            <span className="text-[10px] text-gray-400 font-inter mb-0.5 ml-1">{msg.senderName}</span>
                            <div className={`px-3 py-2 rounded-xl text-sm font-inter break-words ${msg.senderId === currentUser.id ? 'bg-terroncin-primary text-white rounded-tr-sm' : 'bg-white/10 text-gray-200 rounded-tl-sm'}`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-white/10 bg-black/20 absolute bottom-0 left-0 right-0">
                    {showEmojiPicker && (
                        <div className="absolute bottom-full right-4 mb-2 z-[90]">
                            <EmojiPicker onEmojiClick={(e) => setChatInput(prev => prev + e.emoji)} theme={"dark" as any} />
                        </div>
                    )}
                    <form onSubmit={sendMessage} className="flex items-center gap-2">
                        <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-gray-400 hover:text-terroncin-primary transition-colors">
                            <Smile size={20} />
                        </button>
                        <input
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            placeholder="Mensaje..."
                            spellCheck={false}
                            autoComplete="off"
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-terroncin-primary/50"
                        />
                        <button type="submit" className="w-8 h-8 rounded-full bg-terroncin-primary text-white flex items-center justify-center hover:scale-105 transition-transform" disabled={!chatInput.trim()}>
                            <ChevronRight size={16} />
                        </button>
                    </form>
                </div>
            </div>

            {/* FAB Chat */}
            {!showChat && (
                <button
                    onClick={(e) => { e.stopPropagation(); setShowChat(true); setHasUnreadMessages(false); }}
                    className="fixed bottom-6 right-6 z-[90] w-16 h-16 rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-2xl bg-terroncin-primary text-white shadow-glow-primary"
                >
                    <MessageSquare size={28} />
                    {hasUnreadMessages && <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-[#1e2024] animate-pulse"></span>}
                </button>
            )}
        </div>
    )
}
