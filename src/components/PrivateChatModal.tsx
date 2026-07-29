'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Send, Smile } from 'lucide-react'
import EmojiPicker from 'emoji-picker-react'
import { nanoid } from 'nanoid'

interface PrivateChatModalProps {
  friendId: string
  friendName: string
  friendAvatar?: string
  currentUserId: string
  onClose: () => void
}

type PrivateMessage = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
}

export default function PrivateChatModal({ friendId, friendName, friendAvatar, currentUserId, onClose }: PrivateChatModalProps) {
  const [messages, setMessages] = useState<PrivateMessage[]>([])
  const [inputMsg, setInputMsg] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const supabase = createClient()

  useEffect(() => {
    // 1. Fetch history
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('private_messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true })

      if (data && !error) {
        setMessages(data)
      }
    }

    fetchHistory()

    // 2. Subscribe to realtime
    const channel = supabase.channel(`dms:${currentUserId}:${friendId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'private_messages',
        filter: `receiver_id=eq.${currentUserId}`, // when I receive
      }, (payload) => {
        if (payload.new.sender_id === friendId) {
          setMessages(prev => [...prev, payload.new as PrivateMessage])
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'private_messages',
        filter: `sender_id=eq.${currentUserId}`, // when I send (sync across my devices)
      }, (payload) => {
        if (payload.new.receiver_id === friendId) {
          // Evitar duplicados si lo acabamos de insertar localmente
          setMessages(prev => {
              if (prev.find(m => m.id === payload.new.id)) return prev;
              return [...prev, payload.new as PrivateMessage]
          })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, friendId, supabase])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMsg.trim()) return

    const tempId = nanoid()
    const newMsg: PrivateMessage = {
      id: tempId,
      sender_id: currentUserId,
      receiver_id: friendId,
      content: inputMsg.trim(),
      created_at: new Date().toISOString()
    }

    // Optimistic UI update
    setMessages(prev => [...prev, newMsg])
    setInputMsg('')
    setShowEmojiPicker(false)

    // Insert to DB
    const { error } = await supabase.from('private_messages').insert({
      sender_id: currentUserId,
      receiver_id: friendId,
      content: newMsg.content
    })

    if (error) {
      console.error("Error enviando mensaje", error)
      // En caso de error, podríamos quitar el mensaje optimista, pero por simplicidad lo dejamos y logueamos
    }
  }

  return (
    <div className="absolute inset-0 z-[150] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md pointer-events-auto" onClick={onClose}>
      <div className="glass-modal p-0 w-full max-w-md h-[550px] flex flex-col relative overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <img src={friendAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${friendName}`} className="w-10 h-10 rounded-full object-cover shadow-md" alt="Avatar" />
            <div className="flex flex-col">
              <span className="font-syne font-bold text-white text-lg">{friendName}</span>
              <span className="font-inter text-[10px] text-terroncin-primary tracking-widest uppercase">Chat Privado</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1"><X size={20} /></button>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.length === 0 && (
             <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                 <span className="material-symbols-outlined text-[48px] mb-2">forum</span>
                 <p className="text-sm font-inter">Envía el primer mensaje a {friendName}</p>
             </div>
          )}
          {messages.map(msg => {
            const isMe = msg.sender_id === currentUserId
            return (
              <div key={msg.id} className={`flex max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
                <div className={`px-4 py-2 rounded-2xl text-sm font-inter break-words shadow-sm ${isMe ? 'bg-terroncin-primary text-white rounded-tr-sm' : 'bg-white/10 text-gray-200 rounded-tl-sm border border-white/5'}`}>
                  {msg.content}
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-black/40 border-t border-white/10 relative">
          {showEmojiPicker && (
            <div className="absolute bottom-full right-4 mb-2 z-[160] shadow-2xl">
                <EmojiPicker onEmojiClick={(e) => setInputMsg(prev => prev + e.emoji)} theme={"dark" as any} />
            </div>
          )}
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-gray-400 hover:text-terroncin-primary transition-colors p-2">
                <Smile size={20} />
            </button>
            <input 
              autoFocus
              value={inputMsg}
              onChange={e => setInputMsg(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-terroncin-primary/50 transition-colors"
            />
            <button type="submit" disabled={!inputMsg.trim()} className="w-10 h-10 rounded-full bg-terroncin-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_15px_rgba(255,107,53,0.3)]">
                <Send size={16} className="ml-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
