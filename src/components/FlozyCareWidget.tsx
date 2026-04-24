'use client'

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useTheme } from './DynamicThemeProvider';
import { cn } from '@/lib/utils';

export function FlozyCareWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [adminId, setAdminId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();
  const { primaryColor } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Fetch the first admin
      const { data: admin } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_admin', true)
        .limit(1)
        .single();
      
      if (admin) {
        setAdminId(admin.id);
        fetchMessages(user.id, admin.id);
      }
    }
    init();
  }, []);

  useEffect(() => {
    // Auto-scroll
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  async function fetchMessages(uId: string, aId: string) {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${uId},recipient_id.eq.${aId}),and(sender_id.eq.${aId},recipient_id.eq.${uId})`)
      .order('created_at', { ascending: true });
    
    if (data) setMessages(data);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !userId || !adminId) return;

    const content = newMessage;
    setNewMessage('');
    
    // Optimistic UI update
    setMessages(prev => [...prev, {
      sender_id: userId,
      recipient_id: adminId,
      content,
      created_at: new Date().toISOString()
    }]);

    await supabase.from('messages').insert({
      sender_id: userId,
      recipient_id: adminId,
      content
    });

    fetchMessages(userId, adminId);
  }

  if (!userId || !adminId) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-card border border-border shadow-2xl rounded-2xl w-80 mb-4 overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300 origin-bottom-right h-[400px]">
          {/* Header */}
          <div className="p-4 bg-zinc-900 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm text-white">Support Flozy</p>
                <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> En ligne
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-zinc-950/50 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-2 opacity-50">
                <MessageCircle className="w-8 h-8 text-zinc-500" />
                <p className="text-xs text-zinc-400">Posez-nous vos questions, nous vous répondons rapidement.</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMe = msg.sender_id === userId;
                return (
                  <div key={i} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                    <div 
                      className={cn(
                        "max-w-[85%] px-3 py-2 rounded-2xl text-xs",
                        isMe 
                          ? "text-white rounded-tr-none shadow-md" 
                          : "bg-zinc-800 text-zinc-200 rounded-tl-none border border-white/5"
                      )}
                      style={isMe ? { backgroundColor: primaryColor || '#10b981' } : {}}
                    >
                      {msg.content}
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-card border-t border-border flex items-center gap-2">
            <input 
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Besoin d'aide ?"
              className="flex-1 bg-secondary border border-border/50 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary/50 transition-colors"
            />
            <button 
              type="submit" 
              disabled={!newMessage.trim()}
              className="p-2 rounded-xl text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
              style={{ backgroundColor: primaryColor || '#10b981' }}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 text-white border border-white/10",
          isOpen ? "bg-zinc-800 rotate-90" : ""
        )}
        style={!isOpen ? { backgroundColor: primaryColor || '#10b981' } : {}}
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>
    </div>
  );
}
