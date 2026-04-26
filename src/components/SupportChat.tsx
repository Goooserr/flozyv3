'use client'

import React, { useState, useEffect, useRef } from 'react'
import { MessageSquare, Send, X, Loader2, Minus } from 'lucide-react'
import { getMessages, sendMessage, markMessagesAsRead } from '@/lib/actions'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const ADMIN_ID = '76b5136b-e5e6-474c-9469-48c27817bf9c'

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    init()
  }, [])

  // Poll for messages even when closed to show notification dot
  useEffect(() => {
    if (currentUser && currentUser.id !== ADMIN_ID) {
      loadMessages()
      const interval = setInterval(loadMessages, 5000)
      return () => clearInterval(interval)
    }
  }, [currentUser])

  // Mark as read when opening
  useEffect(() => {
    if (isOpen && messages.some(m => !m.is_read && m.sender_id === ADMIN_ID)) {
      markMessagesAsRead(ADMIN_ID).catch(console.error)
      setMessages(prev => prev.map(m => ({ ...m, is_read: true })))
    }
  }, [isOpen, messages])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isOpen])

  async function loadMessages() {
    try {
      const msgs = await getMessages(ADMIN_ID)
      setMessages(msgs)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || sending || !currentUser) return

    setSending(true)
    try {
      await sendMessage(ADMIN_ID, newMessage.trim())
      setNewMessage('')
      await loadMessages()
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  // Don't show for admin, but show for everyone else (even if loading, it will just be inactive)
  if (currentUser?.id === ADMIN_ID) return null

  const hasUnread = messages.some(m => !m.is_read && m.sender_id === ADMIN_ID)

  return (
    <div className={cn(
      "fixed z-[100] transition-all duration-300",
      "bottom-6 right-6 md:bottom-8 md:right-8",
      "max-md:bottom-24"
    )}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 md:w-16 md:h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all relative group"
        >
          <MessageSquare className="w-6 h-6 md:w-7 md:h-7" />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center animate-bounce">
              <span className="w-2 h-2 bg-white rounded-full" />
            </span>
          )}
          <div className="absolute right-full mr-4 px-3 py-1.5 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-white/10">
            Aide & Support
          </div>
        </button>
      ) : (
        <div className="w-[320px] md:w-[380px] h-[500px] bg-card border border-border shadow-2xl rounded-3xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-primary p-4 flex items-center justify-between text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-xs">
                F
              </div>
              <div>
                <p className="text-sm font-bold">Support Flozy</p>
                <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">En ligne</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
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
                const isMe = msg.sender_id === currentUser.id
                return (
                  <div 
                    key={msg.id || i}
                    className={cn(
                      "flex flex-col max-w-[80%] animate-in fade-in duration-300",
                      isMe ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div className={cn(
                      "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                      isMe 
                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                        : "bg-card border border-border rounded-tl-none"
                    )}>
                      {msg.content}
                    </div>
                    <span className="text-[9px] text-muted-foreground mt-1 px-1">
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
            className="p-4 bg-card border-t border-border flex items-center gap-2"
          >
            <input 
              type="text" 
              placeholder="Écrivez votre message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 bg-secondary/50 border border-border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="p-2 bg-primary text-primary-foreground rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-md"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
