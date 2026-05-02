'use client'

import React, { useState, useEffect, useRef } from 'react'
import { MessageSquare, Send, X, Loader2, Minus } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { getMessages, sendMessage, markMessagesAsRead } from '@/lib/actions'
import { ADMIN_ID } from '@/lib/constants'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { useTheme } from './DynamicThemeProvider'

export default function SupportChat() {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const { primaryColor } = useTheme()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setCurrentUser(user)
    }
    init()
  }, [])

  // Poll for messages even when closed to show notification dot
  useEffect(() => {
    loadMessages()
    const interval = setInterval(loadMessages, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (messages.some(m => !m.is_read && m.is_from_admin)) {
      markMessagesAsRead(ADMIN_ID, false).catch(console.error)
      setMessages(prev => prev.map(m => ({ ...m, is_read: true })))
    }
  }, [messages])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function loadMessages() {
    try {
      const msgs = await getMessages(ADMIN_ID, false)
      setMessages(msgs)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      await sendMessage(ADMIN_ID, newMessage.trim(), false)
      setNewMessage('')
      await loadMessages()
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const pathname = usePathname()
  const isAdminPath = pathname.startsWith('/admin') || pathname === '/admin-login'

  // On masque uniquement si on est physiquement dans l'espace admin
  if (isAdminPath) return null

  const hasUnread = messages.some(m => !m.is_read && m.is_from_admin)

  return (
    <div className={cn(
      "bg-zinc-900 border border-white/10 shadow-sm flex flex-col overflow-hidden",
      "w-full h-[600px] rounded-[32px]"
    )}>
      {/* Header */}
      <div className="p-6 flex items-center justify-between text-white shrink-0 border-b border-white/5 bg-zinc-800/50">
        <div className="flex items-center gap-4">
          <div 
            style={{ backgroundColor: primaryColor }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-lg rotate-3"
          >
            F
          </div>
          <div>
            <p className="text-base md:text-lg font-black tracking-tight">Support Flozy</p>
            <p className="text-[10px] opacity-90 uppercase tracking-[0.2em] font-black flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              En ligne
            </p>
          </div>
        </div>
      </div>

          {/* Messages List */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/10"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold">Besoin d'aide ?</p>
                <p className="text-xs text-muted-foreground">Posez votre question ici, Florian vous répondra dès que possible.</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                // Identification robuste via le flag is_from_admin ajouté par le serveur
                const isMe = !msg.is_from_admin
                return (
                  <div 
                    key={msg.id || i}
                    className={cn(
                      "flex flex-col max-w-[85%] animate-in fade-in duration-300",
                      isMe ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1 px-1">
                      {isMe ? "Vous" : "Support Flozy"}
                    </span>
                    <div 
                      style={{ backgroundColor: isMe ? primaryColor : '#f4f4f5' }}
                      className={cn(
                        "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                        isMe 
                          ? "text-white rounded-tr-none"
                          : "text-zinc-900 border border-zinc-200 rounded-tl-none"
                      )}
                    >
                      {msg.content}
                    </div>
                    <span className={cn(
                      "text-[9px] text-muted-foreground mt-1 px-1",
                      isMe ? "text-right" : "text-left"
                    )}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer Input */}
          <form 
            onSubmit={handleSend}
            className="p-4 md:p-6 bg-card border-t border-border flex items-center gap-2 max-md:pb-12"
          >
            <input 
              type="text" 
              placeholder="Écrivez votre message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 bg-secondary/50 border border-border rounded-2xl px-4 py-3 text-base md:text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim() || sending}
              style={{ backgroundColor: primaryColor }}
              className="w-12 h-12 flex items-center justify-center text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
    </div>
  )
}
