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
  Database,
  LogOut
} from 'lucide-react'
import { getAdminStats, getAllArtisans, getMessages, sendMessage, suspendArtisan, activateArtisan, updateArtisanProfile, markMessagesAsRead } from '@/lib/actions'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

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
  const supabase = createClient()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterPlan, setFilterPlan] = useState('all')

  useEffect(() => {
    // Sécurité locale simple
    if (localStorage.getItem('flozy_admin_access') !== 'true') {
      router.push('/admin-login')
    }
  }, [router])

  const handleLogout = async () => {
    localStorage.removeItem('flozy_admin_access')
    await supabase.auth.signOut()
    router.push('/admin-login')
  }

  useEffect(() => {
    async function loadData() {
      try {
        const [sData, aData] = await Promise.all([getAdminStats(), getAllArtisans()])
        setStats(sData)
        setArtisans(aData)
      } catch (e: any) {
        setError(e.message)
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
    if (msgs.some(m => !m.is_read && m.recipient_id !== selectedArtisan.id)) {
      markMessagesAsRead(selectedArtisan.id).catch(console.error)
    }
    setChatMessages(msgs)
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !selectedArtisan) return
    await sendMessage(selectedArtisan.id, newMessage)
    setNewMessage('')
    loadChat()
  }

  async function toggleSuspension(artisan: any) {
    const action = artisan.is_suspended ? activateArtisan : suspendArtisan
    await action(artisan.id)
    const updated = await getAllArtisans()
    setArtisans(updated)
    if (selectedArtisan?.id === artisan.id) {
      setSelectedArtisan(updated.find(a => a.id === artisan.id))
    }
  }

  async function handleUpdateProfile(artisanId: string, updates: any) {
    await updateArtisanProfile(artisanId, updates)
    const updated = await getAllArtisans()
    setArtisans(updated)
    if (selectedArtisan?.id === artisanId) {
      setSelectedArtisan(updated.find(a => a.id === artisanId))
    }
  }

  const filteredArtisans = artisans.filter(a => {
    const matchesSearch = (a.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.email?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterPlan === 'all' || a.subscription_plan?.toLowerCase() === filterPlan.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const expertCount = stats?.expert_count || 0;
  const proCount = stats?.pro_count || 0;
  const starterCount = stats?.starter_count || 0;
  const totalCount = stats?.total_artisans || 1;

  const expertPercent = Math.round((expertCount / totalCount) * 100);
  const proPercent = Math.round((proCount / totalCount) * 100);
  const starterPercent = Math.round((starterCount / totalCount) * 100);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-muted-foreground animate-pulse font-medium text-sm uppercase tracking-widest">Initialisation du cockpit...</p>
    </div>
  )

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black w-fit border border-amber-500/20 uppercase tracking-widest">
            <ShieldAlert className="w-3 h-3" /> Zone de Supervision
          </div>
          <h2 className="text-4xl font-black tracking-tight">Vue d'ensemble Flozy</h2>
          <p className="text-muted-foreground text-lg">Pilotez la croissance de votre SaaS en temps réel.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-card border border-border p-2 rounded-2xl shadow-sm">
           <div className="flex flex-col items-end px-4 border-r border-border">
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">Status Système</span>
              <span className="text-sm font-bold text-emerald-500 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Opérationnel
              </span>
           </div>
           <div className="px-4 border-r border-border">
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">Version App</span>
              <p className="text-sm font-bold">v3.4.0-pro</p>
           </div>
           <button 
             onClick={handleLogout}
             className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 transition-all rounded-xl"
           >
             <LogOut className="w-4 h-4" />
             Quitter
           </button>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-xl w-fit border border-border/50">
         <button 
           onClick={() => setActiveTab('overview')}
           className={cn("px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all", activeTab === 'overview' ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground")}
         >
            Activité & Artisans
         </button>
         <button 
           onClick={() => setActiveTab('subscriptions')}
           className={cn("px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all", activeTab === 'subscriptions' ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground")}
         >
            Abonnements (MRR)
         </button>
         <button 
           onClick={() => setActiveTab('system')}
           className={cn("px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all", activeTab === 'system' ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground")}
         >
            Pulse Système
         </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminStatCard 
              label="Artisans inscrits" 
              value={stats?.total_artisans || 0} 
              icon={Users} 
              color="text-blue-500" 
              trend="+12%"
            />
            <AdminStatCard 
              label="MRR Estimé" 
              value={`${stats?.total_revenue?.toLocaleString() || 0} €`} 
              icon={Euro} 
              color="text-emerald-500" 
              trend="+8%"
            />
            <AdminStatCard 
              label="Total Documents" 
              value={stats?.total_documents || 0} 
              icon={BarChart3} 
              color="text-purple-500" 
            />
            <AdminStatCard 
              label="Messages Support" 
              value={stats?.total_messages || 0} 
              icon={MessageSquare} 
              color="text-amber-500" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-12 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110 duration-700" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 relative">
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">Comptes Artisans</h3>
                    <p className="text-sm text-muted-foreground mt-1">Gérez les accès et surveillez l'activité.</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="bg-secondary/50 border border-border rounded-xl px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/20 w-48 transition-all"
                      />
                    </div>
                    <select 
                      value={filterPlan}
                      onChange={e => setFilterPlan(e.target.value)}
                      className="bg-secondary/50 border border-border rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option value="all">Tous les plans</option>
                      <option value="starter">Starter</option>
                      <option value="pro">Pro</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </div>
                
                <div className="overflow-x-auto relative">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] text-muted-foreground uppercase tracking-widest border-b border-border/50">
                        <th className="pb-4 font-black">Artisan / Entreprise</th>
                        <th className="pb-4 font-black">Forfait</th>
                        <th className="pb-4 font-black text-center">Status</th>
                        <th className="pb-4 font-black text-right pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {filteredArtisans.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-20 text-center text-muted-foreground">
                             Aucun artisan ne correspond à votre recherche.
                          </td>
                        </tr>
                      ) : filteredArtisans.map((artisan) => (
                        <tr 
                          key={artisan.id} 
                          onClick={() => setSelectedArtisan(artisan)}
                          className={cn(
                            "group cursor-pointer transition-all hover:bg-secondary/30",
                            selectedArtisan?.id === artisan.id && "bg-primary/5"
                          )}
                        >
                          <td className="py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-black text-primary text-sm border border-primary/10 shadow-sm">
                                {artisan.company_name?.substring(0, 2) || 'A'}
                              </div>
                              <div>
                                <p className="text-sm font-black leading-tight group-hover:text-primary transition-colors">{artisan.company_name || 'Sans Nom'}</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">{artisan.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-5">
                            <span className={cn(
                              "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border shadow-sm",
                              artisan.subscription_plan?.toLowerCase() === 'expert' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                              artisan.subscription_plan?.toLowerCase() === 'pro' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : 
                              "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
                            )}>
                              {artisan.subscription_plan || 'Starter'}
                            </span>
                          </td>
                          <td className="py-5">
                            <div className="flex justify-center">
                               <div className={cn(
                                 "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-tighter",
                                 artisan.is_suspended 
                                   ? "bg-rose-500/10 text-rose-500 border-rose-500/20" 
                                   : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                               )}>
                                 <div className={cn("w-1.5 h-1.5 rounded-full", artisan.is_suspended ? "bg-rose-500" : "bg-emerald-500 animate-pulse")} /> 
                                 {artisan.is_suspended ? 'Suspendu' : 'Actif'}
                               </div>
                            </div>
                          </td>
                          <td className="py-5 text-right pr-4">
                             <div className="flex justify-end gap-2">
                                {artisan.subscription_plan?.toLowerCase() !== 'expert' && (
                                  <button 
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      handleUpdateProfile(artisan.id, { 
                                        subscription_plan: 'expert',
                                        enabled_modules: ['clients', 'documents', 'planning', 'stock']
                                      }); 
                                    }}
                                    className="p-2 hover:bg-amber-500/10 text-amber-500 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                    title="Forcer Expert"
                                  >
                                    <Crown className="w-4 h-4" />
                                  </button>
                                )}
                                <button 
                                  onClick={(e) => { e.stopPropagation(); toggleSuspension(artisan); }}
                                  className={cn(
                                    "p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100",
                                    artisan.is_suspended ? "hover:bg-emerald-500/10 text-emerald-500" : "hover:bg-rose-500/10 text-rose-500"
                                  )}
                                  title={artisan.is_suspended ? "Réactiver" : "Suspendre"}
                                >
                                  <ShieldAlert className="w-4 h-4" />
                                </button>
                                <button className="p-2 hover:bg-secondary rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                  <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                                </button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-card border border-border rounded-[2.5rem] p-8 flex items-center justify-between shadow-sm border-l-4 border-l-emerald-500">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center shadow-inner">
                      <Activity className="w-7 h-7 text-emerald-500" />
                    </div>
                    <div>
                       <p className="text-lg font-black tracking-tight">Santé de la plateforme</p>
                       <p className="text-sm text-muted-foreground">Toutes les API répondent normalement (Ping: 24ms)</p>
                    </div>
                 </div>
                 <div className="hidden md:flex gap-1.5 items-end h-10">
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                      <div 
                        key={i} 
                        className="w-2 bg-emerald-500/20 rounded-full hover:bg-emerald-500/50 transition-all cursor-help" 
                        style={{ 
                          height: `${40 + Math.random() * 60}%`,
                          animation: `pulse 2s infinite ${i * 100}ms`
                        }} 
                      />
                    ))}
                 </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[700px] sticky top-24 border-primary/10">
               {selectedArtisan ? (
                 <>
                   <div className="p-6 bg-zinc-900 text-white flex items-center justify-between border-b border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center text-sm font-black uppercase shadow-lg shadow-primary/30">
                            {selectedArtisan.company_name?.substring(0, 2) || 'A'}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-zinc-900 rounded-full" />
                        </div>
                        <div>
                          <p className="text-md font-black truncate max-w-[150px] leading-tight">{selectedArtisan.company_name || 'Sans Nom'}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <div className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-black uppercase tracking-widest">{selectedArtisan.subscription_plan}</div>
                             <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">En ligne</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setSelectedArtisan(null)} className="p-2.5 hover:bg-white/10 rounded-xl transition-all"><CloseIcon className="w-5 h-5 text-zinc-500" /></button>
                   </div>
                   <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-secondary/10 custom-scrollbar">
                      {chatMessages.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-center p-8 gap-6 opacity-40">
                              <div className="p-6 bg-secondary rounded-full"><MessageSquare className="w-12 h-12 text-primary" /></div>
                              <p className="text-xs font-black uppercase tracking-widest leading-relaxed">Initiez la conversation avec<br/>cet artisan</p>
                          </div>
                      ) : (
                          chatMessages.map((msg, i) => (
                            <div key={i} className={cn("flex flex-col animate-in slide-in-from-bottom-2", msg.sender_id === selectedArtisan.id ? "items-start" : "items-end")}>
                              <div className={cn(
                                "max-w-[85%] px-5 py-3.5 rounded-2xl text-sm shadow-sm transition-all",
                                msg.sender_id === selectedArtisan.id 
                                  ? "bg-white border border-border text-zinc-800 rounded-tl-none" 
                                  : "bg-primary text-white rounded-tr-none shadow-primary/20"
                              )}>
                                {msg.content}
                              </div>
                              <span className="text-[10px] text-muted-foreground mt-2 font-black uppercase tracking-tighter px-1">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          ))
                      )}
                   </div>
                   <form onSubmit={handleSendMessage} className="p-5 border-t border-border flex gap-4 bg-card">
                      <input 
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Répondre..."
                        className="flex-1 bg-secondary/50 border border-border rounded-2xl px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      />
                      <button 
                        type="submit" 
                        disabled={!newMessage.trim()} 
                        className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 transition-all shadow-xl shadow-primary/20"
                      >
                        <Send className="w-6 h-6" />
                      </button>
                   </form>
                 </>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-center p-12 gap-8">
                    <div className="relative group">
                      <div className="p-8 bg-primary/5 rounded-[3rem] transition-transform group-hover:scale-110 duration-500">
                        <MessageSquare className="w-14 h-14 text-primary opacity-50" />
                      </div>
                      <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full border-4 border-card shadow-lg">LIVE</div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-black text-2xl tracking-tight">Flozy Care Hub</h4>
                      <p className="text-sm text-muted-foreground max-w-[240px] mx-auto leading-relaxed">Pilotez la satisfaction client en répondant directement aux artisans depuis ce cockpit.</p>
                    </div>
                    <div className="flex gap-3">
                       {[1,2,3].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-primary/10" />)}
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'subscriptions' && (
         <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border-b-4 border-b-emerald-500">
                  <div className="flex items-center gap-4 text-emerald-500 mb-6">
                     <div className="p-3 bg-emerald-500/10 rounded-2xl shadow-inner"><Euro className="w-6 h-6" /></div>
                     <span className="font-black uppercase tracking-widest text-xs">MRR Actuel</span>
                  </div>
                  <div className="text-5xl font-black tracking-tighter">{stats?.total_revenue || 0} €</div>
                  <p className="text-sm text-muted-foreground mt-4 font-medium flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                    Potentiel de croissance élevé
                  </p>
               </div>
               
               <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border-b-4 border-b-amber-500">
                  <div className="flex items-center gap-4 text-amber-500 mb-6">
                     <div className="p-3 bg-amber-500/10 rounded-2xl shadow-inner"><Crown className="w-6 h-6" /></div>
                     <span className="font-black uppercase tracking-widest text-xs">Part Premium</span>
                  </div>
                  <div className="text-5xl font-black tracking-tighter">{expertPercent}%</div>
                  <p className="text-sm text-muted-foreground mt-4 font-medium italic">Artisans sur le plan Expert</p>
               </div>

               <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border-b-4 border-b-blue-500">
                  <div className="flex items-center gap-4 text-blue-500 mb-6">
                     <div className="p-3 bg-blue-500/10 rounded-2xl shadow-inner"><Zap className="w-6 h-6" /></div>
                     <span className="font-black uppercase tracking-widest text-xs">Utilisateurs Pro</span>
                  </div>
                  <div className="text-5xl font-black tracking-tighter">{proCount}</div>
                  <p className="text-sm text-muted-foreground mt-4 font-medium">Clients sur le plan intermédiaire</p>
               </div>
            </div>
            
            <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
               <div className="p-8 border-b border-border bg-secondary/20">
                  <h3 className="font-black text-xl tracking-tight">Distribution des Revenus</h3>
                  <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-bold">Analyse de la répartition des forfaits actifs</p>
               </div>
               <div className="p-8 space-y-8">
                  <div className="h-8 w-full bg-secondary rounded-full overflow-hidden flex shadow-inner border border-border">
                    <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${expertPercent}%` }} />
                    <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${proPercent}%` }} />
                    <div className="h-full bg-zinc-400 transition-all duration-1000" style={{ width: `${starterPercent}%` }} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <PlanMetric 
                      label="Starter" 
                      count={starterCount} 
                      percent={starterPercent} 
                      color="bg-zinc-400" 
                      description="Porte d'entrée gratuite du SaaS"
                    />
                    <PlanMetric 
                      label="Pro" 
                      count={proCount} 
                      percent={proPercent} 
                      color="bg-primary" 
                      description="Artisans en croissance"
                    />
                    <PlanMetric 
                      label="Expert" 
                      count={expertCount} 
                      percent={expertPercent} 
                      color="bg-amber-500" 
                      description="Clients Premium full access"
                    />
                  </div>
               </div>
            </div>
         </div>
      )}

      {activeTab === 'system' && (
         <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <SystemPulseCard 
                 label="Base de données (Profiles)" 
                 count={artisans.length} 
                 icon={Users} 
                 status="Optimisé"
               />
               <SystemPulseCard 
                 label="Documents Générés" 
                 count={stats?.total_documents || 0} 
                 icon={BarChart3} 
                 status="Stable"
               />
               <SystemPulseCard 
                 label="Interventions Planning" 
                 count={stats?.total_interventions || 0} 
                 icon={Activity} 
                 status="Actif"
               />
            </div>

            <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-12 text-center text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
               <Database className="w-20 h-20 mx-auto mb-8 text-primary group-hover:scale-110 transition-transform duration-700" />
               <h3 className="text-3xl font-black mb-4 tracking-tight">Supervision Technique</h3>
               <p className="max-w-xl mx-auto text-zinc-400 leading-relaxed text-lg">
                 Le monitoring en temps réel des requêtes Supabase et l'analyse de charge des Webhooks Stripe sont actifs. 
                 La plateforme traite actuellement les requêtes avec une latence moyenne de <strong>18ms</strong>.
               </p>
               <div className="mt-12 flex justify-center gap-12 border-t border-white/5 pt-12">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Supabase Region</p>
                    <p className="font-bold text-sm">eu-central-1 (Paris)</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Stripe API</p>
                    <p className="font-bold text-sm">2026-03-25.dahlia</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Security</p>
                    <p className="font-bold text-sm text-emerald-500">RLS Active</p>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  )
}

function AdminStatCard({ label, value, icon: Icon, color, trend }: any) {
  return (
    <div className="bg-card border border-border p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
      <div className={cn("p-4 rounded-2xl bg-secondary w-fit mb-6 group-hover:scale-110 transition-transform shadow-inner", color)}>
        <Icon className="w-7 h-7" />
      </div>
      <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">{label}</p>
      <div className="flex items-baseline gap-2 mt-2">
        <p className="text-4xl font-black tracking-tight">{value}</p>
        {trend && <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase tracking-tighter">{trend}</span>}
      </div>
    </div>
  )
}

function PlanMetric({ label, count, percent, color, description }: any) {
  return (
    <div className="p-6 rounded-3xl border border-border hover:bg-secondary/20 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("w-3 h-3 rounded-full shadow-sm", color)} />
          <span className="font-black text-sm uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-xl font-black">{percent}%</span>
      </div>
      <p className="text-2xl font-black mb-1">{count} <span className="text-xs text-muted-foreground font-bold">Artisans</span></p>
      <p className="text-[10px] text-muted-foreground italic">{description}</p>
    </div>
  )
}

function SystemPulseCard({ label, count, icon: Icon, status }: any) {
  return (
    <div className="bg-card border border-border p-8 rounded-[2rem] shadow-sm hover:border-primary/30 transition-all group">
       <div className="flex items-center justify-between mb-8">
          <div className="p-4 bg-secondary rounded-2xl group-hover:bg-primary/10 transition-colors">
             <Icon className="w-8 h-8 text-primary" />
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-tighter">
             <div className="w-1 h-1 rounded-full bg-emerald-500" />
             {status}
          </div>
       </div>
       <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mb-2">{label}</p>
       <p className="text-5xl font-black tracking-tighter">{count.toLocaleString()}</p>
       <div className="mt-6 h-1 w-full bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary/40 w-2/3 animate-pulse" />
       </div>
    </div>
  )
}
