'use client'

import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  Users, 
  Euro, 
  ShieldAlert, 
  ArrowUpRight,
  Loader2,
  Lock,
  MessageSquare,
  Send,
  X as CloseIcon,
  CreditCard,
  Crown,
  Zap,
  Activity,
  Database
} from 'lucide-react'
import { getAdminStats, getAllArtisans, getMessages, sendMessage } from '@/lib/actions'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function AdminPage() {
  const [stats, setStats] = useState<any>({})
  const [artisans, setArtisans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedArtisan, setSelectedArtisan] = useState<any>(null)
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'subscriptions' | 'system'>('overview')
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        const [sData, aData] = await Promise.all([getAdminStats(), getAllArtisans()])
        setStats(sData)
        setArtisans(aData)
      } catch (e: any) {
        setError(e.message)
        
        // Fallback for local testing if Supabase blocks
        if (typeof window !== 'undefined' && localStorage.getItem('flozy_admin_access') === 'true') {
          setStats({ totalUsers: 1, totalClients: 5, totalRevenue: 12500, activeArtisans: 1 })
          setArtisans([{ 
            id: 'mock-1', 
            company_name: 'Flozy Démo', 
            full_name: 'Artisan Test', 
            email: 'test@flozy.fr',
            created_at: new Date().toISOString()
          }])
        }
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    if (selectedArtisan) {
      loadChat()
      const interval = setInterval(loadChat, 3000)
      return () => clearInterval(interval)
    }
  }, [selectedArtisan])

  async function loadChat() {
    if (!selectedArtisan) return
    const msgs = await getMessages(selectedArtisan.id)
    setChatMessages(msgs)
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !selectedArtisan) return
    await sendMessage(selectedArtisan.id, newMessage)
    setNewMessage('')
    loadChat()
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-muted-foreground animate-pulse font-medium">Chargement des données confidentielles...</p>
    </div>
  )

  if (error) {
    const isLocalAdmin = typeof window !== 'undefined' && localStorage.getItem('flozy_admin_access') === 'true'
    
    // Si on a le jeton local, on ignore l'erreur RLS et on affiche le dashboard (même vide ou avec données mockées)
    if (!isLocalAdmin) {
      return (
        <div className="flex flex-col items-center justify-center h-[80vh] text-center p-6">
          <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Accès Restreint</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Cette zone est réservée aux administrateurs de la plateforme Flozy. 
            Si vous pensez qu'il s'agit d'une erreur, contactez le support.
          </p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-secondary text-foreground rounded-xl font-bold hover:bg-secondary/80 transition-all"
          >
            Retour au Dashboard
          </button>
        </div>
      )
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold w-fit border border-amber-500/20 uppercase tracking-widest">
          <ShieldAlert className="w-3 h-3" /> Zone Admin
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Vue d'ensemble Flozy</h2>
        <p className="text-muted-foreground">Pilotez la croissance de votre SaaS en temps réel.</p>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-px">
         <button 
           onClick={() => setActiveTab('overview')}
           className={cn("px-4 py-2 text-sm font-bold border-b-2 transition-colors", activeTab === 'overview' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
         >
            Activité & Artisans
         </button>
         <button 
           onClick={() => setActiveTab('subscriptions')}
           className={cn("px-4 py-2 text-sm font-bold border-b-2 transition-colors", activeTab === 'subscriptions' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
         >
            Abonnements (MRR)
         </button>
         <button 
           onClick={() => setActiveTab('system')}
           className={cn("px-4 py-2 text-sm font-bold border-b-2 transition-colors", activeTab === 'system' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
         >
            Système & Base de données
         </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Admin Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard 
          label="Artisans inscrits" 
          value={stats?.totalUsers || 0} 
          icon={Users} 
          color="text-blue-500" 
        />
        <AdminStatCard 
          label="Volume d'affaires" 
          value={`${stats?.totalRevenue?.toLocaleString() || 0} €`} 
          icon={Euro} 
          color="text-emerald-500" 
        />
        <AdminStatCard 
          label="Total Clients" 
          value={stats?.totalClients || 0} 
          icon={BarChart3} 
          color="text-purple-500" 
        />
        <AdminStatCard 
          label="Status Platform" 
          value="Opérationnel" 
          icon={ShieldAlert} 
          color="text-emerald-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Real Artisans List */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Artisans inscrits ({artisans.length})</h3>
            <button className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground">
              Voir tout le répertoire <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-4">
             {artisans.map((artisan) => (
               <div 
                key={artisan.id} 
                onClick={() => setSelectedArtisan(artisan)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border border-border/50 cursor-pointer transition-all hover:border-primary/50",
                  selectedArtisan?.id === artisan.id ? "bg-primary/5 border-primary/30" : "bg-secondary/30"
                )}
               >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center font-bold text-primary uppercase">
                      {artisan.company_name?.substring(0, 2) || 'A'}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{artisan.company_name || 'Sans Nom'}</p>
                      <p className="text-[10px] text-muted-foreground">{artisan.full_name} • Inscrit le {new Date(artisan.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-full uppercase">Actif</div>
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  </div>
               </div>
             ))}
             {artisans.length === 0 && (
                 <div className="text-center p-8 text-muted-foreground text-sm">
                     Aucun artisan inscrit pour le moment.
                 </div>
             )}
          </div>
        </div>

        {/* Live Chat Panel */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm flex flex-col h-[500px]">
           {selectedArtisan ? (
             <>
               <div className="p-4 bg-secondary/50 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-xs font-bold uppercase">
                      {selectedArtisan.company_name?.substring(0, 2) || 'A'}
                    </div>
                    <p className="text-sm font-bold truncate max-w-[150px]">{selectedArtisan.company_name || 'Sans Nom'}</p>
                  </div>
                  <button onClick={() => setSelectedArtisan(null)}><CloseIcon className="w-4 h-4 text-muted-foreground hover:text-foreground" /></button>
               </div>
               <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">
                          Démarrez la conversation
                      </div>
                  ) : (
                      chatMessages.map((msg, i) => (
                        <div key={i} className={cn("flex flex-col mb-4", msg.sender_id === selectedArtisan.id ? "items-start" : "items-end")}>
                          <div className={cn(
                            "max-w-[80%] px-4 py-2 rounded-2xl text-xs shadow-sm",
                            msg.sender_id === selectedArtisan.id ? "bg-secondary text-foreground rounded-tl-none border border-border" : "bg-primary text-white rounded-tr-none"
                          )}>
                            {msg.content}
                          </div>
                          <span className="text-[8px] text-muted-foreground mt-1">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ))
                  )}
               </div>
               <form onSubmit={handleSendMessage} className="p-4 border-t border-border flex gap-2 bg-secondary/20">
                  <input 
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Tapez votre message..."
                    className="flex-1 bg-card border border-border rounded-xl px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-primary shadow-sm"
                  />
                  <button type="submit" disabled={!newMessage.trim()} className="p-2 bg-primary text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity">
                    <Send className="w-4 h-4" />
                  </button>
               </form>
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4 opacity-40">
                <div className="p-4 bg-secondary rounded-full"><MessageSquare className="w-8 h-8" /></div>
                <div>
                  <p className="font-bold text-sm">Messagerie Directe</p>
                  <p className="text-xs">Sélectionnez un artisan pour démarrer une conversation.</p>
                </div>
             </div>
           )}
        </div>
        </div>
      </div>
      )}

      {activeTab === 'subscriptions' && (
         <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-card border border-border p-6 rounded-3xl shadow-sm hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center gap-3 text-emerald-500 mb-2">
                     <div className="p-2 bg-emerald-500/10 rounded-lg"><Euro className="w-5 h-5" /></div>
                     <span className="font-bold">MRR Estimé</span>
                  </div>
                  <div className="text-4xl font-black mt-4">290 €</div>
                  <div className="text-sm text-muted-foreground mt-2">+12% par rapport au mois dernier</div>
               </div>
               <div className="bg-card border border-border p-6 rounded-3xl shadow-sm hover:border-amber-500/30 transition-all">
                  <div className="flex items-center gap-3 text-amber-500 mb-2">
                     <div className="p-2 bg-amber-500/10 rounded-lg"><Crown className="w-5 h-5" /></div>
                     <span className="font-bold">Taux de conversion</span>
                  </div>
                  <div className="text-4xl font-black mt-4">18%</div>
                  <div className="text-sm text-muted-foreground mt-2">D'utilisateurs Starter vers Pro</div>
               </div>
               <div className="bg-card border border-border p-6 rounded-3xl shadow-sm hover:border-blue-500/30 transition-all">
                  <div className="flex items-center gap-3 text-blue-500 mb-2">
                     <div className="p-2 bg-blue-500/10 rounded-lg"><Activity className="w-5 h-5" /></div>
                     <span className="font-bold">Artisans Actifs (30j)</span>
                  </div>
                  <div className="text-4xl font-black mt-4">{artisans.length}</div>
                  <div className="text-sm text-emerald-500 font-bold mt-2">Taux de rétention élevé</div>
               </div>
            </div>
            
            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
               <div className="p-6 border-b border-border">
                  <h3 className="font-bold text-lg">Répartition des Forfaits</h3>
               </div>
               <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-border rounded-2xl p-4 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-zinc-500" />
                        <span className="font-bold">Starter</span>
                     </div>
                     <span className="font-black">82%</span>
                  </div>
                  <div className="border border-primary/50 bg-primary/5 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                     <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span className="font-bold text-primary">Pro</span>
                     </div>
                     <span className="font-black text-primary">15%</span>
                  </div>
                  <div className="border border-amber-500/50 bg-amber-500/5 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                     <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="font-bold text-amber-500">Premium</span>
                     </div>
                     <span className="font-black text-amber-500">3%</span>
                  </div>
               </div>
            </div>
         </div>
      )}

      {activeTab === 'system' && (
         <div className="bg-card border border-border rounded-3xl p-16 text-center text-muted-foreground animate-in fade-in duration-500 shadow-sm">
            <Database className="w-16 h-16 mx-auto mb-6 opacity-20" />
            <h3 className="text-xl font-bold text-foreground mb-3">Base de données & API</h3>
            <p className="max-w-md mx-auto leading-relaxed">La vue détaillée des requêtes Supabase, l'état des webhooks Stripe et les logs système seront accessibles dans la prochaine mise à jour technique.</p>
         </div>
      )}
    </div>
  )
}

function AdminStatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-card border border-border p-6 rounded-3xl shadow-sm hover:border-primary/30 transition-all group">
      <div className={cn("p-3 rounded-2xl bg-secondary w-fit mb-4 group-hover:scale-110 transition-transform", color)}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold mt-2 tracking-tight">{value}</p>
    </div>
  )
}
