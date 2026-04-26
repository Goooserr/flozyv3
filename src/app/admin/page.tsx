'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  MessageSquare, 
  FileText, 
  TrendingUp, 
  ShieldAlert, 
  Search,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Activity,
  ArrowUpRight,
  Clock,
  Filter
} from 'lucide-react'
import { 
  getAllArtisans, 
  getAdminStats, 
  suspendArtisan, 
  activateArtisan,
  getMessages,
  sendMessage,
  markMessagesAsRead
} from '@/lib/actions'
import { cn } from '@/lib/utils'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [artisans, setArtisans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'artisans' | 'support'>('overview')
  
  // Support Chat State
  const [selectedArtisan, setSelectedArtisan] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)

  const router = useRouter()

  useEffect(() => {
    // Check access cookie
    const hasAccess = document.cookie.includes('flozy_admin_access=true')
    if (!hasAccess) {
      router.push('/admin-login')
      return
    }

    loadData()
  }, [])

  async function loadData() {
    try {
      const [s, a] = await Promise.all([
        getAdminStats(),
        getAllArtisans()
      ])
      setStats(s)
      setArtisans(a)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // --- Support Logic ---
  useEffect(() => {
    if (selectedArtisan && activeTab === 'support') {
      const fetchMsgs = async () => {
        const msgs = await getMessages(selectedArtisan.id)
        setMessages(msgs)
        // Mark as read when admin views them
        await markMessagesAsRead(selectedArtisan.id)
      }
      fetchMsgs()
      const interval = setInterval(fetchMsgs, 5000)
      return () => clearInterval(interval)
    }
  }, [selectedArtisan, activeTab])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedArtisan) return
    
    setSending(true)
    try {
      await sendMessage(selectedArtisan.id, newMessage)
      setNewMessage('')
      const msgs = await getMessages(selectedArtisan.id)
      setMessages(msgs)
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const filteredArtisans = artisans.filter(a => 
    (a.business_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (a.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse font-medium">Initialisation du Nexus...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black w-fit border border-amber-500/20 uppercase tracking-widest">
              <ShieldAlert className="w-3 h-3" /> Zone de Supervision
            </div>
            <h2 className="text-4xl font-black tracking-tight">Vue d'ensemble Flozy</h2>
            <p className="text-muted-foreground text-lg">Pilotez la croissance de votre SaaS en temps réel.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Artisans" 
            value={stats?.total_artisans || 0} 
            icon={<Users className="w-5 h-5" />}
            color="primary"
            trend="+12% ce mois"
          />
          <StatCard 
            title="MRR Estimé" 
            value={`${stats?.total_revenue || 0}€`} 
            icon={<TrendingUp className="w-5 h-5" />}
            color="emerald"
            trend="+8.4% vs M-1"
          />
          <StatCard 
            title="Messages Support" 
            value={stats?.total_messages || 0} 
            icon={<MessageSquare className="w-5 h-5" />}
            color="amber"
          />
          <StatCard 
            title="Nexus Health" 
            value="99.9%" 
            icon={<Activity className="w-5 h-5" />}
            color="indigo"
          />
        </div>

        {/* Tabs Navigation */}
        <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-2xl w-fit border border-border/50">
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Nexus" />
          <TabButton active={activeTab === 'artisans'} onClick={() => setActiveTab('artisans')} label="Artisans" />
          <TabButton active={activeTab === 'support'} onClick={() => setActiveTab('support')} label="Support Live" />
        </div>

        {/* Content Area */}
        <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden min-h-[600px]">
          {activeTab === 'overview' && (
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" /> Répartition des Plans
                  </h3>
                  <div className="space-y-4">
                    <PlanProgress label="Expert (49€/m)" count={stats?.expert_count || 0} total={stats?.total_artisans} color="bg-primary" />
                    <PlanProgress label="Pro (29€/m)" count={stats?.pro_count || 0} total={stats?.total_artisans} color="bg-indigo-500" />
                    <PlanProgress label="Starter (Gratuit)" count={stats?.starter_count || 0} total={stats?.total_artisans} color="bg-slate-400" />
                  </div>
                </div>
                <div className="bg-secondary/20 rounded-2xl p-6 border border-border/50 flex flex-col justify-center items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                    <Activity className="w-8 h-8 text-primary animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">System Pulse</h4>
                    <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
                      Tous les modules sont opérationnels. {stats?.total_documents} documents générés ce mois.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'artisans' && (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/20">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text"
                    placeholder="Rechercher un artisan (Nom, Email...)"
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-background rounded-lg border border-transparent hover:border-border transition-all">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-secondary/10 border-b border-border">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Artisan</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Plan</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredArtisans.map((artisan) => (
                      <tr key={artisan.id} className="hover:bg-secondary/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary">
                              {artisan.business_name?.[0] || artisan.email?.[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold">{artisan.business_name || 'Sans Nom'}</p>
                              <p className="text-xs text-muted-foreground">{artisan.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                            artisan.subscription_plan === 'expert' ? "bg-amber-500/10 text-amber-500" :
                            artisan.subscription_plan === 'pro' ? "bg-indigo-500/10 text-indigo-500" :
                            "bg-slate-500/10 text-slate-500"
                          )}>
                            {artisan.subscription_plan || 'starter'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              artisan.subscription_status === 'active' ? "bg-emerald-500" : "bg-rose-500"
                            )} />
                            <span className="text-sm capitalize">{artisan.subscription_status || 'active'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {artisan.subscription_status === 'active' ? (
                              <button 
                                onClick={() => suspendArtisan(artisan.id).then(loadData)}
                                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                                title="Suspendre"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            ) : (
                              <button 
                                onClick={() => activateArtisan(artisan.id).then(loadData)}
                                className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                title="Activer"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                            <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                              <MoreVertical className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 h-[600px]">
              {/* Artisans List */}
              <div className="border-r border-border bg-secondary/10 flex flex-col">
                <div className="p-4 border-b border-border font-bold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Conversations
                </div>
                <div className="flex-1 overflow-y-auto">
                  {artisans.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setSelectedArtisan(a)}
                      className={cn(
                        "w-full p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors text-left border-b border-border/30",
                        selectedArtisan?.id === a.id && "bg-secondary border-l-4 border-l-primary"
                      )}
                    >
                      <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center font-bold text-primary">
                        {a.business_name?.[0] || a.email?.[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{a.business_name || 'Artisan'}</p>
                        <p className="text-xs text-muted-foreground truncate">{a.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat View */}
              <div className="lg:col-span-2 flex flex-col bg-background relative">
                {selectedArtisan ? (
                  <>
                    <div className="p-4 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                          {selectedArtisan.business_name?.[0] || 'A'}
                        </div>
                        <h3 className="font-bold">{selectedArtisan.business_name || 'Conversation'}</h3>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {messages.map((m) => {
                        const isAdmin = m.sender_id === '76b5136b-e5e6-474c-9469-48c27817bf9c'
                        return (
                          <div 
                            key={m.id} 
                            className={cn(
                              "flex",
                              isAdmin ? "justify-end" : "justify-start"
                            )}
                          >
                            <div className={cn(
                              "max-w-[80%] p-4 rounded-2xl text-sm shadow-sm",
                              isAdmin 
                                ? "bg-primary text-primary-foreground rounded-tr-none" 
                                : "bg-secondary border border-border rounded-tl-none"
                            )}>
                              {m.content}
                              <div className={cn(
                                "text-[10px] mt-1 opacity-50",
                                isAdmin ? "text-primary-foreground" : "text-muted-foreground"
                              )}>
                                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30 grayscale">
                          <MessageSquare className="w-12 h-12 mb-2" />
                          <p>Aucun message avec cet artisan</p>
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleSend} className="p-4 border-t border-border flex gap-2 bg-secondary/10">
                      <input 
                        type="text"
                        placeholder="Répondre à l'artisan..."
                        className="flex-1 bg-background border border-border px-4 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                      />
                      <button 
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
                      >
                        Envoyer
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="w-20 h-20 bg-secondary/50 rounded-3xl flex items-center justify-center mb-4">
                      <MessageSquare className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold">Nexus Support</h3>
                    <p className="text-muted-foreground max-w-xs mt-2">
                      Sélectionnez un artisan à gauche pour démarrer la supervision live.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color, trend }: any) {
  const colors: any = {
    primary: "bg-primary/10 text-primary border-primary/20",
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    indigo: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  }

  return (
    <div className="bg-card border border-border p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center mb-4 border", colors[color])}>
        {icon}
      </div>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <h4 className="text-2xl font-black">{value}</h4>
        {trend && (
          <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> {trend}
          </span>
        )}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, label }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
        active 
          ? "bg-card text-foreground shadow-sm border border-border" 
          : "text-muted-foreground hover:text-foreground hover:bg-card/50"
      )}
    >
      {label}
    </button>
  )
}

function PlanProgress({ label, count, total, color }: any) {
  const percentage = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold">
        <span>{label}</span>
        <span className="text-muted-foreground">{count} artisans ({Math.round(percentage)}%)</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden border border-border/50">
        <div className={cn("h-full transition-all duration-1000", color)} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}
